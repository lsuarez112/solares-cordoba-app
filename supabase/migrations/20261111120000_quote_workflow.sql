-- =============================================================================
-- Flujo comercial después de emitir:
--   draft → issued → confirmed → to_invoice → invoiced
-- Lo emitido sigue siendo inmutable (precios, ítems, totales): solo cambia el estado,
-- con historial. Se puede avanzar o volver un paso (para corregir errores).
-- =============================================================================

alter table public.quotes drop constraint if exists quotes_status_check;
alter table public.quotes add constraint quotes_status_check
  check (status in ('draft', 'issued', 'confirmed', 'to_invoice', 'invoiced'));

alter table public.quotes add column if not exists status_changed_at timestamptz;
alter table public.quotes add column if not exists status_changed_by uuid references auth.users(id);

create index if not exists quotes_status_idx on public.quotes (status) where is_current;

create table if not exists public.quote_status_history (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  from_status text not null,
  to_status text not null,
  note text,
  changed_by uuid references auth.users(id) default auth.uid(),
  changed_at timestamptz not null default now()
);
create index if not exists quote_status_history_quote_idx on public.quote_status_history (quote_id, changed_at);

alter table public.quote_status_history enable row level security;
drop policy if exists "quote_status_history: leer" on public.quote_status_history;
create policy "quote_status_history: leer" on public.quote_status_history
  for select to authenticated using (public.is_active_user());
-- Sin políticas de escritura: solo la escribe set_quote_status (security definer).

-- ---------------------------------------------------------------------------
-- Inmutabilidad: aplica a todo lo que no es borrador. El cambio de estado se
-- permite solo dentro de set_quote_status (app.status_change = on).
-- ---------------------------------------------------------------------------
create or replace function public.quotes_guard_issued()
returns trigger language plpgsql as $$
declare
  allowed text[] := array['is_current', 'pdf_path', 'updated_at'];
begin
  if tg_op = 'DELETE' then
    if old.status <> 'draft' then
      raise exception 'No se puede borrar un presupuesto emitido' using errcode = 'P0001';
    end if;
    return old;
  end if;

  if old.status <> 'draft' then
    if current_setting('app.merging_clients', true) = 'on' then
      allowed := array_append(allowed, 'client_id');
    end if;
    if current_setting('app.status_change', true) = 'on' then
      allowed := allowed || array['status', 'status_changed_at', 'status_changed_by'];
    end if;
    if (to_jsonb(new) - allowed) is distinct from (to_jsonb(old) - allowed) then
      raise exception 'El presupuesto emitido no se puede modificar: creá una revisión'
        using errcode = 'P0001';
    end if;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.quote_items_guard_issued()
returns trigger language plpgsql as $$
declare
  target uuid := coalesce(new.quote_id, old.quote_id);
begin
  if exists (select 1 from quotes where id = target and status <> 'draft') then
    raise exception 'Los ítems de un presupuesto emitido no se pueden modificar'
      using errcode = 'P0001';
  end if;
  if tg_op = 'UPDATE' and new.quote_id <> old.quote_id
     and exists (select 1 from quotes where id = old.quote_id and status <> 'draft') then
    raise exception 'Los ítems de un presupuesto emitido no se pueden modificar'
      using errcode = 'P0001';
  end if;
  return coalesce(new, old);
end;
$$;

-- ---------------------------------------------------------------------------
-- Emitir: igual que antes, pero rechaza cualquier estado que no sea borrador.
-- ---------------------------------------------------------------------------
create or replace function public.issue_quote(p_quote_id uuid, p_iva_pct numeric default null)
returns public.quotes language plpgsql set search_path = public as $$
declare
  q quotes;
  r record;
  v_missing text;
  v_subtotal numeric;
  v_iva_pct numeric;
begin
  perform assert_active_user();

  select * into q from quotes where id = p_quote_id for update;
  if not found then raise exception 'Presupuesto inexistente'; end if;
  if q.status <> 'draft' then raise exception 'El presupuesto ya está emitido'; end if;
  if not exists (select 1 from quote_items where quote_id = p_quote_id) then
    raise exception 'El presupuesto no tiene ítems';
  end if;

  -- Foto de precios: se toma el precio vigente de cada producto.
  update quote_items qi
  set unit_price_usd = p.price_usd,
      code = p.product_code,
      description = p.name
  from products p
  where qi.quote_id = p_quote_id and p.id = qi.product_id;

  select string_agg(code, ', ') into v_missing
  from quote_items where quote_id = p_quote_id and unit_price_usd <= 0;
  if v_missing is not null then
    raise exception 'Hay productos sin precio: %', v_missing;
  end if;

  select * into r from current_exchange_rate();
  if not found or r.usd_to_ars is null then
    raise exception 'No hay cotización cargada';
  end if;

  v_iva_pct := coalesce(p_iva_pct, q.iva_pct);
  select coalesce(sum(subtotal_usd), 0) into v_subtotal from quote_items where quote_id = p_quote_id;

  update quotes set
    number = coalesce(q.number, nextval('quote_number_seq')),
    status = 'issued',
    is_current = true,
    iva_pct = v_iva_pct,
    usd_ars = r.usd_to_ars,
    rate_source = r.source,
    rate_date = r.rate_date,
    subtotal_usd = round(v_subtotal, 2),
    iva_usd = round(v_subtotal * v_iva_pct / 100, 2),
    total_usd = round(v_subtotal, 2) + round(v_subtotal * v_iva_pct / 100, 2),
    total_ars = round((round(v_subtotal, 2) + round(v_subtotal * v_iva_pct / 100, 2)) * r.usd_to_ars, 0),
    valid_until = current_date + (select default_validity_days from app_settings where id = 1),
    issued_at = now(),
    issued_by = auth.uid(),
    status_changed_at = now(),
    status_changed_by = auth.uid()
  where id = p_quote_id
  returning * into q;

  -- Las demás revisiones del mismo número dejan de ser la vigente.
  update quotes set is_current = false
  where number = q.number and id <> q.id and is_current;

  return q;
end;
$$;

-- ---------------------------------------------------------------------------
-- Revisión: se puede revisar un emitido o un confirmado (el cliente pide cambios).
-- Lo que ya pasó a facturación no se revisa.
-- ---------------------------------------------------------------------------
create or replace function public.create_quote_revision(p_quote_id uuid)
returns uuid language plpgsql set search_path = public as $$
declare
  src quotes;
  v_id uuid;
begin
  perform assert_active_user();

  select * into src from quotes where id = p_quote_id;
  if not found then raise exception 'Presupuesto inexistente'; end if;
  if src.status not in ('issued', 'confirmed') then
    raise exception 'Solo se crean revisiones de presupuestos emitidos o confirmados';
  end if;

  perform pg_advisory_xact_lock(hashtext('quote_number_' || src.number));

  select id into v_id from quotes where number = src.number and status = 'draft' limit 1;
  if v_id is not null then return v_id; end if;

  insert into quotes (number, revision, status, is_current, source_quote_id, client_id,
                      grid_type, kit_id, input, sizing, ai_summary, iva_pct, notes, client_notes)
  select src.number,
         (select max(revision) + 1 from quotes where number = src.number),
         'draft', false, src.id, src.client_id,
         src.grid_type, src.kit_id, src.input, src.sizing, src.ai_summary, src.iva_pct,
         src.notes, src.client_notes
  returning id into v_id;

  insert into quote_items (quote_id, product_id, code, description, qty, unit_price_usd, sort_order)
  select v_id, product_id, code, description, qty, unit_price_usd, sort_order
  from quote_items where quote_id = src.id;

  return v_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Cambio de estado: un paso adelante o uno atrás, solo sobre la revisión vigente.
-- ---------------------------------------------------------------------------
create or replace function public.set_quote_status(p_quote_id uuid, p_status text, p_note text default null)
returns public.quotes language plpgsql security definer set search_path = public as $$
declare
  flow constant text[] := array['issued', 'confirmed', 'to_invoice', 'invoiced'];
  q quotes;
  v_from int;
  v_to int;
begin
  perform assert_active_user();

  select * into q from quotes where id = p_quote_id for update;
  if not found then raise exception 'Presupuesto inexistente'; end if;
  if q.status = 'draft' then raise exception 'Emití el presupuesto antes de cambiar su estado'; end if;
  if not q.is_current then raise exception 'Solo se cambia el estado de la revisión vigente'; end if;

  v_from := array_position(flow, q.status);
  v_to := array_position(flow, p_status);
  if v_to is null then raise exception 'Estado inválido: %', p_status; end if;
  if v_to = v_from then return q; end if;
  if abs(v_to - v_from) <> 1 then
    raise exception 'Solo se puede avanzar o volver un paso';
  end if;

  perform set_config('app.status_change', 'on', true);
  update quotes set
    status = p_status,
    status_changed_at = now(),
    status_changed_by = auth.uid()
  where id = p_quote_id
  returning * into q;
  perform set_config('app.status_change', 'off', true);

  insert into quote_status_history (quote_id, from_status, to_status, note, changed_by)
  values (p_quote_id, flow[v_from], p_status, nullif(trim(p_note), ''), auth.uid());

  return q;
end;
$$;

revoke all on function public.set_quote_status(uuid, text, text) from public, anon;
grant execute on function public.set_quote_status(uuid, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Vistas: "emitido" pasa a ser "no borrador"; el listado expone el último cambio.
-- ---------------------------------------------------------------------------
create or replace view public.v_quotes_list
with (security_invoker = on) as
select
  q.id,
  q.number,
  q.revision,
  q.status,
  q.is_current,
  q.source_quote_id,
  q.client_id,
  c.name  as client_name,
  c.phone as client_phone,
  c.city  as client_city,
  q.grid_type,
  q.kit_id,
  k.code  as kit_code,
  k.name  as kit_name,
  public.quote_display_number(q) as display_number,
  q.iva_pct,
  coalesce(q.subtotal_usd, it.subtotal_usd) as subtotal_usd,
  q.total_usd,
  q.total_ars,
  q.usd_ars,
  it.items_count,
  q.seller_id,
  q.valid_until,
  q.issued_at,
  q.created_at,
  q.updated_at,
  ai.cost_usd as ai_cost_usd,
  ai.requests_count as ai_requests_count,
  q.status_changed_at
from public.quotes q
join public.clients c on c.id = q.client_id
left join public.kits k on k.id = q.kit_id
left join lateral (
  select count(*)::int as items_count, coalesce(sum(qi.subtotal_usd), 0) as subtotal_usd
  from public.quote_items qi
  where qi.quote_id = q.id
) it on true
left join lateral (
  select coalesce(sum(r.cost_usd), 0) as cost_usd, count(*)::int as requests_count
  from public.ai_requests r
  where r.quote_id = q.id
) ai on true;

grant select on public.v_quotes_list to authenticated;

create or replace view public.v_clients_list
with (security_invoker = on) as
select
  c.*,
  coalesce(s.quotes_count, 0)  as quotes_count,
  coalesce(s.issued_count, 0)  as issued_count,
  s.last_quote_at
from public.clients c
left join lateral (
  select
    count(*)::int                                        as quotes_count,
    count(*) filter (where q.status <> 'draft')::int     as issued_count,
    max(coalesce(q.issued_at, q.created_at))             as last_quote_at
  from public.quotes q
  where q.client_id = c.id
) s on true;

grant select on public.v_clients_list to authenticated;

-- Historial de estados con el nombre de quien lo cambió.
create or replace view public.v_quote_status_history
with (security_invoker = on) as
select h.*, u.full_name as changed_by_name
from public.quote_status_history h
left join public.user_profiles u on u.id = h.changed_by;

grant select on public.v_quote_status_history to authenticated;

-- Los ya emitidos arrancan con su fecha de emisión como último cambio.
select set_config('app.status_change', 'on', false);
update public.quotes set status_changed_at = issued_at, status_changed_by = issued_by
where status <> 'draft' and status_changed_at is null;
select set_config('app.status_change', 'off', false);

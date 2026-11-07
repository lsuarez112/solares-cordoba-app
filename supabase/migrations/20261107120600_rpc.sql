-- =============================================================================
-- RPCs del presupuestador.
-- =============================================================================

create or replace function public.assert_active_user()
returns void language plpgsql stable as $$
begin
  if not public.is_active_user() then
    raise exception 'Usuario no autorizado' using errcode = '42501';
  end if;
end;
$$;

-- Permite reasignar el cliente de presupuestos emitidos solo durante merge_clients.
create or replace function public.quotes_guard_issued()
returns trigger language plpgsql as $$
declare
  allowed text[] := array['is_current', 'pdf_path', 'updated_at'];
begin
  if tg_op = 'DELETE' then
    if old.status = 'issued' then
      raise exception 'No se puede borrar un presupuesto emitido' using errcode = 'P0001';
    end if;
    return old;
  end if;

  if old.status = 'issued' then
    if current_setting('app.merging_clients', true) = 'on' then
      allowed := array_append(allowed, 'client_id');
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

-- ---------------------------------------------------------------------------
-- BOM de un kit con opcionales aplicados (en orden).
-- ---------------------------------------------------------------------------
create or replace function public.kit_bom(p_kit_id uuid, p_option_codes text[] default '{}')
returns table (product_id uuid, product_code text, name text, qty numeric, price_usd numeric, sort_order int)
language plpgsql volatile set search_path = public as $$
#variable_conflict use_column
declare
  opt record;
  ch jsonb;
  pid uuid;
begin
  create temp table if not exists _bom (product_id uuid primary key, qty numeric, sort_order int) on commit drop;
  truncate _bom;

  insert into _bom
  select ki.product_id, ki.qty, ki.sort_order from kit_items ki where ki.kit_id = p_kit_id;

  for opt in
    select ko.changes, ko.code from kit_options ko
    where ko.kit_id = p_kit_id and ko.code = any(coalesce(p_option_codes, '{}'))
    order by array_position(p_option_codes, ko.code)
  loop
    for ch in select * from jsonb_array_elements(opt.changes) loop
      select p.id into pid from products p
      where p.product_code = public.normalize_product_code(ch->>'product_code');
      if pid is null then
        raise exception 'Opcional %: el producto % no existe', opt.code, ch->>'product_code';
      end if;

      case ch->>'op'
        when 'add' then
          insert into _bom values (pid, (ch->>'qty')::numeric, 1000)
          on conflict on constraint _bom_pkey do update set qty = _bom.qty + excluded.qty;
        when 'set' then
          if coalesce((ch->>'qty')::numeric, 0) <= 0 then
            delete from _bom b where b.product_id = pid;
          else
            insert into _bom values (pid, (ch->>'qty')::numeric, 1000)
            on conflict on constraint _bom_pkey do update set qty = excluded.qty;
          end if;
        when 'remove' then
          delete from _bom b where b.product_id = pid;
        else
          raise exception 'Opcional %: operación inválida %', opt.code, ch->>'op';
      end case;
    end loop;
  end loop;

  return query
  select b.product_id, p.product_code::text, p.name::text, b.qty, p.price_usd, b.sort_order
  from _bom b join products p on p.id = b.product_id
  where b.qty > 0
  order by b.sort_order, p.product_code;
end;
$$;

-- ---------------------------------------------------------------------------
-- Candidatos de kit para un pedido (paso [4] del flujo de IA; 0 tokens).
-- ---------------------------------------------------------------------------
create or replace function public.suggest_kit_candidates(
  p_grid_type public.grid_type_enum,
  p_kwp numeric,
  p_battery_kwh numeric default null,
  p_phases text default null,
  p_limit int default 5
)
returns table (
  kit_id uuid, code text, name text, grid_type public.grid_type_enum, phases text,
  kwp numeric, battery_kwh numeric, inverter_kw numeric, est_kwh_month numeric,
  total_usd numeric, items_without_price bigint, kwp_diff_pct numeric, within_tolerance boolean
)
language sql stable set search_path = public as $$
  with s as (select kwp_tolerance_pct as tol from app_settings where id = 1)
  select
    k.id, k.code, k.name, k.grid_type, k.phases,
    k.kwp, k.battery_kwh, k.inverter_kw, k.est_kwh_month,
    k.total_usd, k.items_without_price,
    round((k.kwp - p_kwp) / nullif(p_kwp, 0) * 100, 1) as kwp_diff_pct,
    abs(k.kwp - p_kwp) / nullif(p_kwp, 0) * 100 <= (select tol from s) as within_tolerance
  from v_kits_with_totals k
  where k.active
    and k.grid_type = p_grid_type
    and (p_phases is null or k.phases = p_phases)
  order by
    abs(k.kwp - p_kwp) / nullif(p_kwp, 0),
    case when p_battery_kwh is null then 0 else abs(k.battery_kwh - p_battery_kwh) end,
    k.sort_order
  limit greatest(coalesce(p_limit, 5), 1);
$$;

-- ---------------------------------------------------------------------------
-- Crear borrador desde un kit (manual o sugerido por la IA).
-- ---------------------------------------------------------------------------
create or replace function public.create_quote_from_kit(
  p_client_id uuid,
  p_kit_id uuid,
  p_input jsonb default '{}'::jsonb,
  p_option_codes text[] default '{}',
  p_sizing jsonb default null,
  p_ai_summary jsonb default null
)
returns uuid language plpgsql set search_path = public as $$
declare
  v_quote_id uuid;
  v_grid public.grid_type_enum;
begin
  perform assert_active_user();

  select grid_type into v_grid from kits where id = p_kit_id and active;
  if v_grid is null then
    raise exception 'Kit inexistente o inactivo';
  end if;

  insert into quotes (client_id, grid_type, kit_id, input, sizing, ai_summary,
                      iva_pct, valid_until)
  values (p_client_id, v_grid, p_kit_id, coalesce(p_input, '{}'::jsonb), p_sizing, p_ai_summary,
          (select default_iva_pct from app_settings where id = 1),
          current_date + (select default_validity_days from app_settings where id = 1))
  returning id into v_quote_id;

  insert into quote_items (quote_id, product_id, code, description, qty, unit_price_usd, sort_order)
  select v_quote_id, b.product_id, b.product_code, b.name, b.qty, b.price_usd,
         row_number() over (order by b.sort_order, b.product_code)
  from kit_bom(p_kit_id, p_option_codes) b;

  return v_quote_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Emitir: congela precios, cotización, IVA y totales; asigna número.
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
  if q.status = 'issued' then raise exception 'El presupuesto ya está emitido'; end if;
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
    issued_by = auth.uid()
  where id = p_quote_id
  returning * into q;

  -- Las demás revisiones del mismo número dejan de ser la vigente.
  update quotes set is_current = false
  where number = q.number and id <> q.id and is_current;

  return q;
end;
$$;

-- ---------------------------------------------------------------------------
-- Revisión: copia un emitido como borrador con el mismo número y R+1.
-- Si ya hay un borrador abierto para ese número, lo devuelve.
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
  if src.status <> 'issued' then
    raise exception 'Solo se crean revisiones de presupuestos emitidos';
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
-- Duplicar: presupuesto nuevo (sin número) a partir de otro, opcionalmente para otro cliente.
-- ---------------------------------------------------------------------------
create or replace function public.duplicate_quote(p_quote_id uuid, p_client_id uuid default null)
returns uuid language plpgsql set search_path = public as $$
declare
  src quotes;
  v_id uuid;
begin
  perform assert_active_user();

  select * into src from quotes where id = p_quote_id;
  if not found then raise exception 'Presupuesto inexistente'; end if;

  insert into quotes (client_id, grid_type, kit_id, input, sizing, ai_summary, iva_pct,
                      notes, client_notes, source_quote_id, valid_until)
  values (coalesce(p_client_id, src.client_id), src.grid_type, src.kit_id, src.input, src.sizing,
          src.ai_summary, src.iva_pct, src.notes, src.client_notes, src.id,
          current_date + (select default_validity_days from app_settings where id = 1))
  returning id into v_id;

  insert into quote_items (quote_id, product_id, code, description, qty, unit_price_usd, sort_order)
  select v_id, qi.product_id, qi.code, qi.description, qi.qty,
         coalesce(p.price_usd, qi.unit_price_usd), qi.sort_order
  from quote_items qi left join products p on p.id = qi.product_id
  where qi.quote_id = src.id;

  return v_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Import de precios código + precio. p_rows = [{ "code": "37046", "price_usd": 123.4 }]
-- ---------------------------------------------------------------------------
create or replace function public.apply_price_import(p_rows jsonb, p_file_name text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_total int;
  v_updated int;
  v_unchanged int;
  v_not_found jsonb;
begin
  if not has_permission('products', 'update') then
    raise exception 'Sin permiso para actualizar precios' using errcode = '42501';
  end if;
  if jsonb_typeof(p_rows) <> 'array' then
    raise exception 'Formato inválido: se espera un array de filas';
  end if;

  drop table if exists _imp;
  create temp table _imp on commit drop as
  select distinct on (normalize_product_code(r->>'code'))
         normalize_product_code(r->>'code') as code,
         round((r->>'price_usd')::numeric, 2) as price_usd
  from jsonb_array_elements(p_rows) r
  where coalesce(btrim(r->>'code'), '') <> '' and (r->>'price_usd') is not null;

  if exists (select 1 from _imp where price_usd < 0) then
    raise exception 'Hay precios negativos en el archivo';
  end if;

  select count(*) into v_total from _imp;

  select count(*) into v_unchanged
  from _imp i join products p on p.product_code = i.code
  where p.price_usd = i.price_usd;

  update products p set price_usd = i.price_usd
  from _imp i
  where p.product_code = i.code and p.price_usd is distinct from i.price_usd;
  get diagnostics v_updated = row_count;

  select coalesce(jsonb_agg(i.code order by i.code), '[]'::jsonb) into v_not_found
  from _imp i where not exists (select 1 from products p where p.product_code = i.code);

  insert into price_imports (file_name, rows_total, rows_updated, rows_unchanged, codes_not_found, created_by)
  values (p_file_name, v_total, v_updated, v_unchanged, v_not_found, auth.uid());

  return jsonb_build_object(
    'rows_total', v_total,
    'rows_updated', v_updated,
    'rows_unchanged', v_unchanged,
    'codes_not_found', v_not_found
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Clientes: aviso de teléfono duplicado y unificación.
-- ---------------------------------------------------------------------------
create or replace function public.find_clients_by_phone(p_phone text, p_exclude_id uuid default null)
returns setof public.clients language sql stable set search_path = public as $$
  select * from clients
  where phone_normalized = normalize_phone(p_phone)
    and normalize_phone(p_phone) is not null
    and (p_exclude_id is null or id <> p_exclude_id)
  order by created_at;
$$;

create or replace function public.merge_clients(p_keep_id uuid, p_merge_ids uuid[])
returns public.clients language plpgsql set search_path = public as $$
declare
  ids uuid[] := array_remove(p_merge_ids, p_keep_id);
  k clients;
begin
  perform assert_active_user();
  if not exists (select 1 from clients where id = p_keep_id) then
    raise exception 'Cliente a conservar inexistente';
  end if;
  if coalesce(array_length(ids, 1), 0) = 0 then
    select * into k from clients where id = p_keep_id;
    return k;
  end if;

  -- Completa datos vacíos del cliente que se conserva con los de los unificados.
  update clients c set
    phone   = coalesce(nullif(c.phone, ''),   m.phone),
    email   = coalesce(nullif(c.email, ''),   m.email),
    city    = coalesce(nullif(c.city, ''),    m.city),
    address = coalesce(nullif(c.address, ''), m.address),
    cuit    = coalesce(nullif(c.cuit, ''),    m.cuit),
    notes   = concat_ws(E'\n', nullif(c.notes, ''), m.notes)
  from (
    select
      (array_agg(phone order by created_at) filter (where nullif(phone, '') is not null))[1] as phone,
      (array_agg(email order by created_at) filter (where nullif(email, '') is not null))[1] as email,
      (array_agg(city order by created_at) filter (where nullif(city, '') is not null))[1] as city,
      (array_agg(address order by created_at) filter (where nullif(address, '') is not null))[1] as address,
      (array_agg(cuit order by created_at) filter (where nullif(cuit, '') is not null))[1] as cuit,
      string_agg(nullif(notes, ''), E'\n' order by created_at) as notes
    from clients where id = any(ids)
  ) m
  where c.id = p_keep_id;

  perform set_config('app.merging_clients', 'on', true);
  update quotes set client_id = p_keep_id where client_id = any(ids);
  perform set_config('app.merging_clients', 'off', true);

  delete from clients where id = any(ids);

  select * into k from clients where id = p_keep_id;
  return k;
end;
$$;

grant usage, select on sequence public.quote_number_seq to authenticated;

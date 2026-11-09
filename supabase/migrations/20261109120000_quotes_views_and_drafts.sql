-- =============================================================================
-- F3: vistas de listado de clientes y presupuestos + guardado atómico de borradores.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Presupuestos para el listado: cliente, kit, número para mostrar y subtotal
-- (el emitido usa la foto; el borrador suma sus ítems).
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
  q.updated_at
from public.quotes q
join public.clients c on c.id = q.client_id
left join public.kits k on k.id = q.kit_id
left join lateral (
  select count(*)::int as items_count, coalesce(sum(qi.subtotal_usd), 0) as subtotal_usd
  from public.quote_items qi
  where qi.quote_id = q.id
) it on true;

grant select on public.v_quotes_list to authenticated;

-- ---------------------------------------------------------------------------
-- Clientes con su actividad (para el listado y el aviso antes de borrar).
-- ---------------------------------------------------------------------------
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
    count(*) filter (where q.status = 'issued')::int     as issued_count,
    max(coalesce(q.issued_at, q.created_at))             as last_quote_at
  from public.quotes q
  where q.client_id = c.id
) s on true;

grant select on public.v_clients_list to authenticated;

-- ---------------------------------------------------------------------------
-- Guarda un borrador completo (cabecera + ítems) en una sola transacción.
-- p_patch: campos editables de la cabecera; p_items: [{product_id, code,
-- description, qty, unit_price_usd}] en el orden en que se muestran.
-- ---------------------------------------------------------------------------
create or replace function public.save_quote_draft(
  p_quote_id uuid,
  p_patch jsonb,
  p_items jsonb
)
returns public.quotes language plpgsql set search_path = public as $$
declare
  q quotes;
begin
  perform assert_active_user();

  select * into q from quotes where id = p_quote_id for update;
  if not found then raise exception 'Presupuesto inexistente'; end if;
  if q.status <> 'draft' then
    raise exception 'El presupuesto emitido no se puede modificar: creá una revisión'
      using errcode = 'P0001';
  end if;

  update quotes set
    client_id    = coalesce((p_patch->>'client_id')::uuid, client_id),
    iva_pct      = coalesce((p_patch->>'iva_pct')::numeric, iva_pct),
    notes        = case when p_patch ? 'notes' then nullif(btrim(p_patch->>'notes'), '') else notes end,
    client_notes = case when p_patch ? 'client_notes' then nullif(btrim(p_patch->>'client_notes'), '') else client_notes end,
    input        = case when p_patch ? 'input' then p_patch->'input' else input end,
    sizing       = case when p_patch ? 'sizing' then p_patch->'sizing' else sizing end
  where id = p_quote_id
  returning * into q;

  if p_items is not null then
    delete from quote_items where quote_id = p_quote_id;
    insert into quote_items (quote_id, product_id, code, description, qty, unit_price_usd, sort_order)
    select p_quote_id,
           nullif(i->>'product_id', '')::uuid,
           i->>'code',
           i->>'description',
           (i->>'qty')::numeric,
           coalesce((i->>'unit_price_usd')::numeric, 0),
           ord::int
    from jsonb_array_elements(p_items) with ordinality as t(i, ord);
  end if;

  return q;
end;
$$;

grant execute on function public.save_quote_draft(uuid, jsonb, jsonb) to authenticated;

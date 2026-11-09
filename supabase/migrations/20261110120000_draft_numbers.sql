-- =============================================================================
-- Numeración desde el borrador: el número se asigna al crear el presupuesto
-- (antes se asignaba al emitir). Las revisiones heredan el número del original.
-- Puede haber saltos si se borran borradores: el número no es fiscal.
-- =============================================================================

create or replace function public.quotes_assign_number()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.number is null then
    new.number := nextval('quote_number_seq');
  end if;
  return new;
end;
$$;

drop trigger if exists quotes_assign_number on public.quotes;
create trigger quotes_assign_number
  before insert on public.quotes
  for each row execute function public.quotes_assign_number();

-- Borradores existentes sin número, en orden de creación.
do $$
declare r record;
begin
  for r in select id from public.quotes where number is null order by created_at loop
    update public.quotes set number = nextval('public.quote_number_seq') where id = r.id;
  end loop;
end $$;

-- save_quote_draft: suma grid_type (al editar el pedido se puede cambiar el tipo de sistema).
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
    grid_type    = case when p_patch ? 'grid_type'
                        then nullif(p_patch->>'grid_type', '')::public.grid_type_enum
                        else grid_type end,
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

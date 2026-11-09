-- =============================================================================
-- Guardas de borrado: productos y categorías en uso.
-- (El front avisa antes; esto protege ante cualquier otro camino.)
-- =============================================================================

-- Producto: no se borra si está en un kit (BOM u opcionales) o en un presupuesto.
-- kit_items ya tiene FK restrict; los opcionales guardan el código en jsonb (sin FK).
create or replace function public.products_guard_delete()
returns trigger language plpgsql set search_path = public as $$
declare
  v_kits text;
begin
  select string_agg(distinct k.code, ', ') into v_kits
  from kits k
  where exists (select 1 from kit_items ki where ki.kit_id = k.id and ki.product_id = old.id)
     or exists (
       select 1 from kit_options ko
       where ko.kit_id = k.id
         and ko.changes @> jsonb_build_array(jsonb_build_object('product_code', old.product_code))
     );
  if v_kits is not null then
    raise exception 'El producto % se usa en los kits: %. Desactivalo en lugar de borrarlo.',
      old.product_code, v_kits using errcode = 'P0001';
  end if;

  if exists (select 1 from quote_items qi where qi.product_id = old.id) then
    raise exception 'El producto % figura en presupuestos. Desactivalo en lugar de borrarlo.',
      old.product_code using errcode = 'P0001';
  end if;
  return old;
end;
$$;

drop trigger if exists products_guard_delete on public.products;
create trigger products_guard_delete
  before delete on public.products
  for each row execute function public.products_guard_delete();

-- Categoría: no se borra si tiene productos (antes quedaban sin categoría).
create or replace function public.product_categories_guard_delete()
returns trigger language plpgsql set search_path = public as $$
declare
  n int;
begin
  select count(*) into n from products where category_id = old.id;
  if n > 0 then
    raise exception 'La categoría % tiene % producto(s). Movelos a otra categoría antes de borrarla.',
      old.name, n using errcode = 'P0001';
  end if;
  return old;
end;
$$;

drop trigger if exists product_categories_guard_delete on public.product_categories;
create trigger product_categories_guard_delete
  before delete on public.product_categories
  for each row execute function public.product_categories_guard_delete();

-- Uso de un producto (para avisar en el front antes de borrar).
create or replace function public.product_usage(p_product_id uuid)
returns jsonb language sql stable set search_path = public as $$
  with p as (select id, product_code from products where id = p_product_id)
  select jsonb_build_object(
    'kits', coalesce((
      select jsonb_agg(jsonb_build_object('id', k.id, 'code', k.code, 'name', k.name, 'in_base', u.in_base)
                       order by k.code)
      from (
        select k2.id,
               bool_or(src = 'base') as in_base
        from p
        cross join lateral (
          select ki.kit_id as kit_id, 'base' as src from kit_items ki where ki.product_id = p.id
          union all
          select ko.kit_id, 'option' from kit_options ko
          where ko.changes @> jsonb_build_array(jsonb_build_object('product_code', p.product_code))
        ) x
        join kits k2 on k2.id = x.kit_id
        group by k2.id
      ) u
      join kits k on k.id = u.id
    ), '[]'::jsonb),
    'quotes', (select count(distinct qi.quote_id) from quote_items qi, p where qi.product_id = p.id)
  );
$$;

grant execute on function public.product_usage(uuid) to authenticated;

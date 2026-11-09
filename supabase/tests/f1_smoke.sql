-- =============================================================================
-- Prueba de humo F1. Se corre DESPUÉS de las migraciones y DENTRO de una
-- transacción que termina en ROLLBACK (scripts/db/dry-run.mjs), así no deja datos.
-- Cada chequeo que falla corta con una excepción.
-- =============================================================================

do $$
declare
  admin_id uuid;
begin
  select up.id into admin_id
  from public.user_profiles up join public.roles r on r.id = up.role_id
  where r.name = 'Admin' and up.active
  limit 1;
  if admin_id is null then raise exception 'No hay usuario Admin activo para la prueba'; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', admin_id, 'role', 'authenticated')::text, true);
  perform set_config('test.admin_id', admin_id::text, true);
end $$;

create or replace function pg_temp.log(msg text) returns void language sql as $f$
  select set_config('test.log', coalesce(nullif(current_setting('test.log', true), '') || ' | ', '') || msg, true);
$f$;

set local role authenticated;

do $$
declare
  n int;
  v_text text;
  v_kit uuid;
  v_client uuid;
  v_client2 uuid;
  v_quote uuid;
  v_rev uuid;
  q public.quotes;
  q2 public.quotes;
  v_total numeric;
  v_json jsonb;
begin
  -- ---------------------------------------------------------------- catálogo
  select count(*) into n from public.kits;
  if n <> 9 then raise exception 'kits: esperaba 9, hay %', n; end if;

  select count(*) into n from public.kit_items;
  if n < 100 then raise exception 'kit_items: muy pocos (%)', n; end if;

  select count(*) into n from public.products where category_id is null;
  if n <> 0 then raise exception 'productos sin categoría: %', n; end if;

  select count(*) into n from public.products where product_code ~ '^\d{1,5}$';
  if n <> 0 then raise exception 'códigos sin normalizar: %', n; end if;

  select count(*) into n from public.product_categories where prefix = 'COL';
  if n <> 0 then raise exception 'la categoría Colchones sigue existiendo'; end if;

  select count(*) into n from public.solar_zones;
  if n < 40 then raise exception 'solar_zones incompleto (%)', n; end if;
  perform pg_temp.log(format('OK catálogo'));

  -- ---------------------------------------------------------- candidatos de kit
  select code into v_text from public.suggest_kit_candidates('ON-GRID', 3.3) limit 1;
  if v_text <> 'KIT_ON_MEDIO' then raise exception 'candidato 3.3 kWp on-grid: %', v_text; end if;

  select code into v_text from public.suggest_kit_candidates('HYBRID', 9, 11) limit 1;
  if v_text <> 'KIT_HYB_ALTO' then raise exception 'candidato 9 kWp híbrido: %', v_text; end if;

  select count(*) into n from public.suggest_kit_candidates('ON-GRID', 3.3) where battery_kwh > 0;
  if n <> 0 then raise exception 'on-grid con batería en candidatos'; end if;
  perform pg_temp.log(format('OK suggest_kit_candidates'));

  -- ------------------------------------------------------------- BOM + opcionales
  select id into v_kit from public.kits where code = 'KIT_HYB_MEDIO';
  select qty into v_total from public.kit_bom(v_kit, array['A1']) where product_code = '575917';
  if v_total <> 2 then raise exception 'A1 (2× Hope): qty %', v_total; end if;

  select count(*) into n from public.kit_bom(v_kit, array['A3']) where product_code = '575917';
  if n <> 0 then raise exception 'A3 debería quitar la Hope'; end if;
  perform pg_temp.log(format('OK kit_bom'));

  -- ------------------------------------------------------- import de precios
  v_json := public.apply_price_import(
    (select jsonb_agg(jsonb_build_object('code', ltrim(p.product_code, '0'), 'price_usd', 100))
     from public.products p),
    'prueba.csv');
  if (v_json->>'rows_updated')::int < 100 then
    raise exception 'apply_price_import: %', v_json;
  end if;
  select count(*) into n from public.products where price_usd <> 100;
  if n <> 0 then raise exception 'import: % productos sin el precio nuevo', n; end if;
  perform pg_temp.log(format('OK apply_price_import %s', v_json - 'codes_not_found'));

  insert into public.exchange_rates (date, usd_to_ars, source) values (current_date, 1000, 'manual');

  -- -------------------------------------------------------------- clientes
  insert into public.clients (name, phone) values ('Cliente Prueba', '351 15 555-1234')
  returning id into v_client;
  insert into public.clients (name, phone, email) values ('Cliente Prueba Dup', '+54 9 351 5551234', 'dup@test.com')
  returning id into v_client2;

  select count(*) into n from public.find_clients_by_phone('3515551234');
  if n <> 2 then raise exception 'find_clients_by_phone: esperaba 2, hay %', n; end if;
  perform pg_temp.log(format('OK teléfono duplicado'));

  -- ------------------------------------------------------ presupuesto + emisión
  v_quote := public.create_quote_from_kit(v_client2, v_kit, '{"kwh_mes": 350}'::jsonb, array['A1']);
  select count(*) into n from public.quote_items where quote_id = v_quote;
  if n < 10 then raise exception 'create_quote_from_kit: % ítems', n; end if;

  q := public.issue_quote(v_quote, 21);
  if q.number is null or q.status <> 'issued' then raise exception 'issue_quote no asignó número'; end if;
  if q.total_usd <> round(q.subtotal_usd * 1.21, 2) then
    raise exception 'totales: subtotal % total %', q.subtotal_usd, q.total_usd;
  end if;
  if q.total_ars <> round(q.total_usd * 1000, 0) then raise exception 'total ARS %', q.total_ars; end if;
  perform pg_temp.log(format('OK emitido %s → USD %s', public.quote_display_number(q), q.total_usd));

  -- El emitido no cambia si cambia el precio
  update public.products set price_usd = 999 where product_code = '575917';
  select sum(subtotal_usd) into v_total from public.quote_items where quote_id = v_quote;
  if v_total <> q.subtotal_usd then raise exception 'el emitido cambió con el precio'; end if;

  -- Un emitido no se puede editar
  begin
    update public.quotes set notes = 'x' where id = v_quote;
    raise exception 'FALLA: se pudo editar un emitido';
  exception when sqlstate 'P0001' then null;
  end;
  begin
    update public.quote_items set qty = qty + 1 where quote_id = v_quote;
    raise exception 'FALLA: se pudieron editar ítems de un emitido';
  exception when sqlstate 'P0001' then null;
  end;
  perform pg_temp.log(format('OK inmutabilidad'));

  -- ------------------------------------------------------------- revisión
  v_rev := public.create_quote_revision(v_quote);
  if public.create_quote_revision(v_quote) <> v_rev then
    raise exception 'create_quote_revision duplicó el borrador';
  end if;
  q2 := public.issue_quote(v_rev, 0);
  if q2.number <> q.number or q2.revision <> 1 then
    raise exception 'revisión: número % rev %', q2.number, q2.revision;
  end if;
  if q2.total_usd <= q.total_usd - q.iva_usd then
    raise exception 'la revisión debería tomar el precio nuevo';
  end if;
  select * into q from public.quotes where id = v_quote;
  if q.is_current then raise exception 'R0 sigue vigente'; end if;
  perform pg_temp.log(format('OK revisión %s (R0 intacta: USD %s)', public.quote_display_number(q2), q.total_usd));

  -- --------------------------------------------------------- unificar clientes
  perform public.merge_clients(v_client, array[v_client2]);
  select count(*) into n from public.quotes where client_id = v_client;
  if n <> 2 then raise exception 'merge_clients: % presupuestos movidos', n; end if;
  select email into v_text from public.clients where id = v_client;
  if v_text is distinct from 'dup@test.com' then raise exception 'merge no completó el email'; end if;
  perform pg_temp.log(format('OK merge_clients'));

  -- --------------------------------------------------------- duplicar
  v_quote := public.duplicate_quote(v_rev);
  select * into q from public.quotes where id = v_quote;
  if q.number is null or q.number = (select number from public.quotes where id = v_rev) or q.status <> 'draft' or q.revision <> 0 then raise exception 'duplicate_quote'; end if;
  delete from public.quotes where id = v_quote;
  perform pg_temp.log(format('OK duplicate_quote'));

  perform pg_temp.log(format('=== F1 smoke: TODO OK ==='));
end $$;

reset role;

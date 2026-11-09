-- =============================================================================
-- Prueba de humo F3 (clientes y presupuestos). Corre después de f1_smoke.sql en
-- la misma transacción con ROLLBACK (scripts/db/dry-run.mjs): no deja datos.
-- =============================================================================

do $$
declare
  n int;
  v_kit uuid;
  v_client uuid;
  v_quote uuid;
  v_rev uuid;
  v_items jsonb;
  q public.quotes;
  r record;
  ok boolean;
begin
  -- Precios para poder emitir (dentro de la transacción).
  update public.products set price_usd = 50 where price_usd <= 0;

  select id into v_kit from public.kits where code = 'KIT_ON_MEDIO';
  insert into public.clients (name, phone) values ('F3 Smoke', '351 444 0000') returning id into v_client;
  v_quote := public.create_quote_from_kit(v_client, v_kit, '{"grid_type":"ON-GRID","kwh":400}'::jsonb);

  -- save_quote_draft: invierte el orden, deja 3 ítems y cambia cantidades e IVA.
  select jsonb_agg(jsonb_build_object(
           'product_id', qi.product_id, 'code', qi.code, 'description', qi.description,
           'qty', qi.qty + 1, 'unit_price_usd', 33.33) order by qi.sort_order desc)
    into v_items
  from (select * from public.quote_items where quote_id = v_quote order by sort_order limit 3) qi;

  q := public.save_quote_draft(v_quote, '{"iva_pct": 10.5, "notes": "  interna  ", "client_notes": ""}'::jsonb, v_items);
  if q.iva_pct <> 10.5 or q.notes <> 'interna' or q.client_notes is not null then
    raise exception 'save_quote_draft cabecera: iva % notes % client_notes %', q.iva_pct, q.notes, q.client_notes;
  end if;
  select count(*) into n from public.quote_items where quote_id = v_quote;
  if n <> 3 then raise exception 'save_quote_draft dejó % ítems', n; end if;
  if (select code from public.quote_items where quote_id = v_quote and sort_order = 1)
     <> v_items->0->>'code' then
    raise exception 'save_quote_draft no respetó el orden';
  end if;
  perform pg_temp.log('OK save_quote_draft');

  -- Vistas de listado.
  select * into r from public.v_quotes_list where id = v_quote;
  if r.items_count <> 3 or r.subtotal_usd <> (select sum(subtotal_usd) from public.quote_items where quote_id = v_quote)
     or r.client_name <> 'F3 Smoke' or r.kit_code <> 'KIT_ON_MEDIO' or r.display_number is null then
    raise exception 'v_quotes_list borrador: %', row_to_json(r);
  end if;
  select quotes_count into n from public.v_clients_list where id = v_client;
  if n <> 1 then raise exception 'v_clients_list quotes_count = %', n; end if;
  perform pg_temp.log(format('OK vistas (borrador %s)', r.display_number));

  -- Emisión: toma el precio vigente (50) y el IVA elegido.
  q := public.issue_quote(v_quote, 10.5);
  if q.subtotal_usd <> (select sum(subtotal_usd) from public.quote_items where quote_id = v_quote)
     or q.iva_usd <> round(q.subtotal_usd * 0.105, 2) or q.total_usd <> q.subtotal_usd + q.iva_usd then
    raise exception 'issue_quote totales: %', row_to_json(q);
  end if;
  if exists (select 1 from public.quote_items qi join public.products p on p.id = qi.product_id
             where qi.quote_id = v_quote and qi.unit_price_usd <> p.price_usd) then
    raise exception 'issue_quote no congeló el precio vigente';
  end if;

  -- Un emitido no se guarda como borrador ni se borra.
  ok := false;
  begin
    perform public.save_quote_draft(v_quote, '{}'::jsonb, null);
  exception when others then ok := true;
  end;
  if not ok then raise exception 'save_quote_draft modificó un emitido'; end if;
  ok := false;
  begin
    delete from public.quotes where id = v_quote;
  exception when others then ok := true;
  end;
  if not ok then raise exception 'se borró un emitido'; end if;
  perform pg_temp.log(format('OK emitido %s', public.quote_display_number(q)));

  -- Revisión en borrador: se borra y la original sigue vigente.
  v_rev := public.create_quote_revision(v_quote);
  delete from public.quotes where id = v_rev;
  if not (select is_current from public.quotes where id = v_quote) then
    raise exception 'borrar la revisión dejó sin vigente al número';
  end if;

  -- Revisión emitida: solo ella queda vigente en el listado.
  v_rev := public.create_quote_revision(v_quote);
  perform public.save_quote_draft(v_rev, '{"iva_pct": 21}'::jsonb, null);
  q := public.issue_quote(v_rev, null);
  if q.iva_pct <> 21 or q.revision < 1 then raise exception 'revisión emitida: %', row_to_json(q); end if;
  select count(*) into n from public.v_quotes_list where number = q.number and is_current;
  if n <> 1 or not exists (select 1 from public.v_quotes_list where id = v_rev and is_current) then
    raise exception 'is_current tras emitir la revisión';
  end if;
  perform pg_temp.log(format('OK revisión %s', public.quote_display_number(q)));

  -- Un cliente con presupuestos no se puede borrar.
  ok := false;
  begin
    delete from public.clients where id = v_client;
  exception when others then ok := true;
  end;
  if not ok then raise exception 'se borró un cliente con presupuestos'; end if;
  perform pg_temp.log('OK cliente protegido');

  perform pg_temp.log('=== F3 smoke: TODO OK ===');
end $$;

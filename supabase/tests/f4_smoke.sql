-- =============================================================================
-- Prueba de humo F4 (consumo de IA). Corre después de f1/f3 en la misma
-- transacción con ROLLBACK (scripts/db/dry-run.mjs): no deja datos.
-- =============================================================================

do $$
declare
  v_admin uuid := current_setting('test.admin_id')::uuid;
  v_r1 uuid;
  v_r2 uuid;
  s record;
  base_spent numeric;
  base_topups numeric;
begin
  select spent_usd, topups_usd into base_spent, base_topups from public.v_ai_usage_summary;

  -- Como la Edge Function (service role): dos llamadas del wizard.
  insert into public.ai_requests (step, model, tokens_in, tokens_out, cost_usd, created_by)
  values ('extract', 'claude-haiku-5-5', 500, 200, 0.00015, v_admin) returning id into v_r1;
  insert into public.ai_requests (step, model, tokens_in, tokens_out, cost_usd, created_by)
  values ('select', 'claude-sonnet-5-5', 1200, 300, 0.0054, v_admin) returning id into v_r2;
  insert into public.ai_credit_topups (amount_usd, notes, created_by) values (10, 'F4 smoke', v_admin);

  select * into s from public.v_ai_usage_summary;
  if s.topups_usd - base_topups <> 10 or s.spent_usd - base_spent <> 0.00555
     or s.balance_usd <> s.topups_usd - s.spent_usd then
    raise exception 'v_ai_usage_summary: %', row_to_json(s);
  end if;
  perform set_config('test.r1', v_r1::text, true);
  perform set_config('test.r2', v_r2::text, true);
  perform pg_temp.log(format('OK resumen IA (saldo %s)', round(s.balance_usd, 4)));
end $$;

set local role authenticated;

do $$
declare
  v_client uuid;
  v_quote uuid;
  n int;
  r record;
begin
  insert into public.clients (name) values ('F4 Smoke') returning id into v_client;
  v_quote := public.create_quote_from_kit(v_client, (select id from public.kits where code = 'KIT_ON_MEDIO'), '{}'::jsonb);
  n := public.link_ai_requests(v_quote, array[current_setting('test.r1')::uuid, current_setting('test.r2')::uuid]);
  if n <> 2 then raise exception 'link_ai_requests vinculó %', n; end if;
  -- Ya vinculadas: no se re-asignan.
  if public.link_ai_requests(v_quote, array[current_setting('test.r1')::uuid]) <> 0 then
    raise exception 'link_ai_requests re-vinculó';
  end if;
  select * into r from public.v_quotes_list where id = v_quote;
  if r.ai_requests_count <> 2 or r.ai_cost_usd <> 0.00555 then
    raise exception 'v_quotes_list IA: %', row_to_json(r);
  end if;
  if (select count(*) from public.v_ai_requests_list where quote_id = v_quote and client_name = 'F4 Smoke') <> 2 then
    raise exception 'v_ai_requests_list';
  end if;
  perform pg_temp.log('OK vínculo IA ↔ presupuesto');
  perform pg_temp.log('=== F4 smoke: TODO OK ===');
end $$;

reset role;

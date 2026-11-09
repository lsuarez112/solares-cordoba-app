-- =============================================================================
-- Prueba de humo: flujo de estados (emitido → confirmado → facturar → facturado).
-- Corre después de f1/f3/f4 en la misma transacción con ROLLBACK (dry-run).
-- =============================================================================

set local role authenticated;

do $$
declare
  v_client uuid;
  v_quote uuid;
  v_rev uuid;
  q public.quotes;
  n int;
begin
  insert into public.clients (name) values ('F5 Smoke') returning id into v_client;
  v_quote := public.create_quote_from_kit(v_client, (select id from public.kits where code = 'KIT_ON_MEDIO'), '{}'::jsonb);

  -- Un borrador no cambia de estado.
  begin
    perform public.set_quote_status(v_quote, 'confirmed');
    raise exception 'FALLA: cambió el estado de un borrador';
  exception when others then
    if sqlerrm like 'FALLA%' then raise; end if;
  end;

  q := public.issue_quote(v_quote, 21);
  if q.status <> 'issued' or q.status_changed_at is null then raise exception 'emitir: %', q.status; end if;

  -- No se saltean pasos.
  begin
    perform public.set_quote_status(v_quote, 'invoiced');
    raise exception 'FALLA: saltó de emitido a facturado';
  exception when others then
    if sqlerrm like 'FALLA%' then raise; end if;
  end;

  q := public.set_quote_status(v_quote, 'confirmed', 'Aceptó por WhatsApp');
  q := public.set_quote_status(v_quote, 'to_invoice');
  q := public.set_quote_status(v_quote, 'invoiced');
  if q.status <> 'invoiced' then raise exception 'flujo: %', q.status; end if;
  -- Volver un paso (corrección).
  q := public.set_quote_status(v_quote, 'to_invoice');
  select count(*) into n from public.v_quote_status_history where quote_id = v_quote;
  if n <> 4 then raise exception 'historial: % filas', n; end if;
  if (select note from public.quote_status_history where quote_id = v_quote and to_status = 'confirmed') <> 'Aceptó por WhatsApp' then
    raise exception 'historial: nota';
  end if;
  perform pg_temp.log('OK flujo de estados + historial');

  -- Sigue siendo inmutable y no se borra.
  begin
    update public.quotes set notes = 'x' where id = v_quote;
    raise exception 'FALLA: se editó un presupuesto en facturación';
  exception when sqlstate 'P0001' then null;
  end;
  begin
    update public.quotes set status = 'issued' where id = v_quote;
    raise exception 'FALLA: se cambió el estado sin la RPC';
  exception when sqlstate 'P0001' then null;
  end;
  begin
    delete from public.quotes where id = v_quote;
    raise exception 'FALLA: se borró un presupuesto en facturación';
  exception when sqlstate 'P0001' then null;
  end;
  -- En facturación no se revisa.
  begin
    perform public.create_quote_revision(v_quote);
    raise exception 'FALLA: se revisó un presupuesto en facturación';
  exception when others then
    if sqlerrm like 'FALLA%' then raise; end if;
  end;
  perform pg_temp.log('OK inmutabilidad en facturación');

  -- Un confirmado sí se revisa; al emitir la revisión, la anterior deja de ser vigente
  -- y ya no se le puede cambiar el estado.
  q := public.set_quote_status(v_quote, 'confirmed');
  v_rev := public.create_quote_revision(v_quote);
  perform public.issue_quote(v_rev, 21);
  begin
    perform public.set_quote_status(v_quote, 'to_invoice');
    raise exception 'FALLA: cambió el estado de una revisión no vigente';
  exception when others then
    if sqlerrm like 'FALLA%' then raise; end if;
  end;
  if (select issued_count from public.v_clients_list where id = v_client) <> 2 then
    raise exception 'v_clients_list.issued_count';
  end if;
  perform pg_temp.log('OK revisión de un confirmado');
  perform pg_temp.log('=== F5 smoke: TODO OK ===');
end $$;

reset role;

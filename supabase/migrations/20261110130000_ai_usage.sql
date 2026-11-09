-- =============================================================================
-- F4: consumo de IA. La API de Anthropic no informa el saldo prepago, así que el
-- saldo se estima: recargas registradas a mano − costo de cada llamada
-- (ai_requests.cost_usd, que calcula la Edge Function con los tokens reales).
-- =============================================================================

alter table public.app_settings
  add column if not exists ai_enabled boolean not null default true,
  add column if not exists ai_low_balance_usd numeric(10,2) not null default 2
    check (ai_low_balance_usd >= 0);

-- Recargas de crédito en la consola de Anthropic (registro manual).
create table if not exists public.ai_credit_topups (
  id uuid primary key default gen_random_uuid(),
  amount_usd numeric(10,2) not null check (amount_usd > 0),
  topped_at date not null default current_date,
  notes text,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now()
);
create index if not exists ai_credit_topups_date_idx on public.ai_credit_topups (topped_at desc);

alter table public.ai_credit_topups enable row level security;
drop policy if exists "ai_credit_topups: leer" on public.ai_credit_topups;
create policy "ai_credit_topups: leer" on public.ai_credit_topups
  for select to authenticated using (public.is_active_user());
drop policy if exists "ai_credit_topups: crear" on public.ai_credit_topups;
create policy "ai_credit_topups: crear" on public.ai_credit_topups
  for insert to authenticated with check (public.has_permission('configs', 'update'));
drop policy if exists "ai_credit_topups: borrar" on public.ai_credit_topups;
create policy "ai_credit_topups: borrar" on public.ai_credit_topups
  for delete to authenticated using (public.has_permission('configs', 'update'));

-- ---------------------------------------------------------------------------
-- Resumen para Configuración → IA.
-- ---------------------------------------------------------------------------
create or replace view public.v_ai_usage_summary
with (security_invoker = on) as
with t as (
  select coalesce(sum(amount_usd), 0) as topups_usd, max(topped_at) as last_topup_at
  from public.ai_credit_topups
), r as (
  select
    coalesce(sum(cost_usd), 0) as spent_usd,
    count(*)::int as requests_count,
    coalesce(sum(cost_usd) filter (where created_at >= date_trunc('month', now())), 0) as spent_month_usd,
    (count(*) filter (where created_at >= date_trunc('month', now())))::int as requests_month,
    (count(*) filter (where error is not null))::int as errors_count
  from public.ai_requests
)
select
  t.topups_usd,
  t.last_topup_at,
  r.spent_usd,
  t.topups_usd - r.spent_usd as balance_usd,
  r.spent_month_usd,
  r.requests_month,
  r.requests_count,
  r.errors_count
from t, r;

grant select on public.v_ai_usage_summary to authenticated;

-- Llamadas para el listado (sin los JSON completos).
create or replace view public.v_ai_requests_list
with (security_invoker = on) as
select
  r.id,
  r.step,
  r.model,
  r.tokens_in,
  r.tokens_out,
  r.cache_read_tokens,
  r.cache_write_tokens,
  r.cost_usd,
  r.duration_ms,
  r.error,
  r.quote_id,
  public.quote_display_number(q) as quote_number,
  c.name as client_name,
  r.created_by,
  p.full_name as user_name,
  r.created_at
from public.ai_requests r
left join public.quotes q on q.id = r.quote_id
left join public.clients c on c.id = q.client_id
left join public.user_profiles p on p.id = r.created_by;

grant select on public.v_ai_requests_list to authenticated;

-- ---------------------------------------------------------------------------
-- Las llamadas del wizard ocurren antes de que exista el presupuesto: al crearlo
-- se vinculan las del mismo usuario que todavía no tienen presupuesto.
-- ---------------------------------------------------------------------------
create or replace function public.link_ai_requests(p_quote_id uuid, p_ids uuid[])
returns int language plpgsql security definer set search_path = public as $$
declare n int;
begin
  perform assert_active_user();
  if not exists (select 1 from quotes where id = p_quote_id) then
    raise exception 'Presupuesto inexistente';
  end if;
  update ai_requests set quote_id = p_quote_id
  where id = any(coalesce(p_ids, '{}')) and created_by = auth.uid() and quote_id is null;
  get diagnostics n = row_count;
  return n;
end;
$$;

grant execute on function public.link_ai_requests(uuid, uuid[]) to authenticated;

-- ---------------------------------------------------------------------------
-- v_quotes_list: + costo de IA del presupuesto (columnas al final).
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
  ai.requests_count as ai_requests_count
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

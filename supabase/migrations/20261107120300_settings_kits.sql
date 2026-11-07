-- =============================================================================
-- Configuración, zonas solares, equipos típicos, kits y reglas de armado.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- app_settings: fila única con parámetros de presupuesto y dimensionamiento.
-- Los datos de la empresa (razón social, CUIT, logo...) viven en companies.
-- ---------------------------------------------------------------------------
create table if not exists public.app_settings (
  id smallint primary key default 1 check (id = 1),
  number_prefix text not null default 'P-',
  default_validity_days int not null default 15 check (default_validity_days between 1 and 365),
  default_iva_pct numeric(5,2) not null default 21,
  quote_footer text,
  rate_mode text not null default 'api' check (rate_mode in ('api', 'manual')),
  -- Dimensionamiento (05_sizing rules)
  system_efficiency numeric(4,3) not null default 0.75,
  default_hsp numeric(3,1) not null default 4.4,
  kwp_tolerance_pct numeric(4,1) not null default 15,
  dod_lifepo4 numeric(3,2) not null default 0.90,
  dod_lead numeric(3,2) not null default 0.50,
  battery_eff_lifepo4 numeric(3,2) not null default 0.95,
  battery_eff_lead numeric(3,2) not null default 0.85,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

insert into public.app_settings (id, quote_footer)
values (1, 'Precios en USD sin IVA salvo indicación. Sujeto a disponibilidad de stock. Instalación no incluida salvo que se detalle.')
on conflict (id) do nothing;

drop trigger if exists app_settings_updated_at on public.app_settings;
create trigger app_settings_updated_at
  before update on public.app_settings
  for each row execute function public.set_updated_at();

-- Cotización vigente según el modo configurado (api / manual), con fallback.
create or replace function public.current_exchange_rate()
returns table (id uuid, usd_to_ars numeric, source text, rate_date date, fetched_at timestamptz)
language sql stable security definer set search_path = public as $$
  select er.id, er.usd_to_ars, er.source, er.date, er.fetched_at
  from exchange_rates er
  order by (er.source = (select rate_mode from app_settings where id = 1)) desc,
           er.fetched_at desc
  limit 1;
$$;

-- Vista de productos con precio en ARS (la usa el listado del front).
create or replace view public.v_products_with_ars
with (security_invoker = true) as
select
  p.id,
  p.product_code,
  p.name,
  p.short_desc,
  p.description,
  p.category_id,
  p.grid_type,
  p.generic_properties,
  p.price_usd,
  p.price_updated_at,
  p.active,
  p.created_at,
  p.updated_at,
  round(p.price_usd * r.usd_to_ars, 2) as price_ars,
  r.usd_to_ars as current_exchange_rate,
  r.rate_date as exchange_rate_date,
  pc.name as category_name,
  pc.prefix as category_prefix
from public.products p
left join public.product_categories pc on pc.id = p.category_id
left join lateral public.current_exchange_rate() r on true;

-- ---------------------------------------------------------------------------
-- Zonas solares (04_solar zones): HSP por ciudad y valores regionales.
-- ---------------------------------------------------------------------------
create table if not exists public.solar_zones (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'city' check (kind in ('city', 'region')),
  name text not null,
  province text not null,
  latitude numeric(4,1),
  hsp_horizontal numeric(3,1) not null,
  hsp_optimal numeric(3,1) not null,
  optimal_angle smallint,
  notes text,
  sort_order int not null default 0,
  unique (kind, name)
);

-- ---------------------------------------------------------------------------
-- Equipos típicos (05 §3.2) para el formulario guiado.
-- ---------------------------------------------------------------------------
create table if not exists public.appliance_presets (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  watts numeric not null check (watts > 0),
  hours_per_day numeric not null check (hours_per_day >= 0 and hours_per_day <= 24),
  use_factor numeric not null default 1,
  sort_order int not null default 0,
  active boolean not null default true
);

-- ---------------------------------------------------------------------------
-- Kits predefinidos (03_kit templates)
-- ---------------------------------------------------------------------------
create table if not exists public.kits (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  grid_type public.grid_type_enum not null,
  phases text not null default 'mono' check (phases in ('mono', 'tri')),
  battery_voltage smallint,
  kwp numeric(6,2) not null check (kwp > 0),
  battery_kwh numeric(6,2) not null default 0,
  inverter_kw numeric(6,2),
  est_kwh_month numeric(7,1),
  ref_kwh_month_min numeric(7,1),
  ref_kwh_month_max numeric(7,1),
  description text,
  notes text,
  active boolean not null default true,
  sort_order int not null default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint kits_on_grid_no_battery check (grid_type <> 'ON-GRID' or battery_kwh = 0)
);

drop trigger if exists kits_updated_at on public.kits;
create trigger kits_updated_at
  before update on public.kits
  for each row execute function public.set_updated_at();

create table if not exists public.kit_items (
  id uuid primary key default gen_random_uuid(),
  kit_id uuid not null references public.kits(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  qty numeric(10,2) not null check (qty > 0),
  sort_order int not null default 0,
  unique (kit_id, product_id)
);
create index if not exists kit_items_kit_idx on public.kit_items (kit_id);

-- Opcionales del kit: cambios sobre el BOM base.
-- changes = [{ "op": "add" | "set" | "remove", "product_code": "575917", "qty": 1 }]
--   add    → suma qty a la cantidad actual (o agrega el ítem)
--   set    → fija la cantidad (0 equivale a quitar)
--   remove → quita el ítem
create table if not exists public.kit_options (
  id uuid primary key default gen_random_uuid(),
  kit_id uuid not null references public.kits(id) on delete cascade,
  code text not null,
  kind text not null check (kind in ('autonomy', 'generation', 'extra')),
  name text not null,
  changes jsonb not null default '[]'::jsonb check (jsonb_typeof(changes) = 'array'),
  kwp numeric(6,2),
  battery_kwh numeric(6,2),
  est_kwh_month numeric(7,1),
  notes text,
  sort_order int not null default 0,
  unique (kit_id, code)
);

-- Reglas de armado: texto corto que va al prompt de la IA (system_type null = todas).
create table if not exists public.assembly_rules (
  id uuid primary key default gen_random_uuid(),
  grid_type public.grid_type_enum,
  text text not null,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Totales del kit calculados desde los precios actuales.
create or replace view public.v_kits_with_totals
with (security_invoker = true) as
select
  k.*,
  coalesce(t.total_usd, 0) as total_usd,
  coalesce(t.items_count, 0) as items_count,
  coalesce(t.items_without_price, 0) as items_without_price
from public.kits k
left join lateral (
  select
    round(sum(ki.qty * p.price_usd), 2) as total_usd,
    count(*) as items_count,
    count(*) filter (where p.price_usd <= 0 or not p.active) as items_without_price
  from public.kit_items ki
  join public.products p on p.id = ki.product_id
  where ki.kit_id = k.id
) t on true;

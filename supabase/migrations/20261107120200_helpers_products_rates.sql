-- =============================================================================
-- Helpers, productos (código normalizado + price_updated_at) y cotización.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

-- Usuario autenticado con perfil activo (regla base de RLS de la spec).
create or replace function public.is_active_user()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from user_profiles up
    where up.id = auth.uid() and up.active = true
  );
$$;

-- Código de producto: los SKU numéricos del ERP tienen 6 dígitos con cero inicial.
create or replace function public.normalize_product_code(code text)
returns text language sql immutable as $$
  select case
    when btrim(code) ~ '^\d{1,5}$' then lpad(btrim(code), 6, '0')
    else upper(btrim(code))
  end;
$$;

-- Teléfono AR a dígitos con prefijo 549 (móvil). Se usa para detectar duplicados.
create or replace function public.normalize_phone(phone text)
returns text language plpgsql immutable as $$
declare
  d text := regexp_replace(coalesce(phone, ''), '\D', '', 'g');
begin
  if d = '' then return null; end if;
  d := regexp_replace(d, '^00', '');
  if d like '549%' then return d; end if;
  if d like '54%' then d := substr(d, 3); end if;
  d := regexp_replace(d, '^0', '');
  -- quita el "15" de celulares escritos a la antigua (ej. 351 15 1234567)
  if length(d) = 12 then
    d := regexp_replace(d, '^(\d{2,4})15', '\1');
  end if;
  return '549' || d;
end;
$$;

-- ---------------------------------------------------------------------------
-- Productos
-- ---------------------------------------------------------------------------
update public.products
set product_code = public.normalize_product_code(product_code)
where product_code is distinct from public.normalize_product_code(product_code);

alter table public.products
  add column if not exists price_updated_at timestamptz;

create or replace function public.products_before_write()
returns trigger language plpgsql as $$
begin
  new.product_code := public.normalize_product_code(new.product_code);
  if tg_op = 'INSERT' then
    new.price_updated_at := coalesce(new.price_updated_at, now());
  elsif new.price_usd is distinct from old.price_usd then
    new.price_updated_at := now();
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists products_before_write on public.products;
create trigger products_before_write
  before insert or update on public.products
  for each row execute function public.products_before_write();

create index if not exists products_active_idx on public.products (active);
create index if not exists products_props_idx on public.products using gin (generic_properties);

-- ---------------------------------------------------------------------------
-- Cotización
-- ---------------------------------------------------------------------------
alter table public.exchange_rates
  add column if not exists source text not null default 'manual',
  add column if not exists fetched_at timestamptz not null default now();

do $$ begin
  alter table public.exchange_rates
    add constraint exchange_rates_source_check check (source in ('api', 'manual'));
exception when duplicate_object then null; end $$;

-- Antes había una cotización por día; ahora puede haber varias (api + override manual).
alter table public.exchange_rates drop constraint if exists exchange_rates_date_key;
create index if not exists exchange_rates_fetched_idx
  on public.exchange_rates (fetched_at desc);

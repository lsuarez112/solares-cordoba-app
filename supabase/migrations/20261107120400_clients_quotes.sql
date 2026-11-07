-- =============================================================================
-- Clientes, presupuestos con revisiones, log de IA e imports de precios.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Clientes. El teléfono duplicado es solo un aviso (índice NO único).
-- ---------------------------------------------------------------------------
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) > 0),
  phone text,
  phone_normalized text generated always as (public.normalize_phone(phone)) stored,
  email text,
  city text,
  address text,
  cuit text,
  notes text,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists clients_phone_idx on public.clients (phone_normalized);
create index if not exists clients_name_idx on public.clients (lower(name));

drop trigger if exists clients_updated_at on public.clients;
create trigger clients_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Presupuestos. Cada fila es una revisión:
--   number   → se asigna al emitir la primera vez (secuencia); las revisiones lo heredan
--   revision → 0 = original, 1 = R1, 2 = R2...
--   is_current → la revisión vigente del número (la última creada)
-- Una revisión emitida es inmutable (trigger); editarla crea una revisión nueva.
-- ---------------------------------------------------------------------------
create sequence if not exists public.quote_number_seq start 1;

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  number int,
  revision int not null default 0 check (revision >= 0),
  status text not null default 'draft' check (status in ('draft', 'issued')),
  is_current boolean not null default true,
  source_quote_id uuid references public.quotes(id) on delete set null,
  client_id uuid not null references public.clients(id) on delete restrict,
  seller_id uuid references auth.users(id) default auth.uid(),
  grid_type public.grid_type_enum,
  kit_id uuid references public.kits(id) on delete set null,
  input jsonb not null default '{}'::jsonb,
  sizing jsonb,
  ai_summary jsonb,
  -- Foto al emitir
  usd_ars numeric(12,4),
  rate_source text,
  rate_date date,
  iva_pct numeric(5,2) not null default 21 check (iva_pct >= 0 and iva_pct <= 100),
  subtotal_usd numeric(14,2),
  iva_usd numeric(14,2),
  total_usd numeric(14,2),
  total_ars numeric(16,2),
  valid_until date,
  notes text,
  client_notes text,
  pdf_path text,
  issued_at timestamptz,
  issued_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quotes_issued_has_number check (status = 'draft' or number is not null),
  constraint quotes_revision_has_number check (revision = 0 or number is not null)
);
create unique index if not exists quotes_number_revision_key
  on public.quotes (number, revision) where number is not null;
create index if not exists quotes_client_idx on public.quotes (client_id);
create index if not exists quotes_seller_idx on public.quotes (seller_id);
create index if not exists quotes_created_idx on public.quotes (created_at desc);

create table if not exists public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  code text not null,
  description text not null,
  qty numeric(10,2) not null check (qty > 0),
  unit_price_usd numeric(14,2) not null default 0 check (unit_price_usd >= 0),
  subtotal_usd numeric(14,2) generated always as (round(qty * unit_price_usd, 2)) stored,
  sort_order int not null default 0
);
create index if not exists quote_items_quote_idx on public.quote_items (quote_id);

-- Número para mostrar: P-000042 / P-000042-R1 (borrador sin número → null).
create or replace function public.quote_display_number(q public.quotes)
returns text language sql stable set search_path = public as $$
  select case when q.number is null then null else
    (select number_prefix from app_settings where id = 1)
    || lpad(q.number::text, 6, '0')
    || case when q.revision > 0 then '-R' || q.revision else '' end
  end;
$$;

-- Inmutabilidad de lo emitido.
create or replace function public.quotes_guard_issued()
returns trigger language plpgsql as $$
begin
  if tg_op = 'DELETE' then
    if old.status = 'issued' then
      raise exception 'No se puede borrar un presupuesto emitido' using errcode = 'P0001';
    end if;
    return old;
  end if;

  if old.status = 'issued' then
    -- Solo se permite marcar la revisión como no vigente y guardar el PDF.
    if (to_jsonb(new) - array['is_current', 'pdf_path', 'updated_at'])
       is distinct from (to_jsonb(old) - array['is_current', 'pdf_path', 'updated_at']) then
      raise exception 'El presupuesto emitido no se puede modificar: creá una revisión'
        using errcode = 'P0001';
    end if;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists quotes_guard_issued on public.quotes;
create trigger quotes_guard_issued
  before update or delete on public.quotes
  for each row execute function public.quotes_guard_issued();

create or replace function public.quote_items_guard_issued()
returns trigger language plpgsql as $$
declare
  target uuid := coalesce(new.quote_id, old.quote_id);
begin
  if exists (select 1 from quotes where id = target and status = 'issued') then
    raise exception 'Los ítems de un presupuesto emitido no se pueden modificar'
      using errcode = 'P0001';
  end if;
  if tg_op = 'UPDATE' and new.quote_id <> old.quote_id
     and exists (select 1 from quotes where id = old.quote_id and status = 'issued') then
    raise exception 'Los ítems de un presupuesto emitido no se pueden modificar'
      using errcode = 'P0001';
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists quote_items_guard_issued on public.quote_items;
create trigger quote_items_guard_issued
  before insert or update or delete on public.quote_items
  for each row execute function public.quote_items_guard_issued();

-- ---------------------------------------------------------------------------
-- Log de llamadas a la IA (para medir tokens y costo).
-- ---------------------------------------------------------------------------
create table if not exists public.ai_requests (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid references public.quotes(id) on delete set null,
  step text not null check (step in ('extract', 'select', 'refine')),
  model text not null,
  request jsonb,
  response jsonb,
  tokens_in int,
  tokens_out int,
  cache_read_tokens int,
  cache_write_tokens int,
  cost_usd numeric(10,6),
  duration_ms int,
  error text,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now()
);
create index if not exists ai_requests_created_idx on public.ai_requests (created_at desc);

-- ---------------------------------------------------------------------------
-- Historial de importaciones de precios.
-- ---------------------------------------------------------------------------
create table if not exists public.price_imports (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  rows_total int not null default 0,
  rows_updated int not null default 0,
  rows_unchanged int not null default 0,
  codes_not_found jsonb not null default '[]'::jsonb,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now()
);

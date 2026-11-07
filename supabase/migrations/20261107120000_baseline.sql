-- =============================================================================
-- Baseline: esquema existente que se conserva en V0.
-- Idempotente: en la DB actual no cambia nada; en una DB vacía la crea.
-- Fuente: respaldo lógico backups/2026-11-06-pre-v0 (no versionado).
-- =============================================================================

create extension if not exists pgcrypto;

do $$ begin
  create type public.grid_type_enum as enum ('ON-GRID', 'OFF-GRID', 'HYBRID');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Roles y perfiles
-- ---------------------------------------------------------------------------
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name varchar not null unique,
  description text,
  active boolean not null default true,
  permissions jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name varchar,
  avatar_url text,
  active boolean not null default false,
  role_id uuid not null references public.roles(id),
  home_page varchar not null default '/dashboard',
  phone varchar,
  timezone varchar not null default 'America/Argentina/Cordoba',
  preferred_currency varchar not null default 'ARS',
  notifications_enabled boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Catálogo
-- ---------------------------------------------------------------------------
create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),
  name varchar not null unique,
  description text,
  slug varchar unique,
  icon varchar,
  prefix varchar unique,
  created_at timestamptz default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  product_code varchar not null unique,
  name varchar not null,
  short_desc varchar,
  description text,
  category_id uuid references public.product_categories(id) on delete set null,
  grid_type public.grid_type_enum,
  generic_properties jsonb default '{}'::jsonb,
  price_usd numeric not null default 0.00,
  active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists products_category_idx on public.products (category_id);

-- ---------------------------------------------------------------------------
-- Empresa y cotización
-- ---------------------------------------------------------------------------
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name varchar not null,
  legal_name varchar,
  tax_id varchar,
  address text,
  city varchar,
  province varchar,
  country varchar default 'Argentina',
  phone varchar,
  email varchar,
  website text,
  logo_url text,
  active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.exchange_rates (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  usd_to_ars numeric not null,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Funciones existentes
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.get_my_role()
returns text language sql stable security definer set search_path = public as $$
  select r.name
  from user_profiles up
  join roles r on r.id = up.role_id
  where up.id = auth.uid();
$$;

create or replace function public.has_permission(module text, action text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from user_profiles up
    join roles r on r.id = up.role_id
    where up.id = auth.uid()
      and up.active = true
      and r.permissions -> module ? action
  );
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.user_profiles (id, full_name, avatar_url, role_id, active)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    (select id from public.roles where name = 'Lectura'),
    false
  );
  return new;
end;
$$;

create or replace function public.activate_user(user_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.user_profiles set active = true where id = user_id;
  update auth.users set email_confirmed_at = now()
  where id = user_id and email_confirmed_at is null;
end;
$$;

create or replace function public.deactivate_user(user_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.user_profiles set active = false where id = user_id;
end;
$$;

do $ begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'on_auth_user_created' and tgrelid = 'auth.users'::regclass
  ) then
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute function public.handle_new_user();
  end if;
end $;

-- ---------------------------------------------------------------------------
-- Storage: logos de empresa (público)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('company-logos', 'company-logos', true)
on conflict (id) do nothing;

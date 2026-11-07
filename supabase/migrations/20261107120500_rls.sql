-- =============================================================================
-- RLS
--   Operación (clientes, presupuestos): cualquier usuario autenticado y activo (spec §6).
--   Catálogo y configuración: lectura para activos; escritura según el permiso del rol
--   (convención del repo: has_permission(module, action)).
--   ai_requests: lo escribe la Edge Function con service role; los activos solo leen.
-- =============================================================================

alter table public.roles enable row level security;
alter table public.user_profiles enable row level security;
alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.companies enable row level security;
alter table public.exchange_rates enable row level security;
alter table public.app_settings enable row level security;
alter table public.solar_zones enable row level security;
alter table public.appliance_presets enable row level security;
alter table public.kits enable row level security;
alter table public.kit_items enable row level security;
alter table public.kit_options enable row level security;
alter table public.assembly_rules enable row level security;
alter table public.clients enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
alter table public.ai_requests enable row level security;
alter table public.price_imports enable row level security;

-- Helper para no repetir: crea las 4 políticas estándar de una tabla de catálogo.
create or replace function pg_temp.catalog_policies(tbl text, module text)
returns void language plpgsql as $$
begin
  execute format('drop policy if exists "%1$s: leer" on public.%1$I', tbl);
  execute format('drop policy if exists "%1$s: crear" on public.%1$I', tbl);
  execute format('drop policy if exists "%1$s: editar" on public.%1$I', tbl);
  execute format('drop policy if exists "%1$s: borrar" on public.%1$I', tbl);
  execute format('create policy "%1$s: leer" on public.%1$I for select to authenticated using (public.is_active_user())', tbl);
  execute format('create policy "%1$s: crear" on public.%1$I for insert to authenticated with check (public.has_permission(%2$L, ''create''))', tbl, module);
  execute format('create policy "%1$s: editar" on public.%1$I for update to authenticated using (public.has_permission(%2$L, ''update'')) with check (public.has_permission(%2$L, ''update''))', tbl, module);
  execute format('create policy "%1$s: borrar" on public.%1$I for delete to authenticated using (public.has_permission(%2$L, ''delete''))', tbl, module);
end;
$$;

create or replace function pg_temp.operational_policies(tbl text)
returns void language plpgsql as $$
begin
  execute format('drop policy if exists "%1$s: activos" on public.%1$I', tbl);
  execute format('create policy "%1$s: activos" on public.%1$I for all to authenticated using (public.is_active_user()) with check (public.is_active_user())', tbl);
end;
$$;

-- Productos y categorías: se reemplazan las políticas viejas por el esquema estándar.
drop policy if exists "Actualizar productos con permiso" on public.products;
drop policy if exists "Eliminar productos con permiso" on public.products;
drop policy if exists "Insertar productos con permiso" on public.products;
drop policy if exists "Usuarios activos pueden leer productos" on public.products;
drop policy if exists "Actualizar categorías con permiso" on public.product_categories;
drop policy if exists "Eliminar categorías con permiso" on public.product_categories;
drop policy if exists "Insertar categorías con permiso" on public.product_categories;
drop policy if exists "Leer categorías con permiso" on public.product_categories;

select pg_temp.catalog_policies('products', 'products');
select pg_temp.catalog_policies('product_categories', 'products');
select pg_temp.catalog_policies('kits', 'kits');
select pg_temp.catalog_policies('kit_items', 'kits');
select pg_temp.catalog_policies('kit_options', 'kits');
select pg_temp.catalog_policies('assembly_rules', 'kits');
select pg_temp.catalog_policies('solar_zones', 'configs');
select pg_temp.catalog_policies('appliance_presets', 'configs');
select pg_temp.catalog_policies('companies', 'configs');
select pg_temp.catalog_policies('app_settings', 'configs');
select pg_temp.catalog_policies('exchange_rates', 'exchange_rates');

select pg_temp.operational_policies('clients');
select pg_temp.operational_policies('quotes');
select pg_temp.operational_policies('quote_items');

drop policy if exists "ai_requests: leer" on public.ai_requests;
create policy "ai_requests: leer" on public.ai_requests
  for select to authenticated using (public.is_active_user());

drop policy if exists "price_imports: leer" on public.price_imports;
create policy "price_imports: leer" on public.price_imports
  for select to authenticated using (public.is_active_user());

-- ---------------------------------------------------------------------------
-- Storage
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('quote-pdfs', 'quote-pdfs', false)
on conflict (id) do nothing;

drop policy if exists "company-logos: leer" on storage.objects;
drop policy if exists "company-logos: subir" on storage.objects;
drop policy if exists "company-logos: editar" on storage.objects;
drop policy if exists "company-logos: borrar" on storage.objects;
create policy "company-logos: leer" on storage.objects
  for select using (bucket_id = 'company-logos');
create policy "company-logos: subir" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'company-logos' and public.has_permission('configs', 'update'));
create policy "company-logos: editar" on storage.objects
  for update to authenticated
  using (bucket_id = 'company-logos' and public.has_permission('configs', 'update'));
create policy "company-logos: borrar" on storage.objects
  for delete to authenticated
  using (bucket_id = 'company-logos' and public.has_permission('configs', 'update'));

drop policy if exists "quote-pdfs: activos" on storage.objects;
create policy "quote-pdfs: activos" on storage.objects
  for all to authenticated
  using (bucket_id = 'quote-pdfs' and public.is_active_user())
  with check (bucket_id = 'quote-pdfs' and public.is_active_user());

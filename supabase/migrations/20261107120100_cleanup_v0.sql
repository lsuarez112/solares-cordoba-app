-- =============================================================================
-- Limpieza V0: se borra lo que no forma parte del presupuestador.
-- Los datos borrados están respaldados en backups/2026-11-06-pre-v0.
-- =============================================================================

-- Políticas que dependen de user_company_ids() (se recrean en la migración de RLS)
drop policy if exists "Crear empresas" on public.companies;
drop policy if exists "Editar empresas propias" on public.companies;
drop policy if exists "Eliminar empresas propias" on public.companies;
drop policy if exists "Ver empresas propias" on public.companies;
drop policy if exists "Actualizar logo de empresa propia" on storage.objects;
drop policy if exists "Eliminar logo de empresa propia" on storage.objects;
drop policy if exists "Subir logo de empresa propia" on storage.objects;
drop policy if exists "Ver logos de empresas" on storage.objects;

-- Vistas que dependen de columnas o tablas que se borran
drop view if exists public.products_with_supplier;
drop view if exists public.v_products_with_ars;

-- Tablas fuera de alcance (todas sin datos útiles para V0).
-- clients / quotes / quote_items tienen 0 filas y se recrean con el esquema nuevo.
drop table if exists public.sale_documents cascade;
drop table if exists public.sales cascade;
drop table if exists public.product_components cascade;
drop table if exists public.quote_items cascade;
drop table if exists public.quotes cascade;
drop table if exists public.clients cascade;
drop table if exists public.user_companies cascade;

-- Triggers y funciones multi-empresa
drop trigger if exists link_company_to_creator on public.companies;
drop trigger if exists on_company_created on public.companies;
drop function if exists public.link_company_to_creator() cascade;
drop function if exists public.user_company_ids() cascade;

-- Proveedores
alter table public.products drop column if exists supplier_id;
drop table if exists public.suppliers cascade;

-- Columnas de producto que V0 no usa
drop index if exists public.products_is_composite_idx;
drop index if exists public.products_search_idx;
alter table public.products
  drop column if exists supplier_sku,
  drop column if exists cost_usd,
  drop column if exists stock,
  drop column if exists stock_alert_at,
  drop column if exists is_composite,
  drop column if exists links;

-- Una sola empresa
delete from public.companies where name = 'Colchones y Hogar SA';

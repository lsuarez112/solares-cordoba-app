-- Definición de referencia (ya aplicada en Supabase).
-- La app lee columnas planas category_name y supplier_* vía map-product-view-row.ts

create view public.v_products_with_ars
with
  (security_invoker = true) as
select
  p.id,
  p.product_code,
  p.supplier_sku,
  p.name,
  p.description,
  p.category_id,
  p.grid_type,
  p.generic_properties,
  p.links,
  p.is_composite,
  p.price_usd,
  p.cost_usd,
  p.stock,
  p.created_at,
  p.updated_at,
  p.short_desc,
  p.stock_alert_at,
  p.active,
  p.price_usd * er.usd_to_ars as price_ars,
  p.cost_usd * er.usd_to_ars as cost_ars,
  er.usd_to_ars as current_exchange_rate,
  er.date as exchange_rate_date,
  pc.name as category_name,
  pc.prefix as category_prefix,
  s.id as supplier_id,
  s.name as supplier_name,
  s.prefix as supplier_prefix,
  s.currency as supplier_currency,
  s.payment_days as supplier_payment_days,
  s.rating as supplier_rating,
  s.phone as supplier_phone,
  s.whatsapp as supplier_whatsapp,
  s.email as supplier_email
from
  products p
  left join product_categories pc on pc.id = p.category_id
  left join suppliers s on s.id = p.supplier_id
  left join exchange_rates er on er.date = (
    (
      select
        max(exchange_rates.date) as max
      from
        exchange_rates
    )
  );

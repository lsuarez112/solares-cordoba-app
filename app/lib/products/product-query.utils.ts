/** Listado desde v_products_with_ars (category_name y supplier_* en la vista). */
export const PRODUCT_VIEW_SELECT = "*"

/** Tabla products: embed de categoría y proveedor por FK. */
export const PRODUCT_TABLE_SELECT = `
  *,
  category:product_categories ( id, name, description, slug, icon, prefix ),
  supplier:suppliers!supplier_id ( id, name, prefix, tax_id, currency, active, contact_name, email, whatsapp, phone, payment_days, rating )
`

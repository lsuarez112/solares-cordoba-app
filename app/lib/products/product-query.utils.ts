/** Listado desde v_products_with_ars (incluye category_name y category_prefix). */
export const PRODUCT_VIEW_SELECT = "*"

/** Tabla products: embed de categoría por FK. */
export const PRODUCT_TABLE_SELECT = `
  *,
  category:product_categories ( id, name, description, slug, icon, prefix )
`

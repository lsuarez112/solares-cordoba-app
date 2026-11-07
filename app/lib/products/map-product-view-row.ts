import { ProductSchema, type Product } from "~/domain/products/products.schemas"

type ProductViewRow = Record<string, unknown>

function buildCategoryFromViewColumns(row: ProductViewRow) {
  const id = row.category_id
  const name = row.category_name

  if (typeof id !== "string" || typeof name !== "string" || !name.trim()) {
    return null
  }

  const prefix =
    typeof row.category_prefix === "string" ? row.category_prefix.trim() : null

  return {
    id,
    name: name.trim(),
    description: null,
    slug: null,
    icon: null,
    prefix: prefix || null,
  }
}

/** Convierte filas de v_products_with_ars a shape de Product (category anidada). */
export function normalizeProductViewRow(row: ProductViewRow): ProductViewRow {
  return {
    ...row,
    category: buildCategoryFromViewColumns(row),
  }
}

export function parseProductsFromViewRows(rows: ProductViewRow[]): Product[] {
  return rows
    .map((row) => ProductSchema.safeParse(normalizeProductViewRow(row)))
    .filter((result) => result.success)
    .map((result) => result.data)
}

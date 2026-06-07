import type { Product, ProductFormValues } from "~/domain/products/products.schemas"
import { parseProductLinks } from "~/lib/products/product-display.utils"

export const emptyProductFormValues: ProductFormValues = {
  product_code: "",
  name: "",
  short_desc: "",
  description: "",
  category_id: null,
  grid_type: null,
  supplier_id: null,
  supplier_sku: "",
  price_usd: 0,
  cost_usd: null,
  stock: 0,
  stock_alert_at: 0,
  is_composite: false,
  active: true,
  links: [],
  generic_properties: [],
}

export function productToFormValues(product: Product): ProductFormValues {
  const generic_properties = Object.entries(
    (product.generic_properties as Record<string, string>) ?? {},
  ).map(([key, value]) => ({ key, value: String(value) }))

  const links = parseProductLinks(product.links)

  return {
    product_code: product.product_code,
    name: product.name,
    short_desc: product.short_desc ?? "",
    description: product.description ?? "",
    category_id: product.category_id ?? null,
    grid_type: product.grid_type ?? null,
    supplier_id: product.supplier_id ?? null,
    supplier_sku: product.supplier_sku ?? "",
    price_usd: product.price_usd,
    cost_usd: product.cost_usd ?? null,
    stock: product.stock,
    stock_alert_at: product.stock_alert_at ?? 0,
    is_composite: product.is_composite,
    active: product.active,
    links,
    generic_properties,
  }
}

export function productToDuplicateFormValues(product: Product): ProductFormValues {
  const values = productToFormValues(product)
  return {
    ...values,
    product_code: "",
    name: `${product.name} (copia)`,
  }
}

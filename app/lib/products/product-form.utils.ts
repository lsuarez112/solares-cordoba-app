import type { Product, ProductFormValues } from "~/domain/products/products.schemas"

export const emptyProductFormValues: ProductFormValues = {
  product_code: "",
  name: "",
  short_desc: "",
  description: "",
  category_id: null,
  grid_type: null,
  price_usd: 0,
  active: true,
  generic_properties: [],
}

export function productToFormValues(product: Product): ProductFormValues {
  const generic_properties = Object.entries(
    (product.generic_properties as Record<string, unknown>) ?? {},
  ).map(([key, value]) => ({ key, value: String(value) }))

  return {
    product_code: product.product_code,
    name: product.name,
    short_desc: product.short_desc ?? "",
    description: product.description ?? "",
    category_id: product.category_id ?? null,
    grid_type: product.grid_type ?? null,
    price_usd: product.price_usd,
    active: product.active,
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

/** Payload de insert/update para la tabla products a partir del formulario. */
export function formValuesToProductPayload(values: ProductFormValues) {
  const generic_properties = Object.fromEntries(
    (values.generic_properties ?? []).map(({ key, value }) => [key, value]),
  )

  return {
    product_code: values.product_code.trim(),
    name: values.name,
    short_desc: values.short_desc ?? null,
    description: values.description ?? null,
    category_id: values.category_id ?? null,
    grid_type: values.grid_type ?? null,
    price_usd: values.price_usd,
    active: values.active,
    generic_properties,
  }
}

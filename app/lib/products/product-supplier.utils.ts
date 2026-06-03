import type { Product, ProductSupplier } from "~/domain/products/products.schemas"
import type { Supplier } from "~/domain/suppliers/suppliers.schemas"

export function supplierToProductSupplier(supplier: Supplier): ProductSupplier {
  return {
    id: supplier.id,
    name: supplier.name,
    tax_id: supplier.tax_id,
    currency: supplier.currency,
    active: supplier.active,
    contact_name: supplier.contact_name,
    email: supplier.email,
    whatsapp: supplier.whatsapp,
    phone: supplier.phone,
    payment_days: supplier.payment_days,
    rating: supplier.rating,
  }
}

export function enrichProductsWithSuppliers(
  products: Product[],
  suppliers: Supplier[],
): Product[] {
  const suppliersById = new Map(
    suppliers.map((supplier) => [supplier.id, supplierToProductSupplier(supplier)]),
  )

  return products.map((product) => ({
    ...product,
    supplier: product.supplier_id
      ? (suppliersById.get(product.supplier_id) ?? product.supplier ?? null)
      : null,
  }))
}

export function formatProductSupplierLabel(supplier: ProductSupplier) {
  return supplier.tax_id?.trim()
    ? `${supplier.name} (${supplier.tax_id})`
    : supplier.name
}

export function getProductSupplierDisplay(product: {
  supplier?: ProductSupplier | null
  supplier_id?: string | null
}) {
  if (product.supplier) {
    return {
      name: product.supplier.name,
      taxId: product.supplier.tax_id ?? null,
      currency: product.supplier.currency,
      contactName: product.supplier.contact_name ?? null,
      email: product.supplier.email ?? null,
      phone: product.supplier.phone ?? null,
      whatsapp: product.supplier.whatsapp ?? null,
      paymentDays: product.supplier.payment_days ?? null,
      rating: product.supplier.rating ?? null,
      active: product.supplier.active ?? true,
    }
  }

  if (product.supplier_id) {
    return {
      name: "Proveedor no disponible",
      taxId: null,
      currency: null,
      contactName: null,
      email: null,
      active: null,
    }
  }

  return null
}

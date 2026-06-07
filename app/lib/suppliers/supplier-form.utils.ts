import type { Supplier } from "~/domain/suppliers/suppliers.schemas"
import type { SupplierFormValues } from "~/domain/suppliers/suppliers.schemas"
import type { SupplierInsert } from "~/domain/suppliers/suppliers.types"

export const emptySupplierFormValues: SupplierFormValues = {
  name: "",
  prefix: null,
  legal_name: null,
  tax_id: null,
  contact_name: null,
  email: null,
  phone: null,
  whatsapp: null,
  website: null,
  address: null,
  city: null,
  province: null,
  country: "Argentina",
  currency: "ARS",
  payment_days: null,
  category: null,
  rating: null,
  tags: [],
  notes: null,
  active: true,
}

function cleanOptionalString(value: string | null | undefined) {
  if (value == null) return null
  const trimmed = value.trim()
  return trimmed === "" ? null : trimmed
}

export function findSuppliersWithDuplicatePrefix(
  prefix: string | null | undefined,
  suppliers: Supplier[],
  excludeId?: string,
): Supplier[] {
  const normalized = prefix?.trim().toUpperCase()
  if (!normalized) return []

  return suppliers.filter(
    (supplier) =>
      supplier.id !== excludeId &&
      supplier.prefix?.trim().toUpperCase() === normalized,
  )
}

export function supplierToFormValues(supplier: Supplier): SupplierFormValues {
  return {
    name: supplier.name,
    prefix: supplier.prefix,
    legal_name: supplier.legal_name,
    tax_id: supplier.tax_id,
    contact_name: supplier.contact_name,
    email: supplier.email ?? "",
    phone: supplier.phone,
    whatsapp: supplier.whatsapp,
    website: supplier.website ?? "",
    address: supplier.address,
    city: supplier.city,
    province: supplier.province,
    country: supplier.country,
    currency: supplier.currency,
    payment_days: supplier.payment_days,
    category: supplier.category,
    rating: supplier.rating,
    tags: supplier.tags ?? [],
    notes: supplier.notes,
    active: supplier.active,
  }
}

export function formValuesToSupplierInsert(
  values: SupplierFormValues,
): SupplierInsert {
  const prefix = cleanOptionalString(values.prefix ?? null)

  return {
    name: values.name.trim(),
    prefix: prefix ? prefix.toUpperCase() : null,
    legal_name: cleanOptionalString(values.legal_name ?? null),
    tax_id: cleanOptionalString(values.tax_id ?? null),
    contact_name: cleanOptionalString(values.contact_name ?? null),
    email: cleanOptionalString(values.email ?? null),
    phone: cleanOptionalString(values.phone ?? null),
    whatsapp: cleanOptionalString(values.whatsapp ?? null),
    website: cleanOptionalString(values.website ?? null),
    address: cleanOptionalString(values.address ?? null),
    city: cleanOptionalString(values.city ?? null),
    province: cleanOptionalString(values.province ?? null),
    country: values.country.trim() || "Argentina",
    currency: values.currency,
    payment_days: values.payment_days ?? null,
    category: cleanOptionalString(values.category ?? null),
    rating: values.rating ?? null,
    tags: values.tags ?? [],
    notes: cleanOptionalString(values.notes ?? null),
    active: values.active,
  }
}

import type { Supplier } from "~/domain/suppliers/suppliers.schemas"

export function displayTextField(
  value: string | null | undefined,
  label: string,
) {
  if (value?.trim()) return value.trim()
  return `Sin ${label}`
}

export function supplierWhatsAppUrl(whatsapp: string) {
  const digits = whatsapp.replace(/\D/g, "")
  return digits ? `https://wa.me/${digits}` : null
}

export function getSupplierStats(suppliers: Supplier[]) {
  const total = suppliers.length
  const active = suppliers.filter((supplier) => supplier.active).length
  return { total, active, inactive: total - active }
}

export function hasActiveSupplierFilters(
  filters: {
    search: string
    active: boolean | null
    currency: string | null
    category: string | null
  },
  defaults: {
    active: boolean | null
  },
) {
  return (
    filters.search.trim().length > 0 ||
    filters.active !== defaults.active ||
    filters.currency !== null ||
    (filters.category?.trim().length ?? 0) > 0
  )
}

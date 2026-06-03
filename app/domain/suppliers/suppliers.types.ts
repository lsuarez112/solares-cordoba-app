import type { Supplier, SupplierCurrency } from "~/domain/suppliers/suppliers.schemas"

export type { Supplier, SupplierCurrency } from "~/domain/suppliers/suppliers.schemas"

export type SupplierInsert = Omit<Supplier, "id" | "created_at" | "updated_at">
export type SupplierUpdate = Partial<SupplierInsert>

export interface SupplierFilters {
  search: string
  active: boolean | null
  currency: SupplierCurrency | null
  category: string | null
}

export const defaultSupplierFilters: SupplierFilters = {
  search: "",
  active: true,
  currency: null,
  category: null,
}

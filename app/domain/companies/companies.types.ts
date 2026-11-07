import type { Company } from "~/domain/companies/companies.schemas"

export type { Company } from "~/domain/companies/companies.schemas"

export type CompanyInsert = Omit<Company, "id" | "created_at" | "updated_at">
export type CompanyUpdate = Partial<CompanyInsert>

export interface CompanyFilters {
  search: string
  active: boolean | null
}

export const defaultCompanyFilters: CompanyFilters = {
  search: "",
  active: true,
}

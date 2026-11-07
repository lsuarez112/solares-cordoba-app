import type { Company } from "~/domain/companies/companies.schemas"
import type { CompanyFilters } from "~/domain/companies/companies.types"

export function getCompanyStats(companies: Company[]) {
  const total = companies.length
  const active = companies.filter((company) => company.active).length
  return { total, active, inactive: total - active }
}

export function hasActiveCompanyFilters(
  filters: CompanyFilters,
  defaults: Pick<CompanyFilters, "active">,
) {
  return (
    filters.search.trim().length > 0 || filters.active !== defaults.active
  )
}

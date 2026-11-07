import type { Company } from "~/domain/companies/companies.schemas"
import type { CompanyFormValues } from "~/domain/companies/companies.schemas"
import type { CompanyInsert } from "~/domain/companies/companies.types"

export const emptyCompanyFormValues: CompanyFormValues = {
  name: "",
  legal_name: null,
  tax_id: null,
  email: null,
  phone: null,
  website: null,
  address: null,
  city: null,
  province: null,
  country: "Argentina",
  active: true,
}

function cleanOptionalString(value: string | null | undefined) {
  if (value == null) return null
  const trimmed = value.trim()
  return trimmed === "" ? null : trimmed
}

export function companyToFormValues(company: Company): CompanyFormValues {
  return {
    name: company.name,
    legal_name: company.legal_name,
    tax_id: company.tax_id,
    email: company.email ?? "",
    phone: company.phone,
    website: company.website ?? "",
    address: company.address,
    city: company.city,
    province: company.province,
    country: company.country,
    active: company.active,
  }
}

export function formValuesToCompanyInsert(
  values: CompanyFormValues,
): CompanyInsert {
  return {
    name: values.name.trim(),
    legal_name: cleanOptionalString(values.legal_name ?? null),
    tax_id: cleanOptionalString(values.tax_id ?? null),
    email: cleanOptionalString(values.email ?? null),
    phone: cleanOptionalString(values.phone ?? null),
    website: cleanOptionalString(values.website ?? null),
    address: cleanOptionalString(values.address ?? null),
    city: cleanOptionalString(values.city ?? null),
    province: cleanOptionalString(values.province ?? null),
    country: values.country.trim() || "Argentina",
    logo_url: null,
    active: values.active,
  }
}

export type {
  UserCompanyLink,
  UserCompanyMember,
} from "~/domain/user-companies/user-companies.schemas"

export type UserCompanySummary = {
  companyId: string
  companyName: string
  logoUrl: string | null
  isDefault: boolean
  active: boolean
}

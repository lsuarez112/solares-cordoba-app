import {
  UserCompanyLinkSchema,
  UserCompanyMemberSchema,
  type UserCompanyLink,
  type UserCompanyMember,
} from "~/domain/user-companies/user-companies.schemas"
import type { UserCompanySummary } from "~/domain/user-companies/user-companies.types"
import { devLog } from "~/lib/dev-log"
import { createClient } from "~/lib/supabase/client"

const TABLE = "user_companies" as const

const MEMBER_SELECT = `
  user_id,
  company_id,
  is_default,
  created_at,
  user:user_profiles (
    full_name,
    avatar_url,
    active,
    role:roles (id, name)
  )
`

const LINK_SELECT = `
  user_id,
  company_id,
  is_default,
  company:companies (
    id,
    name,
    logo_url,
    active
  )
`

function parseMemberRows(rows: unknown[]): UserCompanyMember[] {
  return rows
    .map((row) => UserCompanyMemberSchema.safeParse(row))
    .filter((parsed) => parsed.success)
    .map((parsed) => parsed.data)
}

function parseLinkRows(rows: unknown[]): UserCompanyLink[] {
  return rows
    .map((row) => UserCompanyLinkSchema.safeParse(row))
    .filter((parsed) => parsed.success)
    .map((parsed) => parsed.data)
}

function linksToSummaryMap(
  links: UserCompanyLink[],
): Record<string, UserCompanySummary[]> {
  const map: Record<string, UserCompanySummary[]> = {}

  for (const link of links) {
    const summary: UserCompanySummary = {
      companyId: link.company.id,
      companyName: link.company.name,
      logoUrl: link.company.logo_url,
      isDefault: link.is_default,
      active: link.company.active,
    }

    if (!map[link.user_id]) {
      map[link.user_id] = []
    }
    map[link.user_id].push(summary)
  }

  for (const userId of Object.keys(map)) {
    map[userId].sort((a, b) => {
      if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1
      return a.companyName.localeCompare(b.companyName, "es")
    })
  }

  return map
}

export const userCompaniesService = {
  async getMembersByCompanyId(
    companyId: string,
  ): Promise<UserCompanyMember[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from(TABLE)
      .select(MEMBER_SELECT)
      .eq("company_id", companyId)
      .order("created_at", { ascending: true })

    if (error) {
      devLog("[user-companies-service] getMembersByCompanyId error", error)
      throw error
    }

    return parseMemberRows(data ?? [])
  },

  async getMemberCountsByCompanyIds(
    companyIds: string[],
  ): Promise<Record<string, number>> {
    if (companyIds.length === 0) return {}

    const supabase = createClient()
    const { data, error } = await supabase
      .from(TABLE)
      .select("company_id")
      .in("company_id", companyIds)

    if (error) {
      devLog("[user-companies-service] getMemberCountsByCompanyIds error", error)
      throw error
    }

    const counts: Record<string, number> = {}
    for (const id of companyIds) {
      counts[id] = 0
    }

    for (const row of data ?? []) {
      const companyId = row.company_id as string
      counts[companyId] = (counts[companyId] ?? 0) + 1
    }

    return counts
  },

  async getLinksGroupedByUser(): Promise<Record<string, UserCompanySummary[]>> {
    const supabase = createClient()
    const { data, error } = await supabase.from(TABLE).select(LINK_SELECT)

    if (error) {
      devLog("[user-companies-service] getLinksGroupedByUser error", error)
      throw error
    }

    return linksToSummaryMap(parseLinkRows(data ?? []))
  },

  async addUserToCompany(params: {
    userId: string
    companyId: string
    isDefault?: boolean
  }): Promise<void> {
    const supabase = createClient()
    const isDefault = params.isDefault ?? false

    if (isDefault) {
      const { error: clearError } = await supabase
        .from(TABLE)
        .update({ is_default: false })
        .eq("user_id", params.userId)

      if (clearError) {
        devLog("[user-companies-service] addUserToCompany clear default error", clearError)
        throw clearError
      }
    }

    const { error } = await supabase.from(TABLE).insert({
      user_id: params.userId,
      company_id: params.companyId,
      is_default: isDefault,
    })

    if (error) {
      devLog("[user-companies-service] addUserToCompany error", error)
      throw error
    }
  },

  async removeUserFromCompany(
    userId: string,
    companyId: string,
  ): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq("user_id", userId)
      .eq("company_id", companyId)

    if (error) {
      devLog("[user-companies-service] removeUserFromCompany error", error)
      throw error
    }
  },

  async setDefaultCompany(
    userId: string,
    companyId: string,
  ): Promise<void> {
    const supabase = createClient()

    const { error: clearError } = await supabase
      .from(TABLE)
      .update({ is_default: false })
      .eq("user_id", userId)

    if (clearError) {
      devLog("[user-companies-service] setDefaultCompany clear error", clearError)
      throw clearError
    }

    const { error } = await supabase
      .from(TABLE)
      .update({ is_default: true })
      .eq("user_id", userId)
      .eq("company_id", companyId)

    if (error) {
      devLog("[user-companies-service] setDefaultCompany error", error)
      throw error
    }
  },
}

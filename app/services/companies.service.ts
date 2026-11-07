import {
  CompanySchema,
  type Company,
} from "~/domain/companies/companies.schemas"
import type {
  CompanyFilters,
  CompanyInsert,
  CompanyUpdate,
} from "~/domain/companies/companies.types"
import { getLogoFileExtension } from "~/lib/companies/company-logo.utils"
import { devLog } from "~/lib/dev-log"
import { createClient } from "~/lib/supabase/client"

const TABLE = "companies" as const
const LOGO_BUCKET = "company-logos" as const

function parseCompanyRow(data: unknown): Company | null {
  const parsed = CompanySchema.safeParse(data)
  return parsed.success ? parsed.data : null
}

function parseCompanyRows(rows: unknown[]): Company[] {
  return rows
    .map((row) => parseCompanyRow(row))
    .filter((company): company is Company => company !== null)
}

export const companiesService = {
  async getAll(filters?: Partial<CompanyFilters>): Promise<Company[]> {
    const supabase = createClient()
    let query = supabase
      .from(TABLE)
      .select("*")
      .order("name", { ascending: true })

    const search = filters?.search?.trim()
    if (search) {
      const pattern = `%${search}%`
      query = query.or(
        `name.ilike.${pattern},legal_name.ilike.${pattern},tax_id.ilike.${pattern}`,
      )
    }

    if (filters?.active !== null && filters?.active !== undefined) {
      query = query.eq("active", filters.active)
    }

    const { data, error } = await query

    if (error) {
      devLog("[companies-service] getAll error", error)
      throw error
    }

    return parseCompanyRows(data ?? [])
  },

  async getById(id: string): Promise<Company> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      devLog("[companies-service] getById error", error)
      throw error
    }

    const company = parseCompanyRow(data)
    if (!company) {
      throw new Error("Empresa inválida")
    }

    return company
  },

  async create(payload: CompanyInsert): Promise<Company> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from(TABLE)
      .insert(payload)
      .select()
      .single()

    if (error) {
      devLog("[companies-service] create error", error)
      throw error
    }

    const company = parseCompanyRow(data)
    if (!company) {
      throw new Error("Empresa creada con datos inválidos")
    }

    devLog("[companies-service] create ok", company)
    return company
  },

  async update(id: string, payload: CompanyUpdate): Promise<Company> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from(TABLE)
      .update(payload)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      devLog("[companies-service] update error", error)
      throw error
    }

    const company = parseCompanyRow(data)
    if (!company) {
      throw new Error("Empresa actualizada con datos inválidos")
    }

    devLog("[companies-service] update ok", company)
    return company
  },

  async toggleActive(id: string, active: boolean): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase
      .from(TABLE)
      .update({ active })
      .eq("id", id)

    if (error) {
      devLog("[companies-service] toggleActive error", error)
      throw error
    }
  },

  async delete(id: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase.from(TABLE).delete().eq("id", id)

    if (error) {
      devLog("[companies-service] delete error", error)
      throw error
    }
  },

  async uploadLogo(companyId: string, file: File): Promise<string> {
    const supabase = createClient()
    const ext = getLogoFileExtension(file)
    const path = `${companyId}/logo.${ext}`

    const { error } = await supabase.storage
      .from(LOGO_BUCKET)
      .upload(path, file, { upsert: true })

    if (error) {
      devLog("[companies-service] uploadLogo error", error)
      throw error
    }

    const { data } = supabase.storage.from(LOGO_BUCKET).getPublicUrl(path)
    const publicUrl = `${data.publicUrl}?t=${Date.now()}`

    devLog("[companies-service] uploadLogo ok", { companyId, path, publicUrl })
    return publicUrl
  },
}

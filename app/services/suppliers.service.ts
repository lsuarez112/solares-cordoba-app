import {
  SupplierSchema,
  type Supplier,
} from "~/domain/suppliers/suppliers.schemas"
import type {
  SupplierFilters,
  SupplierInsert,
  SupplierUpdate,
} from "~/domain/suppliers/suppliers.types"
import { devLog } from "~/lib/dev-log"
import { createClient } from "~/lib/supabase/client"

const TABLE = "suppliers" as const

function parseSupplierRow(data: unknown): Supplier | null {
  const parsed = SupplierSchema.safeParse(data)
  return parsed.success ? parsed.data : null
}

function parseSupplierRows(rows: unknown[]): Supplier[] {
  return rows
    .map((row) => parseSupplierRow(row))
    .filter((supplier): supplier is Supplier => supplier !== null)
}

export const suppliersService = {
  async getAll(filters?: Partial<SupplierFilters>): Promise<Supplier[]> {
    const supabase = createClient()
    let query = supabase
      .from(TABLE)
      .select("*")
      .order("name", { ascending: true })

    const search = filters?.search?.trim()
    if (search) {
      const pattern = `%${search}%`
      query = query.or(
        `name.ilike.${pattern},legal_name.ilike.${pattern},tax_id.ilike.${pattern},contact_name.ilike.${pattern}`,
      )
    }

    if (filters?.active !== null && filters?.active !== undefined) {
      query = query.eq("active", filters.active)
    }

    if (filters?.currency) {
      query = query.eq("currency", filters.currency)
    }

    if (filters?.category) {
      query = query.eq("category", filters.category)
    }

    const { data, error } = await query

    if (error) {
      devLog("[suppliers-service] getAll error", error)
      throw error
    }

    return parseSupplierRows(data ?? [])
  },

  async getById(id: string): Promise<Supplier> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      devLog("[suppliers-service] getById error", error)
      throw error
    }

    const supplier = parseSupplierRow(data)
    if (!supplier) {
      throw new Error("Proveedor inválido")
    }

    return supplier
  },

  async create(payload: SupplierInsert): Promise<Supplier> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from(TABLE)
      .insert(payload)
      .select()
      .single()

    if (error) {
      devLog("[suppliers-service] create error", error)
      throw error
    }

    const supplier = parseSupplierRow(data)
    if (!supplier) {
      throw new Error("Proveedor creado con datos inválidos")
    }

    devLog("[suppliers-service] create ok", supplier)
    return supplier
  },

  async update(id: string, payload: SupplierUpdate): Promise<Supplier> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from(TABLE)
      .update(payload)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      devLog("[suppliers-service] update error", error)
      throw error
    }

    const supplier = parseSupplierRow(data)
    if (!supplier) {
      throw new Error("Proveedor actualizado con datos inválidos")
    }

    devLog("[suppliers-service] update ok", supplier)
    return supplier
  },

  async toggleActive(id: string, active: boolean): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase
      .from(TABLE)
      .update({ active })
      .eq("id", id)

    if (error) {
      devLog("[suppliers-service] toggleActive error", error)
      throw error
    }
  },

  async delete(id: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase.from(TABLE).delete().eq("id", id)

    if (error) {
      devLog("[suppliers-service] delete error", error)
      throw error
    }
  },

  async getCategories(): Promise<string[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from(TABLE)
      .select("category")
      .not("category", "is", null)
      .order("category")

    if (error) {
      devLog("[suppliers-service] getCategories error", error)
      return []
    }

    const unique = [
      ...new Set(
        (data ?? [])
          .map((row) => row.category)
          .filter((category): category is string => Boolean(category)),
      ),
    ]

    return unique
  },
}

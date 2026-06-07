import {
  CategorySchema,
  type Category,
} from "~/domain/categories/categories.schemas"
import type {
  CategoryFilters,
  CategoryInsert,
  CategoryUpdate,
} from "~/domain/categories/categories.types"
import { devLog } from "~/lib/dev-log"
import { createClient } from "~/lib/supabase/client"

const TABLE = "product_categories" as const

function parseCategoryRow(data: unknown): Category | null {
  const parsed = CategorySchema.safeParse(data)
  return parsed.success ? parsed.data : null
}

function parseCategoryRows(rows: unknown[]): Category[] {
  return rows
    .map((row) => parseCategoryRow(row))
    .filter((category): category is Category => category !== null)
}

export const categoriesService = {
  async getAll(filters?: Partial<CategoryFilters>): Promise<Category[]> {
    const supabase = createClient()
    let query = supabase.from(TABLE).select("*").order("name", { ascending: true })

    const search = filters?.search?.trim()
    if (search) {
      const pattern = `%${search}%`
      query = query.or(`name.ilike.${pattern},description.ilike.${pattern}`)
    }

    const { data, error } = await query

    if (error) {
      devLog("[categories-service] getAll error", error)
      throw error
    }

    return parseCategoryRows(data ?? [])
  },

  async getById(id: string): Promise<Category> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      devLog("[categories-service] getById error", error)
      throw error
    }

    const category = parseCategoryRow(data)
    if (!category) {
      throw new Error("Categoría inválida")
    }

    return category
  },

  async create(payload: CategoryInsert): Promise<Category> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from(TABLE)
      .insert(payload)
      .select()
      .single()

    if (error) {
      devLog("[categories-service] create error", error)
      throw error
    }

    const category = parseCategoryRow(data)
    if (!category) {
      throw new Error("Categoría creada con datos inválidos")
    }

    devLog("[categories-service] create ok", category)
    return category
  },

  async update(id: string, payload: CategoryUpdate): Promise<Category> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from(TABLE)
      .update(payload)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      devLog("[categories-service] update error", error)
      throw error
    }

    const category = parseCategoryRow(data)
    if (!category) {
      throw new Error("Categoría actualizada con datos inválidos")
    }

    devLog("[categories-service] update ok", category)
    return category
  },

  async delete(id: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase.from(TABLE).delete().eq("id", id)

    if (error) {
      devLog("[categories-service] delete error", error)
      throw error
    }
  },

  async getProductCounts(): Promise<Record<string, number>> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("products")
      .select("category_id")
      .not("category_id", "is", null)

    if (error) {
      devLog("[categories-service] getProductCounts error", error)
      return {}
    }

    const counts: Record<string, number> = {}
    for (const row of data ?? []) {
      const categoryId = row.category_id as string | null
      if (!categoryId) continue
      counts[categoryId] = (counts[categoryId] ?? 0) + 1
    }

    return counts
  },
}

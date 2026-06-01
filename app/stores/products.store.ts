import { create } from "zustand"
import { z } from "zod"
import { ProductSchema, ProductCategorySchema } from "~/domain/products/products.schemas"
import type { Product, ProductCategory } from "~/domain/products/products.schemas"
import { devLog } from "~/lib/dev-log"
import { createClient } from "~/lib/supabase/client"

interface ProductsState {
  products: Product[]
  categories: ProductCategory[]

  initialized: boolean
  categoriesInitialized: boolean
  loading: boolean
  loadingCategories: boolean
  fetchedAt: string | null

  fetchAll: (options?: { force?: boolean }) => Promise<void>
  fetchCategories: () => Promise<void>
  refresh: () => Promise<void>
  reset: () => void
}

const initialState = {
  products: [] as Product[],
  categories: [] as ProductCategory[],
  initialized: false,
  categoriesInitialized: false,
  loading: false,
  loadingCategories: false,
  fetchedAt: null as string | null,
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  ...initialState,

  fetchAll: async (options) => {
    if (get().initialized && !options?.force) return
    set({ loading: true })

    devLog("[products-store] fetchAll → products (+ category)")

    const supabase = createClient()
    const { data, error } = await supabase
      .from("v_products_with_ars") // usamos la vista que ya tenés
      .select(`
        *,
        category:product_categories ( id, name, description, slug, icon )
      `)
      .order("name")

    if (error) {
      devLog("[products-store] fetchAll ← error", error.message)
      set({ loading: false })
      return
    }

    const products = (data ?? [])
      .map((row) => ProductSchema.safeParse(row))
      .filter((p) => p.success)
      .map((p) => p.data)

    devLog("[products-store] fetchAll ← products", {
      count: products.length,
      data: products,
    })

    set({
      products,
      initialized: true,
      loading: false,
      fetchedAt: new Date().toISOString(),
    })
  },

  fetchCategories: async () => {
    if (get().categoriesInitialized) return
    set({ loadingCategories: true })

    devLog("[products-store] fetchCategories → product_categories")

    const supabase = createClient()
    const { data, error } = await supabase
      .from("product_categories")
      .select("*")
      .order("name")

    if (error) {
      devLog("[products-store] fetchCategories ← error", error.message)
      set({ loadingCategories: false })
      return
    }

    const categories = (data ?? [])
      .map((row) => ProductCategorySchema.safeParse(row))
      .filter((p) => p.success)
      .map((p) => p.data)

    devLog("[products-store] fetchCategories ← product_categories", {
      count: categories.length,
      data: categories,
    })

    set({
      categories,
      categoriesInitialized: true,
      loadingCategories: false,
    })
  },

  refresh: async () => {
    await get().fetchAll({ force: true })
  },

  reset: () => set(initialState),
}))
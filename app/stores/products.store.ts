import { create } from "zustand"
import { z } from "zod"
import {
  ProductSchema,
  ProductCategorySchema,
} from "~/domain/products/products.schemas"
import type {
  Product,
  ProductCategory,
  ProductFormValues,
} from "~/domain/products/products.schemas"
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
  createProduct: (values: ProductFormValues) => Promise<boolean>
  updateProduct: (id: string, values: ProductFormValues) => Promise<boolean>
  deleteProduct: (id: string) => Promise<boolean>
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

  createProduct: async (values) => {
    devLog("[products-store] createProduct →", values)
    const supabase = createClient()

    const generic_properties = Object.fromEntries(
      (values.generic_properties ?? []).map(({ key, value }) => [key, value]),
    )

    const { data, error } = await supabase
      .from("products")
      .insert({
        product_code: values.product_code,
        name: values.name,
        short_desc: values.short_desc ?? null,
        description: values.description ?? null,
        category_id: values.category_id ?? null,
        grid_type: values.grid_type ?? null,
        supplier_id: values.supplier_id ?? null,
        price_usd: values.price_usd,
        cost_usd: values.cost_usd ?? null,
        stock: values.stock,
        stock_alert_at: values.stock_alert_at ?? null,
        is_composite: values.is_composite,
        active: values.active,
        links: values.links,
        generic_properties,
      })
      .select(
        `*, category:product_categories ( id, name, description, slug, icon )`,
      )
      .single()

    if (error) {
      devLog("[products-store] createProduct ← error", error.message)
      return false
    }

    const parsed = ProductSchema.safeParse(data)
    if (!parsed.success) {
      devLog("[products-store] createProduct ← fila inválida", parsed.error)
      return false
    }

    devLog("[products-store] createProduct ← OK", parsed.data)
    set((state) => ({
      products: [parsed.data, ...state.products],
    }))
    return true
  },

  updateProduct: async (id, values) => {
    devLog("[products-store] updateProduct →", { id, values })
    const supabase = createClient()

    const generic_properties = Object.fromEntries(
      (values.generic_properties ?? []).map(({ key, value }) => [key, value]),
    )

    const { data, error } = await supabase
      .from("products")
      .update({
        product_code: values.product_code,
        name: values.name,
        short_desc: values.short_desc ?? null,
        description: values.description ?? null,
        category_id: values.category_id ?? null,
        grid_type: values.grid_type ?? null,
        supplier_id: values.supplier_id ?? null,
        price_usd: values.price_usd,
        cost_usd: values.cost_usd ?? null,
        stock: values.stock,
        stock_alert_at: values.stock_alert_at ?? null,
        is_composite: values.is_composite,
        active: values.active,
        links: values.links,
        generic_properties,
      })
      .eq("id", id)
      .select(
        `*, category:product_categories ( id, name, description, slug, icon )`,
      )
      .single()

    if (error) {
      devLog("[products-store] updateProduct ← error", error.message)
      return false
    }

    const parsed = ProductSchema.safeParse(data)
    if (!parsed.success) {
      devLog("[products-store] updateProduct ← fila inválida", parsed.error)
      return false
    }

    devLog("[products-store] updateProduct ← OK", parsed.data)
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? parsed.data : p)),
    }))
    return true
  },

  deleteProduct: async (id) => {
    devLog("[products-store] deleteProduct →", { id })
    const supabase = createClient()

    const { error } = await supabase.from("products").delete().eq("id", id)

    if (error) {
      devLog("[products-store] deleteProduct ← error", error.message)
      return false
    }

    devLog("[products-store] deleteProduct ← OK", { id })
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    }))
    return true
  },

  refresh: async () => {
    await get().fetchAll({ force: true })
  },

  reset: () => set(initialState),
}))
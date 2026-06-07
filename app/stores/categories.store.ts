import { create } from "zustand"

import type { Category } from "~/domain/categories/categories.schemas"
import {
  defaultCategoryFilters,
  type CategoryFilters,
  type CategoryInsert,
  type CategoryUpdate,
} from "~/domain/categories/categories.types"
import { syncProductsCategories } from "~/lib/categories/sync-products-categories"
import { devLog } from "~/lib/dev-log"
import { categoriesService } from "~/services/categories.service"

interface CategoriesState {
  categories: Category[]
  productCounts: Record<string, number>
  isLoading: boolean
  hasFetched: boolean
  error: string | null
  fetchedAt: string | null
  filters: CategoryFilters

  modalOpen: boolean
  editingCategory: Category | null

  fetch: () => Promise<void>
  create: (payload: CategoryInsert) => Promise<boolean>
  update: (id: string, payload: CategoryUpdate) => Promise<boolean>
  remove: (id: string) => Promise<boolean>

  setFilters: (filters: Partial<CategoryFilters>) => void
  resetFilters: () => void

  openModal: (category?: Category) => void
  closeModal: () => void

  reset: () => void
}

const initialState = {
  categories: [] as Category[],
  productCounts: {} as Record<string, number>,
  isLoading: false,
  hasFetched: false,
  error: null as string | null,
  fetchedAt: null as string | null,
  filters: defaultCategoryFilters,
  modalOpen: false,
  editingCategory: null as Category | null,
}

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
  ...initialState,

  fetch: async () => {
    set({ isLoading: true, error: null })

    devLog("[categories-store] fetch → categoriesService.getAll", {
      filters: get().filters,
    })

    try {
      const [categories, productCounts] = await Promise.all([
        categoriesService.getAll(get().filters),
        categoriesService.getProductCounts(),
      ])

      devLog("[categories-store] fetch ok", {
        count: categories.length,
        productCounts,
      })

      set({
        categories,
        productCounts,
        fetchedAt: new Date().toISOString(),
      })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al cargar categorías"
      devLog("[categories-store] fetch error", message)
      set({ error: message })
    } finally {
      set({ isLoading: false, hasFetched: true })
    }
  },

  create: async (payload) => {
    devLog("[categories-store] create →", payload)
    try {
      const category = await categoriesService.create(payload)
      devLog("[categories-store] create ok", category)
      const productCounts = await categoriesService.getProductCounts()
      set((state) => ({
        categories: [...state.categories, category].sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
        productCounts,
      }))
      syncProductsCategories()
      return true
    } catch (err) {
      devLog(
        "[categories-store] create error",
        err instanceof Error ? err.message : err,
      )
      return false
    }
  },

  update: async (id, payload) => {
    devLog("[categories-store] update →", { id, payload })
    try {
      const category = await categoriesService.update(id, payload)
      devLog("[categories-store] update ok", category)
      set((state) => ({
        categories: state.categories
          .map((item) => (item.id === id ? category : item))
          .sort((a, b) => a.name.localeCompare(b.name)),
      }))
      syncProductsCategories()
      return true
    } catch (err) {
      devLog(
        "[categories-store] update error",
        err instanceof Error ? err.message : err,
      )
      return false
    }
  },

  remove: async (id) => {
    devLog("[categories-store] remove →", { id })
    try {
      await categoriesService.delete(id)
      devLog("[categories-store] remove ok", { id })
      set((state) => {
        const { [id]: _removed, ...productCounts } = state.productCounts
        return {
          categories: state.categories.filter((item) => item.id !== id),
          productCounts,
        }
      })
      syncProductsCategories()
      return true
    } catch (err) {
      devLog(
        "[categories-store] remove error",
        err instanceof Error ? err.message : err,
      )
      return false
    }
  },

  setFilters: (filters) => {
    set((state) => ({ filters: { ...state.filters, ...filters } }))
  },

  resetFilters: () => {
    set({ filters: defaultCategoryFilters })
  },

  openModal: (category) => {
    set({ modalOpen: true, editingCategory: category ?? null })
  },

  closeModal: () => {
    set({ modalOpen: false, editingCategory: null })
  },

  reset: () => set(initialState),
}))

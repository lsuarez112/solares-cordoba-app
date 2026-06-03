import { create } from "zustand"

import type { Supplier } from "~/domain/suppliers/suppliers.schemas"
import {
  defaultSupplierFilters,
  type SupplierFilters,
  type SupplierInsert,
  type SupplierUpdate,
} from "~/domain/suppliers/suppliers.types"
import { devLog } from "~/lib/dev-log"
import { suppliersService } from "~/services/suppliers.service"

interface SuppliersState {
  suppliers: Supplier[]
  isLoading: boolean
  hasFetched: boolean
  error: string | null
  fetchedAt: string | null
  filters: SupplierFilters

  modalOpen: boolean
  editingSupplier: Supplier | null

  fetch: () => Promise<void>
  create: (payload: SupplierInsert) => Promise<boolean>
  update: (id: string, payload: SupplierUpdate) => Promise<boolean>
  toggleActive: (id: string, active: boolean) => Promise<boolean>
  remove: (id: string) => Promise<boolean>

  setFilters: (filters: Partial<SupplierFilters>) => void
  resetFilters: () => void

  openModal: (supplier?: Supplier) => void
  closeModal: () => void

  reset: () => void
}

const initialState = {
  suppliers: [] as Supplier[],
  isLoading: false,
  hasFetched: false,
  error: null as string | null,
  fetchedAt: null as string | null,
  filters: defaultSupplierFilters,
  modalOpen: false,
  editingSupplier: null as Supplier | null,
}

export const useSuppliersStore = create<SuppliersState>((set, get) => ({
  ...initialState,

  fetch: async () => {
    set({ isLoading: true, error: null })

    devLog("[suppliers-store] fetch → suppliersService.getAll", {
      filters: get().filters,
    })

    try {
      const suppliers = await suppliersService.getAll(get().filters)
      devLog("[suppliers-store] fetch ok", { count: suppliers.length })
      set({
        suppliers,
        fetchedAt: new Date().toISOString(),
      })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al cargar proveedores"
      devLog("[suppliers-store] fetch error", message)
      set({ error: message })
    } finally {
      set({ isLoading: false, hasFetched: true })
    }
  },

  create: async (payload) => {
    devLog("[suppliers-store] create →", payload)
    try {
      const supplier = await suppliersService.create(payload)
      devLog("[suppliers-store] create ok", supplier)
      set((state) => ({ suppliers: [supplier, ...state.suppliers] }))
      return true
    } catch (err) {
      devLog(
        "[suppliers-store] create error",
        err instanceof Error ? err.message : err,
      )
      return false
    }
  },

  update: async (id, payload) => {
    devLog("[suppliers-store] update →", { id, payload })
    try {
      const supplier = await suppliersService.update(id, payload)
      devLog("[suppliers-store] update ok", supplier)
      set((state) => ({
        suppliers: state.suppliers.map((item) =>
          item.id === id ? supplier : item,
        ),
      }))
      return true
    } catch (err) {
      devLog(
        "[suppliers-store] update error",
        err instanceof Error ? err.message : err,
      )
      return false
    }
  },

  toggleActive: async (id, active) => {
    devLog("[suppliers-store] toggleActive →", { id, active })
    try {
      await suppliersService.toggleActive(id, active)
      devLog("[suppliers-store] toggleActive ok", { id, active })
      set((state) => ({
        suppliers: state.suppliers.map((item) =>
          item.id === id ? { ...item, active } : item,
        ),
      }))
      return true
    } catch (err) {
      devLog(
        "[suppliers-store] toggleActive error",
        err instanceof Error ? err.message : err,
      )
      return false
    }
  },

  remove: async (id) => {
    devLog("[suppliers-store] remove →", { id })
    try {
      await suppliersService.delete(id)
      devLog("[suppliers-store] remove ok", { id })
      set((state) => ({
        suppliers: state.suppliers.filter((item) => item.id !== id),
      }))
      return true
    } catch (err) {
      devLog(
        "[suppliers-store] remove error",
        err instanceof Error ? err.message : err,
      )
      return false
    }
  },

  setFilters: (filters) => {
    set((state) => ({ filters: { ...state.filters, ...filters } }))
  },

  resetFilters: () => {
    set({ filters: defaultSupplierFilters })
  },

  openModal: (supplier) => {
    set({ modalOpen: true, editingSupplier: supplier ?? null })
  },

  closeModal: () => {
    set({ modalOpen: false, editingSupplier: null })
  },

  reset: () => set(initialState),
}))

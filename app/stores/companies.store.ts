import { create } from "zustand"

import type { Company } from "~/domain/companies/companies.schemas"
import {
  defaultCompanyFilters,
  type CompanyFilters,
  type CompanyInsert,
  type CompanyUpdate,
} from "~/domain/companies/companies.types"
import { devLog } from "~/lib/dev-log"
import { companiesService } from "~/services/companies.service"
import { userCompaniesService } from "~/services/user-companies.service"

interface CompaniesState {
  companies: Company[]
  isLoading: boolean
  hasFetched: boolean
  error: string | null
  fetchedAt: string | null
  filters: CompanyFilters

  modalOpen: boolean
  editingCompany: Company | null
  usersModalOpen: boolean
  usersModalCompany: Company | null
  memberCounts: Record<string, number>

  fetch: () => Promise<void>
  fetchMemberCounts: () => Promise<void>
  create: (payload: CompanyInsert) => Promise<Company | null>
  update: (id: string, payload: CompanyUpdate) => Promise<Company | null>
  toggleActive: (id: string, active: boolean) => Promise<boolean>
  remove: (id: string) => Promise<boolean>

  setFilters: (filters: Partial<CompanyFilters>) => void
  resetFilters: () => void

  openModal: (company?: Company) => void
  closeModal: () => void
  openUsersModal: (company: Company) => void
  closeUsersModal: () => void

  reset: () => void
}

const initialState = {
  companies: [] as Company[],
  isLoading: false,
  hasFetched: false,
  error: null as string | null,
  fetchedAt: null as string | null,
  filters: defaultCompanyFilters,
  modalOpen: false,
  editingCompany: null as Company | null,
  usersModalOpen: false,
  usersModalCompany: null as Company | null,
  memberCounts: {} as Record<string, number>,
}

export const useCompaniesStore = create<CompaniesState>((set, get) => ({
  ...initialState,

  fetch: async () => {
    set({ isLoading: true, error: null })

    devLog("[companies-store] fetch → companiesService.getAll", {
      filters: get().filters,
    })

    try {
      const companies = await companiesService.getAll(get().filters)
      devLog("[companies-store] fetch ok", { count: companies.length })
      set({
        companies,
        fetchedAt: new Date().toISOString(),
      })
      void get().fetchMemberCounts()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al cargar empresas"
      devLog("[companies-store] fetch error", message)
      set({ error: message })
    } finally {
      set({ isLoading: false, hasFetched: true })
    }
  },

  create: async (payload) => {
    devLog("[companies-store] create →", payload)
    try {
      const company = await companiesService.create(payload)
      devLog("[companies-store] create ok", company)
      set((state) => ({ companies: [company, ...state.companies] }))
      return company
    } catch (err) {
      devLog(
        "[companies-store] create error",
        err instanceof Error ? err.message : err,
      )
      return null
    }
  },

  update: async (id, payload) => {
    devLog("[companies-store] update →", { id, payload })
    try {
      const company = await companiesService.update(id, payload)
      devLog("[companies-store] update ok", company)
      set((state) => ({
        companies: state.companies.map((item) =>
          item.id === id ? company : item,
        ),
        editingCompany:
          state.editingCompany?.id === id ? company : state.editingCompany,
      }))
      return company
    } catch (err) {
      devLog(
        "[companies-store] update error",
        err instanceof Error ? err.message : err,
      )
      return null
    }
  },

  toggleActive: async (id, active) => {
    devLog("[companies-store] toggleActive →", { id, active })
    try {
      await companiesService.toggleActive(id, active)
      devLog("[companies-store] toggleActive ok", { id, active })
      set((state) => ({
        companies: state.companies.map((item) =>
          item.id === id ? { ...item, active } : item,
        ),
      }))
      return true
    } catch (err) {
      devLog(
        "[companies-store] toggleActive error",
        err instanceof Error ? err.message : err,
      )
      return false
    }
  },

  remove: async (id) => {
    devLog("[companies-store] remove →", { id })
    try {
      await companiesService.delete(id)
      devLog("[companies-store] remove ok", { id })
      set((state) => ({
        companies: state.companies.filter((item) => item.id !== id),
      }))
      return true
    } catch (err) {
      devLog(
        "[companies-store] remove error",
        err instanceof Error ? err.message : err,
      )
      return false
    }
  },

  setFilters: (filters) => {
    set((state) => ({ filters: { ...state.filters, ...filters } }))
  },

  resetFilters: () => {
    set({ filters: defaultCompanyFilters })
  },

  openModal: (company) => {
    set({ modalOpen: true, editingCompany: company ?? null })
  },

  closeModal: () => {
    set({ modalOpen: false, editingCompany: null })
  },

  fetchMemberCounts: async () => {
    const companyIds = get().companies.map((company) => company.id)
    if (companyIds.length === 0) {
      set({ memberCounts: {} })
      return
    }

    try {
      const memberCounts =
        await userCompaniesService.getMemberCountsByCompanyIds(companyIds)
      set({ memberCounts })
    } catch (err) {
      devLog(
        "[companies-store] fetchMemberCounts error",
        err instanceof Error ? err.message : err,
      )
    }
  },

  openUsersModal: (company) => {
    set({ usersModalOpen: true, usersModalCompany: company })
  },

  closeUsersModal: () => {
    set({ usersModalOpen: false, usersModalCompany: null })
  },

  reset: () => set(initialState),
}))

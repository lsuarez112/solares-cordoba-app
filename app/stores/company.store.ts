import { create } from "zustand"

import type { Company } from "~/domain/companies/companies.schemas"
import { devLog } from "~/lib/dev-log"
import { companiesService } from "~/services/companies.service"

/** Empresa única (V0): la usa el sidebar (logo y nombre) y Configuración. */
interface CompanyState {
  company: Company | null
  loaded: boolean
  fetch: (options?: { force?: boolean }) => Promise<void>
  setCompany: (company: Company | null) => void
  reset: () => void
}

export const useCompanyStore = create<CompanyState>((set, get) => ({
  company: null,
  loaded: false,

  fetch: async (options) => {
    if (get().loaded && !options?.force) return
    try {
      const rows = await companiesService.getAll({ active: true })
      set({ company: rows[0] ?? null, loaded: true })
    } catch (error) {
      devLog("[company-store] fetch error", error)
      set({ loaded: true })
    }
  },

  setCompany: (company) => set({ company, loaded: true }),
  reset: () => set({ company: null, loaded: false }),
}))

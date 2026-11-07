import { useEffect } from "react"

import { useCompaniesStore } from "~/stores/companies.store"

/** Hook principal del módulo de empresas. Recarga al cambiar filtros. */
export function useCompanies() {
  const store = useCompaniesStore()

  useEffect(() => {
    void store.fetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch cuando cambian los filtros
  }, [store.filters])

  return store
}

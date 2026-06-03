import { useEffect } from "react"

import { useSuppliersStore } from "~/stores/suppliers.store"

/** Hook principal del módulo de proveedores. Recarga al cambiar filtros. */
export function useSuppliers() {
  const store = useSuppliersStore()

  useEffect(() => {
    void store.fetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch cuando cambian los filtros
  }, [store.filters])

  return store
}

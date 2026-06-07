import { useEffect } from "react"

import { useCategoriesStore } from "~/stores/categories.store"

/** Hook principal del módulo de categorías. Recarga al cambiar filtros. */
export function useCategories() {
  const store = useCategoriesStore()

  useEffect(() => {
    void store.fetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch cuando cambian los filtros
  }, [store.filters])

  return store
}

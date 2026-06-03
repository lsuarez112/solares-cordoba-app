import { useEffect } from "react"

import { useSuppliersStore } from "~/stores/suppliers.store"

/** Carga proveedores activos para filtros y formulario de productos. */
export function useProductsPageSuppliers() {
  const suppliers = useSuppliersStore((s) => s.suppliers)
  const hasFetched = useSuppliersStore((s) => s.hasFetched)
  const fetch = useSuppliersStore((s) => s.fetch)

  useEffect(() => {
    if (!hasFetched) void fetch()
  }, [hasFetched, fetch])

  return suppliers
}

import { useEffect } from "react"

import { useAuth } from "~/hooks/use-auth"
import { useProductsStore } from "~/stores/products.store"

/** Limpia el store de productos al cambiar de sesión. */
export function useProductsStoreSync() {
  const { supabaseUser } = useAuth()
  const userId = supabaseUser?.id ?? null
  const reset = useProductsStore((s) => s.reset)

  useEffect(() => {
    reset()
  }, [userId, reset])
}

/** Carga productos y categorías en la página del catálogo. */
export function useProductsStorePageSync() {
  const fetchAll = useProductsStore((s) => s.fetchAll)
  const fetchCategories = useProductsStore((s) => s.fetchCategories)

  useEffect(() => {
    void fetchAll()
    void fetchCategories()
  }, [fetchAll, fetchCategories])
}

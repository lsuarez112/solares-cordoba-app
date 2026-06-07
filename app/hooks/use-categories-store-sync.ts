import { useEffect } from "react"

import { useAuth } from "~/hooks/use-auth"
import { useCategoriesStore } from "~/stores/categories.store"

/** Limpia el store de categorías al cambiar de sesión. */
export function useCategoriesStoreSync() {
  const { supabaseUser } = useAuth()
  const userId = supabaseUser?.id ?? null
  const reset = useCategoriesStore((s) => s.reset)

  useEffect(() => {
    reset()
  }, [userId, reset])
}

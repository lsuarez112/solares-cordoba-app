import { useEffect } from "react"

import { useAuth } from "~/hooks/use-auth"
import { useSuppliersStore } from "~/stores/suppliers.store"

/** Limpia el store de proveedores al cambiar de sesión. */
export function useSuppliersStoreSync() {
  const { supabaseUser } = useAuth()
  const userId = supabaseUser?.id ?? null
  const reset = useSuppliersStore((s) => s.reset)

  useEffect(() => {
    reset()
  }, [userId, reset])
}

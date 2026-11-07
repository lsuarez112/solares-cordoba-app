import { useEffect } from "react"

import { useAuth } from "~/hooks/use-auth"
import { useCompaniesStore } from "~/stores/companies.store"

/** Limpia el store de empresas al cambiar de sesión. */
export function useCompaniesStoreSync() {
  const { supabaseUser } = useAuth()
  const userId = supabaseUser?.id ?? null
  const reset = useCompaniesStore((s) => s.reset)

  useEffect(() => {
    reset()
  }, [userId, reset])
}

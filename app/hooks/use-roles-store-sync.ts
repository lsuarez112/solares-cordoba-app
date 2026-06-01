import { useEffect } from "react"

import { useAuth } from "~/hooks/use-auth"
import { useRolesStore } from "~/stores/roles.store"

/** Limpia el store de roles al cambiar de sesión. */
export function useRolesStoreSync() {
  const { supabaseUser } = useAuth()
  const userId = supabaseUser?.id ?? null
  const reset = useRolesStore((s) => s.reset)

  useEffect(() => {
    reset()
  }, [userId, reset])
}

/** Carga roles completos en la página de administración. */
export function useRolesStoreAdminSync() {
  const fetchRoles = useRolesStore((s) => s.fetchRoles)

  useEffect(() => {
    void fetchRoles()
  }, [fetchRoles])
}

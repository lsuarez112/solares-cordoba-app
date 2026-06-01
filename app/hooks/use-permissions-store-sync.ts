import { useEffect } from "react"

import { useAuth } from "~/hooks/use-auth"
import { usePermissionsStore } from "~/stores/permissions.store"

/** Limpia el store de permisos al cambiar de sesión. */
export function usePermissionsStoreSync() {
  const { supabaseUser } = useAuth()
  const userId = supabaseUser?.id ?? null
  const reset = usePermissionsStore((s) => s.reset)

  useEffect(() => {
    reset()
  }, [userId, reset])
}

/** Carga roles con metadata para badges en administración de usuarios. */
export function usePermissionsStoreAdminSync() {
  const fetchRoles = usePermissionsStore((s) => s.fetchRoles)

  useEffect(() => {
    void fetchRoles()
  }, [fetchRoles])
}

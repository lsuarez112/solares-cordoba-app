import { useEffect } from "react"

import { useAuth } from "~/hooks/use-auth"
import { useUsersStore } from "~/stores/users.store"

/** Carga usuarios básicos al autenticarse y limpia el store al cambiar de sesión. */
export function useUsersStoreSync() {
  const { supabaseUser } = useAuth()
  const userId = supabaseUser?.id ?? null
  const fetchBasic = useUsersStore((s) => s.fetchBasic)
  const reset = useUsersStore((s) => s.reset)

  useEffect(() => {
    reset()
    if (!userId) return

    void fetchBasic()
  }, [userId, fetchBasic, reset])
}

/** Carga usuarios completos cuando el usuario tiene permisos de administración. */
export function useUsersStoreAdminSync() {
  const fetchFull = useUsersStore((s) => s.fetchFull)

  useEffect(() => {
    void fetchFull()
  }, [fetchFull])
}

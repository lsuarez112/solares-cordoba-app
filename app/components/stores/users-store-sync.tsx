"use client"

import { useUsersStoreSync } from "~/hooks/use-users-store-sync"

/** Monta la sincronización del store de usuarios con la sesión activa. */
export function UsersStoreSync() {
  useUsersStoreSync()
  return null
}

import { create } from "zustand"

import type { PermissionRole } from "~/domain/permissions/permissions.types"
import { devLog } from "~/lib/dev-log"
import {
  indexPermissionRoles,
  mapAdminRoleToPermissionRole,
  mapRowToPermissionRole,
} from "~/lib/permissions/map-permission-role"
import { createClient } from "~/lib/supabase/client"
import type { AdminRole } from "~/stores/roles.store"

interface PermissionsState {
  roles: PermissionRole[]
  rolesById: Record<string, PermissionRole>
  initialized: boolean
  loading: boolean
  fetchedAt: string | null

  fetchRoles: (options?: { force?: boolean }) => Promise<void>
  refreshRoles: () => Promise<void>
  syncFromAdminRoles: (roles: AdminRole[]) => void
  upsertRole: (role: PermissionRole) => void
  getRoleById: (id: string) => PermissionRole | undefined
  reset: () => void
}

const initialState = {
  roles: [] as PermissionRole[],
  rolesById: {} as Record<string, PermissionRole>,
  initialized: false,
  loading: false,
  fetchedAt: null as string | null,
}

export const usePermissionsStore = create<PermissionsState>((set, get) => ({
  ...initialState,

  fetchRoles: async (options) => {
    if (get().initialized && !options?.force) return
    set({ loading: true })

    devLog("[permissions-store] fetchRoles → roles", {
      force: options?.force ?? false,
    })

    const supabase = createClient()
    const { data, error } = await supabase
      .from("roles")
      .select("id, name, active, metadata")
      .order("name")

    if (error) {
      devLog("[permissions-store] fetchRoles ← roles → error", error.message)
      set({ loading: false })
      return
    }

    const roles = (data ?? [])
      .map((row) => mapRowToPermissionRole(row))
      .filter((role): role is PermissionRole => role !== null)

    devLog("[permissions-store] fetchRoles ← roles", {
      count: roles.length,
      data: roles,
    })

    set({
      roles,
      rolesById: indexPermissionRoles(roles),
      initialized: true,
      loading: false,
      fetchedAt: new Date().toISOString(),
    })
  },

  refreshRoles: async () => {
    await get().fetchRoles({ force: true })
  },

  syncFromAdminRoles: (adminRoles) => {
    const roles = adminRoles.map(mapAdminRoleToPermissionRole)

    devLog("[permissions-store] syncFromAdminRoles", { count: roles.length })

    set({
      roles,
      rolesById: indexPermissionRoles(roles),
      initialized: true,
      fetchedAt: new Date().toISOString(),
    })
  },

  upsertRole: (role) => {
    set((state) => {
      const roles = state.roles.some((item) => item.id === role.id)
        ? state.roles.map((item) => (item.id === role.id ? role : item))
        : [...state.roles, role]

      return {
        roles,
        rolesById: indexPermissionRoles(roles),
        initialized: true,
      }
    })
  },

  getRoleById: (id) => get().rolesById[id],

  reset: () => set(initialState),
}))

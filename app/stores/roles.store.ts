import { create } from "zustand"
import { z } from "zod"

import {
  PermissionsRecordSchema,
  RoleSchema,
} from "~/domain/auth/auth.schemas"
import {
  parseRoleMetadata,
  RoleMetadataSchema,
} from "~/domain/roles/role-metadata.schema"
import type {
  RoleEditFormValues,
  RoleListItem,
} from "~/domain/roles/roles.types"
import { devLog } from "~/lib/dev-log"
import { mapAdminRoleToPermissionRole } from "~/lib/permissions/map-permission-role"
import { createClient } from "~/lib/supabase/client"
import { usePermissionsStore } from "~/stores/permissions.store"

export const AdminRoleSchema = RoleSchema.extend({
  created_at: z.string().nullable().optional(),
  active: z.boolean().default(true),
  metadata: z.preprocess(
    (value) => parseRoleMetadata(value),
    RoleMetadataSchema,
  ),
})

export type AdminRole = z.infer<typeof AdminRoleSchema>

interface RolesState {
  roles: AdminRole[]
  initialized: boolean
  loading: boolean
  fetchedAt: string | null

  modalOpen: boolean
  editingRole: RoleListItem | null

  fetchRoles: (options?: { force?: boolean }) => Promise<void>
  refreshRoles: () => Promise<void>
  createRole: (values: RoleEditFormValues) => Promise<boolean>
  updateRole: (id: string, values: RoleEditFormValues) => Promise<boolean>
  removeRole: (id: string) => Promise<boolean>

  openModal: (role?: RoleListItem) => void
  closeModal: () => void

  reset: () => void
}

const initialState = {
  roles: [] as AdminRole[],
  initialized: false,
  loading: false,
  fetchedAt: null as string | null,
  modalOpen: false,
  editingRole: null as RoleListItem | null,
}

export const useRolesStore = create<RolesState>((set, get) => ({
  ...initialState,

  fetchRoles: async (options) => {
    if (get().initialized && !options?.force) return
    set({ loading: true })

    devLog("[roles-store] fetchRoles → roles", {
      force: options?.force ?? false,
    })

    const supabase = createClient()
    const { data, error } = await supabase
      .from("roles")
      .select("*")
      .order("name")

    if (error) {
      devLog("[roles-store] fetchRoles ← roles → error", error.message)
      set({ loading: false })
      return
    }

    const roles = (data ?? [])
      .map((row) => AdminRoleSchema.safeParse(row))
      .filter((parsed) => parsed.success)
      .map((parsed) => parsed.data)

    devLog("[roles-store] fetchRoles ← roles", {
      count: roles.length,
      data: roles,
    })

    set({
      roles,
      initialized: true,
      loading: false,
      fetchedAt: new Date().toISOString(),
    })

    usePermissionsStore.getState().syncFromAdminRoles(roles)
  },

  refreshRoles: async () => {
    await get().fetchRoles({ force: true })
  },

  createRole: async (values) => {
    devLog("[roles-store] createRole → roles", { values })

    const permissionsParsed = PermissionsRecordSchema.safeParse(values.permissions)
    if (!permissionsParsed.success) {
      devLog("[roles-store] createRole → permisos inválidos")
      return false
    }

    const metadataParsed = RoleMetadataSchema.safeParse(values.metadata)
    if (!metadataParsed.success) {
      devLog("[roles-store] createRole → metadata inválida")
      return false
    }

    const supabase = createClient()
    const { data, error } = await supabase
      .from("roles")
      .insert({
        name: values.name.trim(),
        description: values.description.trim() || null,
        active: values.active,
        permissions: values.permissions,
        metadata: metadataParsed.data,
      })
      .select()

    if (error) {
      devLog("[roles-store] createRole ← roles → error", {
        message: error.message,
        code: error.code,
      })
      return false
    }

    if (!data?.length) {
      devLog(
        "[roles-store] createRole ← roles → 0 filas (revisá política RLS INSERT en roles)",
      )
      return false
    }

    const createdRole = AdminRoleSchema.safeParse(data[0])
    if (!createdRole.success) {
      devLog("[roles-store] createRole ← roles → fila inválida", createdRole.error)
      return false
    }

    devLog("[roles-store] createRole ← roles OK", { data: createdRole.data })

    set((state) => ({
      roles: [...state.roles, createdRole.data].sort((a, b) =>
        a.name.localeCompare(b.name, "es"),
      ),
    }))

    usePermissionsStore
      .getState()
      .upsertRole(mapAdminRoleToPermissionRole(createdRole.data))

    return true
  },

  updateRole: async (id, values) => {
    devLog("[roles-store] updateRole → roles", { id, values })

    const permissionsParsed = PermissionsRecordSchema.safeParse(values.permissions)
    if (!permissionsParsed.success) {
      devLog("[roles-store] updateRole → permisos inválidos")
      return false
    }

    const metadataParsed = RoleMetadataSchema.safeParse(values.metadata)
    if (!metadataParsed.success) {
      devLog("[roles-store] updateRole → metadata inválida")
      return false
    }

    const supabase = createClient()
    const { data, error } = await supabase
      .from("roles")
      .update({
        name: values.name.trim(),
        description: values.description.trim() || null,
        active: values.active,
        permissions: values.permissions,
        metadata: metadataParsed.data,
      })
      .eq("id", id)
      .select()

    if (error) {
      devLog("[roles-store] updateRole ← roles → error", {
        message: error.message,
        code: error.code,
      })
      return false
    }

    if (!data?.length) {
      devLog(
        "[roles-store] updateRole ← roles → 0 filas (revisá política RLS UPDATE en roles)",
        { id },
      )
      return false
    }

    const updatedRole = AdminRoleSchema.safeParse(data[0])
    if (!updatedRole.success) {
      devLog("[roles-store] updateRole ← roles → fila inválida", updatedRole.error)
      return false
    }

    devLog("[roles-store] updateRole ← roles OK", { id, data: updatedRole.data })

    set((state) => ({
      roles: state.roles.map((role) =>
        role.id === id ? updatedRole.data : role,
      ),
    }))

    usePermissionsStore
      .getState()
      .upsertRole(mapAdminRoleToPermissionRole(updatedRole.data))

    return true
  },

  removeRole: async (id) => {
    devLog("[roles-store] removeRole → roles", { id })

    const supabase = createClient()
    const { error } = await supabase.from("roles").delete().eq("id", id)

    if (error) {
      devLog("[roles-store] removeRole ← roles → error", {
        message: error.message,
        code: error.code,
      })
      return false
    }

    devLog("[roles-store] removeRole ← roles OK", { id })

    set((state) => ({
      roles: state.roles.filter((role) => role.id !== id),
      editingRole: state.editingRole?.id === id ? null : state.editingRole,
      modalOpen: state.editingRole?.id === id ? false : state.modalOpen,
    }))

    usePermissionsStore.getState().removeRole(id)

    return true
  },

  openModal: (role) => {
    set({ modalOpen: true, editingRole: role ?? null })
  },

  closeModal: () => {
    set({ modalOpen: false, editingRole: null })
  },

  reset: () => set(initialState),
}))

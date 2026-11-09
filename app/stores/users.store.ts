import { create } from "zustand"

import { RoleSchema } from "~/domain/auth/auth.schemas"
import type { Role } from "~/domain/auth/auth.schemas"
import type { UserEditFormValues } from "~/domain/users/users.types"
import { devLog } from "~/lib/dev-log"
import { createClient } from "~/lib/supabase/client"
import { z } from "zod"

/** Perfil básico — cualquier usuario autenticado. */
export const BasicUserSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().nullable(),
  avatar_url: z.string().nullable(),
  role: z.object({ name: z.string() }).nullable(),
})

/** Perfil completo — solo con permisos de administración. */
export const FullUserSchema = BasicUserSchema.extend({
  email: z.string().nullable().optional(),
  active: z.boolean(),
  home_page: z.string().default("/dashboard"),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable().optional(),
  role_id: z.string().uuid(),
  phone: z.string().nullable().optional(),
  notifications_enabled: z.boolean().default(true),
  role: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
      permissions: z.record(z.string(), z.array(z.string())),
    })
    .nullable(),
})

export type BasicUser = z.infer<typeof BasicUserSchema>
export type FullUser = z.infer<typeof FullUserSchema>
export type StoreRole = Role

interface UsersState {
  basic: BasicUser[]
  full: FullUser[]
  roles: StoreRole[]

  basicInitialized: boolean
  fullInitialized: boolean
  loadingBasic: boolean
  loadingFull: boolean
  fullFetchedAt: string | null
  /** Falló la última carga completa (para no quedar en skeleton para siempre). */
  fullLoadError: boolean

  fetchBasic: () => Promise<void>
  fetchFull: (options?: { force?: boolean }) => Promise<void>
  refreshFull: () => Promise<void>
  toggleActive: (id: string, active: boolean) => Promise<void>
  updateRole: (id: string, role_id: string) => Promise<void>
  updateUser: (id: string, values: UserEditFormValues) => Promise<boolean>
  reset: () => void
}

const initialState = {
  basic: [] as BasicUser[],
  full: [] as FullUser[],
  roles: [] as StoreRole[],
  basicInitialized: false,
  fullInitialized: false,
  loadingBasic: false,
  loadingFull: false,
  fullFetchedAt: null as string | null,
  fullLoadError: false,
}

export const useUsersStore = create<UsersState>((set, get) => ({
  ...initialState,

  fetchBasic: async () => {
    if (get().basicInitialized) return
    set({ loadingBasic: true })

    devLog("[users-store] fetchBasic → user_profiles (+ roles.name)")

    const supabase = createClient()
    const { data, error } = await supabase
      .from("user_profiles")
      .select("id, full_name, avatar_url, role:roles(name)")
      .order("full_name")

    if (error) {
      devLog("[users-store] fetchBasic ← user_profiles → error", error.message)
      set({ loadingBasic: false })
      return
    }

    const basic = (data ?? [])
      .map((row) => BasicUserSchema.safeParse(row))
      .filter((parsed) => parsed.success)
      .map((parsed) => parsed.data)

    devLog("[users-store] fetchBasic ← user_profiles", {
      tabla: "user_profiles",
      join: "roles (name)",
      count: basic.length,
      data: basic,
    })

    set({
      basic,
      basicInitialized: true,
      loadingBasic: false,
    })
  },

  fetchFull: async (options) => {
    if (get().fullInitialized && !options?.force) return
    set({ loadingFull: true, fullLoadError: false })

    devLog(
      "[users-store] fetchFull → user_profiles (+ roles), roles (active = true)",
      { force: options?.force ?? false },
    )

    const supabase = createClient()
    const [{ data: users, error: usersError }, { data: roles, error: rolesError }] =
      await Promise.all([
        supabase
          .from("user_profiles")
          .select(
            `
          *,
          role:roles ( id, name, permissions )
        `,
          )
          .order("created_at", { ascending: false }),
        supabase.from("roles").select("*").eq("active", true),
      ])

    if (usersError || rolesError) {
      devLog("[users-store] fetchFull → error", {
        user_profiles: usersError?.message ?? null,
        roles: rolesError?.message ?? null,
      })
      set({ loadingFull: false, fullLoadError: true })
      return
    }

    const full = (users ?? [])
      .map((row) => FullUserSchema.safeParse(row))
      .filter((parsed) => parsed.success)
      .map((parsed) => parsed.data)

    const parsedRoles = (roles ?? [])
      .map((row) => RoleSchema.safeParse(row))
      .filter((parsed) => parsed.success)
      .map((parsed) => parsed.data)

    devLog("[users-store] fetchFull ← user_profiles", {
      tabla: "user_profiles",
      join: "roles (id, name, permissions)",
      count: full.length,
      data: full,
    })
    devLog("[users-store] fetchFull ← roles", {
      tabla: "roles",
      filtro: "active = true",
      count: parsedRoles.length,
      data: parsedRoles,
    })

    set({
      full,
      basic: full.map((u) => ({
        id: u.id,
        full_name: u.full_name,
        avatar_url: u.avatar_url,
        role: u.role ? { name: u.role.name } : null,
      })),
      basicInitialized: true,
      roles: parsedRoles,
      fullInitialized: true,
      loadingFull: false,
      fullFetchedAt: new Date().toISOString(),
    })
  },

  refreshFull: async () => {
    await get().fetchFull({ force: true })
  },

  toggleActive: async (id, active) => {
    devLog("[users-store] toggleActive → user_profiles", { id, active })

    const supabase = createClient()
    const { error } = await supabase
      .from("user_profiles")
      .update({ active })
      .eq("id", id)

    if (error) {
      devLog("[users-store] toggleActive ← user_profiles → error", error.message)
      return
    }

    devLog("[users-store] toggleActive ← user_profiles OK", { id, active })

    set((state) => ({
      full: state.full.map((u) => (u.id === id ? { ...u, active } : u)),
    }))
  },

  updateRole: async (id, role_id) => {
    devLog("[users-store] updateRole → user_profiles", { id, role_id })

    const supabase = createClient()
    const { error } = await supabase
      .from("user_profiles")
      .update({ role_id })
      .eq("id", id)

    if (error) {
      devLog("[users-store] updateRole ← user_profiles → error", error.message)
      return
    }

    devLog("[users-store] updateRole ← user_profiles OK", { id, role_id })

    const role = get().roles.find((r) => r.id === role_id) ?? null
    set((state) => ({
      full: state.full.map((u) =>
        u.id === id ? { ...u, role_id, role } : u,
      ),
      basic: state.basic.map((u) =>
        u.id === id ? { ...u, role: role ? { name: role.name } : null } : u,
      ),
    }))
  },

  updateUser: async (id, values) => {
    devLog("[users-store] updateUser → user_profiles", { id, values })

    const supabase = createClient()
    const { data, error } = await supabase
      .from("user_profiles")
      .update({
        full_name: values.fullName.trim() || null,
        phone: values.phone.trim() || null,
        active: values.active,
        role_id: values.roleId,
        home_page: values.homePage,
        notifications_enabled: values.notificationsEnabled,
      })
      .eq("id", id)
      .select(
        `
          *,
          role:roles ( id, name, permissions )
        `,
      )
      .single()

    if (error) {
      devLog("[users-store] updateUser ← user_profiles → error", error.message)
      return false
    }

    const parsed = FullUserSchema.safeParse(data)
    if (!parsed.success) {
      devLog("[users-store] updateUser ← user_profiles → fila inválida", parsed.error)
      return false
    }

    devLog("[users-store] updateUser ← user_profiles OK", { id, data: parsed.data })

    set((state) => ({
      full: state.full.map((user) =>
        user.id === id ? parsed.data : user,
      ),
      basic: state.basic.map((user) =>
        user.id === id
          ? {
              id: parsed.data.id,
              full_name: parsed.data.full_name,
              avatar_url: parsed.data.avatar_url,
              role: parsed.data.role ? { name: parsed.data.role.name } : null,
            }
          : user,
      ),
    }))

    return true
  },

  reset: () => set(initialState),
}))

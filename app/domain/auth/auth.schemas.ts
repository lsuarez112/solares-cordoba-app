import { z } from "zod"

export const ModuleSchema = z.enum([
  "dashboards",
  "quotes",
  "clients",
  "products",
  "kits",
  "exchange_rates",
  "configs",
  "user_profiles",
])

export const ActionSchema = z.enum(["read", "create", "update", "delete"])

export const PermissionsRecordSchema = z
  .record(z.string(), z.unknown())
  .transform((raw) => {
    const result: Partial<Record<Module, Action[]>> = {}
    for (const [key, value] of Object.entries(raw)) {
      const mod = ModuleSchema.safeParse(key)
      if (!mod.success || !Array.isArray(value)) continue
      const actions = value.filter(
        (a): a is Action => ActionSchema.safeParse(a).success,
      )
      if (actions.length > 0) {
        result[mod.data] = actions
      }
    }
    return result as Record<Module, Action[]>
  })

/** Fila de public.roles (permissions JSONB parseado). */
export const RoleSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  active: z.boolean().optional(),
  permissions: PermissionsRecordSchema,
})

/** Fila de public.user_profiles (sin join). */
export const UserProfileBaseSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().nullable(),
  avatar_url: z.string().nullable(),
  active: z.boolean(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
  role_id: z.string().uuid(),
  home_page: z.string(),
  phone: z.string().nullable().optional(),
  timezone: z.string(),
  preferred_currency: z.string(),
  notifications_enabled: z.boolean(),
})

/** Perfil de sesión: user_profiles + rol resuelto en roles.service. */
export const UserProfileSchema = UserProfileBaseSchema.extend({
  role: RoleSchema.nullable(),
})

export type Module = z.infer<typeof ModuleSchema>
export type Action = z.infer<typeof ActionSchema>
export type Role = z.infer<typeof RoleSchema>
export type UserProfileBase = z.infer<typeof UserProfileBaseSchema>
export type UserProfile = z.infer<typeof UserProfileSchema>

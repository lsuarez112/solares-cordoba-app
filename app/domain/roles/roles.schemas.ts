import { z } from "zod"

import { ActionSchema } from "~/domain/auth/auth.schemas"
import type { PermissionsEditorState } from "~/lib/roles/role-permissions.utils"

const PermissionsFormSchema = z.custom<PermissionsEditorState>(
  (value) =>
    value === undefined ||
    (typeof value === "object" && value !== null && !Array.isArray(value)),
)

export const RoleFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(50, "Máximo 50 caracteres"),
  description: z.string().max(500).optional().default(""),
  active: z.boolean().default(true),
  colorPresetId: z.string().min(1),
  icon: z.string().optional().default(""),
  displayOrder: z.string().optional().default(""),
  permissions: PermissionsFormSchema.optional().default({}),
})

export type RoleFormValues = z.infer<typeof RoleFormSchema>

import { z } from "zod"

export const ROLE_ICON_KEYS = [
  "home",
  "layout",
  "user",
  "package",
  "boxes",
  "chart",
  "settings",
  "report",
  "truck",
  "warehouse",
  "users",
  "file",
  "clipboard",
  "sales",
  "shield",
] as const

export const RoleIconKeySchema = z.enum(ROLE_ICON_KEYS)

export type RoleIconKey = z.infer<typeof RoleIconKeySchema>

export const RoleMetadataSchema = z.object({
  badge_color: z.string().optional(),
  badge_text_color: z.string().optional(),
  icon: z.string().optional(),
  display_order: z.coerce.number().int().optional(),
})

export type RoleMetadata = z.infer<typeof RoleMetadataSchema>

export const EMPTY_ROLE_METADATA: RoleMetadata = {}

export function parseRoleMetadata(value: unknown): RoleMetadata {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return EMPTY_ROLE_METADATA
  }

  const parsed = RoleMetadataSchema.safeParse(value)
  return parsed.success ? parsed.data : EMPTY_ROLE_METADATA
}

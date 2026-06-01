import {
  parseRoleMetadata,
  RoleMetadataSchema,
} from "~/domain/roles/role-metadata.schema"
import type { PermissionRole } from "~/domain/permissions/permissions.types"
import type { AdminRole } from "~/stores/roles.store"
import { z } from "zod"

export const PermissionRoleSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  active: z.boolean().default(true),
  metadata: z.preprocess(
    (value) => parseRoleMetadata(value),
    RoleMetadataSchema,
  ),
})

export function indexPermissionRoles(
  roles: PermissionRole[],
): Record<string, PermissionRole> {
  return Object.fromEntries(roles.map((role) => [role.id, role]))
}

export function mapRowToPermissionRole(row: unknown): PermissionRole | null {
  const parsed = PermissionRoleSchema.safeParse(row)
  return parsed.success ? parsed.data : null
}

export function mapAdminRoleToPermissionRole(role: AdminRole): PermissionRole {
  return {
    id: role.id,
    name: role.name,
    active: role.active ?? true,
    metadata: role.metadata,
  }
}

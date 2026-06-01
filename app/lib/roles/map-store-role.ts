import type { RoleListItem } from "~/domain/roles/roles.types"
import type { AdminRole } from "~/stores/roles.store"

export function mapAdminRoleToListItem(role: AdminRole): RoleListItem {
  return {
    id: role.id,
    name: role.name,
    description: role.description ?? null,
    active: role.active ?? true,
    permissions: role.permissions,
    permissionsCount: Object.keys(role.permissions ?? {}).length,
    createdAt: role.created_at ?? null,
    metadata: role.metadata,
  }
}

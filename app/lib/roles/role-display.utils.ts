import type { RoleListItem } from "~/domain/roles/roles.types"

const ADMIN_ROLE_NAME = "admin"

export function isSystemAdminRole(role: Pick<RoleListItem, "name">): boolean {
  return role.name.trim().toLowerCase() === ADMIN_ROLE_NAME
}

export function canDeleteRole(role: Pick<RoleListItem, "name">): boolean {
  return !isSystemAdminRole(role)
}

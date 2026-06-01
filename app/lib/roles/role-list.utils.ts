import type { RoleListItem, RoleStatusFilter } from "~/domain/roles/roles.types"

export function getRoleStats(roles: RoleListItem[]) {
  return {
    total: roles.length,
    active: roles.filter((role) => role.active).length,
    inactive: roles.filter((role) => !role.active).length,
  }
}

export function filterRolesByStatus(
  roles: RoleListItem[],
  status: RoleStatusFilter,
): RoleListItem[] {
  if (status === "all") return roles
  if (status === "active") return roles.filter((role) => role.active)
  return roles.filter((role) => !role.active)
}

export function sortRolesByDisplayOrder(roles: RoleListItem[]): RoleListItem[] {
  return [...roles].sort((a, b) => {
    const orderA = a.metadata.display_order ?? Number.MAX_SAFE_INTEGER
    const orderB = b.metadata.display_order ?? Number.MAX_SAFE_INTEGER
    if (orderA !== orderB) return orderA - orderB
    return a.name.localeCompare(b.name, "es")
  })
}

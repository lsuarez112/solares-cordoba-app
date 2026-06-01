import type { FullUser, StoreRole } from "~/stores/users.store"
import type { AvailableRole, User, UserStatus } from "~/domain/users/users.types"

export function deriveUserStatus(full: FullUser): UserStatus {
  if (full.active) return "active"
  if (
    full.created_at &&
    full.updated_at &&
    full.created_at === full.updated_at
  ) {
    return "pending"
  }
  return "inactive"
}

export function mapFullUserToUser(full: FullUser): User {
  return {
    id: full.id,
    fullName: full.full_name,
    roleId: full.role_id,
    roleName: full.role?.name ?? "—",
    active: full.active,
    homePage: full.home_page ?? "/dashboard",
    status: deriveUserStatus(full),
    createdAt: full.created_at,
    updatedAt: full.updated_at ?? full.created_at,
    notificationsEnabled: full.notifications_enabled,
    phone: full.phone ?? null,
  }
}

export function mapStoreRolesToAvailable(roles: StoreRole[]): AvailableRole[] {
  return roles.map((role) => ({
    id: role.id,
    name: role.name,
  }))
}

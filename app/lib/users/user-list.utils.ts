import type { User, UserStatusFilter } from "~/domain/users/users.types"

export function getUserStats(users: User[]) {
  return {
    total: users.length,
    active: users.filter((user) => user.status === "active").length,
    pending: users.filter((user) => user.status === "pending").length,
    inactive: users.filter((user) => user.status === "inactive").length,
  }
}

export function filterUsersByStatus(
  users: User[],
  status: UserStatusFilter,
): User[] {
  if (status === "all") return users
  return users.filter((user) => user.status === status)
}

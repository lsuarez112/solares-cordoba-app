import type { User, UserStatus } from "~/domain/users/users.types"

export function previewUserStatus(
  active: boolean,
  user: Pick<User, "createdAt" | "updatedAt">,
): UserStatus {
  if (active) return "active"
  if (
    user.createdAt &&
    user.updatedAt &&
    user.createdAt === user.updatedAt
  ) {
    return "pending"
  }
  return "inactive"
}

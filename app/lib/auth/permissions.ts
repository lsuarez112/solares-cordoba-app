import type { Action, Module } from "~/domain/auth/auth.schemas"
import { hasModulePermission } from "~/domain/auth/auth.permissions"
import type { UserProfile } from "~/domain/auth/auth.types"

export function hasAppPermission(
  profile: UserProfile | null,
  module: Module,
  action: Action = "read",
): boolean {
  return hasModulePermission(profile, module, action)
}

import type { Action, Module, UserProfile } from "./auth.schemas"

const ADMIN_ROLE_NAME = "admin"

export type ModuleAccess = {
  module: Module
  action?: Action
}

export function isAdminProfile(profile: UserProfile | null): boolean {
  return profile?.role?.name.toLowerCase() === ADMIN_ROLE_NAME
}

export function hasModulePermission(
  profile: UserProfile | null,
  module: Module,
  action: Action = "read",
): boolean {
  if (!profile?.active || !profile.role) return false
  if (isAdminProfile(profile)) return true
  return profile.role.permissions[module]?.includes(action) ?? false
}

export function hasAllModuleAccess(
  profile: UserProfile | null,
  required: readonly ModuleAccess[],
): boolean {
  if (required.length === 0) return true
  return required.every(({ module, action = "read" }) =>
    hasModulePermission(profile, module, action),
  )
}

export function hasAnyModuleAccess(
  profile: UserProfile | null,
  required: readonly ModuleAccess[],
): boolean {
  if (required.length === 0) return true
  return required.some(({ module, action = "read" }) =>
    hasModulePermission(profile, module, action),
  )
}

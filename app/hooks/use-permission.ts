import type { Action, Module } from "~/domain/auth/auth.schemas"
import { hasModulePermission } from "~/domain/auth/auth.permissions"
import { useAuth } from "~/hooks/use-auth"

export function usePermission(module: Module, action: Action = "read"): boolean {
  const { profile } = useAuth()
  return hasModulePermission(profile, module, action)
}

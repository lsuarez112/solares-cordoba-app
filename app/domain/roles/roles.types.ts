import type { Action, Module } from "~/domain/auth/auth.schemas"
import type { RoleMetadata } from "~/domain/roles/role-metadata.schema"

export type { Role } from "~/domain/auth/auth.schemas"

export type RolePermissions = Partial<Record<Module, Action[]>>

export type RoleListItem = {
  id: string
  name: string
  description: string | null
  active: boolean
  permissions: RolePermissions
  permissionsCount: number
  createdAt: string | null
  metadata: RoleMetadata
}

export type RoleStatusFilter = "all" | "active" | "inactive"

export type RoleEditFormValues = {
  name: string
  description: string
  active: boolean
  permissions: RolePermissions
  metadata: RoleMetadata
}

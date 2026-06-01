import type { RoleMetadata } from "~/domain/roles/role-metadata.schema"

export type PermissionRole = {
  id: string
  name: string
  active: boolean
  metadata: RoleMetadata
}

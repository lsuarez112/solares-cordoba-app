"use client"

import { RoleBadge } from "~/components/roles/role-badge"
import { Badge } from "~/components/ui/badge"
import { usePermissionsStore } from "~/stores/permissions.store"

type UserRoleBadgeProps = {
  roleId: string
  roleName: string
}

export function UserRoleBadge({ roleId, roleName }: UserRoleBadgeProps) {
  const role = usePermissionsStore((state) => state.rolesById[roleId])

  if (!role) {
    return <Badge variant="secondary">{roleName}</Badge>
  }

  return (
    <RoleBadge
      name={role.name}
      metadata={role.metadata}
      muted={!role.active}
    />
  )
}

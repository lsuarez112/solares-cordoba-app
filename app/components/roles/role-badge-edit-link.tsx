"use client"

import { RoleBadge } from "~/components/roles/role-badge"
import { Button } from "~/components/ui/button"
import type { RoleListItem } from "~/domain/roles/roles.types"
import { cn } from "~/lib/utils"

type RoleBadgeEditLinkProps = {
  role: RoleListItem
  className?: string
  canUpdate?: boolean
  onOpenEdit?: (role: RoleListItem) => void
}

export function RoleBadgeEditLink({
  role,
  className,
  canUpdate = false,
  onOpenEdit,
}: RoleBadgeEditLinkProps) {
  if (!canUpdate || !onOpenEdit) {
    return (
      <RoleBadge
        name={role.name}
        metadata={role.metadata}
        muted={!role.active}
      />
    )
  }

  return (
    <Button
      type="button"
      variant="link"
      className={cn(
        "inline h-auto min-h-0 p-0 font-normal text-inherit no-underline hover:underline",
        "[&_[data-slot=badge]]:pointer-events-none",
        className,
      )}
      onClick={() => onOpenEdit(role)}
    >
      <RoleBadge
        name={role.name}
        metadata={role.metadata}
        muted={!role.active}
      />
    </Button>
  )
}

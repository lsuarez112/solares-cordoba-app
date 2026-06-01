import { Badge } from "~/components/ui/badge"
import type { RoleMetadata } from "~/domain/roles/role-metadata.schema"
import { getRoleIcon } from "~/lib/roles/role-icons"
import { cn } from "~/lib/utils"

type RoleBadgeProps = {
  name: string
  metadata: RoleMetadata
  muted?: boolean
}

export function RoleBadge({ name, metadata, muted = false }: RoleBadgeProps) {
  const hasIcon = Boolean(metadata.icon)
  const Icon = hasIcon ? getRoleIcon(metadata.icon) : null
  const iconStyle = metadata.badge_color ? { color: metadata.badge_color } : undefined

  return (
    <Badge
      variant="secondary"
      className={cn(muted && "opacity-60")}
    >
      {Icon ? <Icon data-icon="inline-start" style={iconStyle} /> : null}
      {name}
    </Badge>
  )
}

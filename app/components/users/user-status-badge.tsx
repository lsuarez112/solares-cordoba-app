import { CheckCircle2, CircleX, Clock } from "lucide-react"

import { Badge } from "~/components/ui/badge"
import type { UserStatus } from "~/domain/users/users.types"

const statusConfig: Record<
  UserStatus,
  { label: string; icon: typeof CheckCircle2; iconClassName: string }
> = {
  active: {
    label: "Activo",
    icon: CheckCircle2,
    iconClassName: "text-green-600",
  },
  pending: {
    label: "Pendiente",
    icon: Clock,
    iconClassName: "text-amber-600",
  },
  inactive: {
    label: "Inactivo",
    icon: CircleX,
    iconClassName: "text-destructive",
  },
}

type UserStatusBadgeProps = {
  status: UserStatus
}

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge variant="secondary">
      <Icon data-icon="inline-start" className={config.iconClassName} />
      {config.label}
    </Badge>
  )
}

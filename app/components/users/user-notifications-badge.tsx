import { Bell, BellOff } from "lucide-react"

import { Badge } from "~/components/ui/badge"

type UserNotificationsBadgeProps = {
  enabled: boolean
}

export function UserNotificationsBadge({ enabled }: UserNotificationsBadgeProps) {
  const Icon = enabled ? Bell : BellOff

  return (
    <Badge variant={enabled ? "secondary" : "outline"}>
      <Icon data-icon="inline-start" />
      {enabled ? "Activas" : "Desactivadas"}
    </Badge>
  )
}

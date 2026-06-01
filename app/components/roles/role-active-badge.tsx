import { CheckCircle2, CircleX } from "lucide-react"

import { Badge } from "~/components/ui/badge"

type RoleActiveBadgeProps = {
  active: boolean
}

export function RoleActiveBadge({ active }: RoleActiveBadgeProps) {
  if (active) {
    return (
      <Badge variant="secondary">
        <CheckCircle2 data-icon="inline-start" className="text-green-600" />
        Activo
      </Badge>
    )
  }

  return (
    <Badge variant="secondary">
      <CircleX data-icon="inline-start" className="text-destructive" />
      Inactivo
    </Badge>
  )
}

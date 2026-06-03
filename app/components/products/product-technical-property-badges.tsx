import { Cpu } from "lucide-react"

import { Badge } from "~/components/ui/badge"
import { cn } from "~/lib/utils"

type ProductTechnicalPropertyBadgesProps = {
  items: Array<{ key: string; value: string }>
  className?: string
}

export function ProductTechnicalPropertyBadges({
  items,
  className,
}: ProductTechnicalPropertyBadgesProps) {
  if (items.length === 0) return null

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {items.map(({ key, value }) => (
        <Badge
          key={key}
          variant="secondary"
          className="border-violet-200 bg-violet-100 text-violet-800 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-300"
        >
          <Cpu data-icon="inline-start" className="text-violet-600" />
          {key}: {value}
        </Badge>
      ))}
    </div>
  )
}

import { Cpu } from "lucide-react"

import { Badge } from "~/components/ui/badge"
import { formatPropertyValue } from "~/lib/products/product-display.utils"
import { cn } from "~/lib/utils"

type ProductTechnicalPropertyBadgesProps = {
  items: Array<{ key: string; value: string }>
  className?: string
  /** Máximo de badges visibles; el resto se resume en "+N". */
  max?: number
  /** Versión compacta para filas de tabla: sin ícono y en una sola línea. */
  compact?: boolean
}

const BADGE_CLASS =
  "border-violet-200 bg-violet-100 text-violet-800 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-300"

export function ProductTechnicalPropertyBadges({
  items,
  className,
  max,
  compact = false,
}: ProductTechnicalPropertyBadgesProps) {
  if (items.length === 0) return null

  const visible = typeof max === "number" ? items.slice(0, max) : items
  const hidden = items.length - visible.length

  return (
    <div
      className={cn(
        "flex gap-1",
        compact ? "flex-nowrap" : "flex-wrap",
        className,
      )}
    >
      {visible.map(({ key, value }) => (
        <Badge
          key={key}
          variant="secondary"
          className={BADGE_CLASS}
          title={`${key}: ${value}`}
        >
          {compact ? null : (
            <Cpu data-icon="inline-start" className="text-violet-600" />
          )}
          {compact ? formatPropertyValue(key, value) : `${key}: ${value}`}
        </Badge>
      ))}
      {hidden > 0 ? (
        <Badge
          variant="outline"
          title={items
            .slice(visible.length)
            .map(({ key, value }) => `${key}: ${value}`)
            .join("\n")}
        >
          +{hidden}
        </Badge>
      ) : null}
    </div>
  )
}

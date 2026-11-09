import { Cpu } from "lucide-react"

import { Badge } from "~/components/ui/badge"
import { HintTooltip } from "~/components/ui/hint-tooltip"
import {
  formatPropertyValue,
  orderProductProperties,
} from "~/lib/products/product-display.utils"
import { cn } from "~/lib/utils"

type ProductTechnicalPropertyBadgesProps = {
  items: Array<{ key: string; value: string }>
  className?: string
  /** Máximo de badges visibles; el resto se resume en "+N". */
  max?: number
  /** Versión compacta para filas de tabla: sin ícono, solo valores y en una línea. */
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
  const all = orderProductProperties(items)
  const shown = compact ? orderProductProperties(items, { compact: true }) : all
  if (shown.length === 0) return null

  const visible = typeof max === "number" ? shown.slice(0, max) : shown
  const visibleKeys = new Set(visible.map((item) => item.key))
  const rest = all.filter((item) => !visibleKeys.has(item.key))

  return (
    <div className={cn("flex min-w-0 gap-1", compact ? "flex-nowrap" : "flex-wrap", className)}>
      {visible.map(({ key, value }) => (
        <HintTooltip key={key} content={`${key}: ${value}`}>
          <Badge variant="secondary" className={BADGE_CLASS}>
            {compact ? null : <Cpu data-icon="inline-start" className="text-violet-600" />}
            {compact ? formatPropertyValue(key, value) : `${key}: ${value}`}
          </Badge>
        </HintTooltip>
      ))}
      {rest.length > 0 ? (
        <HintTooltip content={rest.map(({ key, value }) => `${key}: ${value}`).join("\n")}>
          <Badge
            variant="outline"
          >
            +{rest.length}
          </Badge>
        </HintTooltip>
      ) : null}
    </div>
  )
}

import type * as React from "react"
import { Link } from "react-router"

import { cn } from "~/lib/utils"

/**
 * Fila de un listado como tarjeta (celular): ícono/estado, título (link),
 * subtítulo, chips y un valor a la derecha, con el menú de acciones.
 */
export function MobileRowCard({
  to,
  leading,
  title,
  subtitle,
  meta,
  trailing,
  actions,
  className,
}: {
  to?: string
  leading?: React.ReactNode
  title: React.ReactNode
  subtitle?: React.ReactNode
  meta?: React.ReactNode
  trailing?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}) {
  const body = (
    <>
      <span className="flex min-w-0 items-center gap-2">
        {leading}
        <span className="min-w-0 truncate text-sm font-medium">{title}</span>
      </span>
      {subtitle ? <span className="truncate text-xs text-muted-foreground">{subtitle}</span> : null}
    </>
  )
  return (
    <div className={cn("flex items-start gap-2 rounded-lg border bg-card p-3", className)}>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {to ? (
          <Link to={to} className="flex min-w-0 flex-col gap-0.5 hover:underline-offset-2 [&:hover_.truncate.font-medium]:underline">
            {body}
          </Link>
        ) : (
          <div className="flex min-w-0 flex-col gap-0.5">{body}</div>
        )}
        {meta ? <div className="flex flex-wrap items-center gap-1.5 pt-0.5">{meta}</div> : null}
      </div>
      {trailing ? <div className="shrink-0 pt-0.5 text-right">{trailing}</div> : null}
      {actions ? <div className="-mr-1 -mt-1 shrink-0">{actions}</div> : null}
    </div>
  )
}

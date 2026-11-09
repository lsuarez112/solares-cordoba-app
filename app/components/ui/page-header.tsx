import type * as React from "react"
import { ArrowLeft } from "lucide-react"
import { Link } from "react-router"

import { cn } from "~/lib/utils"

/**
 * Encabezado de página: título y acciones en el mismo renglón (acciones a la
 * derecha, sin saltar de línea) y la descripción debajo a todo el ancho, así en
 * el celular no queda apretada ni cortada. Si hay muchas acciones, la página
 * pasa las secundarias a un menú "⋮" (ver DataActionsMenu / OverflowMenu).
 */
export function PageHeader({
  title,
  description,
  actions,
  back,
  leading,
  badges,
  className,
  titleClassName,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  /** Link "← Sección" arriba del título. */
  back?: { to: string; label: string }
  /** Ícono antes del título. */
  leading?: React.ReactNode
  /** Chips al lado del título (estado, tipo). */
  badges?: React.ReactNode
  className?: string
  titleClassName?: string
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>
      {back ? (
        <Link
          to={back.to}
          className="inline-flex w-fit items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          {back.label}
        </Link>
      ) : null}
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
          {leading}
          <h1 className={cn("min-w-0 text-2xl font-semibold tracking-tight break-words", titleClassName)}>{title}</h1>
          {badges}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
      {description ? <div className="text-sm text-muted-foreground">{description}</div> : null}
    </div>
  )
}

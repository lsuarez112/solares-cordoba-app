import {
  BadgeCheck,
  CircleCheck,
  CircleMinus,
  Clock,
  FileCheck2,
  FilePen,
  Handshake,
  Receipt,
  type LucideIcon,
} from "lucide-react"

import { cn } from "~/lib/utils"

export type StatusKind =
  | "active"
  | "inactive"
  | "pending"
  | "draft"
  | "issued"
  | "confirmed"
  | "to_invoice"
  | "invoiced"

const STATUS_META: Record<StatusKind, { label: string; icon: LucideIcon; className: string }> = {
  active: { label: "Activo", icon: CircleCheck, className: "text-emerald-600 dark:text-emerald-400" },
  inactive: { label: "Inactivo", icon: CircleMinus, className: "text-muted-foreground/60" },
  pending: { label: "Pendiente", icon: Clock, className: "text-amber-600 dark:text-amber-400" },
  draft: { label: "Borrador", icon: FilePen, className: "text-amber-600 dark:text-amber-400" },
  issued: { label: "Emitido", icon: FileCheck2, className: "text-sky-600 dark:text-sky-400" },
  confirmed: { label: "Confirmado", icon: Handshake, className: "text-emerald-600 dark:text-emerald-400" },
  to_invoice: { label: "Facturar", icon: Receipt, className: "text-violet-600 dark:text-violet-400" },
  invoiced: { label: "Facturado", icon: BadgeCheck, className: "text-teal-700 dark:text-teal-400" },
}

/** Íconos de presupuestos, en el orden del flujo. */
export const QUOTE_STATUS_KINDS: StatusKind[] = ["draft", "issued", "confirmed", "to_invoice", "invoiced"]

export function statusMeta(status: StatusKind) {
  return STATUS_META[status]
}

export function statusFromActive(active: boolean): StatusKind {
  return active ? "active" : "inactive"
}

/** Ícono de estado que va al inicio del nombre en las filas de las tablas. */
export function StatusIcon({ status, className }: { status: StatusKind; className?: string }) {
  const meta = STATUS_META[status]
  const Icon = meta.icon
  return (
    <Icon
      role="img"
      aria-label={meta.label}
      className={cn("size-3.5 shrink-0", meta.className, className)}
    >
      <title>{meta.label}</title>
    </Icon>
  )
}

/** Leyenda de los íconos de estado (va al pie de la tabla). */
export function StatusLegend({
  statuses = ["active", "inactive"],
  className,
}: {
  statuses?: StatusKind[]
  className?: string
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground", className)}>
      {statuses.map((status) => (
        <span key={status} className="inline-flex items-center gap-1">
          <StatusIcon status={status} />
          {STATUS_META[status].label}
        </span>
      ))}
    </div>
  )
}

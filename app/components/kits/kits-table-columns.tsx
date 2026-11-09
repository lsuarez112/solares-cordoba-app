"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { HintTooltip } from "~/components/ui/hint-tooltip"
import {
  AlertTriangle,
  CircleCheck,
  CircleMinus,
  CopyPlus,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react"

import { Badge } from "~/components/ui/badge"
import { SortableHeader } from "~/components/ui/data-table-sortable-header"
import { ACTIONS_COLUMN_META, RowActionsMenu } from "~/components/ui/row-actions-menu"
import { StatusIcon, statusFromActive } from "~/components/ui/status-indicator"
import type { Kit } from "~/domain/kits/kits.schemas"
import { GRID_TYPE_COLORS, GRID_TYPE_LABELS } from "~/lib/products/grid-type.utils"
import { cn } from "~/lib/utils"

const usd = (value: number) =>
  value.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** Valores de filtro (column filters) de la tabla de kits. */
export type KitStatusFilter = "active" | "inactive"
export type KitPriceFilter = "complete" | "missing"

export type KitsTableColumnsOptions = {
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
  onOpen: (kit: Kit) => void
  onDuplicate: (kit: Kit) => void
  onDelete: (kit: Kit) => void
  onToggleActive: (kit: Kit, active: boolean) => void
}

const equalsFilter =
  <K extends keyof Kit>(key: K) =>
  (row: { original: Kit }, _id: string, value: unknown) =>
    !value || row.original[key] === value

export function kitsTableColumns(o: KitsTableColumnsOptions): ColumnDef<Kit>[] {
  return [
    {
      accessorKey: "code",
      header: ({ column }) => <SortableHeader column={column} title="Código" />,
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.code}</span>,
    },
    {
      id: "kit",
      accessorKey: "name",
      header: ({ column }) => <SortableHeader column={column} title="Nombre" />,
      cell: ({ row }) => (
        <div className="flex max-w-[20rem] min-w-0 items-center gap-2">
          <StatusIcon status={statusFromActive(row.original.active)} />
          <HintTooltip
            content={
              row.original.description ? (
                <>
                  <span className="font-medium">{row.original.name}</span>
                  <br />
                  {row.original.description}
                </>
              ) : (
                row.original.name
              )
            }
          >
            <button
              type="button"
              className="min-w-0 truncate text-left font-medium hover:underline"
              onClick={() => o.onOpen(row.original)}
            >
              {row.original.name}
            </button>
          </HintTooltip>
        </div>
      ),
      filterFn: (row, _id, value) => {
        const q = String(value ?? "").trim().toLowerCase()
        if (!q) return true
        const k = row.original
        return [k.code, k.name, k.description, k.notes]
          .filter(Boolean)
          .some((text) => String(text).toLowerCase().includes(q))
      },
    },
    {
      accessorKey: "grid_type",
      header: ({ column }) => <SortableHeader column={column} title="Sistema" />,
      cell: ({ row }) => (
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-medium",
            GRID_TYPE_COLORS[row.original.grid_type],
          )}
        >
          {GRID_TYPE_LABELS[row.original.grid_type]}
        </span>
      ),
      filterFn: equalsFilter("grid_type"),
    },
    {
      accessorKey: "phases",
      header: ({ column }) => <SortableHeader column={column} title="Fases" />,
      cell: ({ row }) => (
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-medium",
            row.original.phases === "tri"
              ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
          )}
        >
          {row.original.phases === "tri" ? "Trifásico" : "Monofásico"}
        </span>
      ),
      filterFn: equalsFilter("phases"),
    },
    {
      accessorKey: "kwp",
      header: ({ column }) => <SortableHeader column={column} title="kWp" className="ml-auto" />,
      cell: ({ row }) => <span className="tabular-nums">{row.original.kwp.toFixed(2)}</span>,
      meta: { headerClassName: "text-right", cellClassName: "text-right" },
    },
    {
      accessorKey: "battery_kwh",
      header: ({ column }) => <SortableHeader column={column} title="Batería" className="ml-auto" />,
      cell: ({ row }) => (
        <span className="tabular-nums">
          {row.original.battery_kwh > 0 ? `${row.original.battery_kwh} kWh` : "—"}
        </span>
      ),
      meta: { headerClassName: "text-right", cellClassName: "text-right" },
    },
    {
      accessorKey: "est_kwh_month",
      header: ({ column }) => (
        <SortableHeader column={column} title="Generación" className="ml-auto" />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums">
          {row.original.est_kwh_month == null
            ? "—"
            : `${row.original.est_kwh_month.toLocaleString("es-AR")} kWh/mes`}
        </span>
      ),
      sortUndefined: "last",
      meta: { headerClassName: "text-right", cellClassName: "text-right" },
    },
    {
      id: "ref",
      accessorFn: (kit) => kit.ref_kwh_month_min ?? undefined,
      header: ({ column }) => (
        <SortableHeader column={column} title="Consumo ref." className="ml-auto" />
      ),
      cell: ({ row }) => {
        const { ref_kwh_month_min: min, ref_kwh_month_max: max } = row.original
        return (
          <span className="text-muted-foreground tabular-nums">
            {min != null && max != null ? `${min}–${max}` : "—"}
          </span>
        )
      },
      sortUndefined: "last",
      meta: { headerClassName: "text-right", cellClassName: "text-right" },
    },
    {
      id: "prices",
      accessorKey: "total_usd",
      header: ({ column }) => (
        <SortableHeader column={column} title="Total USD" className="ml-auto" />
      ),
      cell: ({ row }) => {
        const kit = row.original
        return (
          <>
            <span className="font-mono tabular-nums">{usd(kit.total_usd)}</span>
            {kit.items_without_price > 0 ? (
              <HintTooltip content={`${kit.items_without_price} de ${kit.items_count} productos sin precio o inactivos`}>
                <Badge
                  variant="outline"
                  className="ml-1.5 text-amber-700"
                >
                  <AlertTriangle data-icon="inline-start" />
                  {kit.items_without_price}
                </Badge>
              </HintTooltip>
            ) : null}
          </>
        )
      },
      filterFn: (row, _id, value) => {
        if (!value) return true
        const missing = row.original.items_without_price > 0
        return value === "missing" ? missing : !missing
      },
      meta: { headerClassName: "text-right", cellClassName: "text-right" },
    },
    {
      id: "status",
      accessorFn: (kit) => (kit.active ? 1 : 0),
      header: ({ column }) => (
        <SortableHeader column={column} title="Activo" className="mx-auto" />
      ),
      cell: ({ row }) => <StatusIcon status={statusFromActive(row.original.active)} />,
      filterFn: (row, _id, value) => {
        if (!value) return true
        return value === "active" ? row.original.active : !row.original.active
      },
      meta: { headerClassName: "text-center", cellClassName: "text-center" },
    },
    {
      id: "actions",
      enableSorting: false,
      header: () => null,
      cell: ({ row }) => {
        const kit = row.original
        return (
          <RowActionsMenu
            actions={[
              { key: "edit", label: o.canUpdate ? "Editar" : "Ver", icon: o.canUpdate ? Pencil : Eye, tone: o.canUpdate ? "edit" : "neutral", onSelect: () => o.onOpen(kit) },
              { key: "duplicate", label: "Duplicar", icon: CopyPlus, tone: "duplicate", hidden: !o.canCreate, onSelect: () => o.onDuplicate(kit) },
              {
                key: "toggle",
                label: kit.active ? "Desactivar" : "Activar",
                icon: kit.active ? CircleMinus : CircleCheck,
                tone: kit.active ? "deactivate" : "activate",
                hidden: !o.canUpdate,
                onSelect: () => o.onToggleActive(kit, !kit.active),
              },
              { key: "delete", label: "Eliminar", icon: Trash2, tone: "delete", hidden: !o.canDelete, onSelect: () => o.onDelete(kit) },
            ]}
          />
        )
      },
      meta: ACTIONS_COLUMN_META,
    },
  ]
}

"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Link } from "react-router"
import {
  CopyPlus,
  Download,
  FilePen,
  GitBranchPlus,
  MessageCircle,
  Share2,
  SquareArrowOutUpRight,
  Trash2,
} from "lucide-react"

import { SortableHeader } from "~/components/ui/data-table-sortable-header"
import { HintTooltip } from "~/components/ui/hint-tooltip"
import { ACTIONS_COLUMN_META, RowActionsMenu } from "~/components/ui/row-actions-menu"
import { StatusIcon } from "~/components/ui/status-indicator"
import type { QuoteListItem } from "~/domain/quotes/quotes.schemas"
import type { QuoteShareAction } from "~/hooks/use-quote-share"
import { formatDate } from "~/lib/dates"
import { GRID_TYPE_COLORS, GRID_TYPE_LABELS } from "~/lib/products/grid-type.utils"
import { formatArs, formatUsd } from "~/lib/quotes/quote-totals"
import { cn } from "~/lib/utils"

export type QuotesTableColumnsOptions = {
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
  /** Oculta la columna Cliente (ficha del cliente). */
  hideClient?: boolean
  onOpen: (quote: QuoteListItem) => void
  onRevise: (quote: QuoteListItem) => void
  onDuplicate: (quote: QuoteListItem) => void
  onDelete: (quote: QuoteListItem) => void
  onShare: (quote: QuoteListItem, action: QuoteShareAction) => void
}

/** Fecha que importa: emisión si está emitido, alta si es borrador. */
export const quoteDate = (q: QuoteListItem) => q.issued_at ?? q.created_at

export function quotesTableColumns(o: QuotesTableColumnsOptions): ColumnDef<QuoteListItem>[] {
  const columns: ColumnDef<QuoteListItem>[] = [
    {
      id: "number",
      accessorFn: (q) => (q.number ?? Number.MAX_SAFE_INTEGER) * 100 + q.revision,
      header: ({ column }) => <SortableHeader column={column} title="Número" />,
      cell: ({ row }) => {
        const q = row.original
        return (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <StatusIcon status={q.status === "issued" ? "issued" : "draft"} />
            <Link to={`/presupuestos/${q.id}`} className="font-mono text-xs font-medium hover:underline">
              {q.display_number ?? "Borrador"}
            </Link>
            {q.status === "issued" && !q.is_current ? (
              <HintTooltip content="Hay una revisión más nueva de este presupuesto">
                <span className="text-xs text-muted-foreground">reemplazado</span>
              </HintTooltip>
            ) : null}
          </div>
        )
      },
    },
    {
      id: "client",
      accessorKey: "client_name",
      header: ({ column }) => <SortableHeader column={column} title="Cliente" />,
      cell: ({ row }) => {
        const q = row.original
        return (
          <div className="flex max-w-[16rem] min-w-0 flex-col">
            <Link to={`/clientes/${q.client_id}`} className="truncate font-medium hover:underline">
              {q.client_name}
            </Link>
            {q.client_city ? (
              <span className="truncate text-xs text-muted-foreground">{q.client_city}</span>
            ) : null}
          </div>
        )
      },
    },
    {
      accessorKey: "grid_type",
      header: ({ column }) => <SortableHeader column={column} title="Sistema" />,
      cell: ({ row }) => {
        const g = row.original.grid_type
        return g ? (
          <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap", GRID_TYPE_COLORS[g])}>
            {GRID_TYPE_LABELS[g]}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )
      },
      sortUndefined: "last",
      filterFn: (row, _id, value) => !value || row.original.grid_type === value,
    },
    {
      id: "kit",
      accessorFn: (q) => q.kit_code ?? undefined,
      header: ({ column }) => <SortableHeader column={column} title="Kit" />,
      cell: ({ row }) => {
        const q = row.original
        if (!q.kit_code) return <span className="text-xs text-muted-foreground">Sin kit</span>
        return (
          <HintTooltip content={q.kit_name ?? q.kit_code}>
            <span className="font-mono text-xs">{q.kit_code}</span>
          </HintTooltip>
        )
      },
      sortUndefined: "last",
    },
    {
      id: "total_usd",
      accessorFn: (q) => q.total_usd ?? q.subtotal_usd ?? 0,
      header: ({ column }) => <SortableHeader column={column} title="Total USD" className="ml-auto" />,
      cell: ({ row }) => {
        const q = row.original
        if (q.status === "issued") {
          return <span className="font-mono tabular-nums">{formatUsd(q.total_usd)}</span>
        }
        return (
          <HintTooltip content="Borrador: subtotal sin IVA con precios vigentes">
            <span className="font-mono text-muted-foreground tabular-nums">
              {formatUsd(q.subtotal_usd)}
              <span className="ml-1 font-sans text-[10px]">+IVA</span>
            </span>
          </HintTooltip>
        )
      },
      meta: { headerClassName: "text-right", cellClassName: "text-right" },
    },
    {
      accessorKey: "total_ars",
      header: ({ column }) => <SortableHeader column={column} title="Total ARS" className="ml-auto" />,
      cell: ({ row }) => (
        <span className="whitespace-nowrap tabular-nums">{formatArs(row.original.total_ars)}</span>
      ),
      sortUndefined: "last",
      meta: { headerClassName: "text-right", cellClassName: "text-right" },
    },
    {
      id: "date",
      accessorFn: quoteDate,
      header: ({ column }) => <SortableHeader column={column} title="Fecha" />,
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-muted-foreground tabular-nums">
          {formatDate(quoteDate(row.original))}
        </span>
      ),
    },
    // Columnas ocultas: solo filtran.
    {
      id: "search",
      accessorFn: (q) =>
        [q.display_number, q.client_name, q.client_phone, q.client_city, q.kit_code, q.kit_name]
          .filter(Boolean)
          .join(" ")
          .toLowerCase(),
      header: () => null,
      cell: () => null,
      enableSorting: false,
      filterFn: (row, id, value) => {
        const query = String(value ?? "").trim().toLowerCase()
        return !query || String(row.getValue(id)).includes(query)
      },
    },
    {
      id: "status",
      accessorKey: "status",
      header: () => null,
      cell: () => null,
      filterFn: (row, _id, value) => !value || row.original.status === value,
    },
    {
      id: "current",
      accessorKey: "is_current",
      header: () => null,
      cell: () => null,
      // "current": la vigente de cada número y los borradores sin número.
      filterFn: (row, _id, value) => value !== "current" || row.original.is_current,
    },
    {
      id: "actions",
      enableSorting: false,
      header: () => null,
      cell: ({ row }) => {
        const q = row.original
        const isDraft = q.status === "draft"
        return (
          <RowActionsMenu
            actions={[
              {
                key: "open",
                label: isDraft && o.canUpdate ? "Editar" : "Ver",
                icon: isDraft && o.canUpdate ? FilePen : SquareArrowOutUpRight,
                tone: isDraft && o.canUpdate ? "edit" : "neutral",
                onSelect: () => o.onOpen(q),
              },
              {
                key: "revise",
                label: "Editar (nueva revisión)",
                icon: GitBranchPlus,
                tone: "edit",
                hidden: isDraft || !q.is_current || !o.canUpdate,
                onSelect: () => o.onRevise(q),
              },
              { key: "duplicate", label: "Duplicar", icon: CopyPlus, tone: "duplicate", hidden: !o.canCreate, onSelect: () => o.onDuplicate(q) },
              {
                key: "whatsapp",
                label: "Enviar por WhatsApp",
                icon: MessageCircle,
                tone: "share",
                onSelect: () => o.onShare(q, "whatsapp"),
              },
              { key: "share", label: "Compartir PDF", icon: Share2, tone: "share", onSelect: () => o.onShare(q, "share") },
              { key: "download", label: "Descargar PDF", icon: Download, onSelect: () => o.onShare(q, "download") },
              {
                key: "delete",
                label: "Eliminar borrador",
                icon: Trash2,
                tone: "delete",
                hidden: !isDraft || !o.canDelete,
                onSelect: () => o.onDelete(q),
              },
            ]}
          />
        )
      },
      meta: ACTIONS_COLUMN_META,
    },
  ]
  return o.hideClient ? columns.filter((c) => c.id !== "client") : columns
}

"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Link } from "react-router"
import {
  Copy,
  Eye,
  FilePlus2,
  Merge,
  MessageCircle,
  Pencil,
  Trash2,
  Users,
} from "lucide-react"

import { Badge } from "~/components/ui/badge"
import { SortableHeader } from "~/components/ui/data-table-sortable-header"
import { HintTooltip } from "~/components/ui/hint-tooltip"
import { ACTIONS_COLUMN_META, RowActionsMenu } from "~/components/ui/row-actions-menu"
import type { ClientListItem } from "~/domain/clients/clients.schemas"
import { whatsappLink } from "~/lib/clients/phone"
import { formatDate } from "~/lib/dates"

export type ClientsTableColumnsOptions = {
  canCreateQuote: boolean
  canUpdate: boolean
  canDelete: boolean
  /** Teléfonos normalizados que se repiten en más de un cliente. */
  duplicatedPhones: Set<string>
  onOpen: (client: ClientListItem) => void
  onEdit: (client: ClientListItem) => void
  onNewQuote: (client: ClientListItem) => void
  onMerge: (client: ClientListItem) => void
  onDelete: (client: ClientListItem) => void
}

export function clientsTableColumns(o: ClientsTableColumnsOptions): ColumnDef<ClientListItem>[] {
  return [
    {
      id: "client",
      accessorKey: "name",
      header: ({ column }) => <SortableHeader column={column} title="Cliente" />,
      cell: ({ row }) => {
        const c = row.original
        return (
          <div className="flex max-w-[22rem] min-w-0 flex-col">
            <Link
              to={`/clientes/${c.id}`}
              className="truncate font-medium hover:underline"
            >
              {c.name}
            </Link>
            {c.email || c.cuit ? (
              <span className="truncate text-xs text-muted-foreground">
                {[c.email, c.cuit].filter(Boolean).join(" · ")}
              </span>
            ) : null}
          </div>
        )
      },
      filterFn: (row, _id, value) => {
        const q = String(value ?? "").trim().toLowerCase()
        if (!q) return true
        const c = row.original
        const digits = q.replace(/\D/g, "")
        return (
          [c.name, c.email, c.city, c.cuit, c.address, c.notes, c.phone]
            .filter(Boolean)
            .some((text) => String(text).toLowerCase().includes(q)) ||
          (digits.length >= 3 && (c.phone_normalized ?? "").includes(digits))
        )
      },
    },
    {
      accessorKey: "phone",
      header: ({ column }) => <SortableHeader column={column} title="Teléfono" />,
      cell: ({ row }) => {
        const c = row.original
        if (!c.phone) return <span className="text-muted-foreground">—</span>
        const duplicated = c.phone_normalized != null && o.duplicatedPhones.has(c.phone_normalized)
        return (
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <span className="tabular-nums">{c.phone}</span>
            {duplicated ? (
              <HintTooltip content="Otro cliente tiene este teléfono: podés unificarlos">
                <Badge variant="outline" className="h-5 px-1.5 text-amber-700 dark:text-amber-400">
                  <Users data-icon="inline-start" />
                  Duplicado
                </Badge>
              </HintTooltip>
            ) : null}
          </span>
        )
      },
      sortUndefined: "last",
      filterFn: (row, _id, value) => {
        if (!value) return true
        const n = row.original.phone_normalized
        if (value === "missing") return !n
        if (value === "duplicated") return n != null && o.duplicatedPhones.has(n)
        return true
      },
    },
    {
      accessorKey: "city",
      header: ({ column }) => <SortableHeader column={column} title="Localidad" />,
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.city ?? "—"}</span>
      ),
      sortUndefined: "last",
      filterFn: (row, _id, value) => !value || row.original.city === value,
    },
    {
      id: "quotes",
      accessorKey: "quotes_count",
      header: ({ column }) => (
        <SortableHeader column={column} title="Presupuestos" className="ml-auto" />
      ),
      cell: ({ row }) => {
        const c = row.original
        return (
          <span className="tabular-nums">
            {c.quotes_count}
            {c.issued_count > 0 ? (
              <span className="text-xs text-muted-foreground"> ({c.issued_count} emit.)</span>
            ) : null}
          </span>
        )
      },
      filterFn: (row, _id, value) => {
        if (!value) return true
        return value === "with" ? row.original.quotes_count > 0 : row.original.quotes_count === 0
      },
      meta: { headerClassName: "text-right", cellClassName: "text-right" },
    },
    {
      accessorKey: "last_quote_at",
      header: ({ column }) => <SortableHeader column={column} title="Último" />,
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-muted-foreground tabular-nums">
          {formatDate(row.original.last_quote_at)}
        </span>
      ),
      sortUndefined: "last",
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => <SortableHeader column={column} title="Alta" />,
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-muted-foreground tabular-nums">
          {formatDate(row.original.created_at)}
        </span>
      ),
    },
    {
      id: "actions",
      enableSorting: false,
      header: () => null,
      cell: ({ row }) => {
        const c = row.original
        const wa = whatsappLink(c.phone)
        return (
          <RowActionsMenu
            actions={[
              {
                key: "view",
                label: "Ver ficha",
                icon: Eye,
                tone: "neutral",
                onSelect: () => o.onOpen(c),
              },
              { key: "edit", label: "Editar", icon: Pencil, tone: "edit", hidden: !o.canUpdate, onSelect: () => o.onEdit(c) },
              {
                key: "quote",
                label: "Nuevo presupuesto",
                icon: FilePlus2,
                tone: "create",
                hidden: !o.canCreateQuote,
                onSelect: () => o.onNewQuote(c),
              },
              {
                key: "whatsapp",
                label: "Abrir WhatsApp",
                icon: MessageCircle,
                tone: "share",
                hidden: !wa,
                onSelect: () => wa && window.open(wa, "_blank", "noopener"),
              },
              {
                key: "copy",
                label: "Copiar teléfono",
                icon: Copy,
                tone: "neutral",
                hidden: !c.phone,
                onSelect: () => void navigator.clipboard?.writeText(c.phone ?? ""),
              },
              { key: "merge", label: "Unificar duplicados", icon: Merge, tone: "duplicate", hidden: !o.canUpdate, onSelect: () => o.onMerge(c) },
              { key: "delete", label: "Eliminar", icon: Trash2, tone: "delete", hidden: !o.canDelete, onSelect: () => o.onDelete(c) },
            ]}
          />
        )
      },
      meta: ACTIONS_COLUMN_META,
    },
  ]
}

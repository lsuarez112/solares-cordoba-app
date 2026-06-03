"use client"

import type { Column, ColumnDef } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"

import { RoleActiveBadge } from "~/components/roles/role-active-badge"
import { RoleBadgeEditLink } from "~/components/roles/role-badge-edit-link"
import { RoleRowActions } from "~/components/roles/role-row-actions"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import type { RoleListItem } from "~/domain/roles/roles.types"
import { cn } from "~/lib/utils"

const dateTimeFormatter = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "short",
  timeStyle: "short",
})

function formatDateTime(value: string | null) {
  if (!value) return "—"
  return dateTimeFormatter.format(new Date(value))
}

function SortableHeader({
  column,
  title,
}: {
  column: Column<RoleListItem, unknown>
  title: string
}) {
  const sorted = column.getIsSorted()

  return (
    <Button
      variant="ghost"
      className={cn("h-8 px-0")}
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {title}
      {sorted === "asc" ? (
        <ArrowUp data-icon="inline-end" />
      ) : sorted === "desc" ? (
        <ArrowDown data-icon="inline-end" />
      ) : (
        <ArrowUpDown data-icon="inline-end" />
      )}
    </Button>
  )
}

type CreateRolesTableColumnsOptions = {
  canUpdate?: boolean
  canDelete?: boolean
  onOpenEdit?: (role: RoleListItem) => void
}

export function createRolesTableColumns({
  canUpdate = false,
  canDelete = false,
  onOpenEdit,
}: CreateRolesTableColumnsOptions = {}): ColumnDef<RoleListItem>[] {
  const columns: ColumnDef<RoleListItem>[] = [
    {
      accessorKey: "metadata.display_order",
      id: "displayOrder",
      header: ({ column }) => <SortableHeader column={column} title="Orden" />,
      cell: ({ row }) => (
        <span className="tabular-nums text-muted-foreground">
          {row.original.metadata.display_order ?? "—"}
        </span>
      ),
      sortingFn: (rowA, rowB) => {
        const orderA =
          rowA.original.metadata.display_order ?? Number.MAX_SAFE_INTEGER
        const orderB =
          rowB.original.metadata.display_order ?? Number.MAX_SAFE_INTEGER
        return orderA - orderB
      },
    },
    {
      accessorKey: "name",
      header: ({ column }) => <SortableHeader column={column} title="Nombre" />,
      cell: ({ row }) => (
        <RoleBadgeEditLink
          role={row.original}
          canUpdate={canUpdate}
          onOpenEdit={onOpenEdit}
        />
      ),
    },
    {
      accessorKey: "description",
      header: "Descripción",
      cell: ({ row }) => (
        <span className="block max-w-xs truncate text-muted-foreground">
          {row.original.description ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "active",
      header: ({ column }) => <SortableHeader column={column} title="Estado" />,
      cell: ({ row }) => <RoleActiveBadge active={row.original.active} />,
      filterFn: (row, _id, value) => {
        if (!value || value === "all") return true
        if (value === "active") return row.original.active
        return !row.original.active
      },
    },
    {
      accessorKey: "permissionsCount",
      header: ({ column }) => (
        <SortableHeader column={column} title="Permisos" />
      ),
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.permissionsCount}</Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <SortableHeader column={column} title="Creado" />,
      cell: ({ row }) => formatDateTime(row.original.createdAt),
    },
  ]

  if (canUpdate || canDelete) {
    columns.push({
      id: "actions",
      enableSorting: false,
      header: () => <span className="sr-only">Acciones</span>,
      meta: {
        headerClassName: "w-10 px-1",
        cellClassName: "w-10 px-1",
      },
      cell: ({ row }) => (
        <RoleRowActions
          role={row.original}
          canUpdate={canUpdate}
          onOpenEdit={onOpenEdit}
        />
      ),
    })
  }

  return columns
}

/** Columnas por defecto (solo lectura). */
export const rolesTableColumns = createRolesTableColumns()

"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { SortableHeader } from "~/components/ui/data-table-sortable-header"

import { UserNameEditLink } from "~/components/users/user-name-edit-link"
import { UserRowActions } from "~/components/users/user-row-actions"
import { UserRoleBadge } from "~/components/users/user-role-badge"
import { UserStatusBadge } from "~/components/users/user-status-badge"
import { Badge } from "~/components/ui/badge"
import type { AvailableRole, User } from "~/domain/users/users.types"

const dateTimeFormatter = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "short",
  timeStyle: "short",
})

function formatDateTime(value: string | null) {
  if (!value) return "—"
  return dateTimeFormatter.format(new Date(value))
}


export function createUsersTableColumns(
  availableRoles: AvailableRole[],
): ColumnDef<User>[] {
  return [
  {
    accessorKey: "fullName",
    header: ({ column }) => (
      <SortableHeader column={column} title="Nombre Completo" />
    ),
    cell: ({ row }) => <UserNameEditLink user={row.original} />,
  },
  {
    accessorKey: "roleName",
    id: "roleId",
    header: ({ column }) => <SortableHeader column={column} title="Rol" />,
    cell: ({ row }) => (
      <UserRoleBadge
        roleId={row.original.roleId}
        roleName={row.original.roleName}
      />
    ),
    filterFn: (row, _id, value) => {
      if (!value || value === "all") return true
      return row.original.roleId === value
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => <SortableHeader column={column} title="Estado" />,
    cell: ({ row }) => <UserStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <SortableHeader column={column} title="Creado" />,
    cell: ({ row }) => formatDateTime(row.original.createdAt),
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <SortableHeader column={column} title="Actualizado" />
    ),
    cell: ({ row }) => formatDateTime(row.original.updatedAt),
  },
  {
    accessorKey: "notificationsEnabled",
    header: ({ column }) => (
      <SortableHeader column={column} title="Notificaciones" />
    ),
    cell: ({ row }) => (
      <Badge
        variant={row.original.notificationsEnabled ? "secondary" : "outline"}
      >
        {row.original.notificationsEnabled ? "Activas" : "Desactivadas"}
      </Badge>
    ),
  },
  {
    id: "actions",
    enableSorting: false,
    header: () => <span className="sr-only">Acciones</span>,
    meta: {
      headerClassName: "w-10 px-1",
      cellClassName: "w-10 px-1",
    },
    cell: ({ row }) => (
      <UserRowActions user={row.original} />
    ),
  },
  ]
}

"use client"

import * as React from "react"
import {
  type ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"

import { UsersDataTableSkeleton } from "~/components/users/users-data-table-skeleton"
import { UsersTableEmpty } from "~/components/users/users-table-empty"
import { DataTableView } from "~/components/ui/data-table"
import { MobileRowCard } from "~/components/ui/mobile-row-card"
import { formatDate } from "~/lib/dates"
import { StatusLegend } from "~/components/ui/status-indicator"
import {
  DataTableToolbar,
  FILTER_ALL,
} from "~/components/ui/data-table-toolbar"
import { createUsersTableColumns } from "~/components/users/users-table-columns"
import type { AvailableRole, User } from "~/domain/users/users.types"
import type { UserStatusFilter } from "~/domain/users/users.types"

type UsersDataTableProps = {
  data: User[]
  availableRoles: AvailableRole[]
  statusFilter: UserStatusFilter
  loading?: boolean
  onRefresh?: () => void
}

export function UsersDataTable({
  data,
  availableRoles,
  statusFilter,
  loading = false,
  onRefresh,
}: UsersDataTableProps) {
  const columns = React.useMemo(
    () => createUsersTableColumns(availableRoles),
    [availableRoles],
  )
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const table = useReactTable({
    // El estado se muestra como ícono junto al nombre; la columna queda solo para filtrar.
    initialState: { columnVisibility: { status: false } },
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    state: {
      columnFilters,
      sorting,
      pagination,
    },
  })

  const roleFilter =
    (table.getColumn("roleId")?.getFilterValue() as string | undefined) ?? "all"
  const search =
    (table.getColumn("fullName")?.getFilterValue() as string | undefined) ?? ""
  const selectedRole = availableRoles.find((role) => role.id === roleFilter)
  const hasTableFilters =
    search.trim().length > 0 || roleFilter !== "all"

  const clearTableFilters = React.useCallback(() => {
    table.getColumn("fullName")?.setFilterValue("")
    table.getColumn("roleId")?.setFilterValue("")
  }, [table])

  const emptyState = (
    <UsersTableEmpty
      totalCount={data.length}
      hasTableFilters={hasTableFilters}
      search={search}
      roleFilter={roleFilter}
      roleName={selectedRole?.name}
      statusFilter={statusFilter}
      onRefresh={onRefresh ?? (() => {})}
      onClearTableFilters={clearTableFilters}
    />
  )

  if (loading) {
    return <UsersDataTableSkeleton />
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <DataTableToolbar
        search={(table.getColumn("fullName")?.getFilterValue() as string) ?? ""}
        onSearchChange={(value) =>
          table.getColumn("fullName")?.setFilterValue(value)
        }
        searchPlaceholder="Buscar por nombre o email..."
        inlineFrom="md"
        filters={[
          {
            id: "role",
            label: "Rol",
            allLabel: "Todos los roles",
            value: roleFilter,
            widthClassName: "w-44",
            options: availableRoles.map((role) => ({
              value: role.id,
              label: role.name,
            })),
            onChange: (value) =>
              table
                .getColumn("roleId")
                ?.setFilterValue(value === FILTER_ALL ? "" : value),
          },
        ]}
      />

      <DataTableView
        table={table}
        columnCount={columns.length}
        emptyState={emptyState}
        showPagination
        showRowCount
        totalCount={data.length}
        rowCountLabel="usuarios"
        legend={<StatusLegend statuses={["active", "pending", "inactive"]} />}
        mobileCard={(row, { actions, cell }) => {
          const u = row.original
          return (
            <MobileRowCard
              title={cell("fullName")}
              subtitle={[u.phone, `creado ${formatDate(u.createdAt)}`].filter(Boolean).join(" · ")}
              meta={
                <>
                  {cell("roleId")}
                  {u.notificationsEnabled ? null : (
                    <span className="text-xs text-muted-foreground">Notificaciones desactivadas</span>
                  )}
                </>
              }
              actions={actions}
            />
          )
        }}
      />
    </div>
  )
}

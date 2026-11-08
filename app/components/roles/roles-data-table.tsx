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

import { RolesDataTableSkeleton } from "~/components/roles/roles-data-table-skeleton"
import { RolesTableEmpty } from "~/components/roles/roles-table-empty"
import { createRolesTableColumns } from "~/components/roles/roles-table-columns"
import { DataTableView } from "~/components/ui/data-table"
import { StatusLegend } from "~/components/ui/status-indicator"
import { DataTableToolbar } from "~/components/ui/data-table-toolbar"
import type { RoleListItem, RoleStatusFilter } from "~/domain/roles/roles.types"

type RolesDataTableProps = {
  data: RoleListItem[]
  statusFilter: RoleStatusFilter
  loading?: boolean
  canCreate?: boolean
  canUpdate?: boolean
  canDelete?: boolean
  onOpenEdit?: (role: RoleListItem) => void
  onNewRole?: () => void
  onRefresh?: () => void
}

export function RolesDataTable({
  data,
  statusFilter,
  loading = false,
  canCreate = false,
  canUpdate = false,
  canDelete = false,
  onOpenEdit,
  onNewRole,
  onRefresh,
}: RolesDataTableProps) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  )
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "displayOrder", desc: false },
  ])
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const columns = React.useMemo(
    () =>
      createRolesTableColumns({
        canUpdate,
        canDelete,
        onOpenEdit,
      }),
    [canUpdate, canDelete, onOpenEdit],
  )

  const table = useReactTable({
    // El estado se muestra como ícono junto al nombre; la columna queda solo para filtrar.
    initialState: { columnVisibility: { active: false } },
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

  const search =
    (table.getColumn("name")?.getFilterValue() as string | undefined) ?? ""
  const hasTableFilters = search.trim().length > 0

  const clearTableFilters = React.useCallback(() => {
    table.getColumn("name")?.setFilterValue("")
  }, [table])

  const emptyState = (
    <RolesTableEmpty
      totalCount={data.length}
      hasTableFilters={hasTableFilters}
      search={search}
      statusFilter={statusFilter}
      canCreate={canCreate}
      onNewRole={onNewRole}
      onRefresh={onRefresh ?? (() => {})}
      onClearTableFilters={clearTableFilters}
    />
  )

  if (loading) {
    return <RolesDataTableSkeleton />
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <DataTableToolbar
        search={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
        onSearchChange={(value) => table.getColumn("name")?.setFilterValue(value)}
        searchPlaceholder="Buscar rol..."
      />

      <DataTableView
        table={table}
        columnCount={columns.length}
        emptyState={emptyState}
        showPagination
        showRowCount
        totalCount={data.length}
        rowCountLabel="roles"
        legend={<StatusLegend />}
      />
    </div>
  )
}

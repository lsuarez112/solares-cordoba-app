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
import { Search } from "lucide-react"

import { RolesDataTableSkeleton } from "~/components/roles/roles-data-table-skeleton"
import { RolesTableEmpty } from "~/components/roles/roles-table-empty"
import { rolesTableColumns } from "~/components/roles/roles-table-columns"
import { DataTableView } from "~/components/ui/data-table"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "~/components/ui/input-group"
import type { RoleListItem, RoleStatusFilter } from "~/domain/roles/roles.types"

type RolesDataTableProps = {
  data: RoleListItem[]
  statusFilter: RoleStatusFilter
  loading?: boolean
  onRefresh?: () => void
}

export function RolesDataTable({
  data,
  statusFilter,
  loading = false,
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

  const table = useReactTable({
    data,
    columns: rolesTableColumns,
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
      onRefresh={onRefresh ?? (() => {})}
      onClearTableFilters={clearTableFilters}
    />
  )

  if (loading) {
    return <RolesDataTableSkeleton />
  }

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <InputGroup className="w-full sm:max-w-sm">
        <InputGroupAddon align="inline-start">
          <Search />
        </InputGroupAddon>
        <InputGroupInput
          placeholder="Buscar rol..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
        />
      </InputGroup>

      <DataTableView
        table={table}
        columnCount={rolesTableColumns.length}
        emptyState={emptyState}
        showPagination
        showRowCount
        totalCount={data.length}
        rowCountLabel="roles"
      />
    </div>
  )
}

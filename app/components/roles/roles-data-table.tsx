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
import { rolesTableColumns } from "~/components/roles/roles-table-columns"
import { DataTableView } from "~/components/ui/data-table"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "~/components/ui/input-group"
import type { RoleListItem } from "~/domain/roles/roles.types"

type RolesDataTableProps = {
  data: RoleListItem[]
  loading?: boolean
}

export function RolesDataTable({
  data,
  loading = false,
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
        showPagination
        showRowCount
        totalCount={data.length}
        rowCountLabel="roles"
      />
    </div>
  )
}

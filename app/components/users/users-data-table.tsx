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

import { UsersDataTableSkeleton } from "~/components/users/users-data-table-skeleton"
import { UsersTableEmpty } from "~/components/users/users-table-empty"
import { DataTableView } from "~/components/ui/data-table"
import { createUsersTableColumns } from "~/components/users/users-table-columns"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "~/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
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
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <InputGroup className="w-full sm:max-w-sm">
          <InputGroupAddon align="inline-start">
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Buscar..."
            value={
              (table.getColumn("fullName")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("fullName")?.setFilterValue(event.target.value)
            }
          />
        </InputGroup>

        <Select
          value={roleFilter}
          onValueChange={(value) =>
            table
              .getColumn("roleId")
              ?.setFilterValue(value === "all" ? "" : value)
          }
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar por rol" />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectGroup>
              <SelectItem value="all">Todos los roles</SelectItem>
              {availableRoles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <DataTableView
        table={table}
        columnCount={columns.length}
        emptyState={emptyState}
        showPagination
        showRowCount
        totalCount={data.length}
        rowCountLabel="usuarios"
      />
    </div>
  )
}

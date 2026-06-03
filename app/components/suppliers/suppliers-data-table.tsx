"use client"

import * as React from "react"
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { FilterX, Search } from "lucide-react"

import { SuppliersDataTableSkeleton } from "./suppliers-data-table-skeleton"
import { SuppliersTableEmpty } from "./suppliers-table-empty"
import { suppliersTableColumns } from "./suppliers-table-columns"
import { DataTableView } from "~/components/ui/data-table"
import { Button } from "~/components/ui/button"
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
import type { Supplier } from "~/domain/suppliers/suppliers.schemas"
import type { SupplierCurrency, SupplierFilters } from "~/domain/suppliers/suppliers.types"

type SuppliersDataTableProps = {
  data: Supplier[]
  filters: SupplierFilters
  loading?: boolean
  canCreate?: boolean
  onFiltersChange: (filters: Partial<SupplierFilters>) => void
  onResetFilters: () => void
  onOpenEdit?: (supplier: Supplier) => void
  onNewSupplier?: () => void
  onRefresh?: () => void
}

export function SuppliersDataTable({
  data,
  filters,
  loading = false,
  canCreate = false,
  onFiltersChange,
  onResetFilters,
  onOpenEdit,
  onNewSupplier,
  onRefresh,
}: SuppliersDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const columns = React.useMemo(
    () => suppliersTableColumns({ onOpenEdit }),
    [onOpenEdit],
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    state: {
      sorting,
      pagination,
    },
  })

  const activeFilterValue =
    filters.active === null
      ? "all"
      : filters.active
        ? "true"
        : "false"

  const emptyState = (
    <SuppliersTableEmpty
      totalCount={data.length}
      filters={filters}
      canCreate={canCreate}
      onNewSupplier={onNewSupplier}
      onRefresh={onRefresh ?? (() => {})}
      onClearFilters={onResetFilters}
    />
  )

  if (loading) {
    return <SuppliersDataTableSkeleton />
  }

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
        <InputGroup className="w-full lg:max-w-sm">
          <InputGroupAddon align="inline-start">
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Buscar por nombre, razón social, CUIT..."
            value={filters.search}
            onChange={(event) =>
              onFiltersChange({ search: event.target.value })
            }
          />
        </InputGroup>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap lg:ml-auto lg:w-auto lg:justify-end">
          <Select
            value={activeFilterValue}
            onValueChange={(value) =>
              onFiltersChange({
                active: value === "all" ? null : value === "true",
              })
            }
          >
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="true">Activos</SelectItem>
                <SelectItem value="false">Inactivos</SelectItem>
                <SelectItem value="all">Todos</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select
            value={filters.currency ?? "all"}
            onValueChange={(value) =>
              onFiltersChange({
                currency:
                  value === "all" ? null : (value as SupplierCurrency),
              })
            }
          >
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Moneda" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Moneda</SelectItem>
                <SelectItem value="ARS">ARS</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground"
            onClick={onResetFilters}
          >
            <FilterX data-icon="inline-start" />
            Limpiar filtros
          </Button>
        </div>
      </div>

      <DataTableView
        table={table}
        columnCount={columns.length}
        emptyState={emptyState}
        showPagination
        showRowCount
        totalCount={data.length}
        rowCountLabel="proveedores"
      />
    </div>
  )
}

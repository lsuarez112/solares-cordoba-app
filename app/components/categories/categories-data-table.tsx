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

import { CategoriesDataTableSkeleton } from "./categories-data-table-skeleton"
import { CategoriesTableEmpty } from "./categories-table-empty"
import {
  categoriesTableColumns,
  type CategoryRow,
} from "./categories-table-columns"
import { DataTableView } from "~/components/ui/data-table"
import { DataTableToolbar } from "~/components/ui/data-table-toolbar"
import type { Category } from "~/domain/categories/categories.schemas"
import type { CategoryFilters } from "~/domain/categories/categories.types"

type CategoriesDataTableProps = {
  data: Category[]
  productCounts: Record<string, number>
  filters: CategoryFilters
  loading?: boolean
  canCreate?: boolean
  onFiltersChange: (filters: Partial<CategoryFilters>) => void
  onResetFilters: () => void
  onOpenEdit?: (category: Category) => void
  onNewCategory?: () => void
  onRefresh?: () => void
}

export function CategoriesDataTable({
  data,
  productCounts,
  filters,
  loading = false,
  canCreate = false,
  onFiltersChange,
  onResetFilters,
  onOpenEdit,
  onNewCategory,
  onRefresh,
}: CategoriesDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const rows = React.useMemo<CategoryRow[]>(
    () =>
      data.map((category) => ({
        ...category,
        productCount: productCounts[category.id] ?? 0,
      })),
    [data, productCounts],
  )

  const columns = React.useMemo(
    () => categoriesTableColumns({ onOpenEdit }),
    [onOpenEdit],
  )

  const table = useReactTable({
    data: rows,
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

  const emptyState = (
    <CategoriesTableEmpty
      totalCount={data.length}
      filters={filters}
      canCreate={canCreate}
      onNewCategory={onNewCategory}
      onRefresh={onRefresh ?? (() => {})}
      onClearFilters={onResetFilters}
    />
  )

  if (loading) {
    return <CategoriesDataTableSkeleton />
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <DataTableToolbar
        search={filters.search}
        onSearchChange={(value) => onFiltersChange({ search: value })}
        searchPlaceholder="Buscar por nombre o descripción..."
        onClearFilters={onResetFilters}
      />

      <DataTableView
        table={table}
        columnCount={columns.length}
        emptyState={emptyState}
        showPagination
        showRowCount
        totalCount={data.length}
        rowCountLabel="categorías"
      />
    </div>
  )
}

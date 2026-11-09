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
import { formatPrefixLabel } from "~/lib/prefix-label.utils"
import { parseProductGenericProperties } from "~/lib/products/product-display.utils"
import { ProductsDataTableSkeleton } from "~/components/products/products-data-table-skeleton"
import { ProductsTableEmpty } from "~/components/products/products-table-empty"
import { productsTableColumns } from "~/components/products/products-table-columns"
import { DataTableView } from "~/components/ui/data-table"
import { ProductNameLink } from "~/components/products/product-name-link"
import { ProductTechnicalPropertyBadges } from "~/components/products/product-technical-property-badges"
import { MobileRowCard } from "~/components/ui/mobile-row-card"
import { StatusIcon, StatusLegend, statusFromActive } from "~/components/ui/status-indicator"
import {
  DataTableToolbar,
  FILTER_ALL,
} from "~/components/ui/data-table-toolbar"
import type { GridType, Product } from "~/domain/products/products.schemas"
import type { ProductCategory } from "~/domain/products/products.schemas"
import type { ProductStatusFilter } from "~/domain/products/products.types"

const gridFilterOptions: { value: GridType; label: string }[] = [
  { value: "ON-GRID", label: "On Grid" },
  { value: "OFF-GRID", label: "Off Grid" },
  { value: "HYBRID", label: "Híbrido" },
]

const statusFilterOptions: {
  value: Exclude<ProductStatusFilter, "all">
  label: string
}[] = [
  { value: "active", label: "Activos" },
  { value: "inactive", label: "Inactivos" },
  { value: "no_price", label: "Sin precio" },
]

type ProductsDataTableProps = {
  data: Product[]
  categories: ProductCategory[]
  loading?: boolean
  canCreate?: boolean
  initialCategoryId?: string | null
  onOpenEdit?: (product: Product) => void
  onDuplicate?: (product: Product) => void
  onNewProduct?: () => void
  onNewProductInCategory?: (categoryId: string) => void
  onRefresh?: () => void
}

export function ProductsDataTable({
  data,
  categories,
  loading = false,
  canCreate = false,
  initialCategoryId = null,
  onOpenEdit,
  onDuplicate,
  onNewProduct,
  onNewProductInCategory,
  onRefresh,
}: ProductsDataTableProps) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    () =>
      initialCategoryId
        ? [{ id: "categoryId", value: initialCategoryId }]
        : [],
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const columns = React.useMemo(
    () => productsTableColumns({ onOpenEdit, onDuplicate }),
    [onOpenEdit, onDuplicate],
  )

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

  const categoryFilter =
    (table.getColumn("categoryId")?.getFilterValue() as string | undefined) ??
    "all"
  const gridFilter =
    (table.getColumn("grid_type")?.getFilterValue() as string | undefined) ??
    "all"
  const statusFilter =
    (table.getColumn("status")?.getFilterValue() as
      | ProductStatusFilter
      | undefined) ?? "all"
  const search =
    (table.getColumn("name")?.getFilterValue() as string | undefined) ?? ""

  const hasActiveFilters =
    search.trim().length > 0 ||
    categoryFilter !== "all" ||
    gridFilter !== "all" ||
    statusFilter !== "all"

  const selectedCategory = categories.find((c) => c.id === categoryFilter)

  const clearFilters = React.useCallback(() => {
    table.getColumn("name")?.setFilterValue("")
    table.getColumn("categoryId")?.setFilterValue("")
    table.getColumn("grid_type")?.setFilterValue("")
    table.getColumn("status")?.setFilterValue("")
  }, [table])

  const emptyState = (
    <ProductsTableEmpty
      totalCount={data.length}
      hasActiveFilters={hasActiveFilters}
      search={search}
      categoryId={categoryFilter}
      categoryName={selectedCategory?.name}
      gridType={
        gridFilter === "all" ? "all" : (gridFilter as GridType)
      }
      statusFilter={statusFilter}
      canCreate={canCreate}
      onNewProduct={onNewProduct ?? (() => {})}
      onNewProductInCategory={onNewProductInCategory ?? (() => {})}
      onRefresh={onRefresh ?? (() => {})}
      onClearFilters={clearFilters}
    />
  )

  if (loading) {
    return <ProductsDataTableSkeleton />
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <DataTableToolbar
        search={search}
        onSearchChange={(value) => table.getColumn("name")?.setFilterValue(value)}
        searchPlaceholder="Buscar por nombre, código o propiedad..."
        onClearFilters={clearFilters}
        filters={[
          {
            id: "category",
            label: "Categoría",
            allLabel: "Todas las categorías",
            value: categoryFilter,
            widthClassName: "w-48",
            options: categories.map((category) => ({
              value: category.id,
              label: formatPrefixLabel(category.name, category.prefix),
            })),
            onChange: (value) =>
              table
                .getColumn("categoryId")
                ?.setFilterValue(value === FILTER_ALL ? "" : value),
          },
          {
            id: "grid",
            label: "Red",
            allLabel: "Todas las redes",
            value: gridFilter,
            widthClassName: "w-36",
            options: gridFilterOptions,
            onChange: (value) =>
              table
                .getColumn("grid_type")
                ?.setFilterValue(value === FILTER_ALL ? "" : value),
          },
          {
            id: "status",
            label: "Estado",
            allLabel: "Todos los estados",
            value: statusFilter,
            widthClassName: "w-40",
            options: statusFilterOptions,
            onChange: (value) =>
              table
                .getColumn("status")
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
        rowCountLabel="productos"
        legend={<StatusLegend />}
        mobileCard={(row, { actions, cell }) => {
          const p = row.original
          const properties = parseProductGenericProperties(p.generic_properties)
          return (
            <MobileRowCard
              leading={<StatusIcon status={statusFromActive(p.active)} />}
              title={
                <ProductNameLink
                  product={p}
                  onOpenEdit={onOpenEdit}
                  onDuplicate={onDuplicate}
                  className="max-w-full truncate text-left"
                />
              }
              subtitle={
                <>
                  <span className="font-mono">{p.product_code}</span>
                  {p.category ? ` · ${p.category.name}` : ""}
                </>
              }
              meta={
                properties.length > 0 ? (
                  <ProductTechnicalPropertyBadges items={properties} max={3} compact />
                ) : null
              }
              trailing={cell("price_usd")}
              actions={actions}
            />
          )
        }}
      />
    </div>
  )
}

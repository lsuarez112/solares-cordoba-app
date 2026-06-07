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
import { FilterX, Search } from "lucide-react"

import { formatPrefixLabel } from "~/lib/prefix-label.utils"
import { ProductsDataTableSkeleton } from "~/components/products/products-data-table-skeleton"
import { ProductsTableEmpty } from "~/components/products/products-table-empty"
import { productsTableColumns } from "~/components/products/products-table-columns"
import { Button } from "~/components/ui/button"
import { DataTableView } from "~/components/ui/data-table"
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
import type { GridType, Product } from "~/domain/products/products.schemas"
import type { ProductCategory } from "~/domain/products/products.schemas"
import type { ProductStatusFilter } from "~/domain/products/products.types"
import type { Supplier } from "~/domain/suppliers/suppliers.types"

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
  { value: "stock_alert", label: "Alerta stock" },
]

type ProductsDataTableProps = {
  data: Product[]
  categories: ProductCategory[]
  suppliers: Supplier[]
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
  suppliers,
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
  const supplierFilter =
    (table.getColumn("supplierId")?.getFilterValue() as string | undefined) ??
    "all"
  const search =
    (table.getColumn("name")?.getFilterValue() as string | undefined) ?? ""

  const hasActiveFilters =
    search.trim().length > 0 ||
    categoryFilter !== "all" ||
    supplierFilter !== "all" ||
    gridFilter !== "all" ||
    statusFilter !== "all"

  const selectedCategory = categories.find((c) => c.id === categoryFilter)
  const selectedSupplier = suppliers.find((s) => s.id === supplierFilter)

  const clearFilters = React.useCallback(() => {
    table.getColumn("name")?.setFilterValue("")
    table.getColumn("categoryId")?.setFilterValue("")
    table.getColumn("supplierId")?.setFilterValue("")
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
      supplierId={supplierFilter}
      supplierName={selectedSupplier?.name}
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
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
        <InputGroup className="w-full lg:max-w-sm">
          <InputGroupAddon align="inline-start">
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Buscar por nombre, código, proveedor..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
          />
        </InputGroup>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap lg:ml-auto lg:w-auto lg:justify-end">
          <Select
            value={categoryFilter}
            onValueChange={(value) =>
              table
                .getColumn("categoryId")
                ?.setFilterValue(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {formatPrefixLabel(category.name, category.prefix)}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select
            value={supplierFilter}
            onValueChange={(value) =>
              table
                .getColumn("supplierId")
                ?.setFilterValue(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Proveedor" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Todos los proveedores</SelectItem>
                <SelectItem value="none">Sin proveedor</SelectItem>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {formatPrefixLabel(supplier.name, supplier.prefix)}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select
            value={gridFilter}
            onValueChange={(value) =>
              table
                .getColumn("grid_type")
                ?.setFilterValue(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Tipo de red" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Todas las redes</SelectItem>
                {gridFilterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(value) =>
              table
                .getColumn("status")
                ?.setFilterValue(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Todos los estados</SelectItem>
                {statusFilterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground"
            onClick={clearFilters}
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
        rowCountLabel="productos"
      />
    </div>
  )
}

"use client"

import * as React from "react"
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table"

import {
  quotesTableColumns,
  type QuotesTableColumnsOptions,
} from "~/components/quotes/quotes-table-columns"
import { DataTableView } from "~/components/ui/data-table"
import {
  DataTableToolbar,
  FILTER_ALL,
  type DataTableFilter,
} from "~/components/ui/data-table-toolbar"
import { StatusLegend } from "~/components/ui/status-indicator"
import type { QuoteListItem } from "~/domain/quotes/quotes.schemas"
import { GRID_TYPE_LABELS } from "~/lib/products/grid-type.utils"

type QuotesDataTableProps = QuotesTableColumnsOptions & {
  data: QuoteListItem[]
  pageSize?: number
  maxHeightClassName?: string
}

export function QuotesDataTable({ data, pageSize = 20, maxHeightClassName, ...options }: QuotesDataTableProps) {
  // Por defecto: solo la revisión vigente de cada número (las viejas se ven en el detalle).
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([
    { id: "current", value: "current" },
  ])
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "date", desc: true }])
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize })

  const { canCreate, canUpdate, canDelete, hideClient, onOpen, onRevise, onDuplicate, onDelete, onShare } = options
  const columns = React.useMemo(
    () =>
      quotesTableColumns({
        canCreate,
        canUpdate,
        canDelete,
        hideClient,
        onOpen,
        onRevise,
        onDuplicate,
        onDelete,
        onShare,
      }),
    [canCreate, canUpdate, canDelete, hideClient, onOpen, onRevise, onDuplicate, onDelete, onShare],
  )

  const table = useReactTable({
    initialState: { columnVisibility: { search: false, status: false, current: false } },
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    enableMultiSort: true,
    state: { columnFilters, sorting, pagination },
  })

  const filterValue = (id: string) =>
    (table.getColumn(id)?.getFilterValue() as string | undefined) || FILTER_ALL
  const setFilter = (id: string) => (value: string) =>
    table.getColumn(id)?.setFilterValue(value === FILTER_ALL ? "" : value)

  const filters: DataTableFilter[] = [
    {
      id: "status",
      label: "Estado",
      allLabel: "Borradores y emitidos",
      value: filterValue("status"),
      options: [
        { value: "draft", label: "Borradores" },
        { value: "issued", label: "Emitidos" },
      ],
      onChange: setFilter("status"),
    },
    {
      id: "grid_type",
      label: "Sistema",
      allLabel: "Todos los sistemas",
      value: filterValue("grid_type"),
      options: (["ON-GRID", "HYBRID", "OFF-GRID"] as const).map((g) => ({
        value: g,
        label: GRID_TYPE_LABELS[g],
      })),
      onChange: setFilter("grid_type"),
    },
    {
      id: "current",
      label: "Revisiones",
      allLabel: "Todas las revisiones",
      value: filterValue("current"),
      options: [{ value: "current", label: "Solo vigentes" }],
      onChange: setFilter("current"),
    },
  ]

  const search = (table.getColumn("search")?.getFilterValue() as string | undefined) ?? ""

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <DataTableToolbar
        search={search}
        onSearchChange={(value) => table.getColumn("search")?.setFilterValue(value)}
        searchPlaceholder={hideClient ? "Buscar por número o kit..." : "Buscar por número, cliente, teléfono o kit..."}
        filters={filters}
        onClearFilters={() => table.resetColumnFilters(true)}
      />
      <DataTableView
        table={table}
        columnCount={table.getVisibleLeafColumns().length}
        emptyMessage={data.length === 0 ? "Todavía no hay presupuestos" : "Ningún presupuesto coincide con los filtros"}
        showPagination
        showRowCount
        totalCount={data.length}
        rowCountLabel="presupuestos"
        legend={<StatusLegend statuses={["draft", "issued"]} />}
        maxHeightClassName={maxHeightClassName}
      />
    </div>
  )
}

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
  quoteDate,
  quotesTableColumns,
  type QuotesTableColumnsOptions,
} from "~/components/quotes/quotes-table-columns"
import { DataTableView } from "~/components/ui/data-table"
import {
  DataTableToolbar,
  FILTER_ALL,
  type DataTableFilter,
} from "~/components/ui/data-table-toolbar"
import { MobileRowCard } from "~/components/ui/mobile-row-card"
import { QUOTE_STATUS_KINDS, StatusIcon, StatusLegend } from "~/components/ui/status-indicator"
import type { QuoteListItem, QuoteStatus } from "~/domain/quotes/quotes.schemas"
import { QUOTE_STATUS_PLURAL } from "~/lib/quotes/quote-status"
import { formatDate } from "~/lib/dates"
import { GRID_TYPE_LABELS } from "~/lib/products/grid-type.utils"
import { formatArs, formatUsd } from "~/lib/quotes/quote-totals"

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

  const { canCreate, canUpdate, canDelete, hideClient, onOpen, onRevise, onDuplicate, onDelete, onShare, onSetStatus } = options
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
        onSetStatus,
      }),
    [canCreate, canUpdate, canDelete, hideClient, onOpen, onRevise, onDuplicate, onDelete, onShare, onSetStatus],
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
      allLabel: "Todos los estados",
      value: filterValue("status"),
      options: QUOTE_STATUS_KINDS.map((status) => ({
        value: status,
        label: QUOTE_STATUS_PLURAL[status as QuoteStatus],
      })),
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
        legend={<StatusLegend statuses={QUOTE_STATUS_KINDS} />}
        maxHeightClassName={maxHeightClassName}
        mobileCard={(row, { actions }) => {
          const q = row.original
          const isDraft = q.status === "draft"
          return (
            <MobileRowCard
              to={`/presupuestos/${q.id}`}
              leading={<StatusIcon status={q.status} />}
              title={
                <>
                  <span className="font-mono text-xs">{q.display_number ?? "Borrador"}</span>
                  {hideClient ? null : <span className="ml-2">{q.client_name}</span>}
                </>
              }
              subtitle={[q.grid_type ? GRID_TYPE_LABELS[q.grid_type] : null, q.kit_code, formatDate(quoteDate(q))]
                .filter(Boolean)
                .join(" · ")}
              meta={
                isDraft || q.is_current ? null : (
                  <span className="text-xs text-muted-foreground">reemplazado</span>
                )
              }
              trailing={
                <span className="flex flex-col items-end">
                  <span className="font-mono text-sm font-semibold tabular-nums">
                    USD {formatUsd(q.total_usd ?? q.subtotal_usd)}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {isDraft ? "+ IVA" : formatArs(q.total_ars)}
                  </span>
                </span>
              }
              actions={actions}
            />
          )
        }}
      />
    </div>
  )
}

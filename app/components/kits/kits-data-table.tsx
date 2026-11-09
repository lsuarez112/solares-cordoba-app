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
  kitsTableColumns,
  type KitsTableColumnsOptions,
} from "~/components/kits/kits-table-columns"
import { DataTableView } from "~/components/ui/data-table"
import { MobileRowCard } from "~/components/ui/mobile-row-card"
import { StatusIcon, StatusLegend, statusFromActive } from "~/components/ui/status-indicator"
import {
  DataTableToolbar,
  FILTER_ALL,
  type DataTableFilter,
} from "~/components/ui/data-table-toolbar"
import type { Kit } from "~/domain/kits/kits.schemas"
import { GRID_TYPE_LABELS } from "~/lib/products/grid-type.utils"

type KitsDataTableProps = KitsTableColumnsOptions & { data: Kit[] }

export function KitsDataTable({ data, ...options }: KitsDataTableProps) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  // Orden por defecto: tipo de sistema y potencia (como el catálogo del armador).
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "grid_type", desc: false },
    { id: "kwp", desc: false },
  ])
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })

  const { canCreate, canUpdate, canDelete, onOpen, onDuplicate, onDelete, onToggleActive } = options
  const columns = React.useMemo(
    () =>
      kitsTableColumns({ canCreate, canUpdate, canDelete, onOpen, onDuplicate, onDelete, onToggleActive }),
    [canCreate, canUpdate, canDelete, onOpen, onDuplicate, onDelete, onToggleActive],
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
    enableMultiSort: true,
    state: { columnFilters, sorting, pagination },
  })

  const filterValue = (id: string) =>
    (table.getColumn(id)?.getFilterValue() as string | undefined) || FILTER_ALL
  const setFilter = (id: string) => (value: string) =>
    table.getColumn(id)?.setFilterValue(value === FILTER_ALL ? "" : value)

  const filters: DataTableFilter[] = [
    {
      id: "grid_type",
      label: "Sistema",
      allLabel: "Todos los sistemas",
      value: filterValue("grid_type"),
      widthClassName: "w-36",
      options: (["ON-GRID", "HYBRID", "OFF-GRID"] as const).map((g) => ({
        value: g,
        label: GRID_TYPE_LABELS[g],
      })),
      onChange: setFilter("grid_type"),
    },
    {
      id: "phases",
      label: "Fases",
      allLabel: "Mono y tri",
      value: filterValue("phases"),
      widthClassName: "w-32",
      options: [
        { value: "mono", label: "Monofásico" },
        { value: "tri", label: "Trifásico" },
      ],
      onChange: setFilter("phases"),
    },
    {
      id: "status",
      label: "Estado",
      allLabel: "Todos",
      value: filterValue("status"),
      widthClassName: "w-32",
      options: [
        { value: "active", label: "Activos" },
        { value: "inactive", label: "Inactivos" },
      ],
      onChange: setFilter("status"),
    },
    {
      id: "prices",
      label: "Precios",
      allLabel: "Todos los precios",
      value: filterValue("prices"),
      widthClassName: "w-40",
      options: [
        { value: "complete", label: "Precios completos" },
        { value: "missing", label: "Faltan precios" },
      ],
      onChange: setFilter("prices"),
    },
  ]

  const search = (table.getColumn("kit")?.getFilterValue() as string | undefined) ?? ""

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <DataTableToolbar
        search={search}
        onSearchChange={(value) => table.getColumn("kit")?.setFilterValue(value)}
        searchPlaceholder="Buscar por código, nombre o notas..."
        filters={filters}
        onClearFilters={() => table.resetColumnFilters()}
      />
      <DataTableView
        table={table}
        columnCount={columns.length}
        emptyMessage={data.length === 0 ? "Todavía no hay kits" : "Ningún kit coincide con los filtros"}
        showPagination
        showRowCount
        totalCount={data.length}
        rowCountLabel="kits"
        legend={<StatusLegend />}
        mobileCard={(row, { actions, cell }) => {
          const k = row.original
          return (
            <MobileRowCard
              to={`/kits/${k.id}`}
              leading={<StatusIcon status={statusFromActive(k.active)} />}
              title={k.name}
              subtitle={
                <>
                  <span className="font-mono">{k.code}</span> · {k.kwp.toLocaleString("es-AR")} kWp
                  {k.battery_kwh > 0 ? ` · ${k.battery_kwh.toLocaleString("es-AR")} kWh` : ""}
                </>
              }
              meta={
                <>
                  {cell("grid_type")}
                  {k.phases === "tri" ? cell("phases") : null}
                </>
              }
              trailing={<span className="text-xs">{cell("prices")}</span>}
              actions={actions}
            />
          )
        }}
      />
    </div>
  )
}

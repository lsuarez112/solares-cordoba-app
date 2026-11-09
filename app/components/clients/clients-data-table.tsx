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
  clientsTableColumns,
  type ClientsTableColumnsOptions,
} from "~/components/clients/clients-table-columns"
import { DataTableView } from "~/components/ui/data-table"
import { MobileRowCard } from "~/components/ui/mobile-row-card"
import {
  DataTableToolbar,
  FILTER_ALL,
  type DataTableFilter,
} from "~/components/ui/data-table-toolbar"
import { formatDate } from "~/lib/dates"
import type { ClientListItem } from "~/domain/clients/clients.schemas"

type ClientsDataTableProps = Omit<ClientsTableColumnsOptions, "duplicatedPhones"> & {
  data: ClientListItem[]
  duplicatedPhones: Set<string>
  /** Filtro inicial de teléfono (ej. "duplicated" desde el badge). */
  phoneFilter?: string
}

export function ClientsDataTable({ data, phoneFilter, ...options }: ClientsDataTableProps) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "client", desc: false }])
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 20 })

  React.useEffect(() => {
    setColumnFilters((prev) => {
      const rest = prev.filter((f) => f.id !== "phone")
      return phoneFilter ? [...rest, { id: "phone", value: phoneFilter }] : rest
    })
  }, [phoneFilter])

  const {
    canCreateQuote,
    canUpdate,
    canDelete,
    duplicatedPhones,
    onOpen,
    onEdit,
    onNewQuote,
    onMerge,
    onDelete,
  } = options
  const columns = React.useMemo(
    () =>
      clientsTableColumns({
        canCreateQuote,
        canUpdate,
        canDelete,
        duplicatedPhones,
        onOpen,
        onEdit,
        onNewQuote,
        onMerge,
        onDelete,
      }),
    [canCreateQuote, canUpdate, canDelete, duplicatedPhones, onOpen, onEdit, onNewQuote, onMerge, onDelete],
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
    enableMultiSort: true,
    state: { columnFilters, sorting, pagination },
  })

  const filterValue = (id: string) =>
    (table.getColumn(id)?.getFilterValue() as string | undefined) || FILTER_ALL
  const setFilter = (id: string) => (value: string) =>
    table.getColumn(id)?.setFilterValue(value === FILTER_ALL ? "" : value)

  const cities = React.useMemo(
    () =>
      [...new Set(data.map((c) => c.city).filter((c): c is string => Boolean(c)))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [data],
  )

  const filters: DataTableFilter[] = [
    {
      id: "city",
      label: "Localidad",
      allLabel: "Todas las localidades",
      value: filterValue("city"),
      options: cities.map((c) => ({ value: c, label: c })),
      onChange: setFilter("city"),
    },
    {
      id: "quotes",
      label: "Presupuestos",
      allLabel: "Con y sin presupuestos",
      value: filterValue("quotes"),
      options: [
        { value: "with", label: "Con presupuestos" },
        { value: "without", label: "Sin presupuestos" },
      ],
      onChange: setFilter("quotes"),
    },
    {
      id: "phone",
      label: "Teléfono",
      allLabel: "Todos los teléfonos",
      value: filterValue("phone"),
      options: [
        { value: "duplicated", label: "Duplicados" },
        { value: "missing", label: "Sin teléfono" },
      ],
      onChange: setFilter("phone"),
    },
  ]

  const search = (table.getColumn("client")?.getFilterValue() as string | undefined) ?? ""

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <DataTableToolbar
        search={search}
        onSearchChange={(value) => table.getColumn("client")?.setFilterValue(value)}
        searchPlaceholder="Buscar por nombre, teléfono, email, CUIT..."
        filters={filters}
        onClearFilters={() => table.resetColumnFilters()}
      />
      <DataTableView
        table={table}
        columnCount={columns.length}
        emptyMessage={data.length === 0 ? "Todavía no hay clientes" : "Ningún cliente coincide con los filtros"}
        showPagination
        showRowCount
        totalCount={data.length}
        rowCountLabel="clientes"
        mobileCard={(row, { actions, cell }) => {
          const c = row.original
          return (
            <MobileRowCard
              to={`/clientes/${c.id}`}
              title={c.name}
              subtitle={[c.city, c.last_quote_at ? `último presupuesto ${formatDate(c.last_quote_at)}` : null]
                .filter(Boolean)
                .join(" · ") || "Sin presupuestos"}
              meta={c.phone ? <span className="text-xs">{cell("phone")}</span> : null}
              trailing={
                <span className="flex flex-col items-end">
                  <span className="text-sm font-semibold tabular-nums">{c.quotes_count}</span>
                  <span className="text-[11px] text-muted-foreground">presup.</span>
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

"use client"

import * as React from "react"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type Row,
  type SortingState,
  type Table as TanstackTable,
  useReactTable,
} from "@tanstack/react-table"

import { Button } from "~/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { TableScrollArea } from "~/components/ui/table-scroll-area"
import { cn } from "~/lib/utils"

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

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

  return (
    <DataTableView table={table} columnCount={columns.length} showPagination />
  )
}

type DataTableViewProps<TData> = {
  table: TanstackTable<TData>
  columnCount: number
  emptyMessage?: string
  emptyState?: React.ReactNode
  showPagination?: boolean
  showRowCount?: boolean
  totalCount?: number
  rowCountLabel?: string
  /** Leyenda al pie (ej. íconos de estado). */
  legend?: React.ReactNode
  /** Alto máximo del área con scroll de la tabla (clase max-h-*). */
  maxHeightClassName?: string
  /**
   * Vista de tarjetas para el celular (debajo de sm): misma fila (filtros, orden y
   * paginación), sin scroll horizontal. `actions` es la celda de la columna "actions".
   */
  mobileCard?: (
    row: Row<TData>,
    ctx: { actions: React.ReactNode; cell: (columnId: string) => React.ReactNode },
  ) => React.ReactNode
}

export function DataTableView<TData>({
  table,
  columnCount,
  emptyMessage = "Sin resultados",
  emptyState,
  showPagination = false,
  showRowCount = false,
  totalCount,
  rowCountLabel = "registros",
  legend,
  maxHeightClassName,
  mobileCard,
}: DataTableViewProps<TData>) {
  const filteredCount = table.getFilteredRowModel().rows.length
  const rows = table.getRowModel().rows

  /** Celda ya renderizada de una columna (para reutilizarla en la tarjeta mobile). */
  const cellOf = (row: Row<TData>, columnId: string) => {
    const cell = row.getAllCells().find((c) => c.column.id === columnId)
    return cell ? flexRender(cell.column.columnDef.cell, cell.getContext()) : null
  }

  return (
    <div className="min-w-0">
      {mobileCard ? (
        <div className="flex flex-col gap-2 sm:hidden">
          {rows.length ? (
            rows.map((row, index) => (
              <div key={row.id} className="row-in" style={{ "--i": index } as React.CSSProperties}>
                {mobileCard(row, { actions: cellOf(row, "actions"), cell: (id) => cellOf(row, id) })}
              </div>
            ))
          ) : (
            <div className="rounded-lg border bg-card">
              {emptyState ?? <p className="py-12 text-center text-sm text-muted-foreground">{emptyMessage}</p>}
            </div>
          )}
        </div>
      ) : null}
      <div className={cn("overflow-hidden rounded-lg border bg-card", mobileCard && "hidden sm:block")}>
        <TableScrollArea maxHeightClassName={maxHeightClassName}>
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(header.column.columnDef.meta?.headerClassName)}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {rows.length ? (
                rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="row-in"
                    style={{ "--i": index } as React.CSSProperties}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(cell.column.columnDef.meta?.cellClassName)}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columnCount} className="p-0">
                    {emptyState ?? (
                      <p className="py-12 text-center text-sm text-muted-foreground">
                        {emptyMessage}
                      </p>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableScrollArea>
      </div>

      {showPagination || legend ? (
        <div className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {showRowCount && typeof totalCount === "number" ? (
              <p className="text-sm text-muted-foreground">
                Mostrando {filteredCount} de {totalCount} {rowCountLabel}
              </p>
            ) : null}
            {legend}
          </div>

          {showPagination ? (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Siguiente
            </Button>
          </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

import type { ReactNode } from "react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { TableScrollArea } from "~/components/ui/table-scroll-area"
import { Skeleton } from "~/components/ui/skeleton"
import { cn } from "~/lib/utils"

export type CatalogColumn<T extends Record<string, unknown>> = {
  key: keyof T & string
  header: string
  skeletonClassName?: string
  cell?: (row: T) => ReactNode
}

type CatalogBrowseTableProps<T extends Record<string, unknown>> = {
  columns: CatalogColumn<T>[]
  data: T[]
  loading?: boolean
  skeletonRows?: number
}

export function CatalogBrowseTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  skeletonRows = 10,
}: CatalogBrowseTableProps<T>) {
  return (
    <div className="min-w-0 overflow-hidden rounded-lg border bg-card">
      <TableScrollArea>
        <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key}>{column.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading
            ? Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                <TableRow key={`skeleton-${rowIndex}`}>
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      <Skeleton
                        className={cn(
                          "h-5 rounded-full",
                          column.skeletonClassName ?? "w-24",
                        )}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Sin registros
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {columns.map((column) => (
                      <TableCell key={column.key}>
                        {column.cell
                          ? column.cell(row)
                          : String(row[column.key] ?? "")}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
        </TableBody>
        </Table>
      </TableScrollArea>
    </div>
  )
}

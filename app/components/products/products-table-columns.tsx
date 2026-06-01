"use client"

import type { Column, ColumnDef } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"

import { ProductNameLink } from "~/components/products/product-name-link"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import type { Product } from "~/domain/products/products.schemas"
import {
  GRID_TYPE_COLORS,
  GRID_TYPE_LABELS,
} from "~/lib/products/grid-type.utils"
import { isStockAlert } from "~/lib/products/product-list.utils"
import { cn } from "~/lib/utils"

function SortableHeader({
  column,
  title,
  className,
}: {
  column: Column<Product, unknown>
  title: string
  className?: string
}) {
  const sorted = column.getIsSorted()

  return (
    <Button
      variant="ghost"
      className={cn("h-8 px-0", className)}
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {title}
      {sorted === "asc" ? (
        <ArrowUp data-icon="inline-end" />
      ) : sorted === "desc" ? (
        <ArrowDown data-icon="inline-end" />
      ) : (
        <ArrowUpDown data-icon="inline-end" />
      )}
    </Button>
  )
}

export const productsTableColumns: ColumnDef<Product>[] = [
  {
    accessorKey: "product_code",
    header: ({ column }) => (
      <SortableHeader column={column} title="Código" />
    ),
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.product_code}</span>
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <SortableHeader column={column} title="Nombre" />
    ),
    cell: ({ row }) => (
      <div className="min-w-0">
        <ProductNameLink product={row.original} />
        {row.original.short_desc ? (
          <p className="max-w-xs truncate text-xs text-muted-foreground">
            {row.original.short_desc}
          </p>
        ) : null}
      </div>
    ),
    filterFn: (row, _id, value) => {
      if (!value) return true
      const search = String(value).toLowerCase()
      const product = row.original
      return (
        product.name.toLowerCase().includes(search) ||
        product.product_code.toLowerCase().includes(search) ||
        (product.short_desc?.toLowerCase().includes(search) ?? false)
      )
    },
  },
  {
    id: "categoryId",
    accessorFn: (row) => row.category?.name ?? "",
    header: ({ column }) => (
      <SortableHeader column={column} title="Categoría" />
    ),
    cell: ({ row }) => (
      <span className="text-sm">{row.original.category?.name ?? "—"}</span>
    ),
    filterFn: (row, _id, value) => {
      if (!value || value === "all") return true
      return row.original.category_id === value
    },
  },
  {
    accessorKey: "grid_type",
    header: ({ column }) => (
      <SortableHeader column={column} title="Tipo red" />
    ),
    cell: ({ row }) => {
      const gridType = row.original.grid_type
      if (!gridType) return "—"

      return (
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-medium",
            GRID_TYPE_COLORS[gridType],
          )}
        >
          {GRID_TYPE_LABELS[gridType]}
        </span>
      )
    },
    filterFn: (row, _id, value) => {
      if (!value || value === "all") return true
      return row.original.grid_type === value
    },
  },
  {
    accessorKey: "is_composite",
    header: ({ column }) => (
      <SortableHeader column={column} title="Tipo" className="mx-auto" />
    ),
    cell: ({ row }) =>
      row.original.is_composite ? (
        <Badge variant="secondary">Kit</Badge>
      ) : (
        <Badge variant="outline">Simple</Badge>
      ),
    meta: {
      headerClassName: "text-center",
      cellClassName: "text-center",
    },
  },
  {
    id: "status",
    accessorFn: (row) => (row.active ? "active" : "inactive"),
    header: ({ column }) => (
      <SortableHeader column={column} title="Estado" className="mx-auto" />
    ),
    cell: ({ row }) => (
      <Badge variant={row.original.active ? "default" : "secondary"}>
        {row.original.active ? "Activo" : "Inactivo"}
      </Badge>
    ),
    filterFn: (row, _id, value) => {
      if (!value || value === "all") return true
      if (value === "active") return row.original.active
      if (value === "inactive") return !row.original.active
      if (value === "stock_alert") return isStockAlert(row.original)
      return true
    },
    meta: {
      headerClassName: "text-center",
      cellClassName: "text-center",
    },
  },
]

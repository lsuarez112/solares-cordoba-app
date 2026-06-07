"use client"

import type { Column, ColumnDef } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import { ProductNameLink } from "~/components/products/product-name-link"
import { ProductSupplierCell } from "~/components/products/product-supplier-cell"
import { ProductTechnicalPropertyBadges } from "~/components/products/product-technical-property-badges"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import type { Product } from "~/domain/products/products.schemas"
import { getCategoryIcon } from "~/lib/categories/category-icons"
import { parseProductGenericProperties } from "~/lib/products/product-display.utils"
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

type ProductsTableColumnsOptions = {
  onOpenEdit?: (product: Product) => void
  onDuplicate?: (product: Product) => void
}

export function productsTableColumns(
  options?: ProductsTableColumnsOptions,
): ColumnDef<Product>[] {
  const { onOpenEdit, onDuplicate } = options ?? {}
  return [
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
    cell: ({ row }) => {
      const properties = parseProductGenericProperties(
        row.original.generic_properties,
      )

      return (
        <div className="flex min-w-0 max-w-md flex-col gap-1.5">
          <ProductNameLink
            product={row.original}
            onOpenEdit={onOpenEdit}
            onDuplicate={onDuplicate}
          />
          {row.original.short_desc ? (
            <p className="truncate text-xs text-muted-foreground">
              {row.original.short_desc}
            </p>
          ) : null}
          <ProductTechnicalPropertyBadges items={properties} />
        </div>
      )
    },
    filterFn: (row, _id, value) => {
      if (!value) return true
      const search = String(value).toLowerCase()
      const product = row.original
      const properties = parseProductGenericProperties(product.generic_properties)
      return (
        product.name.toLowerCase().includes(search) ||
        product.product_code.toLowerCase().includes(search) ||
        (product.supplier?.name.toLowerCase().includes(search) ?? false) ||
        (product.supplier?.tax_id?.toLowerCase().includes(search) ?? false) ||
        (product.short_desc?.toLowerCase().includes(search) ?? false) ||
        properties.some(
          ({ key, value: propValue }) =>
            key.toLowerCase().includes(search) ||
            propValue.toLowerCase().includes(search),
        )
      )
    },
  },
  {
    id: "categoryId",
    accessorFn: (row) => row.category?.name ?? "",
    header: ({ column }) => (
      <SortableHeader column={column} title="Categoría" />
    ),
    cell: ({ row }) => {
      const category = row.original.category
      if (!category) {
        return <span className="text-sm text-muted-foreground">—</span>
      }

      const CategoryIcon = getCategoryIcon(category.icon)

      return (
        <Badge
          variant="secondary"
          className="border-violet-200 bg-violet-100 text-violet-800 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-300"
        >
          <CategoryIcon
            data-icon="inline-start"
            className="text-violet-600"
          />
          {category.name}
        </Badge>
      )
    },
    filterFn: (row, _id, value) => {
      if (!value || value === "all") return true
      return row.original.category_id === value
    },
  },
  {
    id: "supplierId",
    accessorFn: (row) => row.supplier?.name ?? "",
    header: ({ column }) => (
      <SortableHeader column={column} title="Proveedor" />
    ),
    cell: ({ row }) => <ProductSupplierCell product={row.original} />,
    filterFn: (row, _id, value) => {
      if (!value || value === "all") return true
      if (value === "none") return !row.original.supplier_id
      return row.original.supplier_id === value
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
}

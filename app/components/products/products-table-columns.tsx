"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { SortableHeader } from "~/components/ui/data-table-sortable-header"
import { ProductNameLink } from "~/components/products/product-name-link"
import { ProductTechnicalPropertyBadges } from "~/components/products/product-technical-property-badges"
import { Badge } from "~/components/ui/badge"
import { StatusIcon, statusFromActive } from "~/components/ui/status-indicator"
import type { Product } from "~/domain/products/products.schemas"
import { getCategoryIcon } from "~/lib/categories/category-icons"
import { parseProductGenericProperties } from "~/lib/products/product-display.utils"
import {
  GRID_TYPE_COLORS,
  GRID_TYPE_LABELS,
} from "~/lib/products/grid-type.utils"
import { hasNoPrice } from "~/lib/products/product-list.utils"
import { truncateText } from "~/lib/text.utils"
import { cn } from "~/lib/utils"


const DESCRIPTION_MAX_LENGTH = 60

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
      const product = row.original
      const description =
        product.short_desc?.trim() || product.description?.trim() || ""

      const properties = parseProductGenericProperties(product.generic_properties)

      return (
        <div className="flex max-w-[36rem] min-w-0 flex-col gap-1">
          <div className="flex min-w-0 items-center gap-2">
            <StatusIcon status={statusFromActive(product.active)} />
            <ProductNameLink
              product={product}
              onOpenEdit={onOpenEdit}
              onDuplicate={onDuplicate}
              className="shrink-0"
            />
            {description ? (
              <span
                className="min-w-0 truncate text-xs text-muted-foreground"
                title={description}
              >
                {truncateText(description, DESCRIPTION_MAX_LENGTH)}
              </span>
            ) : null}
          </div>
          {properties.length > 0 ? (
            <div className="flex min-w-0 items-center gap-1.5 pl-5.5">
              <span className="shrink-0 text-[11px] text-muted-foreground/70">
                Propiedades
              </span>
              <ProductTechnicalPropertyBadges items={properties} max={4} compact />
            </div>
          ) : null}
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
    accessorKey: "price_usd",
    header: ({ column }) => (
      <SortableHeader column={column} title="Precio USD" className="ml-auto" />
    ),
    cell: ({ row }) =>
      hasNoPrice(row.original) ? (
        <Badge variant="outline" className="text-amber-700">
          Sin precio
        </Badge>
      ) : (
        <span
          className="font-mono text-sm tabular-nums"
          title={
            row.original.price_updated_at
              ? `Actualizado el ${new Date(row.original.price_updated_at).toLocaleDateString("es-AR")}`
              : undefined
          }
        >
          {row.original.price_usd.toLocaleString("es-AR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      ),
    meta: {
      headerClassName: "text-right",
      cellClassName: "text-right",
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
      if (value === "no_price") return hasNoPrice(row.original)
      return true
    },
    meta: {
      headerClassName: "text-center",
      cellClassName: "text-center",
    },
  },
]
}

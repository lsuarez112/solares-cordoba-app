"use client"

import type { Column, ColumnDef } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import { Link } from "react-router"

import { CategoryNameLink } from "./category-name-link"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import type { Category } from "~/domain/categories/categories.schemas"
import { getCategoryIcon } from "~/lib/categories/category-icons"
import { cn } from "~/lib/utils"

function SortableHeader({
  column,
  title,
  className,
}: {
  column: Column<CategoryRow, unknown>
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

export type CategoryRow = Category & {
  productCount: number
}

type CategoriesTableColumnsOptions = {
  onOpenEdit?: (category: Category) => void
}

export function categoriesTableColumns(
  options?: CategoriesTableColumnsOptions,
): ColumnDef<CategoryRow>[] {
  const { onOpenEdit } = options ?? {}

  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <SortableHeader column={column} title="Categoría" />
      ),
      cell: ({ row }) => {
        const category = row.original
        const CategoryIcon = getCategoryIcon(category.icon)

        return (
          <div className="flex min-w-0 max-w-xs items-center gap-2">
            <Badge
              variant="secondary"
              className="shrink-0 border-violet-200 bg-violet-100 text-violet-800 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-300"
            >
              <CategoryIcon
                data-icon="inline-start"
                className="text-violet-600"
              />
            </Badge>
            <div className="flex min-w-0 flex-col gap-0.5">
              <CategoryNameLink category={category} onOpenEdit={onOpenEdit} />
              {category.slug ? (
                <span className="truncate font-mono text-xs text-muted-foreground">
                  {category.slug}
                </span>
              ) : null}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "description",
      header: "Descripción",
      cell: ({ row }) => (
        <span className="line-clamp-2 max-w-md text-sm text-muted-foreground">
          {row.original.description?.trim() || "—"}
        </span>
      ),
    },
    {
      accessorKey: "productCount",
      header: ({ column }) => (
        <SortableHeader column={column} title="Productos" className="mx-auto" />
      ),
      cell: ({ row }) => {
        const count = row.original.productCount
        const productsUrl = `/productos?category=${row.original.id}`

        if (count === 0) {
          return (
            <span className="text-sm text-muted-foreground">0</span>
          )
        }

        return (
          <Button variant="link" className="h-auto p-0 font-semibold" asChild>
            <Link to={productsUrl}>{count}</Link>
          </Button>
        )
      },
      meta: {
        headerClassName: "text-center",
        cellClassName: "text-center",
      },
    },
  ]
}

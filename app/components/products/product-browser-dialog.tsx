"use client"

import * as React from "react"
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/react-table"

import { ProductTechnicalPropertyBadges } from "~/components/products/product-technical-property-badges"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import { DataTableView } from "~/components/ui/data-table"
import { SortableHeader } from "~/components/ui/data-table-sortable-header"
import {
  DataTableToolbar,
  FILTER_ALL,
  type DataTableFilter,
} from "~/components/ui/data-table-toolbar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import type { Product, ProductCategory } from "~/domain/products/products.schemas"
import { parseProductGenericProperties } from "~/lib/products/product-display.utils"
import { GRID_TYPE_LABELS } from "~/lib/products/grid-type.utils"
import { hasNoPrice } from "~/lib/products/product-list.utils"
import { cn } from "~/lib/utils"

function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
}

/** Texto en el que busca: código, nombre, descripciones, tipo/categoría y propiedades. */
function searchableText(product: Product) {
  const props = parseProductGenericProperties(product.generic_properties)
    .map(({ key, value }) => `${key} ${value}`)
    .join(" ")
  return normalize(
    [
      product.product_code,
      product.name,
      product.short_desc,
      product.description,
      product.category?.name,
      props,
    ]
      .filter(Boolean)
      .join(" "),
  )
}

const usd = (value: number) =>
  value.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

type ProductBrowserDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  products: Product[]
  categories: ProductCategory[]
  title?: string
  description?: string
  /** Elegir varios (checkbox) o uno solo (clic en la fila). */
  multiple?: boolean
  /** Categoría preseleccionada en el filtro (id). */
  initialCategoryId?: string | null
  /** Códigos que ya están cargados: se muestran deshabilitados. */
  disabledCodes?: Set<string>
  confirmLabel?: string
  onSelect: (products: Product[]) => void
}

export function ProductBrowserDialog({
  open,
  onOpenChange,
  products,
  categories,
  title = "Agregar productos",
  description = "Buscá por código, descripción o tipo. Los ya cargados aparecen deshabilitados.",
  multiple = true,
  initialCategoryId = null,
  disabledCodes,
  confirmLabel = "Agregar",
  onSelect,
}: ProductBrowserDialogProps) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [selected, setSelected] = React.useState<Set<string>>(new Set())

  React.useEffect(() => {
    if (!open) return
    setSelected(new Set())
    setSorting([])
    setColumnFilters(initialCategoryId ? [{ id: "category", value: initialCategoryId }] : [])
  }, [open, initialCategoryId])

  const index = React.useMemo(
    () => new Map(products.map((p) => [p.id, searchableText(p)])),
    [products],
  )

  const isDisabled = React.useCallback(
    (p: Product) => disabledCodes?.has(p.product_code) ?? false,
    [disabledCodes],
  )

  const choose = React.useCallback(
    (product: Product) => {
      if (isDisabled(product)) return
      if (!multiple) {
        onSelect([product])
        onOpenChange(false)
        return
      }
      setSelected((prev) => {
        const next = new Set(prev)
        if (next.has(product.id)) next.delete(product.id)
        else next.add(product.id)
        return next
      })
    },
    [isDisabled, multiple, onOpenChange, onSelect],
  )

  const columns = React.useMemo<ColumnDef<Product>[]>(
    () => [
      ...(multiple
        ? [
            {
              id: "select",
              enableSorting: false,
              header: () => null,
              cell: ({ row }: { row: { original: Product } }) => (
                <Checkbox
                  checked={selected.has(row.original.id) || isDisabled(row.original)}
                  disabled={isDisabled(row.original)}
                  onCheckedChange={() => choose(row.original)}
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Seleccionar"
                />
              ),
            } satisfies ColumnDef<Product>,
          ]
        : []),
      {
        accessorKey: "product_code",
        header: ({ column }) => <SortableHeader column={column} title="Código" />,
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.product_code}</span>,
      },
      {
        id: "search",
        accessorKey: "name",
        header: ({ column }) => <SortableHeader column={column} title="Producto" />,
        cell: ({ row }) => (
          <div className="flex max-w-[26rem] min-w-0 flex-col">
            <span className="truncate" title={row.original.name}>
              {row.original.name}
            </span>
            <ProductTechnicalPropertyBadges
              items={parseProductGenericProperties(row.original.generic_properties)}
              max={3}
              compact
            />
          </div>
        ),
        filterFn: (row, _id, value) => {
          const terms = normalize(String(value ?? "")).split(/\s+/).filter(Boolean)
          if (terms.length === 0) return true
          const text = index.get(row.original.id) ?? ""
          return terms.every((t) => text.includes(t))
        },
      },
      {
        id: "category",
        accessorFn: (p) => p.category?.name ?? "",
        header: ({ column }) => <SortableHeader column={column} title="Tipo" />,
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">{row.original.category?.name ?? "—"}</span>
        ),
        filterFn: (row, _id, value) => !value || row.original.category_id === value,
      },
      {
        accessorKey: "grid_type",
        header: ({ column }) => <SortableHeader column={column} title="Red" />,
        cell: ({ row }) =>
          row.original.grid_type ? (
            <span className="text-xs">{GRID_TYPE_LABELS[row.original.grid_type]}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
        filterFn: (row, _id, value) => !value || row.original.grid_type === value,
        sortUndefined: "last",
      },
      {
        accessorKey: "price_usd",
        header: ({ column }) => <SortableHeader column={column} title="USD" className="ml-auto" />,
        cell: ({ row }) => (
          <span
            className={cn(
              "font-mono text-xs tabular-nums",
              hasNoPrice(row.original) && "text-amber-700",
            )}
          >
            {hasNoPrice(row.original) ? "Sin precio" : usd(row.original.price_usd)}
          </span>
        ),
        meta: { headerClassName: "text-right", cellClassName: "text-right" },
      },
    ],
    [multiple, selected, isDisabled, choose, index],
  )

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    initialState: { pagination: { pageIndex: 0, pageSize: 50 } },
    state: { columnFilters, sorting },
    autoResetPageIndex: true,
  })

  const filterValue = (id: string) =>
    (table.getColumn(id)?.getFilterValue() as string | undefined) || FILTER_ALL
  const setFilter = (id: string) => (value: string) =>
    table.getColumn(id)?.setFilterValue(value === FILTER_ALL ? "" : value)

  const filters: DataTableFilter[] = [
    {
      id: "category",
      label: "Tipo",
      allLabel: "Todos los tipos",
      value: filterValue("category"),
      widthClassName: "w-44",
      options: categories.map((c) => ({ value: c.id, label: c.name })),
      onChange: setFilter("category"),
    },
    {
      id: "grid_type",
      label: "Red",
      allLabel: "Todas las redes",
      value: filterValue("grid_type"),
      widthClassName: "w-36",
      options: (["ON-GRID", "HYBRID", "OFF-GRID"] as const).map((g) => ({
        value: g,
        label: GRID_TYPE_LABELS[g],
      })),
      onChange: setFilter("grid_type"),
    },
  ]

  const selectedProducts = products.filter((p) => selected.has(p.id))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90svh] flex-col gap-3 sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DataTableToolbar
          search={(table.getColumn("search")?.getFilterValue() as string | undefined) ?? ""}
          onSearchChange={(value) => table.getColumn("search")?.setFilterValue(value)}
          searchPlaceholder="Código, descripción, tipo o propiedad (ej. 460 Wp)…"
          filters={filters}
          onClearFilters={() => table.resetColumnFilters()}
          inlineFrom="md"
        />

        <div
          className="min-h-0 flex-1 overflow-y-auto [&_tbody_tr]:cursor-pointer"
          onClick={(e) => {
            const tr = (e.target as HTMLElement).closest("tbody tr")
            const rowIndex = tr ? Array.from(tr.parentElement?.children ?? []).indexOf(tr) : -1
            const row = table.getRowModel().rows[rowIndex]
            if (row && !(e.target as HTMLElement).closest("button,[role=checkbox]")) choose(row.original)
          }}
        >
          <DataTableView
            table={table}
            columnCount={columns.length}
            emptyMessage="Ningún producto coincide con la búsqueda"
            showPagination
            showRowCount
            totalCount={products.length}
            rowCountLabel="productos"
          />
        </div>

        {multiple ? (
          <DialogFooter className="items-center">
            <span className="mr-auto text-sm text-muted-foreground">
              {selected.size} seleccionado{selected.size === 1 ? "" : "s"}
            </span>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              disabled={selected.size === 0}
              onClick={() => {
                onSelect(selectedProducts)
                onOpenChange(false)
              }}
            >
              {confirmLabel} {selected.size > 0 ? selected.size : ""}
            </Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

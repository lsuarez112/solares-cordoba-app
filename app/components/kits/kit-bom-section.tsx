"use client"

import * as React from "react"
import { HintTooltip } from "~/components/ui/hint-tooltip"
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useFieldArray, useWatch, type Control } from "react-hook-form"
import { AlertTriangle, ChevronDown, GripVertical, PackageOpen, Plus, Search } from "lucide-react"

import { ProductBrowserDialog } from "~/components/products/product-browser-dialog"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty"
import { FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form"
import { DeleteIconButton } from "~/components/ui/icon-action-button"
import { Input } from "~/components/ui/input"
import { TableScrollArea } from "~/components/ui/table-scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import type { KitFormValues } from "~/domain/kits/kits.schemas"
import type { Product, ProductCategory } from "~/domain/products/products.schemas"
import { useIsMobile } from "~/hooks/use-mobile"
import { computeBomTotals } from "~/lib/kits/kit-bom"
import { groupItems, insertionIndex } from "~/lib/kits/kit-groups"
import { cn } from "~/lib/utils"

const usd = (value: number) =>
  value.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

type KitBomSectionProps = {
  control: Control<KitFormValues>
  products: Product[]
  catalog: Map<string, Product>
  categories: ProductCategory[]
  canEdit: boolean
}

export function KitBomSection({ control, products, catalog, categories, canEdit }: KitBomSectionProps) {
  const { fields, insert, remove, move } = useFieldArray({ control, name: "items" })
  const isMobile = useIsMobile()
  const items = useWatch({ control, name: "items" }) ?? []
  const [browser, setBrowser] = React.useState<{ open: boolean; categoryId: string | null }>({
    open: false,
    categoryId: null,
  })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const lines = items.map((i) => ({ product_code: i.product_code, qty: Number(i.qty) || 0 }))
  const totals = computeBomTotals(lines, catalog)
  // Los grupos se calculan sobre los campos (ids estables para dnd) + valores actuales.
  const groups = groupItems(
    fields.map((f, i) => ({ id: f.id, product_code: items[i]?.product_code ?? f.product_code })),
    catalog,
  )
  const groupTotal = (indexes: number[]) =>
    indexes.reduce((acc, i) => {
      const p = catalog.get(items[i]?.product_code)
      return acc + (p ? (Number(items[i]?.qty) || 0) * p.price_usd : 0)
    }, 0)
  const loadedCodes = React.useMemo(() => new Set(items.map((i) => i.product_code)), [items])

  const handleAdd = (selected: Product[]) => {
    // Cada producto entra al final de su grupo.
    const current = [...items]
    for (const product of selected) {
      const at = insertionIndex(current, catalog, product.product_code)
      const line = { product_code: product.product_code, qty: 1 }
      current.splice(at, 0, line)
      insert(at, line)
    }
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const from = fields.findIndex((f) => f.id === active.id)
    const to = fields.findIndex((f) => f.id === over.id)
    if (from < 0 || to < 0) return
    // Solo se reordena dentro del mismo grupo.
    const groupOf = (index: number) => groups.find((g) => g.indexes.includes(index))?.key
    if (groupOf(from) !== groupOf(to)) return
    move(from, to)
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-base font-medium">Lista de materiales</h2>
        <Badge variant="secondary">{fields.length} ítems</Badge>
        <span className="ml-auto text-sm">
          Total: <strong className="font-mono tabular-nums">USD {usd(totals.totalUsd)}</strong>
        </span>
        {canEdit ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" size="sm" variant="outline">
                <Plus data-icon="inline-start" className="text-emerald-600 dark:text-emerald-400" />
                Agregar productos
                <ChevronDown data-icon="inline-end" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onSelect={() => setBrowser({ open: true, categoryId: null })}>
                <Search />
                Buscar en el catálogo…
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Por tipo</DropdownMenuLabel>
              {categories.map((category) => (
                <DropdownMenuItem
                  key={category.id}
                  onSelect={() => setBrowser({ open: true, categoryId: category.id })}
                >
                  {category.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>

      {totals.missingPrice.length > 0 ? (
        <p className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400">
          <AlertTriangle className="size-3.5" />
          {totals.missingPrice.length} producto(s) sin precio: el total es parcial.
        </p>
      ) : null}

      {fields.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <PackageOpen />
            </EmptyMedia>
            <EmptyTitle>Sin productos</EmptyTitle>
            <EmptyDescription>
              Armá la lista de materiales base del kit: paneles, inversor, baterías,
              protecciones, cableado y estructura. Los precios se toman del catálogo.
            </EmptyDescription>
          </EmptyHeader>
          {canEdit ? (
            <EmptyContent>
              <Button
                type="button"
                size="sm"
                onClick={() => setBrowser({ open: true, categoryId: null })}
              >
                <Search data-icon="inline-start" />
                Buscar en el catálogo
              </Button>
            </EmptyContent>
          ) : null}
        </Empty>
      ) : isMobile ? (
        // Celular: tarjetas por grupo (sin scroll horizontal), mismo dnd.
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="flex flex-col gap-3">
            {groups.map((group) => (
              <div key={group.key} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between px-1 text-xs font-medium text-muted-foreground">
                  <span>
                    {group.label} · {group.indexes.length}
                  </span>
                  <span className="font-mono tabular-nums">{usd(groupTotal(group.indexes))}</span>
                </div>
                <SortableContext items={group.indexes.map((i) => fields[i].id)} strategy={verticalListSortingStrategy}>
                  <ul className="flex flex-col gap-1.5">
                    {group.indexes.map((index) => (
                      <BomRow
                        key={fields[index].id}
                        variant="card"
                        id={fields[index].id}
                        index={index}
                        control={control}
                        product={catalog.get(items[index]?.product_code)}
                        code={items[index]?.product_code}
                        qty={Number(items[index]?.qty) || 0}
                        canEdit={canEdit}
                        onRemove={() => remove(index)}
                      />
                    ))}
                  </ul>
                </SortableContext>
              </div>
            ))}
          </div>
        </DndContext>
      ) : (
      <div className="overflow-hidden rounded-lg border bg-card shadow-card">
        <TableScrollArea maxHeightClassName="max-h-[32rem]">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-card">
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead>Código</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead className="w-24 text-right">Cant.</TableHead>
                  <TableHead className="text-right">Unit.</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((group) => {
                  return (
                    <React.Fragment key={group.key}>
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableCell colSpan={5} className="py-1 text-xs font-medium text-muted-foreground">
                          {group.label} · {group.indexes.length}
                        </TableCell>
                        <TableCell className="py-1 text-right font-mono text-xs text-muted-foreground tabular-nums">
                          {usd(groupTotal(group.indexes))}
                        </TableCell>
                        <TableCell className="py-1" />
                      </TableRow>
                      <SortableContext
                        items={group.indexes.map((i) => fields[i].id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {group.indexes.map((index) => (
                          <BomRow
                            key={fields[index].id}
                            id={fields[index].id}
                            index={index}
                            control={control}
                            product={catalog.get(items[index]?.product_code)}
                            code={items[index]?.product_code}
                            qty={Number(items[index]?.qty) || 0}
                            canEdit={canEdit}
                            onRemove={() => remove(index)}
                          />
                        ))}
                      </SortableContext>
                    </React.Fragment>
                  )
                })}
              </TableBody>
            </Table>
          </DndContext>
        </TableScrollArea>
      </div>
      )}

      <FormField
        control={control}
        name="items"
        render={() => (
          <FormItem>
            <FormMessage />
          </FormItem>
        )}
      />

      <ProductBrowserDialog
        open={browser.open}
        onOpenChange={(open) => setBrowser((prev) => ({ ...prev, open }))}
        products={products}
        categories={categories}
        initialCategoryId={browser.categoryId}
        disabledCodes={loadedCodes}
        onSelect={handleAdd}
      />
    </section>
  )
}

function BomRow({
  variant = "row",
  id,
  index,
  control,
  product,
  code,
  qty,
  canEdit,
  onRemove,
}: {
  variant?: "row" | "card"
  id: string
  index: number
  control: Control<KitFormValues>
  product: Product | undefined
  code: string | undefined
  qty: number
  canEdit: boolean
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled: !canEdit })

  const noPrice = product ? !(product.price_usd > 0) : false

  const grip = canEdit ? (
    <button
      type="button"
      ref={setActivatorNodeRef}
      className="flex cursor-grab touch-none items-center text-muted-foreground hover:text-foreground active:cursor-grabbing"
      aria-label="Reordenar"
      {...attributes}
      {...listeners}
    >
      <GripVertical className="size-4" />
    </button>
  ) : null
  const qtyField = (className: string) => (
    <FormField
      control={control}
      name={`items.${index}.qty`}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <Input
              type="number"
              inputMode="decimal"
              step="any"
              min={0}
              className={cn("text-right tabular-nums", className)}
              aria-label="Cantidad"
              {...field}
              onChange={(e) => field.onChange(e.target.value)}
            />
          </FormControl>
        </FormItem>
      )}
    />
  )

  if (variant === "card") {
    return (
      <li
        ref={setNodeRef}
        style={{ transform: CSS.Translate.toString(transform), transition, "--i": index } as React.CSSProperties}
        className={cn("row-in flex gap-2 rounded-lg border bg-card shadow-card p-2.5", isDragging && "relative z-20 shadow-md")}
      >
        {grip ? <div className="-ml-1 flex px-1">{grip}</div> : null}
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-start gap-2">
            <span className="line-clamp-2 min-w-0 flex-1 text-sm">
              {product?.name ?? <span className="text-destructive">Producto inexistente</span>}
            </span>
            {canEdit ? <DeleteIconButton label="Quitar producto" onClick={onRemove} /> : null}
          </div>
          <span className="font-mono text-xs text-muted-foreground">{code}</span>
          <div className="flex items-center gap-2">
            {qtyField("h-8 w-20")}
            <span
              className={cn(
                "font-mono text-xs tabular-nums text-muted-foreground",
                noPrice && "text-amber-700 dark:text-amber-400",
              )}
            >
              × {product ? (noPrice ? "sin precio" : usd(product.price_usd)) : "—"}
            </span>
            <span className="ml-auto font-mono text-sm font-medium tabular-nums">
              {product ? usd(qty * product.price_usd) : "—"}
            </span>
          </div>
        </div>
      </li>
    )
  }

  return (
    <TableRow
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(isDragging && "relative z-20 bg-background shadow-md")}
    >
      <TableCell className="w-8 pr-0">{grip}</TableCell>
      <TableCell className="font-mono text-xs">{code}</TableCell>
      <TableCell className="max-w-[28rem]">
        <HintTooltip content={product?.name}>
          <span className="block truncate">
            {product?.name ?? <span className="text-destructive">Producto inexistente</span>}
          </span>
        </HintTooltip>
      </TableCell>
      <TableCell className="w-24">{qtyField("h-7")}</TableCell>
      <TableCell className={cn("text-right font-mono text-xs tabular-nums", noPrice && "text-amber-700")}>
        {product ? (noPrice ? "Sin precio" : usd(product.price_usd)) : "—"}
      </TableCell>
      <TableCell className="text-right font-mono text-xs tabular-nums">
        {product ? usd(qty * product.price_usd) : "—"}
      </TableCell>
      <TableCell className="w-10 pl-0 text-right">
        {canEdit ? <DeleteIconButton label="Quitar producto" onClick={onRemove} /> : null}
      </TableCell>
    </TableRow>
  )
}

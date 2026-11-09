"use client"

import * as React from "react"
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
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
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
import { HintTooltip } from "~/components/ui/hint-tooltip"
import { DeleteIconButton } from "~/components/ui/icon-action-button"
import { Input } from "~/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { TableScrollArea } from "~/components/ui/table-scroll-area"
import type { Product, ProductCategory } from "~/domain/products/products.schemas"
import type { QuoteDraftLine, QuoteItem } from "~/domain/quotes/quotes.schemas"
import { formatUsd, lineSubtotal } from "~/lib/quotes/quote-totals"
import { cn } from "~/lib/utils"

let keySeq = 0
export const newLineKey = () => `l${Date.now().toString(36)}${(keySeq++).toString(36)}`

/** Ítems guardados → líneas editables, con el precio vigente del catálogo. */
export function itemsToDraftLines(items: QuoteItem[], catalogById: Map<string, Product>): QuoteDraftLine[] {
  return items.map((i) => {
    const product = i.product_id ? catalogById.get(i.product_id) : undefined
    return {
      key: newLineKey(),
      product_id: i.product_id,
      code: product?.product_code ?? i.code,
      description: product?.name ?? i.description,
      qty: i.qty,
      unit_price_usd: product ? product.price_usd : i.unit_price_usd,
    }
  })
}

type QuoteItemsEditorProps = {
  lines: QuoteDraftLine[]
  onChange: (lines: QuoteDraftLine[]) => void
  products: Product[]
  categories: ProductCategory[]
  catalogById: Map<string, Product>
  canEdit: boolean
}

export function QuoteItemsEditor({
  lines,
  onChange,
  products,
  categories,
  catalogById,
  canEdit,
}: QuoteItemsEditorProps) {
  const [browser, setBrowser] = React.useState<{ open: boolean; categoryId: string | null }>({
    open: false,
    categoryId: null,
  })
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const loadedCodes = React.useMemo(() => new Set(lines.map((l) => l.code)), [lines])
  const activeProducts = React.useMemo(() => products.filter((p) => p.active), [products])

  const update = (key: string, patch: Partial<QuoteDraftLine>) =>
    onChange(lines.map((l) => (l.key === key ? { ...l, ...patch } : l)))

  const add = (selected: Product[]) =>
    onChange([
      ...lines,
      ...selected.map((p) => ({
        key: newLineKey(),
        product_id: p.id,
        code: p.product_code,
        description: p.name,
        qty: 1,
        unit_price_usd: p.price_usd,
      })),
    ])

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const from = lines.findIndex((l) => l.key === active.id)
    const to = lines.findIndex((l) => l.key === over.id)
    if (from >= 0 && to >= 0) onChange(arrayMove(lines, from, to))
  }

  const addMenu = canEdit ? (
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
        {categories.map((c) => (
          <DropdownMenuItem key={c.id} onSelect={() => setBrowser({ open: true, categoryId: c.id })}>
            {c.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  ) : null

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-base font-medium">Ítems</h2>
        <Badge variant="secondary">{lines.length}</Badge>
        <div className="ml-auto">{lines.length > 0 ? addMenu : null}</div>
      </div>

      {lines.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <PackageOpen />
            </EmptyMedia>
            <EmptyTitle>Sin ítems</EmptyTitle>
            <EmptyDescription>Agregá productos del catálogo para armar el presupuesto.</EmptyDescription>
          </EmptyHeader>
          {canEdit ? (
            <EmptyContent>
              <Button type="button" size="sm" onClick={() => setBrowser({ open: true, categoryId: null })}>
                <Search data-icon="inline-start" />
                Buscar en el catálogo
              </Button>
            </EmptyContent>
          ) : null}
        </Empty>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-card">
          <TableScrollArea maxHeightClassName="max-h-[min(60svh,40rem)]">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              {/* table-fixed: la descripción toma el ancho que sobra y se trunca (sin scroll
                  horizontal en desktop; en el celular scrollea por el min-w). */}
              <Table className="w-full min-w-[36rem] table-fixed">
                <TableHeader className="sticky top-0 z-10 bg-card">
                  <TableRow>
                    <TableHead className="w-8" />
                    <TableHead className="w-20">Código</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="w-20 text-right">Cant.</TableHead>
                    <TableHead className="w-24 text-right">Unitario</TableHead>
                    <TableHead className="w-24 text-right">Subtotal</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <SortableContext items={lines.map((l) => l.key)} strategy={verticalListSortingStrategy}>
                    {lines.map((line) => (
                      <SortableLine
                        key={line.key}
                        line={line}
                        product={line.product_id ? catalogById.get(line.product_id) : undefined}
                        canEdit={canEdit}
                        onQty={(qty) => update(line.key, { qty })}
                        onRemove={() => onChange(lines.filter((l) => l.key !== line.key))}
                      />
                    ))}
                  </SortableContext>
                </TableBody>
              </Table>
            </DndContext>
          </TableScrollArea>
        </div>
      )}

      <ProductBrowserDialog
        open={browser.open}
        onOpenChange={(open) => setBrowser((b) => ({ ...b, open }))}
        products={activeProducts}
        categories={categories}
        initialCategoryId={browser.categoryId}
        disabledCodes={loadedCodes}
        onSelect={add}
      />
    </section>
  )
}

function SortableLine({
  line,
  product,
  canEdit,
  onQty,
  onRemove,
}: {
  line: QuoteDraftLine
  product: Product | undefined
  canEdit: boolean
  onQty: (qty: number) => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: line.key, disabled: !canEdit })
  const [qtyText, setQtyText] = React.useState(String(line.qty))
  React.useEffect(() => setQtyText(String(line.qty)), [line.qty])

  const noPrice = !(line.unit_price_usd > 0)
  const inactive = product != null && !product.active
  const missing = line.product_id != null && product == null

  return (
    <TableRow
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(isDragging && "relative z-20 bg-background shadow-md")}
    >
      <TableCell className="w-8 pr-0">
        {canEdit ? (
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
        ) : null}
      </TableCell>
      <TableCell className="truncate font-mono text-xs">{line.code}</TableCell>
      <TableCell>
        <div className="flex min-w-0 items-center gap-1.5">
          <HintTooltip content={line.description}>
            <span className="block truncate">{line.description}</span>
          </HintTooltip>
          {inactive || missing ? (
            <HintTooltip content={missing ? "El producto ya no existe en el catálogo" : "Producto inactivo en el catálogo"}>
              <AlertTriangle className="size-3.5 shrink-0 text-amber-600" />
            </HintTooltip>
          ) : null}
        </div>
      </TableCell>
      <TableCell>
        {canEdit ? (
          <Input
            type="number"
            inputMode="decimal"
            step="any"
            min={0}
            className="h-7 text-right tabular-nums"
            aria-label="Cantidad"
            value={qtyText}
            onChange={(e) => {
              setQtyText(e.target.value)
              const n = Number(e.target.value)
              if (Number.isFinite(n) && n > 0) onQty(n)
            }}
            onBlur={() => setQtyText(String(line.qty))}
          />
        ) : (
          <span className="block text-right tabular-nums">{line.qty.toLocaleString("es-AR")}</span>
        )}
      </TableCell>
      <TableCell className={cn("text-right font-mono text-xs tabular-nums", noPrice && "text-amber-700 dark:text-amber-400")}>
        {noPrice ? "Sin precio" : formatUsd(line.unit_price_usd)}
      </TableCell>
      <TableCell className="text-right font-mono text-xs tabular-nums">{formatUsd(lineSubtotal(line))}</TableCell>
      <TableCell className="w-10 pl-0 text-right">
        {canEdit ? <DeleteIconButton label="Quitar ítem" onClick={onRemove} /> : null}
      </TableCell>
    </TableRow>
  )
}

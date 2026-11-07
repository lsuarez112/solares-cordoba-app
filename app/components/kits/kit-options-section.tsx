"use client"

import * as React from "react"
import { useFieldArray, useWatch, type Control, type UseFormReturn } from "react-hook-form"
import { ChevronDown, Minus, Plus, Search, SlidersHorizontal } from "lucide-react"

import { ProductBrowserDialog } from "~/components/products/product-browser-dialog"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form"
import { DeleteIconButton } from "~/components/ui/icon-action-button"
import { Input } from "~/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import {
  KIT_OPTION_KIND_LABELS,
  type KitFormValues,
  type KitOptionKind,
} from "~/domain/kits/kits.schemas"
import type { Product, ProductCategory } from "~/domain/products/products.schemas"
import { applyKitOption, computeBomTotals } from "~/lib/kits/kit-bom"
import { nextOptionCode } from "~/lib/kits/kit-form.utils"
import { cn } from "~/lib/utils"

const usd = (value: number) =>
  value.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const OP_LABELS = { add: "Sumar", set: "Fijar", remove: "Quitar" } as const

type SectionProps = {
  form: UseFormReturn<KitFormValues>
  products: Product[]
  catalog: Map<string, Product>
  categories: ProductCategory[]
  canEdit: boolean
}

export function KitOptionsSection({ form, products, catalog, categories, canEdit }: SectionProps) {
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "options" })
  const options = useWatch({ control: form.control, name: "options" }) ?? []
  const items = useWatch({ control: form.control, name: "items" }) ?? []

  const baseLines = items.map((i) => ({ product_code: i.product_code, qty: Number(i.qty) || 0 }))
  const baseTotal = computeBomTotals(baseLines, catalog).totalUsd

  const addOption = (kind: KitOptionKind) =>
    append({
      code: nextOptionCode(options.map((o) => o.code), kind),
      kind,
      name: "",
      kwp: null,
      battery_kwh: null,
      est_kwh_month: null,
      notes: "",
      changes: [],
    })

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-base font-medium">Opcionales</h2>
        <Badge variant="secondary">{fields.length}</Badge>
        {canEdit ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" size="sm" variant="outline" className="ml-auto">
                <Plus data-icon="inline-start" />
                Agregar opcional
                <ChevronDown data-icon="inline-end" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(Object.keys(KIT_OPTION_KIND_LABELS) as KitOptionKind[]).map((kind) => (
                <DropdownMenuItem key={kind} onSelect={() => addOption(kind)}>
                  {KIT_OPTION_KIND_LABELS[kind]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
        <p className="w-full text-xs text-muted-foreground">
          Un opcional es una lista de cambios sobre la lista base: <b>sumar</b> cantidad,{" "}
          <b>fijar</b> cantidad (0 = quitar) o <b>quitar</b> el producto.
        </p>
      </div>

      {fields.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          Sin opcionales.
        </p>
      ) : null}

      {fields.map((field, index) => {
        const option = options[index]
        const delta = option
          ? computeBomTotals(
              applyKitOption(
                baseLines,
                option.changes.map((c) => ({ ...c, qty: Number(c.qty) || 0 })),
              ),
              catalog,
            ).totalUsd - baseTotal
          : 0

        return (
          <div key={field.id} className="flex flex-col gap-3 rounded-lg border bg-card p-3">
            <div className="grid grid-cols-[5rem_1fr_auto] items-start gap-2 sm:grid-cols-[5rem_12rem_1fr_auto_auto]">
              <FormField
                control={form.control}
                name={`options.${index}.code`}
                render={({ field: f }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        aria-label="Código"
                        {...f}
                        onChange={(e) => f.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`options.${index}.kind`}
                render={({ field: f }) => (
                  <FormItem className="col-span-3 row-start-2 sm:col-span-1 sm:row-start-auto">
                    <Select value={f.value} onValueChange={f.onChange} disabled={!canEdit}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(Object.keys(KIT_OPTION_KIND_LABELS) as KitOptionKind[]).map((k) => (
                          <SelectItem key={k} value={k}>
                            {KIT_OPTION_KIND_LABELS[k]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`options.${index}.name`}
                render={({ field: f }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Ej.: 2× Hope (11 kWh)" {...f} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <span
                className={cn(
                  "hidden self-center font-mono text-sm whitespace-nowrap tabular-nums sm:block",
                  delta < 0 && "text-emerald-700 dark:text-emerald-400",
                )}
                title="Diferencia contra la lista base"
              >
                {delta >= 0 ? "+" : "−"} USD {usd(Math.abs(delta))}
              </span>
              {canEdit ? (
                <DeleteIconButton label="Quitar opcional" onClick={() => remove(index)} />
              ) : null}
            </div>

            <OptionChangesTable
              control={form.control}
              optionIndex={index}
              products={products}
              catalog={catalog}
              categories={categories}
              baseItems={items}
              canEdit={canEdit}
            />

            <div className="grid grid-cols-3 gap-2 sm:max-w-md">
              {(
                [
                  ["kwp", "kWp resultante"],
                  ["battery_kwh", "kWh batería"],
                  ["est_kwh_month", "kWh/mes"],
                ] as const
              ).map(([name, label]) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={`options.${index}.${name}`}
                  render={({ field: f }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">{label}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          inputMode="decimal"
                          step="any"
                          {...f}
                          value={f.value ?? ""}
                          onChange={(e) => f.onChange(e.target.value)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </div>
        )
      })}

      <FormField
        control={form.control}
        name="options"
        render={() => (
          <FormItem>
            <FormMessage />
          </FormItem>
        )}
      />
    </section>
  )
}

function OptionChangesTable({
  control,
  optionIndex,
  products,
  catalog,
  categories,
  baseItems,
  canEdit,
}: {
  control: Control<KitFormValues>
  optionIndex: number
  products: Product[]
  catalog: Map<string, Product>
  categories: ProductCategory[]
  baseItems: KitFormValues["items"]
  canEdit: boolean
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `options.${optionIndex}.changes`,
  })
  const changes = useWatch({ control, name: `options.${optionIndex}.changes` }) ?? []
  const [browserOpen, setBrowserOpen] = React.useState(false)

  const baseMenu = (onPick: (code: string, qty: number) => void) =>
    baseItems.length === 0 ? (
      <DropdownMenuItem disabled>La lista base está vacía</DropdownMenuItem>
    ) : (
      baseItems.map((item) => (
        <DropdownMenuItem
          key={item.product_code}
          onSelect={() => onPick(item.product_code, Number(item.qty) || 1)}
        >
          <span className="font-mono text-xs text-muted-foreground">{item.product_code}</span>
          <span className="max-w-60 truncate">{catalog.get(item.product_code)?.name ?? "—"}</span>
          <span className="ml-auto text-xs text-muted-foreground">×{item.qty}</span>
        </DropdownMenuItem>
      ))
    )

  return (
    <div className="flex flex-col gap-2">
      {fields.length > 0 ? (
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">Cambio</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead className="w-24 text-right">Cant.</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field, i) => {
                const change = changes[i]
                const product = change ? catalog.get(change.product_code) : undefined
                return (
                  <TableRow key={field.id}>
                    <TableCell className="w-28">
                      <FormField
                        control={control}
                        name={`options.${optionIndex}.changes.${i}.op`}
                        render={({ field: f }) => (
                          <Select value={f.value} onValueChange={f.onChange} disabled={!canEdit}>
                            <SelectTrigger size="sm" className="h-7 w-full" aria-label="Operación">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {(Object.keys(OP_LABELS) as Array<keyof typeof OP_LABELS>).map((op) => (
                                <SelectItem key={op} value={op}>
                                  {OP_LABELS[op]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs">{change?.product_code}</TableCell>
                    <TableCell className="max-w-[24rem]">
                      <span className="block truncate" title={product?.name}>
                        {product?.name ?? <span className="text-destructive">Producto inexistente</span>}
                      </span>
                    </TableCell>
                    <TableCell className="w-24">
                      {change?.op !== "remove" ? (
                        <FormField
                          control={control}
                          name={`options.${optionIndex}.changes.${i}.qty`}
                          render={({ field: f }) => (
                            <Input
                              type="number"
                              inputMode="decimal"
                              step="any"
                              min={0}
                              className="h-7 text-right tabular-nums"
                              aria-label="Cantidad"
                              {...f}
                              value={f.value ?? ""}
                              onChange={(e) => f.onChange(e.target.value)}
                            />
                          )}
                        />
                      ) : null}
                    </TableCell>
                    <TableCell className="w-10 pl-0 text-right">
                      {canEdit ? <DeleteIconButton label="Quitar cambio" onClick={() => remove(i)} /> : null}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      ) : null}

      <FormField
        control={control}
        name={`options.${optionIndex}.changes`}
        render={() => (
          <FormItem>
            <FormMessage />
          </FormItem>
        )}
      />

      {canEdit ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="self-start text-muted-foreground">
              <Plus data-icon="inline-start" />
              Agregar cambio
              <ChevronDown data-icon="inline-end" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuItem onSelect={() => setBrowserOpen(true)}>
              <Search />
              Sumar producto del catálogo…
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <SlidersHorizontal />
                Cambiar cantidad de…
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="max-h-80 overflow-y-auto">
                {baseMenu((code, qty) => append({ op: "set", product_code: code, qty }))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Minus />
                Quitar de la base…
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="max-h-80 overflow-y-auto">
                {baseMenu((code) => append({ op: "remove", product_code: code }))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}

      <ProductBrowserDialog
        open={browserOpen}
        onOpenChange={setBrowserOpen}
        products={products}
        categories={categories}
        title="Sumar productos al opcional"
        description="Los productos elegidos se suman (1 unidad) cuando se aplica el opcional."
        disabledCodes={new Set(changes.filter((c) => c.op === "add").map((c) => c.product_code))}
        onSelect={(selected) =>
          selected.forEach((p) => append({ op: "add", product_code: p.product_code, qty: 1 }))
        }
      />
    </div>
  )
}

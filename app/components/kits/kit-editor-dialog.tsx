"use client"

import * as React from "react"
import {
  useFieldArray,
  useForm,
  useWatch,
  type Control,
  type Resolver,
  type UseFormReturn,
} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertTriangle, Plus, Save, Trash2 } from "lucide-react"

import { ProductPicker } from "~/components/kits/product-picker"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Separator } from "~/components/ui/separator"
import { Skeleton } from "~/components/ui/skeleton"
import { Spinner } from "~/components/ui/spinner"
import { Switch } from "~/components/ui/switch"
import { Textarea } from "~/components/ui/textarea"
import {
  KIT_OPTION_KIND_LABELS,
  KitFormSchema,
  type KitFormValues,
  type KitOptionKind,
} from "~/domain/kits/kits.schemas"
import type { Product } from "~/domain/products/products.schemas"
import {
  applyKitOption,
  computeBomTotals,
  type PricedProduct,
} from "~/lib/kits/kit-bom"
import {
  emptyKitFormValues,
  kitDetailToFormValues,
  nextOptionCode,
} from "~/lib/kits/kit-form.utils"
import { GRID_TYPE_LABELS } from "~/lib/products/grid-type.utils"
import { appToast } from "~/lib/toast"
import { cn } from "~/lib/utils"
import { kitsService } from "~/services/kits.service"

const usd = (value: number) =>
  value.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

type KitEditorDialogProps = {
  open: boolean
  kitId: string | null
  /** Valores iniciales para "Duplicar" (sin kitId). */
  initialValues?: KitFormValues | null
  products: Product[]
  canEdit: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

export function KitEditorDialog({
  open,
  kitId,
  initialValues,
  products,
  canEdit,
  onOpenChange,
  onSaved,
}: KitEditorDialogProps) {
  const [loading, setLoading] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  const form = useForm<KitFormValues>({
    resolver: zodResolver(KitFormSchema as never) as Resolver<KitFormValues>,
    defaultValues: emptyKitFormValues,
  })

  const catalog = React.useMemo(
    () =>
      new Map<string, PricedProduct & { id: string }>(
        products.map((p) => [
          p.product_code,
          { id: p.id, name: p.name, price_usd: p.price_usd, active: p.active },
        ]),
      ),
    [products],
  )

  React.useEffect(() => {
    if (!open) return
    if (!kitId) {
      form.reset(initialValues ?? emptyKitFormValues)
      return
    }
    let cancelled = false
    setLoading(true)
    kitsService
      .getDetail(kitId)
      .then((detail) => !cancelled && form.reset(kitDetailToFormValues(detail)))
      .catch(() => appToast.error("No se pudo cargar el kit"))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [open, kitId, initialValues, form])

  const onSubmit = form.handleSubmit(
    async (values) => {
      setSaving(true)
      try {
        const ids = new Map([...catalog].map(([code, p]) => [code, p.id]))
        await kitsService.save(kitId, values, ids)
        appToast.success(kitId ? "Kit actualizado" : "Kit creado")
        onSaved()
        onOpenChange(false)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        appToast.error("No se pudo guardar el kit", {
          description: message.includes("kits_code_key") ? "Ya existe un kit con ese código" : message,
        })
      } finally {
        setSaving(false)
      }
    },
    () => appToast.warning("Revisá los campos marcados"),
  )

  const title = kitId ? "Editar kit" : initialValues ? "Duplicar kit" : "Nuevo kit"

  return (
    <Dialog open={open} onOpenChange={(next) => !saving && onOpenChange(next)}>
      <DialogContent className="flex max-h-[92svh] flex-col gap-0 p-0 sm:max-w-5xl">
        <DialogHeader className="border-b p-4">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Lista de materiales base y opcionales (cambios sobre la lista base). Los precios
            salen siempre del catálogo.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col gap-3 p-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-64" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
              <fieldset
                disabled={!canEdit}
                className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-4"
              >
                <KitHeaderFields form={form} />
                <Separator />
                <KitItemsEditor control={form.control} products={products} catalog={catalog} />
                <Separator />
                <KitOptionsEditor form={form} products={products} catalog={catalog} />
              </fieldset>

              <DialogFooter className="border-t p-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  {canEdit ? "Cancelar" : "Cerrar"}
                </Button>
                {canEdit ? (
                  <Button type="submit" disabled={saving}>
                    {saving ? <Spinner data-icon="inline-start" /> : <Save data-icon="inline-start" />}
                    Guardar
                  </Button>
                ) : null}
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Cabecera
// ---------------------------------------------------------------------------
function NumberInput(props: React.ComponentProps<typeof Input>) {
  return <Input type="number" inputMode="decimal" step="any" {...props} />
}

function KitHeaderFields({ form }: { form: UseFormReturn<KitFormValues> }) {
  const gridType = useWatch({ control: form.control, name: "grid_type" })

  const numberField = (
    name: "kwp" | "battery_kwh" | "inverter_kw" | "est_kwh_month" | "ref_kwh_month_min" | "ref_kwh_month_max" | "battery_voltage",
    label: string,
    disabled?: boolean,
  ) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <NumberInput
              {...field}
              value={field.value ?? ""}
              disabled={disabled}
              onChange={(e) => field.onChange(e.target.value)}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )

  return (
    <section className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-[12rem_1fr_auto]">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código *</FormLabel>
              <FormControl>
                <Input
                  placeholder="KIT_ON_MEDIO"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre *</FormLabel>
              <FormControl>
                <Input placeholder="On-grid residencial 3.3 kW" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Activo</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} className="mt-2" />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <FormField
          control={form.control}
          name="grid_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de sistema *</FormLabel>
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value)
                  if (value === "ON-GRID") form.setValue("battery_kwh", 0)
                }}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {(["ON-GRID", "HYBRID", "OFF-GRID"] as const).map((g) => (
                    <SelectItem key={g} value={g}>
                      {GRID_TYPE_LABELS[g]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phases"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fases</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="mono">Monofásico</SelectItem>
                  <SelectItem value="tri">Trifásico</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        {numberField("kwp", "Potencia (kWp) *")}
        {numberField("inverter_kw", "Inversor (kW)")}
        {numberField("battery_kwh", "Batería (kWh)", gridType === "ON-GRID")}
        {numberField("battery_voltage", "Tensión banco (V)", gridType === "ON-GRID")}
        {numberField("est_kwh_month", "Generación (kWh/mes)")}
        <div className="grid grid-cols-2 gap-2">
          {numberField("ref_kwh_month_min", "Consumo mín.")}
          {numberField("ref_kwh_month_max", "Consumo máx.")}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción (para quién es)</FormLabel>
              <FormControl>
                <Textarea rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas (autonomía, advertencias)</FormLabel>
              <FormControl>
                <Textarea rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// BOM base
// ---------------------------------------------------------------------------
function KitItemsEditor({
  control,
  products,
  catalog,
}: {
  control: Control<KitFormValues>
  products: Product[]
  catalog: Map<string, PricedProduct>
}) {
  const { fields, append, remove } = useFieldArray({ control, name: "items" })
  const items = useWatch({ control, name: "items" }) ?? []
  const totals = computeBomTotals(
    items.map((i) => ({ product_code: i.product_code, qty: Number(i.qty) || 0 })),
    catalog,
  )

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-medium">Lista de materiales base</h3>
        <Badge variant="secondary">{fields.length} ítems</Badge>
        <span className="ml-auto text-sm">
          Total: <strong className="font-mono tabular-nums">USD {usd(totals.totalUsd)}</strong>
        </span>
      </div>
      {totals.missingPrice.length > 0 ? (
        <p className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400">
          <AlertTriangle className="size-3.5" />
          {totals.missingPrice.length} producto(s) sin precio: el total es parcial.
        </p>
      ) : null}

      <div className="flex flex-col gap-2">
        {fields.map((field, index) => {
          const code = items[index]?.product_code
          const product = code ? catalog.get(code) : undefined
          const qty = Number(items[index]?.qty) || 0
          return (
            <div key={field.id} className="flex items-start gap-2">
              <FormField
                control={control}
                name={`items.${index}.product_code`}
                render={({ field: f, fieldState }) => (
                  <FormItem className="min-w-0 flex-1">
                    <ProductPicker
                      products={products}
                      value={f.value || null}
                      onChange={f.onChange}
                      invalid={!!fieldState.error}
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`items.${index}.qty`}
                render={({ field: f }) => (
                  <FormItem className="w-20 shrink-0">
                    <FormControl>
                      <NumberInput
                        {...f}
                        aria-label="Cantidad"
                        onChange={(e) => f.onChange(e.target.value)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <span
                className={cn(
                  "hidden w-24 shrink-0 pt-2 text-right font-mono text-xs tabular-nums sm:block",
                  product && !(product.price_usd > 0) && "text-amber-700",
                )}
              >
                {product ? usd(qty * product.price_usd) : "—"}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Quitar producto"
                onClick={() => remove(index)}
              >
                <Trash2 />
              </Button>
            </div>
          )
        })}
      </div>
      <FormField
        control={control}
        name="items"
        render={() => (
          <FormItem>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() => append({ product_code: "", qty: 1 })}
      >
        <Plus data-icon="inline-start" />
        Agregar producto
      </Button>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Opcionales
// ---------------------------------------------------------------------------
function KitOptionsEditor({
  form,
  products,
  catalog,
}: {
  form: UseFormReturn<KitFormValues>
  products: Product[]
  catalog: Map<string, PricedProduct>
}) {
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
      changes: [{ op: kind === "extra" ? "add" : "set", product_code: "", qty: 1 }],
    })

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-medium">Opcionales</h3>
        <Badge variant="secondary">{fields.length}</Badge>
        <p className="w-full text-xs text-muted-foreground">
          Cada opcional es una lista de cambios sobre la base: <b>sumar</b> cantidad, <b>fijar</b>{" "}
          cantidad (0 = quitar) o <b>quitar</b> el producto.
        </p>
      </div>

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
          <div key={field.id} className="flex flex-col gap-3 rounded-lg border p-3">
            <div className="grid grid-cols-[5rem_1fr_auto] gap-2 sm:grid-cols-[5rem_11rem_1fr_auto]">
              <FormField
                control={form.control}
                name={`options.${index}.code`}
                render={({ field: f }) => (
                  <FormItem>
                    <FormControl>
                      <Input aria-label="Código" {...f} onChange={(e) => f.onChange(e.target.value.toUpperCase())} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`options.${index}.kind`}
                render={({ field: f }) => (
                  <FormItem className="col-span-2 row-start-2 sm:col-span-1 sm:row-start-auto">
                    <Select value={f.value} onValueChange={f.onChange}>
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
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Quitar opcional"
                onClick={() => remove(index)}
              >
                <Trash2 />
              </Button>
            </div>

            <OptionChangesEditor
              control={form.control}
              optionIndex={index}
              products={products}
            />

            <div className="grid grid-cols-3 gap-2 sm:grid-cols-[repeat(3,8rem)_1fr]">
              {(
                [
                  ["kwp", "kWp result."],
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
                        <NumberInput
                          {...f}
                          value={f.value ?? ""}
                          onChange={(e) => f.onChange(e.target.value)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
              <p
                className={cn(
                  "col-span-3 self-end pb-2 text-right font-mono text-sm tabular-nums sm:col-span-1",
                  delta > 0 ? "text-foreground" : "text-emerald-700 dark:text-emerald-400",
                )}
              >
                {delta >= 0 ? "+" : "−"} USD {usd(Math.abs(delta))}
              </p>
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

      <div className="flex flex-wrap gap-2">
        {(Object.keys(KIT_OPTION_KIND_LABELS) as KitOptionKind[]).map((kind) => (
          <Button key={kind} type="button" variant="outline" size="sm" onClick={() => addOption(kind)}>
            <Plus data-icon="inline-start" />
            {KIT_OPTION_KIND_LABELS[kind]}
          </Button>
        ))}
      </div>
    </section>
  )
}

const OP_LABELS = { add: "Sumar", set: "Fijar", remove: "Quitar" } as const

function OptionChangesEditor({
  control,
  optionIndex,
  products,
}: {
  control: Control<KitFormValues>
  optionIndex: number
  products: Product[]
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `options.${optionIndex}.changes`,
  })
  const changes = useWatch({ control, name: `options.${optionIndex}.changes` }) ?? []

  return (
    <div className="flex flex-col gap-2 border-l-2 pl-3">
      {fields.map((field, i) => (
        <div key={field.id} className="flex items-start gap-2">
          <FormField
            control={control}
            name={`options.${optionIndex}.changes.${i}.op`}
            render={({ field: f }) => (
              <FormItem className="w-24 shrink-0">
                <Select value={f.value} onValueChange={f.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full" aria-label="Operación">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(Object.keys(OP_LABELS) as Array<keyof typeof OP_LABELS>).map((op) => (
                      <SelectItem key={op} value={op}>
                        {OP_LABELS[op]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`options.${optionIndex}.changes.${i}.product_code`}
            render={({ field: f, fieldState }) => (
              <FormItem className="min-w-0 flex-1">
                <ProductPicker
                  products={products}
                  value={f.value || null}
                  onChange={f.onChange}
                  invalid={!!fieldState.error}
                />
              </FormItem>
            )}
          />
          {changes[i]?.op !== "remove" ? (
            <FormField
              control={control}
              name={`options.${optionIndex}.changes.${i}.qty`}
              render={({ field: f }) => (
                <FormItem className="w-20 shrink-0">
                  <FormControl>
                    <NumberInput
                      {...f}
                      value={f.value ?? ""}
                      aria-label="Cantidad"
                      onChange={(e) => f.onChange(e.target.value)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          ) : (
            <span className="w-20 shrink-0" />
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Quitar cambio"
            onClick={() => remove(i)}
          >
            <Trash2 />
          </Button>
        </div>
      ))}
      <FormField
        control={control}
        name={`options.${optionIndex}.changes`}
        render={() => (
          <FormItem>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="self-start"
        onClick={() => append({ op: "add", product_code: "", qty: 1 })}
      >
        <Plus data-icon="inline-start" />
        Cambio
      </Button>
    </div>
  )
}

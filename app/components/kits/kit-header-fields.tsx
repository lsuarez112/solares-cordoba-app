"use client"

import * as React from "react"
import { useWatch, type UseFormReturn } from "react-hook-form"

import {
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
import { Switch } from "~/components/ui/switch"
import { Textarea } from "~/components/ui/textarea"
import type { KitFormValues } from "~/domain/kits/kits.schemas"
import { GRID_TYPE_LABELS } from "~/lib/products/grid-type.utils"

function NumberInput(props: React.ComponentProps<typeof Input>) {
  return <Input type="number" inputMode="decimal" step="any" {...props} />
}

export function KitHeaderFields({ form }: { form: UseFormReturn<KitFormValues> }) {
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
      <div className="stagger-x grid gap-4 sm:grid-cols-[12rem_1fr_auto]">
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

      <div className="stagger-x grid grid-cols-2 gap-4 sm:grid-cols-4">
        <FormField
          control={form.control}
          name="grid_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de sistema *</FormLabel>
              <Select
                value={field.value}
                onValueChange={(value) => {
                  // Radix dispara "" al resetear el formulario: se ignora.
                  if (!value) return
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
              <Select value={field.value} onValueChange={(value) => value && field.onChange(value)}>
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

      <div className="stagger-x grid gap-4 sm:grid-cols-2">
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

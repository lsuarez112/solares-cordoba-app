"use client"

import * as React from "react"
import { ChevronDown, Plus, Zap } from "lucide-react"

import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { DeleteIconButton } from "~/components/ui/icon-action-button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { ScrollArea } from "~/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Textarea } from "~/components/ui/textarea"
import type { GridType } from "~/domain/products/products.schemas"
import type { AppliancePreset, SolarZone } from "~/domain/quotes/quotes.schemas"
import { GRID_TYPE_LABELS } from "~/lib/products/grid-type.utils"
import {
  appliancesKwhMonth,
  DEFAULT_AUTONOMY_HOURS,
  type ApplianceLine,
  type QuoteRequest,
} from "~/lib/sizing/sizing"
import { cn } from "~/lib/utils"

const GRID_HINTS: Record<GridType, string> = {
  "ON-GRID": "Conectado a la red, sin baterías",
  HYBRID: "Red + baterías de respaldo",
  "OFF-GRID": "Aislado, siempre con baterías",
}

const NONE = "__none__"

/** Número opcional desde un input (vacío → null). */
const numOrNull = (value: string): number | null => {
  const n = Number(value.replace(",", "."))
  return value.trim() === "" || !Number.isFinite(n) ? null : n
}

type QuoteRequestFormProps = {
  value: QuoteRequest
  onChange: (next: QuoteRequest) => void
  zones: SolarZone[]
  presets: AppliancePreset[]
}

export function QuoteRequestForm({ value, onChange, zones, presets }: QuoteRequestFormProps) {
  const set = <K extends keyof QuoteRequest>(key: K, v: QuoteRequest[K]) => onChange({ ...value, [key]: v })
  const [moreOpen, setMoreOpen] = React.useState(
    Boolean(value.zone_id || value.phases || value.budget_cap_usd || value.roof !== "unknown"),
  )

  const setAppliance = (index: number, patch: Partial<ApplianceLine>) =>
    set(
      "appliances",
      value.appliances.map((a, i) => (i === index ? { ...a, ...patch } : a)),
    )

  const addAppliance = (line: ApplianceLine) => set("appliances", [...value.appliances, line])

  const cities = zones.filter((z) => z.kind === "city")
  const regions = zones.filter((z) => z.kind === "region")
  const hasBatteryChoice = value.grid_type === "HYBRID" || value.grid_type === "OFF-GRID"
  const batteryOn = value.grid_type === "OFF-GRID" || (value.grid_type === "HYBRID" && value.battery_wanted)

  return (
    <div className="flex flex-col gap-6">
      {/* Pedido en texto libre: en F4 la IA lo interpreta. */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="request-text">Pedido del cliente</Label>
        <Textarea
          id="request-text"
          rows={3}
          value={value.request_text}
          onChange={(e) => set("request_text", e.target.value)}
          placeholder="Pegá lo que mandó el cliente por WhatsApp o dictalo con el micrófono del teclado."
        />
        <p className="text-xs text-muted-foreground">
          Queda guardado con el presupuesto. Para dimensionar completá abajo el tipo de sistema y el consumo.
        </p>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">Tipo de sistema *</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {(["ON-GRID", "HYBRID", "OFF-GRID"] as const).map((g) => {
            const active = value.grid_type === g
            return (
              <button
                key={g}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  onChange({
                    ...value,
                    grid_type: g,
                    battery_wanted: g === "OFF-GRID" ? true : g === "ON-GRID" ? false : value.battery_wanted,
                  })
                }
                className={cn(
                  "flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2.5 text-left transition-colors hover:bg-muted/50",
                  active && "border-primary bg-primary/5 ring-1 ring-primary",
                )}
              >
                <span className="text-sm font-medium">{GRID_TYPE_LABELS[g]}</span>
                <span className="text-xs text-muted-foreground">{GRID_HINTS[g]}</span>
              </button>
            )
          })}
        </div>
      </fieldset>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium">Consumo *</span>
          <Tabs
            value={value.consumption_mode}
            onValueChange={(v) => set("consumption_mode", v as QuoteRequest["consumption_mode"])}
          >
            <TabsList>
              <TabsTrigger value="kwh">kWh de la factura</TabsTrigger>
              <TabsTrigger value="appliances">Lista de equipos</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {value.consumption_mode === "kwh" ? (
          <div className="grid items-start gap-3 sm:grid-cols-[12rem_12rem]">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="kwh">Consumo (kWh)</Label>
              <Input
                id="kwh"
                inputMode="decimal"
                value={value.kwh ?? ""}
                onChange={(e) => set("kwh", numOrNull(e.target.value))}
                placeholder="Ej: 450"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="kwh-period">Período de la factura</Label>
              <Select
                value={value.kwh_period}
                onValueChange={(v) => set("kwh_period", v as QuoteRequest["kwh_period"])}
              >
                <SelectTrigger id="kwh-period" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Mensual</SelectItem>
                  <SelectItem value="bimonth">Bimestral</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {value.appliances.length > 0 ? (
              <div className="flex flex-col gap-2">
                <div className="hidden grid-cols-[1fr_6rem_6rem_5rem_2rem] gap-2 px-0.5 text-xs text-muted-foreground sm:grid">
                  <span>Equipo</span>
                  <span>Potencia (W)</span>
                  <span>Horas/día</span>
                  <span>Cantidad</span>
                  <span />
                </div>
                {value.appliances.map((a, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-3 gap-2 rounded-lg border p-2 sm:grid-cols-[1fr_6rem_6rem_5rem_2rem] sm:border-0 sm:p-0"
                  >
                    <Input
                      className="col-span-3 sm:col-span-1"
                      value={a.name}
                      onChange={(e) => setAppliance(i, { name: e.target.value })}
                      placeholder="Equipo"
                      aria-label="Equipo"
                    />
                    <Input
                      inputMode="decimal"
                      value={a.watts || ""}
                      onChange={(e) => setAppliance(i, { watts: numOrNull(e.target.value) ?? 0 })}
                      placeholder="W"
                      aria-label="Potencia (W)"
                    />
                    <Input
                      inputMode="decimal"
                      value={a.hours || ""}
                      onChange={(e) => setAppliance(i, { hours: Math.min(numOrNull(e.target.value) ?? 0, 24) })}
                      placeholder="h/día"
                      aria-label="Horas por día"
                    />
                    <div className="flex items-center gap-1">
                      <Input
                        inputMode="numeric"
                        value={a.qty || ""}
                        onChange={(e) => setAppliance(i, { qty: numOrNull(e.target.value) ?? 0 })}
                        placeholder="Cant."
                        aria-label="Cantidad"
                      />
                      <DeleteIconButton
                        className="sm:hidden"
                        label="Quitar equipo"
                        onClick={() => set("appliances", value.appliances.filter((_, j) => j !== i))}
                      />
                    </div>
                    <DeleteIconButton
                      className="hidden sm:inline-flex"
                      label="Quitar equipo"
                      onClick={() => set("appliances", value.appliances.filter((_, j) => j !== i))}
                    />
                  </div>
                ))}
              </div>
            ) : null}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="outline" size="sm">
                    <Plus data-icon="inline-start" className="text-emerald-600 dark:text-emerald-400" />
                    Agregar equipo
                    <ChevronDown data-icon="inline-end" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-72 p-0">
                  <ScrollArea viewportClassName="max-h-72">
                    <div className="p-1">
                      <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                        Equipos típicos (W × horas/día)
                      </DropdownMenuLabel>
                      {presets.map((p) => (
                        <DropdownMenuItem
                          key={p.id}
                          onSelect={() => addAppliance({ name: p.name, watts: p.watts, hours: p.hours_per_day, qty: 1 })}
                        >
                          <span className="flex-1 truncate">{p.name}</span>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {p.watts} W · {p.hours_per_day} h
                          </span>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={() => addAppliance({ name: "", watts: 0, hours: 0, qty: 1 })}>
                        Otro equipo…
                      </DropdownMenuItem>
                    </div>
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>
              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                <Zap className="size-3.5 text-amber-500" />
                <span className="font-medium text-foreground tabular-nums">
                  {appliancesKwhMonth(value.appliances).toLocaleString("es-AR")}
                </span>
                kWh/mes
              </span>
            </div>
          </div>
        )}
      </div>

      {hasBatteryChoice ? (
        <div className="flex flex-col gap-3 rounded-lg border p-3">
          {value.grid_type === "HYBRID" ? (
            <label className="flex items-center gap-2 text-sm font-medium">
              <Checkbox
                checked={value.battery_wanted}
                onCheckedChange={(checked) => set("battery_wanted", checked === true)}
              />
              Con baterías de respaldo
            </label>
          ) : (
            <span className="text-sm font-medium">Baterías</span>
          )}
          {batteryOn && value.grid_type !== "ON-GRID" && value.grid_type ? (
            <div className="grid items-start gap-3 sm:grid-cols-[12rem_12rem]">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="autonomy">Autonomía (horas)</Label>
                <Input
                  id="autonomy"
                  inputMode="decimal"
                  value={value.autonomy_hours ?? ""}
                  onChange={(e) => set("autonomy_hours", numOrNull(e.target.value))}
                  placeholder={`${DEFAULT_AUTONOMY_HOURS[value.grid_type]} (por defecto)`}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="chemistry">Química</Label>
                <Select
                  value={value.battery_chemistry}
                  onValueChange={(v) => set("battery_chemistry", v as QuoteRequest["battery_chemistry"])}
                >
                  <SelectTrigger id="chemistry" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lifepo4">Litio (LiFePO4)</SelectItem>
                    <SelectItem value="lead">Plomo (AGM/GEL)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <Collapsible open={moreOpen} onOpenChange={setMoreOpen}>
        <CollapsibleTrigger asChild>
          <Button type="button" variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
            <ChevronDown data-icon="inline-start" className={cn("transition-transform", moreOpen && "rotate-180")} />
            Más datos (opcional): localidad, techo, fases, cobertura, tope
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="grid items-start gap-3 pt-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="zone">Localidad (horas sol pico)</Label>
            <Select value={value.zone_id ?? NONE} onValueChange={(v) => set("zone_id", v === NONE ? null : v)}>
              <SelectTrigger id="zone" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Sin indicar (conservador)</SelectItem>
                <SelectGroup>
                  <SelectLabel>Ciudades</SelectLabel>
                  {cities.map((z) => (
                    <SelectItem key={z.id} value={z.id}>
                      {z.name}
                      <span className="text-xs text-muted-foreground"> · {z.province}</span>
                    </SelectItem>
                  ))}
                </SelectGroup>
                {regions.length > 0 ? (
                  <SelectGroup>
                    <SelectLabel>Regiones</SelectLabel>
                    {regions.map((z) => (
                      <SelectItem key={z.id} value={z.id}>
                        {z.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ) : null}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="roof">Techo</Label>
            <Select value={value.roof} onValueChange={(v) => set("roof", v as QuoteRequest["roof"])}>
              <SelectTrigger id="roof" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unknown">No sé / sin indicar</SelectItem>
                <SelectItem value="inclined">Inclinado (~30°)</SelectItem>
                <SelectItem value="flat">Losa plana</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phases">Instalación</Label>
            <Select
              value={value.phases ?? NONE}
              onValueChange={(v) => set("phases", v === NONE ? null : (v as QuoteRequest["phases"]))}
            >
              <SelectTrigger id="phases" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Sin indicar</SelectItem>
                <SelectItem value="mono">Monofásica</SelectItem>
                <SelectItem value="tri">Trifásica</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="coverage">Cobertura del consumo</Label>
            <Select value={String(value.coverage_pct)} onValueChange={(v) => set("coverage_pct", Number(v))}>
              <SelectTrigger id="coverage" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="100">100 % (todo el consumo)</SelectItem>
                <SelectItem value="80">80 %</SelectItem>
                <SelectItem value="60">60 % (reducción de factura)</SelectItem>
                <SelectItem value="50">50 %</SelectItem>
                <SelectItem value="40">40 %</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="budget">Tope de presupuesto (USD)</Label>
            <Input
              id="budget"
              inputMode="decimal"
              value={value.budget_cap_usd ?? ""}
              onChange={(e) => set("budget_cap_usd", numOrNull(e.target.value))}
              placeholder="Sin tope"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

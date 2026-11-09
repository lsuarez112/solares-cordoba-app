"use client"

import * as React from "react"
import { ChevronDown, ClipboardList, Pencil } from "lucide-react"

import { Button } from "~/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible"
import { GRID_TYPE_LABELS } from "~/lib/products/grid-type.utils"
import type { QuoteRequest, SizingResult } from "~/lib/sizing/sizing"
import { cn } from "~/lib/utils"

type StoredInput = Partial<QuoteRequest> & { zone_name?: string | null }

const ROOF_LABEL = { unknown: "Sin indicar", inclined: "Inclinado", flat: "Losa plana" } as const
const num = (v: number | null | undefined, unit: string) => (v == null ? "—" : `${v.toLocaleString("es-AR")} ${unit}`)

function Item({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="truncate text-sm">{value}</dd>
    </div>
  )
}

/** Pedido del cliente y dimensionamiento guardados con el presupuesto (editable en borrador). */
export function QuoteRequestSummary({
  input: rawInput,
  sizing: rawSizing,
  onEdit,
}: {
  input: Record<string, unknown> | null
  sizing: Record<string, unknown> | SizingResult | null
  onEdit?: () => void
}) {
  const input = (rawInput ?? {}) as StoredInput
  const sizing = rawSizing as Partial<SizingResult> | null
  const [open, setOpen] = React.useState(false)

  const hasData = Boolean(input.grid_type || input.request_text || sizing)
  if (!hasData && !onEdit) return null

  const consumption =
    input.consumption_mode === "appliances"
      ? `${input.appliances?.length ?? 0} equipo(s)`
      : input.kwh
        ? `${input.kwh.toLocaleString("es-AR")} kWh ${input.kwh_period === "bimonth" ? "bimestrales" : "mensuales"}`
        : "—"

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="rounded-lg border">
      <div className="flex items-center gap-1 pr-2">
        <CollapsibleTrigger className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2.5 text-left text-sm font-medium">
          <ClipboardList className="size-4 shrink-0 text-muted-foreground" />
          <span className="shrink-0">Pedido y dimensionamiento</span>
          {sizing?.target_kwp != null ? (
            <span className="truncate font-normal text-muted-foreground">
              · {num(sizing.target_kwp, "kWp")}
              {sizing.battery_kwh ? ` · ${num(sizing.battery_kwh, "kWh")} de batería` : ""}
            </span>
          ) : !hasData ? (
            <span className="truncate font-normal text-muted-foreground">· sin cargar</span>
          ) : null}
          <ChevronDown className={cn("ml-auto size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
        </CollapsibleTrigger>
        {onEdit ? (
          <Button type="button" variant="ghost" size="sm" onClick={onEdit}>
            <Pencil data-icon="inline-start" className="text-sky-600 dark:text-sky-400" />
            Editar
          </Button>
        ) : null}
      </div>
      <CollapsibleContent className="flex flex-col gap-3 border-t px-3 py-3">
        {input.request_text ? (
          <p className="rounded-md bg-muted/40 p-2 text-sm whitespace-pre-line">{input.request_text}</p>
        ) : null}
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Item label="Sistema" value={input.grid_type ? GRID_TYPE_LABELS[input.grid_type] : "—"} />
          <Item label="Consumo" value={consumption} />
          <Item label="Localidad" value={input.zone_name ?? "Sin indicar"} />
          <Item label="Techo" value={ROOF_LABEL[input.roof ?? "unknown"]} />
          {sizing ? (
            <>
              <Item label="Consumo mensual" value={num(sizing.kwh_month, "kWh")} />
              <Item label="Potencia necesaria" value={num(sizing.target_kwp, "kWp")} />
              <Item label="HSP" value={num(sizing.hsp, "h")} />
              <Item label="Batería" value={sizing.battery_kwh ? num(sizing.battery_kwh, "kWh") : "—"} />
            </>
          ) : null}
          {input.budget_cap_usd ? <Item label="Tope" value={`USD ${input.budget_cap_usd.toLocaleString("es-AR")}`} /> : null}
          {input.coverage_pct && input.coverage_pct < 100 ? (
            <Item label="Cobertura" value={`${input.coverage_pct} %`} />
          ) : null}
        </dl>
        {input.consumption_mode === "appliances" && input.appliances?.length ? (
          <ul className="text-xs text-muted-foreground">
            {input.appliances.map((a, i) => (
              <li key={i}>
                {a.qty} × {a.name || "Equipo"} — {a.watts} W × {a.hours} h/día
              </li>
            ))}
          </ul>
        ) : null}
      </CollapsibleContent>
    </Collapsible>
  )
}

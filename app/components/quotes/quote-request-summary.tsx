"use client"

import * as React from "react"
import { ChevronDown, ClipboardList } from "lucide-react"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible"
import type { Quote } from "~/domain/quotes/quotes.schemas"
import { GRID_TYPE_LABELS } from "~/lib/products/grid-type.utils"
import type { QuoteRequest, SizingResult } from "~/lib/sizing/sizing"
import { cn } from "~/lib/utils"

type StoredInput = Partial<QuoteRequest> & { zone_name?: string | null }

const ROOF_LABEL = { unknown: "Sin indicar", inclined: "Inclinado", flat: "Losa plana" } as const

function Item({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="truncate text-sm">{value}</dd>
    </div>
  )
}

/** Pedido del cliente y dimensionamiento guardados con el presupuesto. */
export function QuoteRequestSummary({ quote }: { quote: Quote }) {
  const input = (quote.input ?? {}) as StoredInput
  const sizing = quote.sizing as Partial<SizingResult> | null
  const [open, setOpen] = React.useState(false)

  const hasData = Boolean(input.grid_type || input.request_text || sizing)
  if (!hasData) return null

  const consumption =
    input.consumption_mode === "appliances"
      ? `${input.appliances?.length ?? 0} equipo(s)`
      : input.kwh
        ? `${input.kwh} kWh ${input.kwh_period === "bimonth" ? "bimestrales" : "mensuales"}`
        : "—"

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="rounded-lg border">
      <CollapsibleTrigger className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium">
        <ClipboardList className="size-4 text-muted-foreground" />
        Pedido y dimensionamiento
        {sizing?.target_kwp != null ? (
          <span className="font-normal text-muted-foreground">
            · {sizing.target_kwp} kWp
            {sizing.battery_kwh ? ` · ${sizing.battery_kwh} kWh de batería` : ""}
          </span>
        ) : null}
        <ChevronDown className={cn("ml-auto size-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </CollapsibleTrigger>
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
              <Item label="Consumo mensual" value={`${sizing.kwh_month ?? "—"} kWh`} />
              <Item label="Potencia necesaria" value={`${sizing.target_kwp ?? "—"} kWp`} />
              <Item label="HSP" value={`${sizing.hsp ?? "—"} h`} />
              <Item label="Batería" value={sizing.battery_kwh ? `${sizing.battery_kwh} kWh` : "—"} />
            </>
          ) : null}
          {input.budget_cap_usd ? <Item label="Tope" value={`USD ${input.budget_cap_usd}`} /> : null}
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

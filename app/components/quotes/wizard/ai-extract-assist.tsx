"use client"

import { AlertTriangle, Info, Sparkles } from "lucide-react"

import { Button } from "~/components/ui/button"
import { Spinner } from "~/components/ui/spinner"
import { formatAiUsd, type AiExtractResult } from "~/domain/ai/ai.schemas"
import { GRID_TYPE_LABELS } from "~/lib/products/grid-type.utils"

/** Resumen corto de lo que encontró la IA (para confirmar de un vistazo). */
export function extractSummary(r: AiExtractResult): string {
  const parts: string[] = []
  if (r.grid_type) parts.push(GRID_TYPE_LABELS[r.grid_type])
  if (r.kwh) parts.push(`${r.kwh.toLocaleString("es-AR")} kWh ${r.kwh_period === "bimonth" ? "bimestrales" : "mensuales"}`)
  else if (r.appliances.length) parts.push(`${r.appliances.length} equipo(s)`)
  if (r.battery_wanted) parts.push(r.autonomy_hours ? `batería ${r.autonomy_hours} h` : "con batería")
  if (r.phases) parts.push(r.phases === "tri" ? "trifásico" : "monofásico")
  if (r.zone_name ?? r.city) parts.push(r.zone_name ?? r.city!)
  if (r.budget_cap_usd) parts.push(`tope USD ${r.budget_cap_usd.toLocaleString("es-AR")}`)
  return parts.join(" · ") || "No encontró datos para dimensionar"
}

/** Botón "Interpretar con IA" bajo el texto del cliente + resultado. */
export function AiExtractAssist({
  text,
  enabled,
  busy,
  result,
  onRun,
}: {
  text: string
  enabled: boolean
  busy: boolean
  result: AiExtractResult | null
  onRun: () => void
}) {
  if (!enabled) return null
  const tooShort = text.trim().length < 5

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" variant="outline" disabled={tooShort || busy} onClick={onRun}>
          {busy ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <Sparkles data-icon="inline-start" className="text-violet-600 dark:text-violet-400" />
          )}
          {busy ? "Interpretando…" : "Interpretar con IA"}
        </Button>
        <span className="text-xs text-muted-foreground">
          {tooShort ? "Pegá el pedido para que la IA complete el formulario." : "Completa el formulario; revisalo antes de seguir."}
        </span>
      </div>

      {result ? (
        <div className="flex flex-col gap-1.5 rounded-md border border-violet-200 bg-violet-50/60 p-2.5 text-sm dark:border-violet-900 dark:bg-violet-950/30">
          <p className="flex items-start gap-1.5">
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-violet-600 dark:text-violet-400" />
            <span>
              <span className="font-medium">{extractSummary(result)}</span>
              <span className="ml-1.5 text-xs text-muted-foreground">({formatAiUsd(result.cost_usd)})</span>
            </span>
          </p>
          {result.missing_info.map((m) => (
            <p key={m} className="flex items-start gap-1.5 text-xs text-amber-800 dark:text-amber-300">
              <AlertTriangle className="mt-0.5 size-3 shrink-0" />
              Falta: {m}
            </p>
          ))}
          {result.notes.map((n) => (
            <p key={n} className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <Info className="mt-0.5 size-3 shrink-0" />
              {n}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  )
}

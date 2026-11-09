"use client"

import * as React from "react"
import { AlertTriangle, Battery, Bot, Check, PackageOpen, Sparkles, Sun } from "lucide-react"

import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import { Label } from "~/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Skeleton } from "~/components/ui/skeleton"
import { Spinner } from "~/components/ui/spinner"
import { formatAiUsd, type AiSelectResult } from "~/domain/ai/ai.schemas"
import type { Kit, KitOption } from "~/domain/kits/kits.schemas"
import type { KitCandidate } from "~/domain/quotes/quotes.schemas"
import { GRID_TYPE_LABELS } from "~/lib/products/grid-type.utils"
import { formatUsd } from "~/lib/quotes/quote-totals"
import { coverageBand, estimatedGeneration, type SizingResult } from "~/lib/sizing/sizing"
import { cn } from "~/lib/utils"
import { kitsService } from "~/services/kits.service"

export type KitChoice = { kitId: string | null; optionCodes: string[] }

const BAND_CLASS = {
  under: "text-amber-700 dark:text-amber-400",
  optimal: "text-emerald-700 dark:text-emerald-400",
  over: "text-sky-700 dark:text-sky-400",
  high: "text-amber-700 dark:text-amber-400",
} as const

const OPTION_KIND_LABEL: Record<KitOption["kind"], string> = {
  autonomy: "Autonomía",
  generation: "Generación",
  extra: "Extra",
}

type KitChoiceStepProps = {
  sizing: SizingResult
  candidates: KitCandidate[] | null
  kits: Kit[]
  budgetCap: number | null
  value: KitChoice
  onChange: (next: KitChoice) => void
  /** Sugerencia con IA entre los candidatos (si está habilitada). */
  ai?: { enabled: boolean; busy: boolean; result: AiSelectResult | null; onAsk: () => void }
}

/** Resumen del dimensionamiento + candidatos de la base (sin IA) + elección manual. */
export function KitChoiceStep({ sizing, candidates, kits, budgetCap, value, onChange, ai }: KitChoiceStepProps) {
  const [options, setOptions] = React.useState<KitOption[] | null>(null)

  React.useEffect(() => {
    if (!value.kitId) {
      setOptions([])
      return
    }
    let cancelled = false
    setOptions(null)
    kitsService
      .getDetail(value.kitId)
      .then((d) => !cancelled && setOptions(d.options))
      .catch(() => !cancelled && setOptions([]))
    return () => {
      cancelled = true
    }
  }, [value.kitId])

  const candidateIds = new Set(candidates?.map((c) => c.kit_id) ?? [])
  const others = kits.filter((k) => k.active && !candidateIds.has(k.id))
  const selectedKit = kits.find((k) => k.id === value.kitId) ?? null

  const coverage = (kwp: number) =>
    Math.round((estimatedGeneration(kwp, sizing.hsp, sizing.efficiency) / sizing.kwh_month) * 100)

  const toggleOption = (code: string, checked: boolean) =>
    onChange({
      ...value,
      optionCodes: checked ? [...value.optionCodes, code] : value.optionCodes.filter((c) => c !== code),
    })

  return (
    <div className="flex flex-col gap-5">
      {/* Dimensionamiento */}
      <div className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/30 p-3 text-sm sm:grid-cols-4">
        <div>
          <p className="text-xs text-muted-foreground">Consumo</p>
          <p className="font-medium tabular-nums">{sizing.kwh_month.toLocaleString("es-AR")} kWh/mes</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Potencia necesaria</p>
          <p className="font-medium tabular-nums">{sizing.target_kwp.toLocaleString("es-AR")} kWp</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Horas sol pico</p>
          <p className="font-medium tabular-nums">{sizing.hsp.toLocaleString("es-AR")} h</p>
          <p className="truncate text-[11px] text-muted-foreground">{sizing.hsp_source}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Batería</p>
          <p className="font-medium tabular-nums">
            {sizing.battery_kwh != null ? `${sizing.battery_kwh.toLocaleString("es-AR")} kWh` : "—"}
          </p>
          {sizing.autonomy_hours ? (
            <p className="text-[11px] text-muted-foreground">{sizing.autonomy_hours} h de autonomía</p>
          ) : null}
        </div>
        {sizing.warnings.length > 0 ? (
          <ul className="col-span-full flex flex-col gap-0.5 border-t pt-2 text-xs text-muted-foreground">
            {sizing.warnings.map((w) => (
              <li key={w} className="flex gap-1.5">
                <AlertTriangle className="mt-0.5 size-3 shrink-0 text-amber-500" />
                {w}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {/* Candidatos */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-medium">Kits sugeridos</h3>
          {ai?.enabled && candidates && candidates.length > 1 ? (
            <Button type="button" size="sm" variant="outline" disabled={ai.busy} onClick={ai.onAsk}>
              {ai.busy ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <Sparkles data-icon="inline-start" className="text-violet-600 dark:text-violet-400" />
              )}
              {ai.busy ? "Consultando…" : ai.result ? "Volver a consultar" : "Pedir sugerencia a la IA"}
            </Button>
          ) : null}
        </div>
        {ai?.result ? <AiSuggestionNote result={ai.result} kitName={kits.find((k) => k.id === ai.result?.kit_id)?.name ?? null} /> : null}
        {candidates === null ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        ) : candidates.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            No hay kits activos de este tipo. Elegí otro abajo o cargá los ítems a mano.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {candidates.map((c, index) => {
              const active = value.kitId === c.kit_id
              const cov = coverage(c.kwp)
              const overBudget = budgetCap != null && c.total_usd > budgetCap
              return (
                <li key={c.kit_id}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => onChange({ kitId: c.kit_id, optionCodes: [] })}
                    className={cn(
                      "flex w-full flex-col gap-2 rounded-lg border p-3 text-left transition-colors hover:bg-muted/40",
                      active && "border-primary bg-primary/5 ring-1 ring-primary",
                    )}
                  >
                    <div className="flex w-full items-start gap-2">
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="flex flex-wrap items-center gap-1.5">
                          <span className="font-mono text-xs text-muted-foreground">{c.code}</span>
                          {index === 0 && c.within_tolerance ? (
                            <Badge className="h-5 bg-emerald-600 px-1.5 text-white hover:bg-emerald-600">
                              <Sparkles data-icon="inline-start" />
                              Recomendado
                            </Badge>
                          ) : null}
                          {ai?.result?.kit_id === c.kit_id && ai.result.source === "ai" ? (
                            <Badge className="h-5 bg-violet-600 px-1.5 text-white hover:bg-violet-600">
                              <Bot data-icon="inline-start" />
                              Elegido por IA
                            </Badge>
                          ) : null}
                          {c.phases === "tri" ? (
                            <Badge variant="outline" className="h-5 px-1.5">Trifásico</Badge>
                          ) : null}
                        </span>
                        <span className="truncate text-sm font-medium">{c.name}</span>
                      </span>
                      <span className="flex shrink-0 flex-col items-end">
                        <span className="font-mono text-sm font-semibold tabular-nums">USD {formatUsd(c.total_usd)}</span>
                        <span className="text-[11px] text-muted-foreground">sin IVA</span>
                      </span>
                      {active ? <Check className="mt-0.5 size-4 shrink-0 text-primary" /> : null}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Sun className="size-3.5 text-amber-500" />
                        {c.kwp.toLocaleString("es-AR")} kWp
                        {c.kwp_diff_pct != null ? (
                          <span className={c.within_tolerance ? "" : "text-amber-700 dark:text-amber-400"}>
                            ({c.kwp_diff_pct > 0 ? "+" : ""}
                            {c.kwp_diff_pct.toLocaleString("es-AR")} %)
                          </span>
                        ) : null}
                      </span>
                      <span className={BAND_CLASS[coverageBand(cov)]}>Cubre ~{cov} %</span>
                      {c.battery_kwh > 0 ? (
                        <span className="inline-flex items-center gap-1">
                          <Battery className="size-3.5 text-emerald-600" />
                          {c.battery_kwh.toLocaleString("es-AR")} kWh
                        </span>
                      ) : null}
                      {c.items_without_price > 0 ? (
                        <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400">
                          <AlertTriangle className="size-3.5" />
                          {c.items_without_price} sin precio
                        </span>
                      ) : null}
                      {overBudget ? (
                        <span className="text-amber-700 dark:text-amber-400">Supera el tope</span>
                      ) : null}
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Elección manual */}
      <div className="grid items-start gap-3 sm:grid-cols-[1fr_auto]">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="other-kit">Otro kit</Label>
          <Select
            value={value.kitId && !candidateIds.has(value.kitId) ? value.kitId : "__none__"}
            onValueChange={(v) => v !== "__none__" && onChange({ kitId: v, optionCodes: [] })}
          >
            <SelectTrigger id="other-kit" className="w-full">
              <SelectValue placeholder="Elegir de todos los kits activos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__" disabled>
                Elegir de todos los kits activos
              </SelectItem>
              {others.map((k) => (
                <SelectItem key={k.id} value={k.id}>
                  <span className="font-mono text-xs">{k.code}</span> · {k.name} ·{" "}
                  {GRID_TYPE_LABELS[k.grid_type]} {k.kwp} kWp
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <button
          type="button"
          aria-pressed={value.kitId === null}
          onClick={() => onChange({ kitId: null, optionCodes: [] })}
          className={cn(
            "flex h-9 items-center gap-2 self-end rounded-md border px-3 text-sm hover:bg-muted/40",
            value.kitId === null && "border-primary bg-primary/5 ring-1 ring-primary",
          )}
        >
          <PackageOpen className="size-4 text-muted-foreground" />
          Sin kit (ítems a mano)
        </button>
      </div>

      {/* Opcionales del kit elegido */}
      {selectedKit ? (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">Opcionales de {selectedKit.code}</h3>
          {options === null ? (
            <Skeleton className="h-16" />
          ) : options.length === 0 ? (
            <p className="text-xs text-muted-foreground">Este kit no tiene opcionales.</p>
          ) : (
            <ul className="flex flex-col divide-y rounded-lg border">
              {options.map((o) => (
                <li key={o.code}>
                  <label className="flex cursor-pointer items-start gap-3 px-3 py-2 hover:bg-muted/40">
                    <Checkbox
                      className="mt-0.5"
                      checked={value.optionCodes.includes(o.code)}
                      onCheckedChange={(checked) => toggleOption(o.code, checked === true)}
                    />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="text-sm">
                        <span className="font-mono text-xs text-muted-foreground">{o.code}</span> {o.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {OPTION_KIND_LABEL[o.kind]}
                        {o.kwp != null ? ` · ${o.kwp} kWp` : ""}
                        {o.battery_kwh != null ? ` · ${o.battery_kwh} kWh` : ""}
                        {o.notes ? ` · ${o.notes}` : ""}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  )
}

function AiSuggestionNote({ result, kitName }: { result: AiSelectResult; kitName: string | null }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-md border border-violet-200 bg-violet-50/60 p-2.5 text-sm dark:border-violet-900 dark:bg-violet-950/30">
      <p className="flex items-start gap-1.5">
        <Sparkles className="mt-0.5 size-3.5 shrink-0 text-violet-600 dark:text-violet-400" />
        <span>
          {result.source === "rule" ? (
            <span className="font-medium">Sugerencia directa (sin IA): </span>
          ) : kitName ? (
            <span className="font-medium">{kitName}: </span>
          ) : (
            <span className="font-medium">Ningún candidato encaja: </span>
          )}
          {result.reason}
          {result.cost_usd ? (
            <span className="ml-1.5 text-xs text-muted-foreground">({formatAiUsd(result.cost_usd)})</span>
          ) : null}
        </span>
      </p>
      {result.warnings.map((w) => (
        <p key={w} className="flex items-start gap-1.5 text-xs text-amber-800 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 size-3 shrink-0" />
          {w}
        </p>
      ))}
      {result.missing_info.length > 0 ? (
        <p className="text-xs text-muted-foreground">Conviene confirmar: {result.missing_info.join("; ")}.</p>
      ) : null}
    </div>
  )
}

"use client"

import * as React from "react"
import { AlertTriangle, ArrowRight, Battery, RotateCcw, Sparkles, Sun, Zap } from "lucide-react"

import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogScrollableContent,
  DialogTitle,
} from "~/components/ui/dialog"
import { HintTooltip } from "~/components/ui/hint-tooltip"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Spinner } from "~/components/ui/spinner"
import { Textarea } from "~/components/ui/textarea"
import { formatAiUsd, type AiKitDraft } from "~/domain/ai/ai.schemas"
import type { GridType } from "~/domain/products/products.schemas"
import { GRID_TYPE_LABELS } from "~/lib/products/grid-type.utils"
import { formatUsd } from "~/lib/quotes/quote-totals"
import { appToast } from "~/lib/toast"
import { cn } from "~/lib/utils"
import { aiService } from "~/services/ai.service"

const GRID_HINTS: Record<GridType, string> = {
  "ON-GRID": "Sin baterías",
  HYBRID: "Red + baterías",
  "OFF-GRID": "Aislado",
}

const numOrNull = (value: string): number | null => {
  const n = Number(value.replace(",", "."))
  return value.trim() === "" || !Number.isFinite(n) ? null : n
}

/** Kits → Crear con IA: describe el kit, la IA lo arma con el catálogo y se abre en el editor. */
export function KitAiDialog({
  open,
  onOpenChange,
  onUse,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUse: (draft: AiKitDraft) => void
}) {
  const [gridType, setGridType] = React.useState<GridType | null>(null)
  const [phases, setPhases] = React.useState<"any" | "mono" | "tri">("any")
  const [kwp, setKwp] = React.useState("")
  const [battery, setBattery] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  const [draft, setDraft] = React.useState<AiKitDraft | null>(null)

  const canRun = Boolean(gridType) && description.trim().length >= 5 && !busy

  const run = async () => {
    if (!gridType) return
    setBusy(true)
    try {
      setDraft(
        await aiService.buildKit({
          grid_type: gridType,
          phases: phases === "any" ? null : phases,
          kwp: numOrNull(kwp),
          battery_kwh: gridType === "ON-GRID" ? null : numOrNull(battery),
          description: description.trim(),
        }),
      )
    } catch (error) {
      appToast.error("La IA no pudo armar el kit", {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setBusy(false)
    }
  }

  const total = draft ? draft.items.reduce((s, i) => s + i.qty * i.price_usd, 0) : 0
  const withoutPrice = draft ? draft.items.filter((i) => !(i.price_usd > 0)).length : 0

  return (
    <Dialog open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <DialogContent className="flex max-h-[90svh] flex-col gap-0 p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-4 py-4">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-violet-600 dark:text-violet-400" />
            Crear kit con IA
          </DialogTitle>
          <DialogDescription>
            La IA lo arma con productos del catálogo, siguiendo los kits existentes y las reglas de armado. Después lo
            revisás en el editor. Cada armado cuesta alrededor de USD 0,07.
          </DialogDescription>
        </DialogHeader>

        <DialogScrollableContent fill className="flex flex-col gap-4">
          {!draft ? (
            <>
              <fieldset className="flex flex-col gap-2" disabled={busy}>
                <legend className="mb-2 text-sm font-medium">Tipo de sistema *</legend>
                <div className="grid grid-cols-3 gap-2">
                  {(["ON-GRID", "HYBRID", "OFF-GRID"] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      aria-pressed={gridType === g}
                      onClick={() => setGridType(g)}
                      className={cn(
                        "flex flex-col items-start rounded-lg border px-3 py-2 text-left transition-colors hover:bg-muted/50",
                        gridType === g && "border-primary bg-primary/5 ring-1 ring-primary",
                      )}
                    >
                      <span className="text-sm font-medium">{GRID_TYPE_LABELS[g]}</span>
                      <span className="text-xs text-muted-foreground">{GRID_HINTS[g]}</span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ai-kit-phases">Fases</Label>
                  <Select value={phases} onValueChange={(v) => setPhases(v as typeof phases)} disabled={busy}>
                    <SelectTrigger id="ai-kit-phases" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Que elija la IA</SelectItem>
                      <SelectItem value="mono">Monofásico</SelectItem>
                      <SelectItem value="tri">Trifásico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ai-kit-kwp">Potencia (kWp)</Label>
                  <Input
                    id="ai-kit-kwp"
                    inputMode="decimal"
                    placeholder="Opcional"
                    disabled={busy}
                    value={kwp}
                    onChange={(e) => setKwp(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ai-kit-battery">Batería (kWh)</Label>
                  <Input
                    id="ai-kit-battery"
                    inputMode="decimal"
                    placeholder={gridType === "ON-GRID" ? "No lleva" : "Opcional"}
                    disabled={busy || gridType === "ON-GRID"}
                    value={gridType === "ON-GRID" ? "" : battery}
                    onChange={(e) => setBattery(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ai-kit-description">Descripción *</Label>
                <Textarea
                  id="ai-kit-description"
                  rows={4}
                  disabled={busy}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ej.: kit híbrido Growatt de 5 kW con baterías de litio de 10 kWh, paneles de alta potencia, techo de chapa."
                />
                <p className="text-xs text-muted-foreground">
                  Marca, inversor, tipo de batería, techo, uso (casa, comercio, campo)… cuanto más precisa, mejor.
                </p>
              </div>
            </>
          ) : (
            <KitDraftPreview draft={draft} total={total} withoutPrice={withoutPrice} />
          )}
        </DialogScrollableContent>

        <DialogFooter className="border-t px-4 py-3">
          {draft ? (
            <>
              <Button type="button" variant="outline" onClick={() => setDraft(null)}>
                <RotateCcw data-icon="inline-start" />
                Cambiar el pedido
              </Button>
              <Button type="button" onClick={() => onUse(draft)} disabled={draft.items.length === 0}>
                Abrir en el editor
                <ArrowRight data-icon="inline-end" />
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="outline" disabled={busy} onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="button" disabled={!canRun} onClick={() => void run()}>
                {busy ? <Spinner data-icon="inline-start" /> : <Sparkles data-icon="inline-start" />}
                {busy ? "Armando el kit… (~20 s)" : "Armar kit"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function KitDraftPreview({ draft, total, withoutPrice }: { draft: AiKitDraft; total: number; withoutPrice: number }) {
  const k = draft.kit
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <span className="font-mono text-xs text-muted-foreground">{k.code}</span>
        <span className="text-base font-semibold">{k.name}</span>
        <span className="text-sm text-muted-foreground">{k.description}</span>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <span className="inline-flex items-center gap-1">
            <Sun className="size-3.5 text-amber-500" />
            {k.kwp.toLocaleString("es-AR")} kWp
          </span>
          {k.battery_kwh > 0 ? (
            <span className="inline-flex items-center gap-1">
              <Battery className="size-3.5 text-emerald-600" />
              {k.battery_kwh.toLocaleString("es-AR")} kWh
            </span>
          ) : null}
          {k.inverter_kw ? (
            <span className="inline-flex items-center gap-1">
              <Zap className="size-3.5 text-sky-600" />
              Inversor {k.inverter_kw.toLocaleString("es-AR")} kW
            </span>
          ) : null}
          <span className="text-muted-foreground">
            {GRID_TYPE_LABELS[k.grid_type]} · {k.phases === "tri" ? "Trifásico" : "Monofásico"}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-medium">{draft.items.length} productos</span>
          <span className="font-mono text-xs tabular-nums">
            USD {formatUsd(total)}
            {withoutPrice ? <span className="text-amber-700 dark:text-amber-400"> · {withoutPrice} sin precio</span> : null}
          </span>
        </div>
        <ul className="flex flex-col divide-y rounded-lg border text-sm">
          {draft.items.map((i) => (
            <li key={i.product_code} className="flex items-start gap-3 px-3 py-1.5">
              <span className="w-10 shrink-0 text-right font-mono tabular-nums">{i.qty.toLocaleString("es-AR")}×</span>
              <span className="flex min-w-0 flex-1 flex-col">
                <HintTooltip content={i.name}>
                  <span className="truncate">{i.name}</span>
                </HintTooltip>
                <span className="truncate text-xs text-muted-foreground">
                  <span className="font-mono">{i.product_code}</span>
                  {i.category ? ` · ${i.category}` : ""} · {i.reason}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {draft.warnings.length ? (
        <div className="flex flex-col gap-1 rounded-md border border-amber-200 bg-amber-50/60 p-2.5 dark:border-amber-900 dark:bg-amber-950/30">
          {draft.warnings.map((w, i) => (
            <p key={i} className="flex items-start gap-1.5 text-xs text-amber-900 dark:text-amber-200">
              <AlertTriangle className="mt-0.5 size-3 shrink-0" />
              {w}
            </p>
          ))}
        </div>
      ) : null}
      <p className="text-xs text-muted-foreground">Costo de este armado: {formatAiUsd(draft.cost_usd)}</p>
    </div>
  )
}

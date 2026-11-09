"use client"

import * as React from "react"
import { AlertTriangle, Save } from "lucide-react"

import { QuoteRequestForm } from "~/components/quotes/wizard/quote-request-form"
import { Alert, AlertDescription } from "~/components/ui/alert"
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
import { Skeleton } from "~/components/ui/skeleton"
import type { GridType } from "~/domain/products/products.schemas"
import type { AppliancePreset, SolarZone } from "~/domain/quotes/quotes.schemas"
import type { AppSettings } from "~/domain/settings/settings.schemas"
import { GRID_TYPE_LABELS } from "~/lib/products/grid-type.utils"
import {
  computeSizing,
  emptyQuoteRequest,
  missingMinimums,
  sizingParamsFromSettings,
  type QuoteRequest,
  type SizingResult,
} from "~/lib/sizing/sizing"
import { appToast } from "~/lib/toast"
import { quotesService } from "~/services/quotes.service"
import { settingsService } from "~/services/settings.service"

export type StoredQuoteInput = QuoteRequest & { zone_name?: string | null }

export type QuoteRequestEdit = {
  input: StoredQuoteInput
  sizing: SizingResult | null
  grid_type: GridType | null
}

type Refs = { zones: SolarZone[]; presets: AppliancePreset[]; settings: AppSettings }

/** Pedido guardado → formulario (completa con los valores por defecto lo que falte). */
export function storedToRequest(input: Record<string, unknown> | null | undefined, gridType: GridType | null): QuoteRequest {
  const stored = (input ?? {}) as Partial<QuoteRequest>
  return { ...emptyQuoteRequest, ...stored, grid_type: stored.grid_type ?? gridType }
}

/** Edita lo declarado del pedido en un borrador y recalcula el dimensionamiento. */
export function QuoteRequestEditDialog({
  open,
  onOpenChange,
  initial,
  kitGridType,
  onApply,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  initial: QuoteRequest
  /** Tipo del kit cargado, para avisar si el pedido pasa a otro tipo. */
  kitGridType: GridType | null
  onApply: (edit: QuoteRequestEdit) => void
}) {
  const [refs, setRefs] = React.useState<Refs | null>(null)
  const [request, setRequest] = React.useState<QuoteRequest>(initial)

  React.useEffect(() => {
    if (!open) return
    setRequest(initial)
    if (refs) return
    Promise.all([quotesService.solarZones(), quotesService.appliancePresets(), settingsService.get()])
      .then(([zones, presets, settings]) => setRefs({ zones, presets, settings }))
      .catch(() => appToast.error("No se pudieron cargar las localidades y equipos"))
    // initial se toma al abrir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const zone = refs?.zones.find((z) => z.id === request.zone_id) ?? null
  const sizing = refs ? computeSizing(request, sizingParamsFromSettings(refs.settings), zone) : null
  const missing = missingMinimums(request)
  const gridChanged = kitGridType != null && request.grid_type != null && request.grid_type !== kitGridType

  const apply = () => {
    onApply({
      input: { ...request, zone_name: zone?.name ?? null },
      sizing,
      grid_type: request.grid_type,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90svh] flex-col gap-0 p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-4 py-4">
          <DialogTitle>Pedido y dimensionamiento</DialogTitle>
          <DialogDescription>
            Corregí lo que declaró el cliente. Los ítems no cambian: si cambia la potencia, ajustalos a mano.
          </DialogDescription>
        </DialogHeader>
        <DialogScrollableContent fill className="flex flex-col gap-4">
          {!refs ? (
            <Skeleton className="h-64" />
          ) : (
            <>
              <QuoteRequestForm value={request} onChange={setRequest} zones={refs.zones} presets={refs.presets} />
              {sizing ? (
                <p className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
                  Potencia necesaria{" "}
                  <span className="font-medium tabular-nums">{sizing.target_kwp.toLocaleString("es-AR")} kWp</span>
                  {sizing.battery_kwh != null ? (
                    <>
                      {" · "}batería{" "}
                      <span className="font-medium tabular-nums">{sizing.battery_kwh.toLocaleString("es-AR")} kWh</span>
                    </>
                  ) : null}
                  <span className="text-muted-foreground"> · HSP {sizing.hsp.toLocaleString("es-AR")} h ({sizing.hsp_source})</span>
                </p>
              ) : null}
              {missing.length > 0 ? (
                <p className="text-xs text-muted-foreground">
                  Sin dimensionamiento: falta {missing.join(" y ").toLowerCase()}.
                </p>
              ) : null}
              {gridChanged && request.grid_type ? (
                <Alert className="border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                  <AlertTriangle className="text-amber-600" />
                  <AlertDescription className="text-amber-900/90 dark:text-amber-200/90">
                    El kit cargado es {GRID_TYPE_LABELS[kitGridType]}; el pedido pasa a {GRID_TYPE_LABELS[request.grid_type]}.
                    Revisá los ítems.
                  </AlertDescription>
                </Alert>
              ) : null}
            </>
          )}
        </DialogScrollableContent>
        <DialogFooter className="border-t px-4 py-3">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" disabled={!refs} onClick={apply}>
            <Save data-icon="inline-start" />
            Aplicar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

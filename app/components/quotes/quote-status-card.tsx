"use client"

import * as React from "react"
import { ArrowRight, Undo2 } from "lucide-react"

import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Label } from "~/components/ui/label"
import { Spinner } from "~/components/ui/spinner"
import { StatusIcon } from "~/components/ui/status-indicator"
import { Textarea } from "~/components/ui/textarea"
import type { QuoteStatus, QuoteStatusEvent } from "~/domain/quotes/quotes.schemas"
import { formatDateTime } from "~/lib/dates"
import {
  QUOTE_FLOW,
  QUOTE_STATUS_ACTIONS,
  QUOTE_STATUS_LABELS,
  nextStatus,
  prevStatus,
} from "~/lib/quotes/quote-status"
import { appToast } from "~/lib/toast"
import { cn } from "~/lib/utils"
import { quotesService } from "~/services/quotes.service"

const FORWARD_TITLES: Partial<Record<QuoteStatus, string>> = {
  confirmed: "¿El cliente confirmó el presupuesto?",
  to_invoice: "¿Pasar a facturar?",
  invoiced: "¿Ya se facturó?",
}

/**
 * Estado comercial de un presupuesto emitido: pasos del flujo, botón para
 * avanzar (con nota opcional), volver un paso e historial de cambios.
 */
export function QuoteStatusCard({
  quoteId,
  status,
  isCurrent,
  canUpdate,
  onChanged,
}: {
  quoteId: string
  status: QuoteStatus
  isCurrent: boolean
  canUpdate: boolean
  onChanged: () => void | Promise<void>
}) {
  const [history, setHistory] = React.useState<QuoteStatusEvent[] | null>(null)
  const [target, setTarget] = React.useState<QuoteStatus | null>(null)
  const [note, setNote] = React.useState("")
  const [busy, setBusy] = React.useState(false)

  const loadHistory = React.useCallback(() => {
    quotesService.statusHistory(quoteId).then(setHistory).catch(() => setHistory([]))
  }, [quoteId])
  React.useEffect(loadHistory, [loadHistory])

  const next = nextStatus(status)
  const prev = prevStatus(status)
  const editable = canUpdate && isCurrent
  const currentIndex = QUOTE_FLOW.indexOf(status as (typeof QUOTE_FLOW)[number])

  const apply = async () => {
    if (!target) return
    setBusy(true)
    try {
      await quotesService.setStatus(quoteId, target, note)
      appToast.success(`Presupuesto ${QUOTE_STATUS_LABELS[target].toLowerCase()}`)
      setTarget(null)
      setNote("")
      loadHistory()
      await onChanged()
    } catch (error) {
      appToast.error("No se pudo cambiar el estado", {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setBusy(false)
    }
  }

  const goingBack = target != null && target === prev

  return (
    <Card className="gap-3 py-3">
      <CardHeader className="px-4">
        <CardTitle className="flex items-center gap-1.5 text-sm">
          <StatusIcon status={status} className="size-4" />
          {QUOTE_STATUS_LABELS[status]}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-4">
        {/* Pasos del flujo */}
        <ol className="grid grid-cols-4 gap-1" aria-label="Flujo del presupuesto">
          {QUOTE_FLOW.map((s, i) => (
            <li key={s} className="flex flex-col gap-1" aria-current={s === status ? "step" : undefined}>
              <span
                className={cn(
                  "h-1.5 rounded-full bg-muted",
                  i <= currentIndex && "bg-primary/70",
                  i === currentIndex && "bg-primary",
                )}
              />
              <span
                className={cn(
                  "truncate text-[11px] text-muted-foreground",
                  i === currentIndex && "font-medium text-foreground",
                )}
              >
                {QUOTE_STATUS_LABELS[s]}
              </span>
            </li>
          ))}
        </ol>

        {!isCurrent ? (
          <p className="text-xs text-muted-foreground">Es una revisión reemplazada: el estado se sigue en la vigente.</p>
        ) : editable ? (
          <div className="flex flex-col gap-1.5">
            {next ? (
              <Button size="sm" className="w-full" onClick={() => setTarget(next)}>
                <StatusIcon status={next} className="text-current" />
                {QUOTE_STATUS_ACTIONS[next]}
                <ArrowRight data-icon="inline-end" />
              </Button>
            ) : null}
            {prev ? (
              <Button size="sm" variant="ghost" className="w-full text-muted-foreground" onClick={() => setTarget(prev)}>
                <Undo2 data-icon="inline-start" />
                Volver a {QUOTE_STATUS_LABELS[prev].toLowerCase()}
              </Button>
            ) : null}
          </div>
        ) : null}

        {history && history.length > 0 ? (
          <ul className="flex flex-col gap-1.5 border-t pt-2.5">
            {history.map((h) => (
              <li key={h.id} className="flex items-start gap-2 text-xs">
                <StatusIcon status={h.to_status} className="mt-0.5" />
                <span className="flex min-w-0 flex-col">
                  <span>
                    <span className="font-medium">{QUOTE_STATUS_LABELS[h.to_status]}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      · {formatDateTime(h.changed_at)}
                      {h.changed_by_name ? ` · ${h.changed_by_name}` : ""}
                    </span>
                  </span>
                  {h.note ? <span className="text-muted-foreground">{h.note}</span> : null}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>

      <Dialog open={target != null} onOpenChange={(open) => !open && !busy && setTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {target ? (goingBack ? `¿Volver a ${QUOTE_STATUS_LABELS[target].toLowerCase()}?` : FORWARD_TITLES[target]) : ""}
            </DialogTitle>
            <DialogDescription>
              {goingBack
                ? "Para corregir un cambio hecho por error. Queda registrado en el historial."
                : "El presupuesto no cambia (precios y totales siguen congelados): solo su estado."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="status-note">Nota (opcional)</Label>
            <Textarea
              id="status-note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                target === "confirmed"
                  ? "Ej.: aceptó por WhatsApp, seña del 50 %"
                  : target === "invoiced"
                    ? "Ej.: factura A 0001-00001234"
                    : "Motivo o referencia"
              }
            />
          </div>
          <DialogFooter>
            <Button variant="outline" disabled={busy} onClick={() => setTarget(null)}>
              Cancelar
            </Button>
            <Button disabled={busy} onClick={() => void apply()}>
              {busy ? <Spinner data-icon="inline-start" /> : null}
              {goingBack ? "Volver" : "Confirmar cambio"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

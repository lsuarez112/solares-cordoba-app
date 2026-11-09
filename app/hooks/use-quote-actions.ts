import * as React from "react"
import { useNavigate } from "react-router"

import { confirmDialog } from "~/components/ui/confirm-dialog"
import type { QuoteListItem, QuoteStatus } from "~/domain/quotes/quotes.schemas"
import { useQuoteShare, type QuoteShareAction } from "~/hooks/use-quote-share"
import { QUOTE_STATUS_ACTIONS, QUOTE_STATUS_LABELS } from "~/lib/quotes/quote-status"
import { appToast } from "~/lib/toast"
import { quotesService } from "~/services/quotes.service"

type QuoteRef = Pick<QuoteListItem, "id" | "status" | "display_number">

const errorDescription = (error: unknown) => (error instanceof Error ? error.message : undefined)

/**
 * Acciones de presupuesto compartidas por el listado, la ficha del cliente y el
 * detalle. Los handlers son estables (las columnas de TanStack los usan).
 */
export function useQuoteActions({
  onDeleted,
  onChanged,
}: { onDeleted?: (quote: QuoteRef) => void; onChanged?: (quote: QuoteRef) => void } = {}) {
  const navigate = useNavigate()
  const onDeletedRef = React.useRef(onDeleted)
  onDeletedRef.current = onDeleted
  const onChangedRef = React.useRef(onChanged)
  onChangedRef.current = onChanged

  const onOpen = React.useCallback((q: QuoteRef) => navigate(`/presupuestos/${q.id}`), [navigate])

  /** Editar un emitido = crear (o retomar) su revisión en borrador. */
  const onRevise = React.useCallback(
    async (q: QuoteRef) => {
      try {
        const id = await quotesService.createRevision(q.id)
        navigate(`/presupuestos/${id}`)
      } catch (error) {
        appToast.error("No se pudo crear la revisión", { description: errorDescription(error) })
      }
    },
    [navigate],
  )

  const onDuplicate = React.useCallback(
    async (q: QuoteRef) => {
      try {
        const id = await quotesService.duplicate(q.id)
        appToast.success("Presupuesto duplicado como borrador")
        navigate(`/presupuestos/${id}`)
      } catch (error) {
        appToast.error("No se pudo duplicar", { description: errorDescription(error) })
      }
    },
    [navigate],
  )

  const onDelete = React.useCallback(async (q: QuoteRef) => {
    if (q.status !== "draft") return
    const label = q.display_number ? `el borrador ${q.display_number}` : "este borrador"
    const ok = await confirmDialog({
      title: `¿Eliminar ${label}?`,
      description: "Se borran sus ítems. No se puede deshacer.",
      confirmLabel: "Eliminar",
      destructive: true,
    })
    if (!ok) return
    try {
      await quotesService.remove(q.id)
      appToast.success("Borrador eliminado")
      onDeletedRef.current?.(q)
    } catch (error) {
      appToast.error("No se pudo eliminar", { description: errorDescription(error) })
    }
  }, [])

  const share = useQuoteShare()
  const { whatsapp, copyMessage, sharePdf, downloadPdf, previewPdf } = share
  const onShare = React.useCallback(
    (q: QuoteRef, action: QuoteShareAction) => {
      const fn = { whatsapp, copy: copyMessage, share: sharePdf, download: downloadPdf, preview: previewPdf }[action]
      void fn(q.id)
    },
    [whatsapp, copyMessage, sharePdf, downloadPdf, previewPdf],
  )

  /** Avance rápido de estado desde el listado (la nota se carga desde el detalle). */
  const onSetStatus = React.useCallback(async (q: QuoteRef, status: QuoteStatus) => {
    const label = q.display_number ?? "el presupuesto"
    const ok = await confirmDialog({
      title: `¿${QUOTE_STATUS_ACTIONS[status] ?? QUOTE_STATUS_LABELS[status]} ${label}?`,
      description: "Solo cambia el estado; precios y totales siguen congelados. Queda en el historial.",
      confirmLabel: QUOTE_STATUS_ACTIONS[status] ?? "Aceptar",
    })
    if (!ok) return
    try {
      await quotesService.setStatus(q.id, status)
      appToast.success(`${label}: ${QUOTE_STATUS_LABELS[status].toLowerCase()}`)
      onChangedRef.current?.(q)
    } catch (error) {
      appToast.error("No se pudo cambiar el estado", { description: errorDescription(error) })
    }
  }, [])

  return { onOpen, onRevise, onDuplicate, onDelete, onShare, onSetStatus }
}

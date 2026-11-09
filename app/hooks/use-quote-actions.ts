import * as React from "react"
import { useNavigate } from "react-router"

import type { QuoteListItem } from "~/domain/quotes/quotes.schemas"
import { appToast } from "~/lib/toast"
import { quotesService } from "~/services/quotes.service"

type QuoteRef = Pick<QuoteListItem, "id" | "status" | "display_number">

const errorDescription = (error: unknown) => (error instanceof Error ? error.message : undefined)

/**
 * Acciones de presupuesto compartidas por el listado, la ficha del cliente y el
 * detalle. Los handlers son estables (las columnas de TanStack los usan).
 */
export function useQuoteActions({ onDeleted }: { onDeleted?: (quote: QuoteRef) => void } = {}) {
  const navigate = useNavigate()
  const onDeletedRef = React.useRef(onDeleted)
  onDeletedRef.current = onDeleted

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
    if (!window.confirm(`¿Eliminar ${label}? No se puede deshacer.`)) return
    try {
      await quotesService.remove(q.id)
      appToast.success("Borrador eliminado")
      onDeletedRef.current?.(q)
    } catch (error) {
      appToast.error("No se pudo eliminar", { description: errorDescription(error) })
    }
  }, [])

  return { onOpen, onRevise, onDuplicate, onDelete }
}

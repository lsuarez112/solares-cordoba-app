import type { QuoteStatus } from "~/domain/quotes/quotes.schemas"

/** Flujo comercial después de emitir (mismo orden que set_quote_status en la DB). */
export const QUOTE_FLOW = ["issued", "confirmed", "to_invoice", "invoiced"] as const satisfies readonly QuoteStatus[]

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  draft: "Borrador",
  issued: "Emitido",
  confirmed: "Confirmado",
  to_invoice: "Facturar",
  invoiced: "Facturado",
}

/** Texto del botón que lleva a cada estado. */
export const QUOTE_STATUS_ACTIONS: Partial<Record<QuoteStatus, string>> = {
  confirmed: "Confirmar",
  to_invoice: "Pasar a facturar",
  invoiced: "Marcar facturado",
}

/** Emitido en sentido amplio: ya tiene número fijo, precios congelados y no se edita. */
export const isIssued = (status: QuoteStatus) => status !== "draft"

export function nextStatus(status: QuoteStatus): QuoteStatus | null {
  const i = QUOTE_FLOW.indexOf(status as (typeof QUOTE_FLOW)[number])
  return i >= 0 && i < QUOTE_FLOW.length - 1 ? QUOTE_FLOW[i + 1] : null
}

export function prevStatus(status: QuoteStatus): QuoteStatus | null {
  const i = QUOTE_FLOW.indexOf(status as (typeof QUOTE_FLOW)[number])
  return i > 0 ? QUOTE_FLOW[i - 1] : null
}

/** Se revisa lo emitido o confirmado; lo que pasó a facturación ya no (igual que en la DB). */
export const canRevise = (status: QuoteStatus) => status === "issued" || status === "confirmed"

/** Para contadores ("3 Confirmados"). */
export const QUOTE_STATUS_PLURAL: Record<QuoteStatus, string> = {
  draft: "Borradores",
  issued: "Emitidos",
  confirmed: "Confirmados",
  to_invoice: "Facturar",
  invoiced: "Facturados",
}

/**
 * Datos del presupuesto para compartir (PDF y mensaje de WhatsApp).
 * Puro: el armado desde la base está en services/quote-share.service.ts.
 */
import type { GridType } from "~/domain/products/products.schemas"
import { GRID_TYPE_LABELS } from "~/lib/products/grid-type.utils"
import type { QuoteTotals } from "~/lib/quotes/quote-totals"

export type QuoteDocumentCompany = {
  name: string
  legal_name: string | null
  tax_id: string | null
  address: string | null
  city: string | null
  province: string | null
  phone: string | null
  email: string | null
  website: string | null
}

export type QuoteDocumentItem = {
  code: string
  description: string
  qty: number
  unit_price_usd: number
  subtotal_usd: number
}

export type QuoteDocument = {
  number: string
  isDraft: boolean
  /** Fecha del presupuesto (emisión o última modificación del borrador), ISO. */
  date: string
  validUntil: string | null
  company: QuoteDocumentCompany | null
  /** Logo listo para el PDF (data URL PNG) o null. */
  logo: string | null
  client: { name: string; phone: string | null; email: string | null; city: string | null; address: string | null; cuit: string | null }
  seller: string | null
  system: {
    grid_type: GridType | null
    kit_name: string | null
    kwp: number | null
    generation_kwh_month: number | null
    battery_kwh: number | null
  }
  items: QuoteDocumentItem[]
  totals: QuoteTotals
  rate: { usd_ars: number; source: string | null; date: string | null } | null
  clientNotes: string | null
  footer: string | null
}

/** dd/mm/aaaa (fecha ISO "aaaa-mm-dd" o timestamp). */
export function dmy(value: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  if (m && value.length === 10) return `${m[3]}/${m[2]}/${m[1]}`
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}

const int = (v: number) => Math.round(v).toLocaleString("es-AR")
const dec = (v: number) => v.toLocaleString("es-AR", { maximumFractionDigits: 2 })
const qtyText = (v: number) => v.toLocaleString("es-AR", { maximumFractionDigits: 2 })

/** "On Grid 5,5 kWp (~690 kWh/mes)" o null si no hay datos. */
export function systemLine(doc: Pick<QuoteDocument, "system">): string | null {
  const s = doc.system
  const parts: string[] = []
  if (s.grid_type) parts.push(GRID_TYPE_LABELS[s.grid_type])
  if (s.kwp) parts.push(`${dec(s.kwp)} kWp`)
  if (parts.length === 0) return null
  let line = `Sistema ${parts.join(" ")}`
  if (s.generation_kwh_month) line += ` (~${int(s.generation_kwh_month)} kWh/mes)`
  if (s.battery_kwh) line += ` + batería ${dec(s.battery_kwh)} kWh`
  return line
}

export function rateSourceLabel(source: string | null | undefined): string {
  return source === "api" ? "oficial" : source === "manual" ? "manual" : (source ?? "")
}

/** Mensaje compacto para WhatsApp (spec §8): sin emojis, una línea por ítem. */
export function buildQuoteMessage(doc: QuoteDocument): string {
  const lines: string[] = []
  lines.push(`Presupuesto ${doc.number}${doc.isDraft ? " (borrador)" : ""} - ${doc.client.name}`)
  const system = systemLine(doc)
  if (system) lines.push(system)
  lines.push("")
  for (const item of doc.items) lines.push(`${qtyText(item.qty)}x ${item.description}`)
  lines.push("")

  const t = doc.totals
  lines.push(
    t.iva_pct > 0
      ? `Total: USD ${int(t.subtotal_usd)} + IVA ${dec(t.iva_pct)}% = USD ${int(t.total_usd)}`
      : `Total: USD ${int(t.total_usd)} (sin IVA)`,
  )
  if (t.total_ars != null && doc.rate) {
    const when = doc.rate.date ? `, ${dmy(doc.rate.date)}` : ""
    lines.push(`ARS $ ${int(t.total_ars)} (USD ${int(doc.rate.usd_ars)}${when})`)
  }
  if (doc.validUntil) lines.push(`Valido hasta ${dmy(doc.validUntil)}`)
  if (doc.isDraft) lines.push("Precios sujetos a confirmacion")
  return lines.join("\n")
}

/** Nombre de archivo: Presupuesto P-000042 - Juan Perez.pdf */
export function quotePdfFileName(doc: Pick<QuoteDocument, "number" | "client">): string {
  const client = doc.client.name.replace(/[\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim()
  return `Presupuesto ${doc.number}${client ? ` - ${client}` : ""}.pdf`
}

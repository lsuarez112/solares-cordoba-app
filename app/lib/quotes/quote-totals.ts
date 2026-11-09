/**
 * Totales del presupuesto con el mismo redondeo que public.issue_quote():
 * subtotal por ítem a 2 decimales, IVA a 2 decimales y total en pesos sin decimales.
 */

export const STANDARD_IVA_PCT = 21

export type TotalsLine = { qty: number; unit_price_usd: number }

export type QuoteTotals = {
  subtotal_usd: number
  iva_pct: number
  iva_usd: number
  total_usd: number
  total_ars: number | null
}

// toPrecision corrige el error binario (2,5 × 3,33 = 8,3249999…) para redondear
// "half up" como numeric de Postgres.
const round2 = (value: number) => Math.round(Number((value * 100).toPrecision(12))) / 100

export function lineSubtotal(line: TotalsLine): number {
  return round2((Number(line.qty) || 0) * (Number(line.unit_price_usd) || 0))
}

export function computeQuoteTotals(
  lines: TotalsLine[],
  ivaPct: number,
  usdArs: number | null = null,
): QuoteTotals {
  const subtotal = round2(lines.reduce((sum, l) => sum + lineSubtotal(l), 0))
  const pct = Math.min(Math.max(Number(ivaPct) || 0, 0), 100)
  const iva = round2((subtotal * pct) / 100)
  const total = round2(subtotal + iva)
  return {
    subtotal_usd: subtotal,
    iva_pct: pct,
    iva_usd: iva,
    total_usd: total,
    total_ars: usdArs && usdArs > 0 ? Math.round(Number((total * usdArs).toPrecision(15))) : null,
  }
}

/** Elección de IVA en la confirmación (D7). */
export type IvaChoice = {
  include: boolean
  /** null = 21 %; un número = IVA específico. */
  custom_pct: number | null
}

export function ivaPctFromChoice(choice: IvaChoice): number {
  if (!choice.include) return 0
  const custom = choice.custom_pct
  return custom != null && Number.isFinite(custom) ? Math.min(Math.max(custom, 0), 100) : STANDARD_IVA_PCT
}

export function ivaChoiceFromPct(pct: number): IvaChoice {
  if (!pct) return { include: false, custom_pct: null }
  return { include: true, custom_pct: pct === STANDARD_IVA_PCT ? null : pct }
}

/** P-000042 / P-000042-R1; null si es un borrador nunca emitido. */
export function formatQuoteNumber(
  prefix: string,
  number: number | null,
  revision = 0,
): string | null {
  if (number == null) return null
  return `${prefix}${String(number).padStart(6, "0")}${revision > 0 ? `-R${revision}` : ""}`
}

export function revisionLabel(revision: number): string {
  return revision > 0 ? `R${revision}` : "Original"
}

export const formatUsd = (value: number | null | undefined) =>
  value == null
    ? "—"
    : value.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const formatArs = (value: number | null | undefined) =>
  value == null ? "—" : `$ ${value.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`

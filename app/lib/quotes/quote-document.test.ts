import { describe, expect, it } from "vitest"

import { buildQuoteMessage, quotePdfFileName, type QuoteDocument } from "~/lib/quotes/quote-document"
import { computeQuoteTotals } from "~/lib/quotes/quote-totals"

const items = [
  { code: "P550", description: "Panel 550W", qty: 10, unit_price_usd: 200 },
  { code: "INV5", description: "Inversor 5kW on-grid", qty: 1, unit_price_usd: 1500 },
  { code: "EST10", description: "Estructura techo chapa 10p", qty: 1, unit_price_usd: 850 },
  { code: "PROT", description: "Kit protecciones DC/AC", qty: 1, unit_price_usd: 500 },
].map((i) => ({ ...i, subtotal_usd: i.qty * i.unit_price_usd }))

const base: QuoteDocument = {
  number: "P-000042",
  isDraft: false,
  date: "2026-11-06T12:00:00Z",
  validUntil: "2026-11-21",
  company: null,
  logo: null,
  client: { name: "Juan Perez", phone: null, email: null, city: null, address: null, cuit: null },
  seller: null,
  system: { grid_type: "ON-GRID", kit_name: null, kwp: 5.5, generation_kwh_month: 690, battery_kwh: null },
  items,
  totals: computeQuoteTotals(items, 21, 1250),
  rate: { usd_ars: 1250, source: "api", date: "2026-11-06" },
  clientNotes: null,
  footer: null,
}

describe("buildQuoteMessage", () => {
  it("arma el mensaje compacto de la spec", () => {
    expect(buildQuoteMessage(base)).toBe(
      [
        "Presupuesto P-000042 - Juan Perez",
        "Sistema On Grid 5,5 kWp (~690 kWh/mes)",
        "",
        "10x Panel 550W",
        "1x Inversor 5kW on-grid",
        "1x Estructura techo chapa 10p",
        "1x Kit protecciones DC/AC",
        "",
        "Total: USD 4.850 + IVA 21% = USD 5.869",
        "ARS $ 7.335.625 (USD 1.250, 06/11/2026)",
        "Valido hasta 21/11/2026",
      ].join("\n"),
    )
  })

  it("sin IVA, borrador y sin cotización", () => {
    const msg = buildQuoteMessage({
      ...base,
      isDraft: true,
      totals: computeQuoteTotals(items, 0, null),
      rate: null,
      system: { ...base.system, kwp: null, generation_kwh_month: null },
    })
    expect(msg).toContain("Presupuesto P-000042 (borrador) - Juan Perez\nSistema On Grid\n")
    expect(msg).toContain("Total: USD 4.850 (sin IVA)")
    expect(msg).not.toContain("ARS")
    expect(msg).toContain("Precios sujetos a confirmacion")
  })
})

describe("quotePdfFileName", () => {
  it("limpia caracteres inválidos", () => {
    expect(quotePdfFileName({ number: "P-000042", client: { ...base.client, name: "Juan / Pérez" } })).toBe(
      "Presupuesto P-000042 - Juan Pérez.pdf",
    )
  })
})

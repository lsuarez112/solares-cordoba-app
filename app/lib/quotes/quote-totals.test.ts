import { describe, expect, it } from "vitest"

import {
  computeQuoteTotals,
  formatQuoteNumber,
  ivaChoiceFromPct,
  ivaPctFromChoice,
  lineSubtotal,
} from "./quote-totals"

describe("computeQuoteTotals", () => {
  const lines = [
    { qty: 8, unit_price_usd: 112.35 },
    { qty: 1, unit_price_usd: 1499.9 },
    { qty: 2.5, unit_price_usd: 3.33 },
  ]

  it("redondea por ítem como la base", () => {
    expect(lineSubtotal({ qty: 2.5, unit_price_usd: 3.33 })).toBe(8.33)
  })

  it("subtotal, IVA 21 % y total en pesos", () => {
    const t = computeQuoteTotals(lines, 21, 1200)
    expect(t.subtotal_usd).toBe(2407.03) // 898,80 + 1499,90 + 8,33
    expect(t.iva_usd).toBe(505.48)
    expect(t.total_usd).toBe(2912.51)
    expect(t.total_ars).toBe(3495012)
  })

  it("sin IVA y sin cotización", () => {
    const t = computeQuoteTotals(lines, 0)
    expect(t.iva_usd).toBe(0)
    expect(t.total_usd).toBe(t.subtotal_usd)
    expect(t.total_ars).toBeNull()
  })

  it("IVA específico (10,5 %)", () => {
    expect(computeQuoteTotals([{ qty: 1, unit_price_usd: 1000 }], 10.5).total_usd).toBe(1105)
  })
})

describe("IVA (D7)", () => {
  it("checkbox 21 %, específico o sin IVA", () => {
    expect(ivaPctFromChoice({ mode: "standard", custom_pct: null })).toBe(21)
    expect(ivaPctFromChoice({ mode: "custom", custom_pct: 10.5 })).toBe(10.5)
    expect(ivaPctFromChoice({ mode: "none", custom_pct: 10.5 })).toBe(0)
  })

  it("ida y vuelta desde el porcentaje guardado", () => {
    expect(ivaChoiceFromPct(21)).toEqual({ mode: "standard", custom_pct: null })
    expect(ivaChoiceFromPct(10.5)).toEqual({ mode: "custom", custom_pct: 10.5 })
    expect(ivaChoiceFromPct(0)).toEqual({ mode: "none", custom_pct: null })
  })
})

describe("formatQuoteNumber", () => {
  it("número y revisión", () => {
    expect(formatQuoteNumber("P-", 42)).toBe("P-000042")
    expect(formatQuoteNumber("P-", 42, 2)).toBe("P-000042-R2")
    expect(formatQuoteNumber("P-", null)).toBeNull()
  })
})

import { describe, expect, it } from "vitest"

import type { QuoteListItem } from "~/domain/quotes/quotes.schemas"
import { computeHomeStats, weekStart } from "~/lib/quotes/home-stats"

const q = (p: Partial<QuoteListItem>): QuoteListItem =>
  ({
    id: Math.random().toString(36), number: null, revision: 0, status: "draft", is_current: true,
    source_quote_id: null, client_id: "c", client_name: "C", client_phone: null, client_city: null,
    grid_type: null, kit_id: null, kit_code: null, kit_name: null, display_number: null, iva_pct: 21,
    subtotal_usd: 0, total_usd: null, total_ars: null, usd_ars: null, items_count: 0, seller_id: null,
    valid_until: null, issued_at: null, created_at: "2026-11-09T12:00:00", updated_at: "2026-11-09T12:00:00",
    ai_cost_usd: 0, ai_requests_count: 0, ...p,
  }) as QuoteListItem

const NOW = new Date("2026-11-11T10:00:00") // miércoles

describe("weekStart", () => {
  it("lleva al lunes", () => {
    expect(weekStart(new Date("2026-11-11T10:00:00")).getDate()).toBe(9)
    expect(weekStart(new Date("2026-11-09T00:30:00")).getDate()).toBe(9)
    expect(weekStart(new Date("2026-11-08T23:00:00")).getDate()).toBe(2)
  })
})

describe("computeHomeStats", () => {
  it("cuenta cada número una vez, por semana de creación del original", () => {
    const s = computeHomeStats(
      [
        // N°1: original emitido + revisión emitida vigente (cuenta 1 emitido, importe de la vigente)
        q({ number: 1, status: "issued", is_current: false, total_usd: 100, created_at: "2026-11-02T10:00:00", issued_at: "2026-11-03T10:00:00" }),
        q({ number: 1, revision: 1, status: "issued", total_usd: 150, created_at: "2026-11-10T10:00:00", issued_at: "2026-11-10T11:00:00" }),
        // N°2: borrador de esta semana
        q({ number: 2, created_at: "2026-11-10T09:00:00" }),
        // N°3: de hace 10 semanas (fuera del gráfico)
        q({ number: 3, created_at: "2026-09-01T09:00:00" }),
      ],
      NOW,
    )
    expect(s.weeks).toHaveLength(8)
    expect(s.weeks.at(-1)).toEqual({ start: "2026-11-09", issued: 0, draft: 1 })
    expect(s.weeks.at(-2)).toEqual({ start: "2026-11-02", issued: 1, draft: 0 })
    expect(s.month).toEqual({ created: 2, issued: 1, issuedUsd: 150, issueRate: 50 })
  })

  it("sin presupuestos en el mes no hay tasa", () => {
    expect(computeHomeStats([], NOW).month.issueRate).toBeNull()
  })
})

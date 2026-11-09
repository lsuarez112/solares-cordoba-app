import { describe, expect, it } from "vitest"

import type { AiExtractResult } from "~/domain/ai/ai.schemas"
import { applyExtract, nearestCoverage } from "~/lib/ai/apply-extract"
import { emptyQuoteRequest } from "~/lib/sizing/sizing"

const empty: AiExtractResult = {
  grid_type: null, kwh: null, kwh_period: null, appliances: [], battery_wanted: null, autonomy_hours: null,
  battery_chemistry: null, phases: null, city: null, roof: "unknown", budget_cap_usd: null, coverage_pct: null,
  notes: [], missing_info: [], zone_id: null, zone_name: null, ai_request_id: null, cost_usd: null,
}

describe("applyExtract", () => {
  it("aplica factura bimestral, híbrido con batería y localidad", () => {
    const base = { ...emptyQuoteRequest, request_text: "texto" }
    const r = applyExtract(base, {
      ...empty, grid_type: "HYBRID", kwh: 820, kwh_period: "bimonth", battery_wanted: true,
      autonomy_hours: 6, zone_id: "z1", roof: "inclined",
    })
    expect(r).toMatchObject({
      grid_type: "HYBRID", consumption_mode: "kwh", kwh: 820, kwh_period: "bimonth", battery_wanted: true,
      autonomy_hours: 6, zone_id: "z1", roof: "inclined", request_text: "texto",
    })
  })

  it("usa la lista de equipos cuando no hay kWh y no pisa lo que la IA no encontró", () => {
    const base = { ...emptyQuoteRequest, phases: "tri" as const, zone_id: "z9" }
    const r = applyExtract(base, {
      ...empty, grid_type: "OFF-GRID",
      appliances: [{ name: "Heladera", watts: 150, hours: 30, qty: 0 }, { name: "Nada", watts: 0, hours: 1, qty: 1 }],
    })
    expect(r.consumption_mode).toBe("appliances")
    expect(r.appliances).toEqual([{ name: "Heladera", watts: 150, hours: 24, qty: 1 }])
    expect(r.battery_wanted).toBe(true)
    expect(r.phases).toBe("tri")
    expect(r.zone_id).toBe("z9")
  })

  it("on grid nunca lleva batería", () => {
    expect(applyExtract({ ...emptyQuoteRequest, battery_wanted: true }, { ...empty, grid_type: "ON-GRID" }).battery_wanted).toBe(false)
  })
})

describe("nearestCoverage", () => {
  it("redondea a las opciones del formulario", () => {
    expect(nearestCoverage(52)).toBe(50)
    expect(nearestCoverage(70)).toBe(80)
    expect(nearestCoverage(130)).toBe(100)
  })
})

import { describe, expect, it } from "vitest"

import {
  appliancesKwhMonth,
  computeSizing,
  coverageBand,
  emptyQuoteRequest,
  estimatedGeneration,
  missingMinimums,
  monthlyKwh,
  resolveHsp,
  type QuoteRequest,
  type SizingParams,
} from "./sizing"

const params: SizingParams = {
  efficiency: 0.75,
  default_hsp: 4.4,
  dod_lifepo4: 0.9,
  dod_lead: 0.5,
  battery_eff_lifepo4: 0.95,
  battery_eff_lead: 0.85,
}

const cordoba = { name: "Córdoba capital", hsp_horizontal: 4.4, hsp_optimal: 5.0 }

const req = (patch: Partial<QuoteRequest>): QuoteRequest => ({ ...emptyQuoteRequest, ...patch })

describe("missingMinimums", () => {
  it("una consulta vaga no alcanza", () => {
    expect(missingMinimums(req({ request_text: "¿qué presupuesto armo para mi casa?" }))).toHaveLength(2)
  })

  it("tipo de sistema + kWh alcanza", () => {
    expect(missingMinimums(req({ grid_type: "ON-GRID", kwh: 400 }))).toEqual([])
  })

  it("con equipos exige potencia y horas", () => {
    const base = req({ grid_type: "OFF-GRID", consumption_mode: "appliances" })
    expect(missingMinimums({ ...base, appliances: [{ name: "Heladera", watts: 150, hours: 0, qty: 1 }] })).toHaveLength(1)
    expect(missingMinimums({ ...base, appliances: [{ name: "Heladera", watts: 150, hours: 24, qty: 1 }] })).toEqual([])
  })
})

describe("consumo", () => {
  it("bimestral se divide por 2", () => {
    expect(monthlyKwh(req({ kwh: 800, kwh_period: "bimonth" }))).toBe(400)
  })

  it("equipos: Σ W × h × cantidad × 30 / 1000", () => {
    expect(
      appliancesKwhMonth([
        { name: "Heladera", watts: 150, hours: 24, qty: 1 },
        { name: "TV", watts: 80, hours: 5, qty: 2 },
      ]),
    ).toBe(132) // (3600 + 800) × 30 / 1000
  })
})

describe("computeSizing", () => {
  it("ejemplo del armador: 400 kWh/mes, HSP 5, η 0,75 → 3556 Wp", () => {
    const s = computeSizing(req({ grid_type: "ON-GRID", kwh: 400, roof: "inclined" }), params, cordoba)
    expect(s?.hsp).toBe(5)
    expect(s?.target_wp).toBe(3556)
    expect(s?.target_kwp).toBe(3.56)
    expect(s?.battery_kwh).toBeNull()
  })

  it("sin localidad usa el HSP conservador", () => {
    const s = computeSizing(req({ grid_type: "ON-GRID", kwh: 400 }), params)
    expect(s?.hsp).toBe(4.4)
    expect(s?.warnings.some((w) => w.includes("conservador"))).toBe(true)
  })

  it("batería híbrida: 15 kWh/día, 8 h, LiFePO4 → 5,85 kWh", () => {
    const s = computeSizing(
      req({ grid_type: "HYBRID", kwh: 450, battery_wanted: true, autonomy_hours: 8 }),
      params,
      cordoba,
    )
    expect(s?.battery_kwh).toBe(5.85)
  })

  it("off-grid siempre lleva batería (24 h por defecto)", () => {
    const s = computeSizing(req({ grid_type: "OFF-GRID", kwh: 90 }), params)
    expect(s?.autonomy_hours).toBe(24)
    expect(s?.battery_kwh).toBeCloseTo(3.51, 2) // 3 kWh / 0,9 / 0,95
  })

  it("cobertura parcial reduce el Wp", () => {
    const full = computeSizing(req({ grid_type: "ON-GRID", kwh: 400 }), params)
    const half = computeSizing(req({ grid_type: "ON-GRID", kwh: 400, coverage_pct: 50 }), params)
    expect(half!.target_wp).toBeCloseTo(full!.target_wp / 2, -1)
  })

  it("devuelve null sin mínimos", () => {
    expect(computeSizing(req({ kwh: 400 }), params)).toBeNull()
  })
})

describe("helpers", () => {
  it("HSP según techo", () => {
    expect(resolveHsp({ roof: "flat" }, cordoba, 4.4).hsp).toBe(4.4)
    expect(resolveHsp({ roof: "inclined" }, cordoba, 4.4).hsp).toBe(5)
  })

  it("generación y bandas de cobertura", () => {
    expect(estimatedGeneration(3.6, 5, 0.75)).toBe(405)
    expect(coverageBand(70)).toBe("under")
    expect(coverageBand(100)).toBe("optimal")
    expect(coverageBand(115)).toBe("over")
    expect(coverageBand(140)).toBe("high")
  })
})

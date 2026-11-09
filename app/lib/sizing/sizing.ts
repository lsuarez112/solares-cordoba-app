/**
 * Dimensionamiento fotovoltaico (armador-kit-solares/05_sizing rules).
 * Puro y determinístico: no llama a la IA ni a la base.
 */
import type { GridType } from "~/domain/products/products.schemas"

export type ConsumptionPeriod = "month" | "bimonth"
export type ConsumptionMode = "kwh" | "appliances"
export type RoofKind = "unknown" | "inclined" | "flat"
export type BatteryChemistry = "lifepo4" | "lead"
export type Phases = "mono" | "tri"

export type ApplianceLine = {
  name: string
  watts: number
  hours: number
  qty: number
}

/** Pedido del cliente tal como lo carga el vendedor (se guarda en quotes.input). */
export type QuoteRequest = {
  grid_type: GridType | null
  consumption_mode: ConsumptionMode
  kwh: number | null
  kwh_period: ConsumptionPeriod
  appliances: ApplianceLine[]
  phases: Phases | null
  battery_wanted: boolean
  autonomy_hours: number | null
  battery_chemistry: BatteryChemistry
  zone_id: string | null
  roof: RoofKind
  /** % del consumo a cubrir (100 = todo; 40–60 = reducción de factura). */
  coverage_pct: number
  budget_cap_usd: number | null
  request_text: string
}

export const emptyQuoteRequest: QuoteRequest = {
  grid_type: null,
  consumption_mode: "kwh",
  kwh: null,
  kwh_period: "month",
  appliances: [],
  phases: null,
  battery_wanted: false,
  autonomy_hours: null,
  battery_chemistry: "lifepo4",
  zone_id: null,
  roof: "unknown",
  coverage_pct: 100,
  budget_cap_usd: null,
  request_text: "",
}

export type SizingParams = {
  /** η global (0,75 por defecto). */
  efficiency: number
  /** HSP a usar cuando no hay localidad. */
  default_hsp: number
  dod_lifepo4: number
  dod_lead: number
  battery_eff_lifepo4: number
  battery_eff_lead: number
}

export type SolarZoneHsp = {
  name: string
  hsp_horizontal: number
  hsp_optimal: number
  notes?: string | null
}

export type SizingResult = {
  kwh_month: number
  kwh_day: number
  kwh_to_cover: number
  hsp: number
  hsp_source: string
  efficiency: number
  target_wp: number
  target_kwp: number
  battery_kwh: number | null
  autonomy_hours: number | null
  warnings: string[]
}

const DAYS = 30
/** Autonomía por defecto: híbrido cubre la noche, off-grid un día completo. */
export const DEFAULT_AUTONOMY_HOURS: Record<"HYBRID" | "OFF-GRID", number> = {
  HYBRID: 8,
  "OFF-GRID": 24,
}

const round = (value: number, decimals = 2) => {
  const f = 10 ** decimals
  return Math.round(value * f) / f
}

/** Consumo de la lista de equipos en kWh/mes: Σ(W × h × cantidad) × 30 / 1000. */
export function appliancesKwhMonth(appliances: ApplianceLine[]): number {
  const whDay = appliances.reduce(
    (sum, a) => sum + Math.max(0, a.watts) * Math.max(0, a.hours) * Math.max(0, a.qty || 0),
    0,
  )
  return round((whDay * DAYS) / 1000, 1)
}

/** Consumo mensual en kWh según el modo cargado (null si falta). */
export function monthlyKwh(req: QuoteRequest): number | null {
  if (req.consumption_mode === "appliances") {
    const kwh = appliancesKwhMonth(req.appliances)
    return kwh > 0 ? kwh : null
  }
  if (req.kwh == null || !(req.kwh > 0)) return null
  return round(req.kwh_period === "bimonth" ? req.kwh / 2 : req.kwh, 1)
}

/**
 * Mínimos para dimensionar (y, en F4, para llamar a la IA):
 * tipo de sistema + consumo (kWh o equipos con potencia y horas).
 */
export function missingMinimums(req: QuoteRequest): string[] {
  const missing: string[] = []
  if (!req.grid_type) missing.push("Tipo de sistema (On grid, Híbrido u Off grid)")
  if (req.consumption_mode === "appliances") {
    const valid = req.appliances.filter((a) => a.watts > 0 && a.hours > 0 && a.qty > 0)
    if (valid.length === 0) missing.push("Al menos un equipo con potencia (W) y horas de uso")
  } else if (monthlyKwh(req) == null) {
    missing.push("Consumo en kWh de la factura")
  }
  return missing
}

/** HSP: localidad (óptimo si el techo es inclinado; horizontal si no se sabe o es losa). */
export function resolveHsp(
  req: Pick<QuoteRequest, "roof">,
  zone: SolarZoneHsp | null,
  defaultHsp: number,
): { hsp: number; source: string } {
  if (!zone) {
    return { hsp: defaultHsp, source: `Valor conservador (${defaultHsp.toLocaleString("es-AR")} h)` }
  }
  if (req.roof === "inclined") {
    return { hsp: zone.hsp_optimal, source: `${zone.name}, panel inclinado` }
  }
  return {
    hsp: zone.hsp_horizontal,
    source: `${zone.name}, ${req.roof === "flat" ? "losa plana" : "ángulo desconocido"}`,
  }
}

export function needsBattery(req: Pick<QuoteRequest, "grid_type" | "battery_wanted">): boolean {
  if (req.grid_type === "OFF-GRID") return true
  return req.grid_type === "HYBRID" && req.battery_wanted
}

export function computeSizing(
  req: QuoteRequest,
  params: SizingParams,
  zone: SolarZoneHsp | null = null,
): SizingResult | null {
  if (missingMinimums(req).length > 0) return null
  const kwhMonth = monthlyKwh(req)
  if (kwhMonth == null) return null

  const warnings: string[] = []
  const coverage = Math.min(Math.max(req.coverage_pct || 100, 10), 150)
  const kwhToCover = (kwhMonth * coverage) / 100
  const { hsp, source } = resolveHsp(req, zone, params.default_hsp)

  // Wp = kWh_mes × 1000 / (HSP × η × 30)
  const targetWp = (kwhToCover * 1000) / (hsp * params.efficiency * DAYS)

  let batteryKwh: number | null = null
  let autonomy: number | null = null
  if (needsBattery(req) && req.grid_type !== "ON-GRID" && req.grid_type) {
    autonomy = req.autonomy_hours && req.autonomy_hours > 0
      ? req.autonomy_hours
      : DEFAULT_AUTONOMY_HOURS[req.grid_type]
    const lead = req.battery_chemistry === "lead"
    const dod = lead ? params.dod_lead : params.dod_lifepo4
    const eff = lead ? params.battery_eff_lead : params.battery_eff_lifepo4
    // C = (kWh_día × horas / 24) / DoD / η_bat
    batteryKwh = round(((kwhMonth / DAYS) * autonomy) / 24 / dod / eff, 2)
  }

  if (kwhMonth > 1000) {
    warnings.push("Consumo mayor a 1000 kWh/mes: requiere análisis detallado (¿trifásico?).")
  }
  if (coverage < 100) {
    warnings.push(`Se dimensiona para cubrir el ${coverage} % del consumo.`)
  }
  if (!zone) {
    warnings.push("Sin localidad: se usa HSP conservador.")
  } else if (zone.notes) {
    warnings.push(`${zone.name}: ${zone.notes}`)
  }
  if (req.grid_type === "ON-GRID" && req.battery_wanted) {
    warnings.push("On grid no lleva baterías: para respaldo elegí Híbrido.")
  }

  return {
    kwh_month: kwhMonth,
    kwh_day: round(kwhMonth / DAYS, 2),
    kwh_to_cover: round(kwhToCover, 1),
    hsp,
    hsp_source: source,
    efficiency: params.efficiency,
    target_wp: Math.round(targetWp),
    target_kwp: round(targetWp / 1000, 2),
    battery_kwh: batteryKwh,
    autonomy_hours: autonomy,
    warnings,
  }
}

/** Generación mensual estimada de un sistema (kWh/mes). */
export function estimatedGeneration(kwp: number, hsp: number, efficiency: number): number {
  return Math.round(kwp * hsp * efficiency * DAYS)
}

export type CoverageBand = "under" | "optimal" | "over" | "high"

/** Cobertura = generación / consumo: <80 sub, 80–110 óptimo, 110–120 margen, >120 sobre. */
export function coverageBand(pct: number): CoverageBand {
  if (pct < 80) return "under"
  if (pct <= 110) return "optimal"
  if (pct <= 120) return "over"
  return "high"
}

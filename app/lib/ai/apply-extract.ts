import type { AiExtractResult } from "~/domain/ai/ai.schemas"
import type { QuoteRequest } from "~/lib/sizing/sizing"

const COVERAGE_OPTIONS = [100, 80, 60, 50, 40]

/** Cobertura pedida → la opción más cercana del formulario. */
export function nearestCoverage(pct: number): number {
  return COVERAGE_OPTIONS.reduce((best, o) => (Math.abs(o - pct) < Math.abs(best - pct) ? o : best), 100)
}

/**
 * Aplica lo que interpretó la IA sobre el pedido: solo pisa lo que la IA
 * encontró (lo null se deja como estaba) y conserva el texto del cliente.
 */
export function applyExtract(current: QuoteRequest, ai: AiExtractResult): QuoteRequest {
  const next: QuoteRequest = { ...current }

  if (ai.grid_type) next.grid_type = ai.grid_type

  const appliances = ai.appliances
    .filter((a) => a.watts > 0 && a.hours > 0)
    .map((a) => ({ name: a.name, watts: a.watts, hours: Math.min(a.hours, 24), qty: Math.max(1, Math.round(a.qty || 1)) }))
  if (ai.kwh != null && ai.kwh > 0) {
    next.consumption_mode = "kwh"
    next.kwh = ai.kwh
    next.kwh_period = ai.kwh_period ?? "month"
  } else if (appliances.length > 0) {
    next.consumption_mode = "appliances"
    next.appliances = appliances
  }

  if (ai.battery_wanted != null) next.battery_wanted = ai.battery_wanted
  if (next.grid_type === "OFF-GRID") next.battery_wanted = true
  if (next.grid_type === "ON-GRID") next.battery_wanted = false
  if (ai.autonomy_hours != null && ai.autonomy_hours > 0) next.autonomy_hours = ai.autonomy_hours
  if (ai.battery_chemistry) next.battery_chemistry = ai.battery_chemistry
  if (ai.phases) next.phases = ai.phases
  if (ai.zone_id) next.zone_id = ai.zone_id
  if (ai.roof !== "unknown") next.roof = ai.roof
  if (ai.budget_cap_usd != null && ai.budget_cap_usd > 0) next.budget_cap_usd = ai.budget_cap_usd
  if (ai.coverage_pct != null && ai.coverage_pct > 0) next.coverage_pct = nearestCoverage(ai.coverage_pct)

  return next
}

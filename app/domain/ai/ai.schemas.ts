import { z } from "zod"

const num = z.coerce.number()
const numOrNull = z.coerce.number().nullable()

/** Respuesta de suggest-quote action "extract". */
export const AiExtractResultSchema = z.object({
  grid_type: z.enum(["ON-GRID", "HYBRID", "OFF-GRID"]).nullable(),
  kwh: numOrNull,
  kwh_period: z.enum(["month", "bimonth"]).nullable(),
  appliances: z.array(z.object({ name: z.string(), watts: num, hours: num, qty: num })),
  battery_wanted: z.boolean().nullable(),
  autonomy_hours: numOrNull,
  battery_chemistry: z.enum(["lifepo4", "lead"]).nullable(),
  phases: z.enum(["mono", "tri"]).nullable(),
  city: z.string().nullable(),
  roof: z.enum(["unknown", "inclined", "flat"]),
  budget_cap_usd: numOrNull,
  coverage_pct: numOrNull,
  notes: z.array(z.string()),
  missing_info: z.array(z.string()),
  zone_id: z.string().nullable(),
  zone_name: z.string().nullable(),
  ai_request_id: z.string().nullable(),
  cost_usd: numOrNull,
})
export type AiExtractResult = z.infer<typeof AiExtractResultSchema>

/** Respuesta de suggest-quote action "select". */
export const AiSelectResultSchema = z.object({
  kit_id: z.string().nullable(),
  /** ai = eligió Claude; rule = candidato claro, sin IA; none = sin candidatos. */
  source: z.enum(["ai", "rule", "none"]),
  reason: z.string(),
  warnings: z.array(z.string()),
  missing_info: z.array(z.string()),
  ai_request_id: z.string().nullable().optional(),
  cost_usd: numOrNull.optional(),
})
export type AiSelectResult = z.infer<typeof AiSelectResultSchema>

/** Fila única de v_ai_usage_summary. */
export const AiUsageSummarySchema = z.object({
  topups_usd: num,
  last_topup_at: z.string().nullable(),
  spent_usd: num,
  balance_usd: num,
  spent_month_usd: num,
  requests_month: num,
  requests_count: num,
  errors_count: num,
})
export type AiUsageSummary = z.infer<typeof AiUsageSummarySchema>

export const AI_STEP_LABELS = {
  extract: "Interpretar pedido",
  select: "Sugerir kit",
  refine: "Ajuste",
  kit: "Armar kit",
} as const
export type AiStep = keyof typeof AI_STEP_LABELS

/** Fila de v_ai_requests_list. */
export const AiRequestListItemSchema = z.object({
  id: z.string(),
  step: z.enum(["extract", "select", "refine", "kit"]),
  model: z.string(),
  tokens_in: numOrNull,
  tokens_out: numOrNull,
  cache_read_tokens: numOrNull,
  cache_write_tokens: numOrNull,
  cost_usd: numOrNull,
  duration_ms: numOrNull,
  error: z.string().nullable(),
  quote_id: z.string().nullable(),
  quote_number: z.string().nullable(),
  client_name: z.string().nullable(),
  created_by: z.string().nullable(),
  user_name: z.string().nullable(),
  created_at: z.string(),
})
export type AiRequestListItem = z.infer<typeof AiRequestListItemSchema>

export const AiCreditTopupSchema = z.object({
  id: z.string(),
  amount_usd: num,
  topped_at: z.string(),
  notes: z.string().nullable(),
  created_by: z.string().nullable(),
  created_at: z.string(),
})
export type AiCreditTopup = z.infer<typeof AiCreditTopupSchema>

export const AiTopupFormSchema = z.object({
  amount_usd: z.coerce.number({ message: "Ingresá un monto" }).positive("Debe ser mayor a 0").max(100000),
  topped_at: z.string().min(1, "Requerido"),
  notes: z.string().max(200).optional(),
})
export type AiTopupFormValues = z.infer<typeof AiTopupFormSchema>

/** USD con 4 decimales (los costos por llamada son de centavos). */
export const formatAiUsd = (value: number | null | undefined, decimals = 4) =>
  value == null
    ? "—"
    : `USD ${value.toLocaleString("es-AR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`

/** Respuesta de suggest-quote action "build_kit" (borrador para el editor de kits). */
export const AiKitDraftSchema = z.object({
  kit: z.object({
    code: z.string(),
    name: z.string(),
    grid_type: z.enum(["ON-GRID", "HYBRID", "OFF-GRID"]),
    phases: z.enum(["mono", "tri"]),
    kwp: num,
    battery_kwh: num,
    battery_voltage: numOrNull,
    inverter_kw: numOrNull,
    est_kwh_month: numOrNull,
    description: z.string(),
  }),
  items: z.array(
    z.object({
      product_code: z.string(),
      name: z.string(),
      category: z.string().nullable(),
      qty: num,
      price_usd: num,
      reason: z.string(),
    }),
  ),
  warnings: z.array(z.string()),
  ai_request_id: z.string().nullable(),
  cost_usd: numOrNull,
})
export type AiKitDraft = z.infer<typeof AiKitDraftSchema>

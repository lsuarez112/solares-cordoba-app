import { z } from "zod"

import { GridTypeSchema } from "~/domain/products/products.schemas"

const num = z.coerce.number()
const numOrNull = z.coerce.number().nullable()

export const QuoteStatusSchema = z.enum(["draft", "issued", "confirmed", "to_invoice", "invoiced"])
export type QuoteStatus = z.infer<typeof QuoteStatusSchema>

/** Fila de v_quotes_list. */
export const QuoteListItemSchema = z.object({
  id: z.string(),
  number: numOrNull,
  revision: num,
  status: QuoteStatusSchema,
  is_current: z.boolean(),
  source_quote_id: z.string().nullable(),
  client_id: z.string(),
  client_name: z.string(),
  client_phone: z.string().nullable(),
  client_city: z.string().nullable(),
  grid_type: GridTypeSchema.nullable(),
  kit_id: z.string().nullable(),
  kit_code: z.string().nullable(),
  kit_name: z.string().nullable(),
  display_number: z.string().nullable(),
  iva_pct: num,
  subtotal_usd: numOrNull,
  total_usd: numOrNull,
  total_ars: numOrNull,
  usd_ars: numOrNull,
  items_count: num.default(0),
  seller_id: z.string().nullable(),
  valid_until: z.string().nullable(),
  issued_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  ai_cost_usd: num.default(0),
  ai_requests_count: num.default(0),
  status_changed_at: z.string().nullable().optional(),
})
export type QuoteListItem = z.infer<typeof QuoteListItemSchema>

/** Fila de public.quotes. */
export const QuoteSchema = z.object({
  id: z.string(),
  number: numOrNull,
  revision: num,
  status: QuoteStatusSchema,
  is_current: z.boolean(),
  source_quote_id: z.string().nullable(),
  client_id: z.string(),
  seller_id: z.string().nullable(),
  grid_type: GridTypeSchema.nullable(),
  kit_id: z.string().nullable(),
  input: z.record(z.string(), z.unknown()).nullable().default({}),
  sizing: z.record(z.string(), z.unknown()).nullable(),
  ai_summary: z.unknown().nullable(),
  usd_ars: numOrNull,
  rate_source: z.string().nullable(),
  rate_date: z.string().nullable(),
  iva_pct: num,
  subtotal_usd: numOrNull,
  iva_usd: numOrNull,
  total_usd: numOrNull,
  total_ars: numOrNull,
  valid_until: z.string().nullable(),
  notes: z.string().nullable(),
  client_notes: z.string().nullable(),
  pdf_path: z.string().nullable(),
  issued_at: z.string().nullable(),
  issued_by: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})
export type Quote = z.infer<typeof QuoteSchema>

export const QuoteItemSchema = z.object({
  id: z.string(),
  product_id: z.string().nullable(),
  code: z.string(),
  description: z.string(),
  qty: num,
  unit_price_usd: num,
  subtotal_usd: num,
  sort_order: num,
})
export type QuoteItem = z.infer<typeof QuoteItemSchema>

/** Línea editable de un borrador (la clave local permite reordenar con dnd). */
export type QuoteDraftLine = {
  key: string
  product_id: string | null
  code: string
  description: string
  qty: number
  unit_price_usd: number
}

/** Resultado de public.suggest_kit_candidates(). */
export const KitCandidateSchema = z.object({
  kit_id: z.string(),
  code: z.string(),
  name: z.string(),
  grid_type: GridTypeSchema,
  phases: z.string(),
  kwp: num,
  battery_kwh: num,
  inverter_kw: numOrNull,
  est_kwh_month: numOrNull,
  total_usd: num,
  items_without_price: num,
  kwp_diff_pct: numOrNull,
  within_tolerance: z.boolean().nullable(),
})
export type KitCandidate = z.infer<typeof KitCandidateSchema>

export const SolarZoneSchema = z.object({
  id: z.string(),
  kind: z.enum(["city", "region"]),
  name: z.string(),
  province: z.string(),
  hsp_horizontal: num,
  hsp_optimal: num,
  notes: z.string().nullable(),
  sort_order: num,
})
export type SolarZone = z.infer<typeof SolarZoneSchema>

export const AppliancePresetSchema = z.object({
  id: z.string(),
  name: z.string(),
  watts: num,
  hours_per_day: num,
  sort_order: num,
})
export type AppliancePreset = z.infer<typeof AppliancePresetSchema>

/** Fila de v_quote_status_history. */
export const QuoteStatusEventSchema = z.object({
  id: z.string(),
  quote_id: z.string(),
  from_status: QuoteStatusSchema,
  to_status: QuoteStatusSchema,
  note: z.string().nullable(),
  changed_by: z.string().nullable(),
  changed_by_name: z.string().nullable(),
  changed_at: z.string(),
})
export type QuoteStatusEvent = z.infer<typeof QuoteStatusEventSchema>

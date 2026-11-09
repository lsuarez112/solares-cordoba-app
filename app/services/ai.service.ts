import { z } from "zod"

import {
  AiCreditTopupSchema,
  AiExtractResultSchema,
  AiKitDraftSchema,
  AiRequestListItemSchema,
  AiSelectResultSchema,
  AiUsageSummarySchema,
  type AiCreditTopup,
  type AiExtractResult,
  type AiKitDraft,
  type AiRequestListItem,
  type AiSelectResult,
  type AiTopupFormValues,
  type AiUsageSummary,
} from "~/domain/ai/ai.schemas"
import type { GridType } from "~/domain/products/products.schemas"
import { devLog } from "~/lib/dev-log"
import { createClient } from "~/lib/supabase/client"

function fail(scope: string, error: unknown): never {
  devLog(`[ai-service] ${scope} error`, error)
  throw error
}

/** Mensaje legible de un error de la Edge Function (viene en el cuerpo). */
async function functionError(error: unknown): Promise<Error> {
  const context = (error as { context?: Response })?.context
  if (context && typeof context.json === "function") {
    try {
      const body = await context.json()
      if (body?.error) return new Error(String(body.error))
    } catch {
      // cuerpo no JSON
    }
  }
  return error instanceof Error ? error : new Error("No se pudo consultar a la IA")
}

async function invoke<T>(body: Record<string, unknown>, schema: z.ZodType<T>): Promise<T> {
  const supabase = createClient()
  const { data, error } = await supabase.functions.invoke("suggest-quote", { body })
  if (error) fail(`invoke ${String(body.action)}`, await functionError(error))
  return schema.parse(data)
}

export type AiSelectParams = {
  grid_type: GridType
  kwh_month: number
  coverage_pct: number
  battery_required: boolean
  autonomy_hours: number | null
  phases: "mono" | "tri" | null
  budget_cap_usd: number | null
  request_text: string | null
  sizing: { target_kwp: number; battery_kwh: number | null; hsp: number }
}

export const aiService = {
  /** Texto libre del cliente → datos del pedido (Haiku). */
  extract(text: string): Promise<AiExtractResult> {
    return invoke({ action: "extract", text }, AiExtractResultSchema)
  },

  /** Elige entre los kits candidatos (Sonnet, o la regla si hay uno claro). */
  select(params: AiSelectParams): Promise<AiSelectResult> {
    const { sizing, ...request } = params
    return invoke({ action: "select", request, sizing }, AiSelectResultSchema)
  },

  /** Arma un kit nuevo con productos del catálogo (Sonnet, ~USD 0,07). */
  buildKit(params: {
    grid_type: GridType
    phases: "mono" | "tri" | null
    kwp: number | null
    battery_kwh: number | null
    description: string
  }): Promise<AiKitDraft> {
    return invoke({ action: "build_kit", ...params }, AiKitDraftSchema)
  },

  /** Vincula las llamadas del wizard al presupuesto recién creado. */
  async linkRequests(quoteId: string, ids: string[]): Promise<void> {
    if (ids.length === 0) return
    const { error } = await createClient().rpc("link_ai_requests", { p_quote_id: quoteId, p_ids: ids })
    if (error) devLog("[ai-service] linkRequests error", error)
  },

  async usageSummary(): Promise<AiUsageSummary> {
    const { data, error } = await createClient().from("v_ai_usage_summary").select("*").single()
    if (error) fail("usageSummary", error)
    return AiUsageSummarySchema.parse(data)
  },

  async listRequests(limit = 500): Promise<AiRequestListItem[]> {
    const { data, error } = await createClient()
      .from("v_ai_requests_list")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit)
    if (error) fail("listRequests", error)
    return z.array(AiRequestListItemSchema).parse(data ?? [])
  },

  async listTopups(): Promise<AiCreditTopup[]> {
    const { data, error } = await createClient()
      .from("ai_credit_topups")
      .select("*")
      .order("topped_at", { ascending: false })
    if (error) fail("listTopups", error)
    return z.array(AiCreditTopupSchema).parse(data ?? [])
  },

  async addTopup(values: AiTopupFormValues): Promise<void> {
    const { error } = await createClient().from("ai_credit_topups").insert({
      amount_usd: values.amount_usd,
      topped_at: values.topped_at,
      notes: values.notes?.trim() || null,
    })
    if (error) fail("addTopup", error)
  },

  async removeTopup(id: string): Promise<void> {
    const { error } = await createClient().from("ai_credit_topups").delete().eq("id", id)
    if (error) fail("removeTopup", error)
  },
}

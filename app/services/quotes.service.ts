import { z } from "zod"

import type { GridType } from "~/domain/products/products.schemas"
import {
  AppliancePresetSchema,
  KitCandidateSchema,
  QuoteItemSchema,
  QuoteListItemSchema,
  QuoteSchema,
  SolarZoneSchema,
  type AppliancePreset,
  type KitCandidate,
  type Quote,
  type QuoteDraftLine,
  type QuoteItem,
  type QuoteListItem,
  type SolarZone,
} from "~/domain/quotes/quotes.schemas"
import { devLog } from "~/lib/dev-log"
import type { QuoteRequest, SizingResult } from "~/lib/sizing/sizing"
import { createClient } from "~/lib/supabase/client"

function fail(scope: string, error: unknown): never {
  devLog(`[quotes-service] ${scope} error`, error)
  throw error
}

export type QuoteDetail = {
  quote: Quote
  items: QuoteItem[]
  /** Todas las filas del mismo número (revisiones), de la más nueva a la más vieja. */
  revisions: QuoteListItem[]
  listItem: QuoteListItem
}

export type DraftPatch = {
  client_id?: string
  grid_type?: GridType | null
  input?: Record<string, unknown>
  sizing?: Record<string, unknown> | null
  iva_pct?: number
  notes?: string
  client_notes?: string
}

export const quotesService = {
  async list(): Promise<QuoteListItem[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("v_quotes_list")
      .select("*")
      .order("created_at", { ascending: false })
    if (error) fail("list", error)
    return z.array(QuoteListItemSchema).parse(data ?? [])
  },

  async listByClient(clientId: string): Promise<QuoteListItem[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("v_quotes_list")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
    if (error) fail("listByClient", error)
    return z.array(QuoteListItemSchema).parse(data ?? [])
  },

  /** Último presupuesto (para el inicio). */
  async latest(limit = 5): Promise<QuoteListItem[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("v_quotes_list")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(limit)
    if (error) fail("latest", error)
    return z.array(QuoteListItemSchema).parse(data ?? [])
  },

  async getDetail(id: string): Promise<QuoteDetail> {
    const supabase = createClient()
    const [quoteRes, itemsRes, listRes] = await Promise.all([
      supabase.from("quotes").select("*").eq("id", id).single(),
      supabase.from("quote_items").select("*").eq("quote_id", id).order("sort_order"),
      supabase.from("v_quotes_list").select("*").eq("id", id).single(),
    ])
    if (quoteRes.error) fail("getDetail quote", quoteRes.error)
    if (itemsRes.error) fail("getDetail items", itemsRes.error)
    if (listRes.error) fail("getDetail list", listRes.error)
    const quote = QuoteSchema.parse(quoteRes.data)

    let revisions: QuoteListItem[] = []
    if (quote.number != null) {
      const { data, error } = await supabase
        .from("v_quotes_list")
        .select("*")
        .eq("number", quote.number)
        .order("revision", { ascending: false })
      if (error) fail("getDetail revisions", error)
      revisions = z.array(QuoteListItemSchema).parse(data ?? [])
    }

    return {
      quote,
      items: z.array(QuoteItemSchema).parse(itemsRes.data ?? []),
      revisions,
      listItem: QuoteListItemSchema.parse(listRes.data),
    }
  },

  async suggestKits(params: {
    grid_type: GridType
    kwp: number
    battery_kwh: number | null
    phases: "mono" | "tri" | null
  }): Promise<KitCandidate[]> {
    const supabase = createClient()
    const { data, error } = await supabase.rpc("suggest_kit_candidates", {
      p_grid_type: params.grid_type,
      p_kwp: params.kwp,
      p_battery_kwh: params.battery_kwh ?? undefined,
      p_phases: params.phases ?? undefined,
      p_limit: 5,
    })
    if (error) fail("suggestKits", error)
    return z.array(KitCandidateSchema).parse(data ?? [])
  },

  async createFromKit(params: {
    client_id: string
    kit_id: string
    option_codes: string[]
    input: QuoteRequest
    sizing: SizingResult | null
    ai_summary?: Record<string, unknown> | null
  }): Promise<string> {
    const supabase = createClient()
    const { data, error } = await supabase.rpc("create_quote_from_kit", {
      p_client_id: params.client_id,
      p_kit_id: params.kit_id,
      p_input: params.input,
      p_option_codes: params.option_codes,
      p_sizing: params.sizing ?? undefined,
      p_ai_summary: (params.ai_summary ?? undefined) as never,
    })
    if (error) fail("createFromKit", error)
    return z.string().parse(data)
  },

  /** Presupuesto sin kit: se cargan los ítems a mano. */
  async createEmpty(params: {
    client_id: string
    grid_type: GridType | null
    input: QuoteRequest
    sizing: SizingResult | null
    iva_pct: number
    validity_days: number
    ai_summary?: Record<string, unknown> | null
  }): Promise<string> {
    const supabase = createClient()
    const validUntil = new Date(Date.now() + params.validity_days * 86_400_000)
      .toISOString()
      .slice(0, 10)
    const { data, error } = await supabase
      .from("quotes")
      .insert({
        client_id: params.client_id,
        grid_type: params.grid_type,
        input: params.input,
        sizing: params.sizing,
        iva_pct: params.iva_pct,
        valid_until: validUntil,
        ai_summary: (params.ai_summary ?? null) as never,
      })
      .select("id")
      .single()
    if (error) fail("createEmpty", error)
    return z.object({ id: z.string() }).parse(data).id
  },

  async saveDraft(id: string, patch: DraftPatch, lines: QuoteDraftLine[]): Promise<Quote> {
    const supabase = createClient()
    const { data, error } = await supabase.rpc("save_quote_draft", {
      p_quote_id: id,
      p_patch: patch,
      p_items: lines.map((l) => ({
        product_id: l.product_id,
        code: l.code,
        description: l.description,
        qty: l.qty,
        unit_price_usd: l.unit_price_usd,
      })),
    })
    if (error) fail("saveDraft", error)
    return QuoteSchema.parse(data)
  },

  /** Congela precios y cotización, asigna número y emite. */
  async issue(id: string, ivaPct: number): Promise<Quote> {
    const supabase = createClient()
    const { data, error } = await supabase.rpc("issue_quote", {
      p_quote_id: id,
      p_iva_pct: ivaPct,
    })
    if (error) fail("issue", error)
    return QuoteSchema.parse(data)
  },

  /** Crea (o devuelve la existente) revisión en borrador de un emitido. */
  async createRevision(id: string): Promise<string> {
    const supabase = createClient()
    const { data, error } = await supabase.rpc("create_quote_revision", { p_quote_id: id })
    if (error) fail("createRevision", error)
    return z.string().parse(data)
  },

  async duplicate(id: string, clientId?: string | null): Promise<string> {
    const supabase = createClient()
    const { data, error } = await supabase.rpc("duplicate_quote", {
      p_quote_id: id,
      p_client_id: clientId ?? undefined,
    })
    if (error) fail("duplicate", error)
    return z.string().parse(data)
  },

  /** Solo borradores (los emitidos los protege un trigger). */
  async remove(id: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase.from("quotes").delete().eq("id", id)
    if (error) fail("remove", error)
  },

  async solarZones(): Promise<SolarZone[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("solar_zones")
      .select("id, kind, name, province, hsp_horizontal, hsp_optimal, notes, sort_order")
      .order("kind")
      .order("sort_order")
    if (error) fail("solarZones", error)
    return z.array(SolarZoneSchema).parse(data ?? [])
  },

  async appliancePresets(): Promise<AppliancePreset[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("appliance_presets")
      .select("id, name, watts, hours_per_day, sort_order")
      .order("sort_order")
    if (error) fail("appliancePresets", error)
    return z.array(AppliancePresetSchema).parse(data ?? [])
  },
}

// Edge Function: sugerencias con Claude para el presupuesto (F4).
//   action "extract": texto libre del cliente → datos del pedido (Haiku). Sin catálogo.
//   action "build_kit": descripción → kit nuevo con productos del catálogo (Sonnet).
//   action "select":  pedido + dimensionamiento → elige entre ≤5 kits candidatos de la
//                     base (Sonnet). Si hay un candidato claro, decide la regla, sin IA.
// La API key vive en el secret ANTHROPIC_API_KEY. Cada llamada se registra en
// ai_requests con tokens y costo (el saldo de créditos se estima con eso).

import Anthropic from "npm:@anthropic-ai/sdk@1.3.0"
import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2"

import { costUsd } from "./pricing.ts"
import {
  EXTRACT_SCHEMA,
  EXTRACT_SYSTEM,
  KIT_SCHEMA,
  KIT_SYSTEM,
  SELECT_SYSTEM,
  selectSchema,
  type ExtractOutput,
  type KitOutput,
  type SelectOutput,
} from "./prompts.ts"

const MODEL_EXTRACT = Deno.env.get("AI_MODEL_EXTRACT") ?? "claude-haiku-5-5"
const MODEL_SELECT = Deno.env.get("AI_MODEL_SELECT") ?? "claude-sonnet-5-5"
const MODEL_KIT = Deno.env.get("AI_MODEL_KIT") ?? "claude-sonnet-5-5"
const MAX_TEXT = 4000

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

type Ctx = {
  user: SupabaseClient
  admin: SupabaseClient
  userId: string
  anthropic: Anthropic
}

// ---------------------------------------------------------------------------
// Llamada a Claude con salida estructurada + registro en ai_requests.
// ---------------------------------------------------------------------------
async function callClaude<T>(
  ctx: Ctx,
  step: "extract" | "select" | "kit",
  model: string,
  system: string,
  userContent: string,
  schema: Record<string, unknown>,
  logRequest: unknown,
  options: { effort?: "low" | "medium" | "high"; maxTokens?: number } = {},
): Promise<{ output: T; requestId: string | null; cost: number | null }> {
  const started = Date.now()
  let response: Anthropic.Message | null = null
  let error: string | null = null
  let output: T | null = null

  try {
    response = await ctx.anthropic.messages.create({
      model,
      max_tokens: options.maxTokens ?? 4000,
      // Sin prompt caching: con poco tráfico la caché de 5 min casi nunca se lee y
      // escribirla cuesta 1,25× la entrada. Activar si el volumen lo justifica.
      system,
      messages: [{ role: "user", content: userContent }],
      output_config: {
        effort: options.effort ?? "low",
        format: { type: "json_schema", schema },
      },
    })
    if (response.stop_reason === "refusal") throw new Error("El modelo rechazó la consulta")
    if (response.stop_reason === "max_tokens") throw new Error("Respuesta incompleta (límite de tokens)")
    const text = response.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("")
    output = JSON.parse(text) as T
  } catch (e) {
    error = e instanceof Error ? e.message : String(e)
  }

  const usage = response?.usage
  const cost = usage ? costUsd(response!.model ?? model, usage) : null
  const { data: row } = await ctx.admin
    .from("ai_requests")
    .insert({
      step,
      model: response?.model ?? model,
      request: logRequest,
      response: output,
      tokens_in: usage?.input_tokens ?? null,
      tokens_out: usage?.output_tokens ?? null,
      cache_read_tokens: usage?.cache_read_input_tokens ?? null,
      cache_write_tokens: usage?.cache_creation_input_tokens ?? null,
      cost_usd: cost,
      duration_ms: Date.now() - started,
      error,
      created_by: ctx.userId,
    })
    .select("id")
    .single()

  if (error || output === null) throw new HttpError(502, `No se pudo consultar a la IA: ${error ?? "sin respuesta"}`)
  return { output, requestId: row?.id ?? null, cost }
}

// ---------------------------------------------------------------------------
// extract
// ---------------------------------------------------------------------------
const normalize = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim()

async function matchZone(ctx: Ctx, city: string | null) {
  if (!city) return null
  const { data } = await ctx.user.from("solar_zones").select("id, name, kind").eq("kind", "city")
  const target = normalize(city)
  const zones = data ?? []
  return (
    zones.find((z) => normalize(z.name) === target) ??
    zones.find((z) => target.includes(normalize(z.name)) || normalize(z.name).includes(target)) ??
    null
  )
}

async function extract(ctx: Ctx, body: { text?: unknown }) {
  const text = typeof body.text === "string" ? body.text.trim().slice(0, MAX_TEXT) : ""
  if (text.length < 5) throw new HttpError(400, "Pegá el pedido del cliente para interpretarlo")

  const { output, requestId, cost } = await callClaude<ExtractOutput>(
    ctx,
    "extract",
    MODEL_EXTRACT,
    EXTRACT_SYSTEM,
    `Pedido del cliente:\n"""\n${text}\n"""`,
    EXTRACT_SCHEMA,
    { text },
  )
  const zone = await matchZone(ctx, output.city)
  return {
    ...output,
    zone_id: zone?.id ?? null,
    zone_name: zone?.name ?? null,
    ai_request_id: requestId,
    cost_usd: cost,
  }
}

// ---------------------------------------------------------------------------
// select
// ---------------------------------------------------------------------------
type Candidate = {
  kit_id: string
  code: string
  name: string
  phases: string | null
  kwp: number
  battery_kwh: number
  inverter_kw: number | null
  est_kwh_month: number | null
  total_usd: number
  items_without_price: number
  kwp_diff_pct: number | null
  within_tolerance: boolean
}

type SelectBody = {
  request?: {
    grid_type?: string
    kwh_month?: number | null
    coverage_pct?: number | null
    battery_required?: boolean
    autonomy_hours?: number | null
    phases?: "mono" | "tri" | null
    budget_cap_usd?: number | null
    request_text?: string | null
  }
  sizing?: { target_kwp?: number; battery_kwh?: number | null; hsp?: number }
}

async function select(ctx: Ctx, body: SelectBody) {
  const req = body.request ?? {}
  const sizing = body.sizing ?? {}
  if (!req.grid_type || !(Number(sizing.target_kwp) > 0)) {
    throw new HttpError(400, "Faltan el tipo de sistema y el dimensionamiento")
  }

  const { data, error } = await ctx.user.rpc("suggest_kit_candidates", {
    p_grid_type: req.grid_type,
    p_kwp: sizing.target_kwp,
    p_battery_kwh: sizing.battery_kwh ?? null,
    p_phases: req.phases ?? null,
    p_limit: 5,
  })
  if (error) throw new HttpError(500, `No se pudieron buscar kits: ${error.message}`)
  const candidates = (data ?? []) as Candidate[]

  if (candidates.length === 0) {
    return { kit_id: null, source: "none", reason: "No hay kits activos para este pedido.", warnings: [], missing_info: [] }
  }
  // Un candidato claro: lo decide la regla, sin gastar tokens.
  const clear =
    candidates.length === 1 ||
    (candidates[0].within_tolerance && !candidates[1].within_tolerance)
  const capOk = (c: Candidate) => !req.budget_cap_usd || c.total_usd <= req.budget_cap_usd
  if (clear && capOk(candidates[0])) {
    return {
      kit_id: candidates[0].kit_id,
      source: "rule",
      reason: "Es el único kit dentro de la tolerancia de potencia.",
      warnings: [],
      missing_info: [],
    }
  }

  const [{ data: kits }, { data: rules }] = await Promise.all([
    ctx.user.from("kits").select("id, notes").in("id", candidates.map((c) => c.kit_id)),
    ctx.user
      .from("assembly_rules")
      .select("text, grid_type")
      .eq("active", true)
      .or(`grid_type.is.null,grid_type.eq.${req.grid_type}`)
      .order("sort_order"),
  ])
  const notes = new Map((kits ?? []).map((k) => [k.id, k.notes as string | null]))
  const aliases = candidates.map((_, i) => `K${i + 1}`)

  // Compacto: solo lo que hace falta para decidir.
  const payload = {
    pedido: {
      tipo: req.grid_type,
      fases: req.phases ?? "sin indicar",
      consumo_kwh_mes: req.kwh_month ?? null,
      cobertura_pct: req.coverage_pct ?? 100,
      bateria_requerida: Boolean(req.battery_required),
      autonomia_h: req.autonomy_hours ?? null,
      tope_usd: req.budget_cap_usd ?? null,
      texto: req.request_text ? req.request_text.slice(0, 1500) : null,
    },
    dimensionamiento: {
      kwp_necesario: sizing.target_kwp,
      bateria_kwh_necesaria: sizing.battery_kwh ?? null,
      hsp: sizing.hsp ?? null,
    },
    candidatos: candidates.map((c, i) => ({
      id: aliases[i],
      nombre: c.name,
      fases: c.phases,
      kwp: c.kwp,
      desvio_kwp_pct: c.kwp_diff_pct,
      bateria_kwh: c.battery_kwh,
      inversor_kw: c.inverter_kw,
      gen_kwh_mes: c.est_kwh_month,
      total_usd: c.total_usd,
      items_sin_precio: c.items_without_price,
      notas: notes.get(c.kit_id) ?? null,
    })),
    reglas: (rules ?? []).map((r) => r.text),
  }

  const { output, requestId, cost } = await callClaude<SelectOutput>(
    ctx,
    "select",
    MODEL_SELECT,
    SELECT_SYSTEM,
    JSON.stringify(payload),
    selectSchema(aliases),
    payload,
  )
  const index = output.kit ? aliases.indexOf(output.kit) : -1
  return {
    kit_id: index >= 0 ? candidates[index].kit_id : null,
    source: "ai",
    reason: output.reason,
    warnings: output.warnings,
    missing_info: output.missing_info,
    ai_request_id: requestId,
    cost_usd: cost,
  }
}

// ---------------------------------------------------------------------------
// build_kit: arma un kit nuevo con el catálogo compacto + 2 kits de ejemplo.
// ---------------------------------------------------------------------------
type KitBody = {
  description?: unknown
  grid_type?: unknown
  phases?: unknown
  kwp?: unknown
  battery_kwh?: unknown
}

type KitRow = {
  code: string
  name: string
  phases: string | null
  kwp: number
  battery_kwh: number
  kit_items: { qty: number; sort_order: number; product: { product_code: string; name: string } | null }[]
}

const GRID_TYPES = ["ON-GRID", "HYBRID", "OFF-GRID"]
const oneLine = (s: string, max: number) => s.replace(/\s+/g, " ").trim().slice(0, max)

function propsText(props: unknown): string {
  if (!props || typeof props !== "object") return ""
  return Object.entries(props as Record<string, unknown>)
    .filter(([, v]) => v !== null && v !== "" && typeof v !== "object")
    .map(([k, v]) => `${k}=${oneLine(String(v), 40)}`)
    .join(";")
}

async function buildKit(ctx: Ctx, body: KitBody) {
  const description = typeof body.description === "string" ? body.description.trim().slice(0, MAX_TEXT) : ""
  const gridType = typeof body.grid_type === "string" && GRID_TYPES.includes(body.grid_type) ? body.grid_type : null
  if (!gridType) throw new HttpError(400, "Elegí el tipo de sistema del kit")
  if (description.length < 5) throw new HttpError(400, "Describí el kit que querés armar")
  const phases = body.phases === "tri" || body.phases === "mono" ? body.phases : null
  const kwp = Number(body.kwp) > 0 ? Number(body.kwp) : null
  const batteryKwh =
    body.battery_kwh !== null && body.battery_kwh !== undefined && body.battery_kwh !== "" && Number(body.battery_kwh) >= 0
      ? Number(body.battery_kwh)
      : null

  const [{ data: products, error: productsError }, { data: categories }, { data: kits }, { data: rules }] =
    await Promise.all([
      ctx.user
        .from("products")
        .select("id, product_code, name, category_id, grid_type, generic_properties, price_usd")
        .eq("active", true)
        .or(`grid_type.is.null,grid_type.eq.${gridType}`)
        .order("product_code"),
      ctx.user.from("product_categories").select("id, name"),
      ctx.user
        .from("kits")
        .select("code, name, phases, kwp, battery_kwh, kit_items(qty, sort_order, product:products(product_code, name))")
        .eq("active", true)
        .eq("grid_type", gridType),
      ctx.user
        .from("assembly_rules")
        .select("text")
        .eq("active", true)
        .or(`grid_type.is.null,grid_type.eq.${gridType}`)
        .order("sort_order"),
    ])
  if (productsError) throw new HttpError(500, `No se pudo leer el catálogo: ${productsError.message}`)
  const catName = new Map((categories ?? []).map((c) => [c.id as string, c.name as string]))
  const catalog = products ?? []

  // Dos kits de ejemplo del mismo tipo, los más cercanos en potencia.
  const examples = ((kits ?? []) as unknown as KitRow[])
    .sort((a, b) => (kwp ? Math.abs(a.kwp - kwp) - Math.abs(b.kwp - kwp) : a.kwp - b.kwp))
    .slice(0, 2)
    .map((k) =>
      [
        `${k.name} (${k.kwp} kWp, batería ${k.battery_kwh} kWh, ${k.phases ?? "mono"})`,
        ...[...k.kit_items]
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((i) => `  ${i.qty} x ${i.product?.product_code} ${oneLine(i.product?.name ?? "", 50)}`),
      ].join("\n"),
    )

  const userContent = [
    `Tipo de sistema: ${gridType}. Fases: ${phases ?? "a elección (mono si no se indica)"}.`,
    kwp ? `Potencia objetivo: ${kwp} kWp.` : "",
    batteryKwh != null ? `Batería objetivo: ${batteryKwh} kWh.` : "",
    `Pedido: ${description}`,
    "",
    "Reglas de armado:",
    ...(rules ?? []).map((r) => `- ${r.text}`),
    "",
    "Kits de ejemplo del mismo tipo:",
    ...(examples.length ? examples : ["(no hay)"]),
    "",
    `Catálogo (${catalog.length} productos activos):`,
    ...catalog.map((p) =>
      [p.product_code, oneLine(p.name, 70), catName.get(p.category_id) ?? "", propsText(p.generic_properties)].join("|"),
    ),
  ].join("\n")

  const { output, requestId, cost } = await callClaude<KitOutput>(
    ctx,
    "kit",
    MODEL_KIT,
    KIT_SYSTEM,
    userContent,
    KIT_SCHEMA,
    { description, grid_type: gridType, phases, kwp, battery_kwh: batteryKwh, catalog_size: catalog.length },
    { effort: "medium", maxTokens: 12000 },
  )

  // Validación: solo códigos del catálogo activo; se suman repetidos.
  const byCode = new Map(catalog.map((p) => [p.product_code as string, p]))
  const warnings = [...output.warnings]
  const merged = new Map<string, { qty: number; reason: string }>()
  for (const item of output.items) {
    const code = item.product_code.trim()
    if (!byCode.has(code)) {
      warnings.push(`Se descartó ${code}: no está en el catálogo activo.`)
      continue
    }
    if (!(item.qty > 0)) continue
    const prev = merged.get(code)
    merged.set(code, { qty: (prev?.qty ?? 0) + item.qty, reason: prev?.reason ?? item.reason })
  }
  const items = [...merged].map(([code, v]) => {
    const p = byCode.get(code)!
    return {
      product_code: code,
      name: p.name as string,
      category: catName.get(p.category_id) ?? null,
      qty: Math.round(v.qty * 100) / 100,
      price_usd: Number(p.price_usd) || 0,
      reason: v.reason,
    }
  })

  // Código único (si ya existe, se le agrega un sufijo).
  let code = output.code.toUpperCase().replace(/[^A-Z0-9_-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 34) || "KIT_IA"
  if (code.length < 3) code = `KIT_${code}`
  const { data: existing } = await ctx.user.from("kits").select("code").ilike("code", `${code}%`)
  const taken = new Set((existing ?? []).map((k) => k.code as string))
  if (taken.has(code)) {
    let n = 2
    while (taken.has(`${code}_${n}`)) n++
    code = `${code}_${n}`
  }

  return {
    warnings: [...new Set(warnings)],
    kit: {
      code,
      name: oneLine(output.name, 120),
      grid_type: gridType,
      phases: output.phases,
      kwp: output.kwp,
      battery_kwh: gridType === "ON-GRID" ? 0 : output.battery_kwh,
      battery_voltage: output.battery_voltage,
      inverter_kw: output.inverter_kw,
      est_kwh_month: output.est_kwh_month ? Math.round(output.est_kwh_month) : null,
      description: oneLine(output.description, 500),
    },
    items,
    ai_request_id: requestId,
    cost_usd: cost,
  }
}

// ---------------------------------------------------------------------------
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405)

  try {
    const url = Deno.env.get("SUPABASE_URL")!
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY")
    if (!apiKey) throw new HttpError(500, "Falta configurar ANTHROPIC_API_KEY")

    const user = createClient(url, anonKey, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    })
    const [{ data: auth }, { data: isActive }] = await Promise.all([
      user.auth.getUser(),
      user.rpc("is_active_user"),
    ])
    if (!auth?.user || isActive !== true) throw new HttpError(401, "No autorizado")

    const admin = createClient(url, serviceKey)
    const [{ data: settings }, { data: usage }] = await Promise.all([
      admin.from("app_settings").select("ai_enabled").eq("id", 1).single(),
      admin.from("v_ai_usage_summary").select("topups_usd, balance_usd").single(),
    ])
    if (settings && settings.ai_enabled === false) {
      throw new HttpError(403, "La IA está desactivada en Configuración")
    }
    if (usage && Number(usage.topups_usd) > 0 && Number(usage.balance_usd) <= 0) {
      throw new HttpError(402, "Sin crédito de IA estimado: registrá una recarga en Configuración → IA")
    }

    const ctx: Ctx = { user, admin, userId: auth.user.id, anthropic: new Anthropic({ apiKey }) }
    const body = await req.json().catch(() => ({}))
    if (body.action === "extract") return json(await extract(ctx, body))
    if (body.action === "select") return json(await select(ctx, body))
    if (body.action === "build_kit") return json(await buildKit(ctx, body))
    throw new HttpError(400, "Acción inválida")
  } catch (e) {
    const status = e instanceof HttpError ? e.status : 500
    return json({ error: e instanceof Error ? e.message : "Error inesperado" }, status)
  }
})

// Edge Function: cotización oficial USD → ARS (venta) desde dolarapi.com.
// Guarda una fila en exchange_rates (source = 'api') y la devuelve.
// La puede llamar cualquier usuario activo (JWT) o un cron con la service role key.

import { createClient } from "jsr:@supabase/supabase-js@2"

const DOLAR_API_URL = "https://dolarapi.com/v1/dolares/oficial"

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

type DolarApiResponse = { compra?: number; venta?: number; fechaActualizacion?: string }

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405)

  const url = Deno.env.get("SUPABASE_URL")!
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  const authHeader = req.headers.get("Authorization") ?? ""

  // Autorización: service role (cron) o usuario activo.
  if (authHeader !== `Bearer ${serviceKey}`) {
    const userClient = createClient(url, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: isActive, error } = await userClient.rpc("is_active_user")
    if (error || isActive !== true) return json({ error: "No autorizado" }, 401)
  }

  let quote: DolarApiResponse
  try {
    const res = await fetch(DOLAR_API_URL, { headers: { Accept: "application/json" } })
    if (!res.ok) throw new Error(`dolarapi respondió ${res.status}`)
    quote = await res.json()
  } catch (error) {
    return json({ error: `No se pudo consultar la cotización: ${(error as Error).message}` }, 502)
  }

  const venta = Number(quote.venta)
  if (!Number.isFinite(venta) || venta <= 0) {
    return json({ error: "Respuesta de dolarapi sin valor de venta" }, 502)
  }

  const date = (quote.fechaActualizacion ?? new Date().toISOString()).slice(0, 10)
  const admin = createClient(url, serviceKey)

  // Si la última cotización de la API es igual (mismo día y valor), no duplica.
  const { data: last } = await admin
    .from("exchange_rates")
    .select("id, usd_to_ars, date, fetched_at, source")
    .eq("source", "api")
    .order("fetched_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (last && last.date === date && Number(last.usd_to_ars) === venta) {
    return json({
      id: last.id,
      usd_to_ars: venta,
      source: "api",
      rate_date: last.date,
      fetched_at: last.fetched_at,
    })
  }

  const { data: row, error: insertError } = await admin
    .from("exchange_rates")
    .insert({
      date,
      usd_to_ars: venta,
      source: "api",
      notes: "dolarapi · oficial venta",
      fetched_at: new Date().toISOString(),
    })
    .select("id, usd_to_ars, date, fetched_at")
    .single()

  if (insertError) return json({ error: insertError.message }, 500)

  return json({
    id: row.id,
    usd_to_ars: Number(row.usd_to_ars),
    source: "api",
    rate_date: row.date,
    fetched_at: row.fetched_at,
  })
})

// Prompts y esquemas de salida de suggest-quote. Son estáticos: lo variable va
// siempre en el mensaje del usuario (así se puede activar prompt caching).

const nullable = (schema: Record<string, unknown>) => ({ anyOf: [schema, { type: "null" }] })

export const EXTRACT_SYSTEM = `Sos asistente de un vendedor de sistemas solares fotovoltaicos en Argentina.
Recibís lo que el cliente escribió (WhatsApp o dictado) y devolvés los datos para dimensionar.

Reglas:
- No inventes datos. Si algo no está, devolvé null.
- grid_type: "ON-GRID" si quiere bajar la factura o inyectar a la red sin baterías; "HYBRID" si tiene red y quiere baterías/respaldo ante cortes; "OFF-GRID" si no tiene red (campo, cabaña sin luz). Si no se puede deducir, null.
- Consumo: kwh es el número de kWh de la factura. kwh_period = "bimonth" si dice bimestral o dos meses; si no, "month". Un monto en pesos NO es consumo.
- appliances: solo si enumera equipos. watts por unidad (si no los da, usá un valor típico y avisalo en notes), hours de uso por día, qty cantidad.
- battery_wanted: true si pide baterías o respaldo. autonomy_hours si dice cuántas horas o días (1 día = 24).
- battery_chemistry: "lead" si pide plomo/gel/AGM, "lifepo4" si pide litio; si no, null.
- phases: "tri" si dice trifásico, "mono" si dice monofásico; si no, null.
- city: localidad tal como la escribió. roof: "inclined" (chapa/teja con pendiente), "flat" (losa), "unknown".
- budget_cap_usd: tope en dólares si lo da. coverage_pct: % del consumo a cubrir si lo pide (ej. "bajar la mitad" = 50).
- notes: aclaraciones breves para el vendedor: supuestos que hiciste y datos que conviene confirmar.
- missing_info: SOLO lo imprescindible que falta para dimensionar: el tipo de sistema y/o el consumo (kWh o equipos con potencia y horas). Si ambos están, lista vacía. Frases cortas en español.`

export const EXTRACT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "grid_type", "kwh", "kwh_period", "appliances", "battery_wanted", "autonomy_hours",
    "battery_chemistry", "phases", "city", "roof", "budget_cap_usd", "coverage_pct", "notes", "missing_info",
  ],
  properties: {
    grid_type: nullable({ type: "string", enum: ["ON-GRID", "HYBRID", "OFF-GRID"] }),
    kwh: nullable({ type: "number" }),
    kwh_period: nullable({ type: "string", enum: ["month", "bimonth"] }),
    appliances: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "watts", "hours", "qty"],
        properties: {
          name: { type: "string" },
          watts: { type: "number" },
          hours: { type: "number" },
          qty: { type: "integer" },
        },
      },
    },
    battery_wanted: nullable({ type: "boolean" }),
    autonomy_hours: nullable({ type: "number" }),
    battery_chemistry: nullable({ type: "string", enum: ["lifepo4", "lead"] }),
    phases: nullable({ type: "string", enum: ["mono", "tri"] }),
    city: nullable({ type: "string" }),
    roof: { type: "string", enum: ["unknown", "inclined", "flat"] },
    budget_cap_usd: nullable({ type: "number" }),
    coverage_pct: nullable({ type: "number" }),
    notes: { type: "array", items: { type: "string" } },
    missing_info: { type: "array", items: { type: "string" } },
  },
} as const

export type ExtractOutput = {
  grid_type: "ON-GRID" | "HYBRID" | "OFF-GRID" | null
  kwh: number | null
  kwh_period: "month" | "bimonth" | null
  appliances: { name: string; watts: number; hours: number; qty: number }[]
  battery_wanted: boolean | null
  autonomy_hours: number | null
  battery_chemistry: "lifepo4" | "lead" | null
  phases: "mono" | "tri" | null
  city: string | null
  roof: "unknown" | "inclined" | "flat"
  budget_cap_usd: number | null
  coverage_pct: number | null
  notes: string[]
  missing_info: string[]
}

export const SELECT_SYSTEM = `Sos asistente de un vendedor de sistemas solares fotovoltaicos en Argentina.
Recibís el pedido del cliente, el dimensionamiento ya calculado y hasta 5 kits candidatos (K1..K5) filtrados de la base.
Elegí el kit más adecuado. No inventes kits ni precios: solo podés elegir uno de los candidatos, o null si ninguno sirve.

Criterios, en orden:
1. Mismo tipo de sistema y fases que el pedido.
2. Potencia (kWp) cercana a la necesaria: preferí cubrir 80–110 % del consumo; evitá quedar corto.
3. Si el pedido requiere batería, capacidad cercana a la necesaria.
4. Respetá el tope de presupuesto si existe (total USD sin IVA).
5. Si hay empate, el más económico.
Respetá las reglas de armado que se indiquen.

reason: una sola frase para el vendedor (cobertura, batería, precio). Nombrá los kits por su nombre, nunca como K1, K2…
warnings: como máximo 3, solo riesgos concretos de ESTE kit (sin precio cargado, queda corto, supera el tope).
missing_info: como máximo 3 datos del cliente que cambiarían la elección.
Todo en español, frases cortas.`

export function selectSchema(aliases: string[]) {
  return {
    type: "object",
    additionalProperties: false,
    required: ["kit", "reason", "warnings", "missing_info"],
    properties: {
      kit: nullable({ type: "string", enum: aliases }),
      reason: { type: "string" },
      warnings: { type: "array", items: { type: "string" } },
      missing_info: { type: "array", items: { type: "string" } },
    },
  }
}

export type SelectOutput = {
  kit: string | null
  reason: string
  warnings: string[]
  missing_info: string[]
}

// ---------------------------------------------------------------------------
// build_kit: arma un kit nuevo desde el catálogo (Kits → Crear con IA).
// ---------------------------------------------------------------------------
export const KIT_SYSTEM = `Sos ingeniero de una empresa que vende sistemas solares fotovoltaicos en Argentina.
Armás un KIT BASE (lista de materiales) a partir de la descripción del usuario, usando SOLO productos del catálogo que se te pasa (formato: código|nombre|categoría|propiedades).

Reglas:
- product_code debe ser exactamente un código del catálogo. No inventes códigos ni productos.
- Seguí la estructura de los kits de ejemplo del mismo tipo: paneles, inversor (y baterías si corresponde), estructura, protecciones DC/AC, cables, conectores, monitoreo y accesorios necesarios.
- Respetá las reglas de armado indicadas.
- Compatibilidad: inversor acorde al tipo de sistema y fases; baterías compatibles con el inversor (tensión, marca); cantidad de paneles para llegar a la potencia pedida sin exceder lo que admite el inversor.
- kwp = paneles × potencia del panel / 1000. battery_kwh = 0 si es on grid.
- est_kwh_month: generación mensual estimada ≈ kwp × 4,4 × 0,75 × 30.
- code: código corto en MAYÚSCULAS con guiones bajos (ej. KIT_HIB_5K_LI10). name: nombre comercial breve.
- description: una frase para el vendedor. reason de cada ítem: muy breve (por qué y cuántos).
- warnings: lo que el usuario debería revisar (compatibilidad dudosa, faltó un producto en el catálogo, etc.). Máximo 5.
Todo en español.`

export const KIT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "code", "name", "phases", "kwp", "battery_kwh", "battery_voltage", "inverter_kw", "est_kwh_month",
    "description", "items", "warnings",
  ],
  properties: {
    code: { type: "string" },
    name: { type: "string" },
    phases: { type: "string", enum: ["mono", "tri"] },
    kwp: { type: "number" },
    battery_kwh: { type: "number" },
    battery_voltage: nullable({ type: "number" }),
    inverter_kw: nullable({ type: "number" }),
    est_kwh_month: nullable({ type: "number" }),
    description: { type: "string" },
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["product_code", "qty", "reason"],
        properties: {
          product_code: { type: "string" },
          qty: { type: "number" },
          reason: { type: "string" },
        },
      },
    },
    warnings: { type: "array", items: { type: "string" } },
  },
} as const

export type KitOutput = {
  code: string
  name: string
  phases: "mono" | "tri"
  kwp: number
  battery_kwh: number
  battery_voltage: number | null
  inverter_kw: number | null
  est_kwh_month: number | null
  description: string
  items: { product_code: string; qty: number; reason: string }[]
  warnings: string[]
}

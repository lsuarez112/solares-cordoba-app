// Genera la migración de carga de catálogo a partir de los .md del armador:
//   - categorías solares (+ "Otros"), categoría/tipo de red/propiedades de cada SKU
//   - los 9 kits predefinidos con su BOM y opcionales
//
// Uso: node scripts/catalog/build-seed.mjs
// Salida: supabase/migrations/20261107120800_seed_catalog.sql

import { readFileSync, writeFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

import { KITS } from "./kits.data.mjs"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..")
const SRC = join(ROOT, "armador-kit-solares")
const OUT = join(ROOT, "supabase", "migrations", "20261107120800_seed_catalog.sql")

// ---------------------------------------------------------------------------
// Categorías
// ---------------------------------------------------------------------------
const CATEGORIES = [
  { prefix: "PNL", name: "Paneles Solares", slug: "paneles-solares", icon: "solar-panel", description: "Módulos fotovoltaicos" },
  { prefix: "INV", name: "Inversores", slug: "inversores", icon: "ev-charger", description: "Inversores on-grid, híbridos, off-grid y de bombeo" },
  { prefix: "BAT", name: "Baterías", slug: "baterias", icon: "battery-full", description: "Baterías LiFePO4, GEL/AGM y accesorios" },
  { prefix: "REG", name: "Reguladores", slug: "reguladores", icon: "battery-charging", description: "Reguladores de carga MPPT y PWM" },
  { prefix: "CAB", name: "Cableado", slug: "cableado", icon: "cable", description: "Cable solar y conectores MC4" },
  { prefix: "PRO", name: "Protecciones", slug: "protecciones", icon: "utility-pole", description: "Descargadores, fusibles, interruptores y disyuntores" },
  { prefix: "EST", name: "Estructura", slug: "estructura", icon: "toy-brick", description: "Soportes y estructuras de montaje" },
  { prefix: "MON", name: "Monitoreo", slug: "monitoreo", icon: "monitor", description: "Dongles WiFi, limitadores de inyección y medidores" },
  { prefix: "OTR", name: "Otros", slug: "otros", icon: "boxes", description: "Productos y servicios fuera del catálogo solar (no los usa la IA)" },
]

// ---------------------------------------------------------------------------
// Mapeo de columnas de las tablas .md → claves de generic_properties
// ---------------------------------------------------------------------------
const NUMERIC_KEYS = new Set(["potencia_wp", "potencia_w", "capacidad_kwh", "mppt", "pv_max_w", "hp"])
const COLUMN_KEYS = {
  "wp": "potencia_wp",
  "tecnología": "tecnologia",
  "marco": "marco",
  "marco panel": "marco",
  "p ac (w)": "potencia_w",
  "mppt": "mppt",
  "pv max (w)": "pv_max_w",
  "v max (v)": "v_max",
  "i max (a)": "i_max",
  "dongle": "dongle",
  "baterías compatibles": "baterias_compatibles",
  "bat. v": "tension_bateria",
  "mppt pv max": "mppt_pv",
  "hp recomendado": "hp",
  "compatible con": "compatible_con",
  "capacidad": "capacidad",
  "tensión": "tension",
  "ciclos": "ciclos",
  "dod": "dod",
  "dod rec.": "dod",
  "paralelo máx.": "paralelo_max",
  "uso": "uso",
  "corriente": "corriente",
  "tensión bat.": "tension_bateria",
  "pv max": "pv_max",
  "sección": "seccion",
  "color": "color",
  "norma": "norma",
  "tipo": "formato",
  "aplicación": "aplicacion",
  "polos": "polos",
  "sensibilidad": "sensibilidad",
  "peso": "peso",
  "notas": "notas",
}
const SKIP_COLUMNS = new Set(["sku", "descripción", "modelo", "marca / modelo", "cant."])

// Orden de las claves (las primeras se ven como etiquetas en la tabla).
const KEY_ORDER = [
  "tipo", "potencia_wp", "potencia_w", "capacidad_kwh", "quimica", "fases", "tension_bateria",
  "tension", "corriente", "seccion", "mppt", "pv_max_w", "tecnologia", "marco", "formato",
]

/** Clasifica una fila según el archivo y los títulos (# y ##) en los que está. */
function classify(file, h1, h2) {
  const H1 = h1.toUpperCase()
  const H2 = h2.toLowerCase()
  const fases = H2.includes("monofás") ? "mono" : H2.includes("trifás") ? "tri" : null

  switch (file) {
    case "products panels.md":
      return { prefix: "PNL", props: { tipo: "panel" } }
    case "products inverters ongrid.md":
      if (H2.includes("dongle")) return { prefix: "MON", props: { tipo: "dongle wifi" } }
      return { prefix: "INV", grid: "ON-GRID", props: { tipo: "on-grid", fases } }
    case "products inverters hybrid.md":
      if (H2.includes("dongle")) return { prefix: "MON", props: { tipo: "dongle wifi" } }
      if (H1.includes("HÍBRIDO")) return { prefix: "INV", grid: "HYBRID", props: { tipo: "híbrido", fases } }
      if (H2.includes("bombeo")) return { prefix: "INV", grid: "OFF-GRID", props: { tipo: "bombeo solar", fases: "tri" } }
      return { prefix: "INV", grid: "OFF-GRID", props: { tipo: "off-grid", fases } }
    case "products batteries.md": {
      if (H2.includes("accesorios")) return { prefix: "BAT", props: { tipo: "accesorio batería" } }
      const quimica = H2.includes("gel") ? "GEL/AGM" : H2.includes("ácido") ? "plomo-ácido" : "LiFePO4"
      return { prefix: "BAT", props: { tipo: "batería", quimica } }
    }
    case "products regulators.md":
      return { prefix: "REG", props: { tipo: H2.includes("pwm") ? "regulador PWM" : "regulador MPPT" } }
    case "products cables protections.md":
      if (H2.includes("limitador")) return { prefix: "MON", props: { tipo: "limitador de inyección" } }
      if (H2.includes("cable")) return { prefix: "CAB", props: { tipo: "cable solar" } }
      if (H2.includes("conector")) return { prefix: "CAB", props: { tipo: "conector" } }
      if (H1.includes("FUSIBLES")) return { prefix: "PRO", props: { tipo: "fusible" } }
      if (H1.includes("INTERRUPTORES")) {
        return { prefix: "PRO", props: { tipo: H2.includes("interruptores ca") ? "interruptor CA" : "interruptor CC" } }
      }
      if (H1.includes("DISYUNTORES")) return { prefix: "PRO", props: { tipo: "disyuntor diferencial" } }
      if (H1.includes("PROTECCIONES")) return { prefix: "PRO", props: { tipo: "descargador (SPD)" } }
      return null
    case "products structure.md": {
      const tipos = [
        ["coplanar", "soporte coplanar"], ["triangular", "estructura triangular"],
        ["a suelo", "estructura a suelo"], ["accesorios", "accesorio de soporte"],
        ["fijaciones", "fijación a suelo"], ["vehículos", "soporte vehículo"],
      ]
      const hit = tipos.find(([k]) => H2.includes(k))
      return hit ? { prefix: "EST", props: { tipo: hit[1] } } : null
    }
    default:
      return null
  }
}

function cleanCell(v) {
  return v.replace(/\*\*/g, "").replace(/\s+/g, " ").trim()
}

function normalizeValue(key, raw) {
  if (!raw || raw === "—" || raw === "-") return null
  let v = raw
  if (/^\d{1,3}(\.\d{3})+$/.test(v)) v = v.replace(/\./g, "")
  if (NUMERIC_KEYS.has(key)) {
    const n = Number(v.replace(",", "."))
    return Number.isFinite(n) ? n : v
  }
  return v
}

function normalizeCode(code) {
  const c = code.trim()
  return /^\d{1,5}$/.test(c) ? c.padStart(6, "0") : c.toUpperCase()
}

function parseProducts() {
  const files = [
    "products panels.md", "products inverters ongrid.md", "products inverters hybrid.md",
    "products batteries.md", "products regulators.md", "products cables protections.md",
    "products structure.md",
  ]
  const products = new Map()

  for (const file of files) {
    const lines = readFileSync(join(SRC, file), "utf8").split(/\r?\n/)
    let h1 = ""
    let h2 = ""
    let header = null

    for (const line of lines) {
      if (line.startsWith("# ")) { h1 = line.slice(2); h2 = ""; header = null; continue }
      if (line.startsWith("## ")) { h2 = line.slice(3); header = null; continue }
      if (!line.trim().startsWith("|")) { header = null; continue }

      const cells = line.trim().replace(/^\||\|$/g, "").split("|").map(cleanCell)
      if (cells.every((c) => /^:?-+:?$/.test(c))) continue
      if (!header) { header = cells.map((c) => c.toLowerCase()); continue }

      const sku = cells[0]
      if (!/^[0-9A-Z][0-9A-Z-]*\d[0-9A-Z-]*$/.test(sku)) continue

      const cls = classify(file, h1, h2)
      if (!cls) continue

      const code = normalizeCode(sku)
      if (products.has(code)) continue // la primera aparición manda

      const props = {}
      for (const [k, v] of Object.entries(cls.props)) if (v) props[k] = v
      header.forEach((col, i) => {
        if (i === 0 || SKIP_COLUMNS.has(col)) return
        const key = COLUMN_KEYS[col]
        if (!key) return
        const value = normalizeValue(key, cells[i] ?? "")
        if (value !== null && props[key] === undefined) props[key] = value
      })

      // Capacidad de batería como número (kWh) para filtrar.
      if (typeof props.capacidad === "string") {
        const m = props.capacidad.match(/([\d.]+)\s*kWh/i)
        if (m) { props.capacidad_kwh = Number(m[1]); delete props.capacidad }
      }

      const ordered = {}
      for (const k of KEY_ORDER) if (props[k] !== undefined) ordered[k] = props[k]
      for (const [k, v] of Object.entries(props)) if (ordered[k] === undefined) ordered[k] = v

      products.set(code, { code, prefix: cls.prefix, grid: cls.grid ?? null, props: ordered })
    }
  }
  return [...products.values()]
}

// ---------------------------------------------------------------------------
// SQL
// ---------------------------------------------------------------------------
const q = (v) => (v === null || v === undefined ? "null" : `'${String(v).replace(/'/g, "''")}'`)
const num = (v) => (v === null || v === undefined ? "null" : String(v))

function buildSql() {
  const products = parseProducts()
  const out = []

  out.push(`-- =============================================================================
-- Carga de catálogo (GENERADO por scripts/catalog/build-seed.mjs — no editar a mano).
-- Fuente: armador-kit-solares/products *.md y scripts/catalog/kits.data.mjs
-- Productos del armador: ${products.length} · Kits: ${KITS.length}
-- =============================================================================
`)

  // Categorías
  out.push("-- Categorías solares")
  out.push(`insert into public.product_categories (name, prefix, slug, icon, description) values`)
  out.push(CATEGORIES.map((c) => `  (${q(c.name)}, ${q(c.prefix)}, ${q(c.slug)}, ${q(c.icon)}, ${q(c.description)})`).join(",\n"))
  out.push(`on conflict (prefix) do update set
  name = excluded.name, slug = excluded.slug, icon = excluded.icon, description = excluded.description;
`)

  // Productos del armador
  out.push("-- Categoría, tipo de red y propiedades de los productos del armador")
  out.push("with src (code, prefix, grid, props) as (values")
  out.push(products.map((p) =>
    `  (${q(p.code)}, ${q(p.prefix)}, ${p.grid ? `${q(p.grid)}::public.grid_type_enum` : "null::public.grid_type_enum"}, ${q(JSON.stringify(p.props))}::jsonb)`,
  ).join(",\n"))
  out.push(`)
update public.products p set
  category_id = c.id,
  grid_type = coalesce(src.grid, p.grid_type),
  generic_properties = coalesce(p.generic_properties, '{}'::jsonb) || src.props
from src
join public.product_categories c on c.prefix = src.prefix
where p.product_code = src.code;
`)

  out.push(`-- El resto (productos ajenos, servicios) va a "Otros". Se borra la categoría Colchones.
update public.products set category_id = (select id from public.product_categories where prefix = 'OTR')
where category_id is null
   or category_id = (select id from public.product_categories where prefix = 'COL');
delete from public.product_categories where prefix = 'COL';
`)

  // Kits
  out.push("-- Kits predefinidos")
  KITS.forEach((k, idx) => {
    out.push(`insert into public.kits (code, name, grid_type, phases, battery_voltage, kwp, battery_kwh, inverter_kw,
  est_kwh_month, ref_kwh_month_min, ref_kwh_month_max, description, notes, sort_order)
values (${q(k.code)}, ${q(k.name)}, ${q(k.grid_type)}, ${q(k.phases)}, ${num(k.battery_voltage)}, ${num(k.kwp)}, ${num(k.battery_kwh)}, ${num(k.inverter_kw)},
  ${num(k.est_kwh_month)}, ${num(k.ref[0])}, ${num(k.ref[1])}, ${q(k.description)}, ${q(k.notes)}, ${idx + 1})
on conflict (code) do nothing;
`)
    out.push(`insert into public.kit_items (kit_id, product_id, qty, sort_order)
select k.id, p.id, v.qty, v.ord
from (values
${k.items.map(([qty, code], i) => `  (${q(normalizeCode(code))}, ${qty}, ${i + 1})`).join(",\n")}
) as v(code, qty, ord)
join public.kits k on k.code = ${q(k.code)}
join public.products p on p.product_code = v.code
on conflict (kit_id, product_id) do nothing;
`)
    out.push(`insert into public.kit_options (kit_id, code, kind, name, changes, kwp, battery_kwh, est_kwh_month, notes, sort_order)
select k.id, v.code, v.kind, v.name, v.changes::jsonb, v.kwp, v.battery_kwh, v.est, v.notes, v.ord
from (values
${k.options.map((o, i) => `  (${q(o.code)}, ${q(o.kind)}, ${q(o.name)}, ${q(JSON.stringify(o.changes.map((c) => ({ ...c, product_code: normalizeCode(c.product_code) }))))}, ${num(o.kwp)}::numeric, ${num(o.battery_kwh)}::numeric, ${num(o.est_kwh_month)}::numeric, ${q(o.notes)}, ${i + 1})`).join(",\n")}
) as v(code, kind, name, changes, kwp, battery_kwh, est, notes, ord)
join public.kits k on k.code = ${q(k.code)}
on conflict (kit_id, code) do nothing;
`)
  })

  // Verificación: todo SKU de kits y opcionales debe existir.
  const kitCodes = new Set()
  for (const k of KITS) {
    k.items.forEach(([, c]) => kitCodes.add(normalizeCode(c)))
    k.options.forEach((o) => o.changes.forEach((c) => kitCodes.add(normalizeCode(c.product_code))))
  }
  out.push(`-- Verificación: todos los SKU usados por kits y opcionales existen.
do $$
declare missing text;
begin
  select string_agg(code, ', ') into missing
  from unnest(array[${[...kitCodes].sort().map(q).join(", ")}]) as code
  where not exists (select 1 from public.products p where p.product_code = code);
  if missing is not null then
    raise exception 'SKU de kits inexistentes: %', missing;
  end if;
end $$;
`)

  return { sql: out.join("\n"), count: products.length }
}

const { sql, count } = buildSql()
writeFileSync(OUT, sql)
console.log(`OK: ${count} productos, ${KITS.length} kits → ${OUT}`)

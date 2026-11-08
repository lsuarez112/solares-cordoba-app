export function emptyFieldLabel(fieldName: string): string {
  return `Sin ${fieldName.toLowerCase()}.`
}

export function displayTextField(
  value: string | null | undefined,
  fieldName: string,
): string {
  const trimmed = value?.trim()
  return trimmed ? trimmed : emptyFieldLabel(fieldName)
}

export function parseProductGenericProperties(
  properties: unknown,
): Array<{ key: string; value: string }> {
  if (!properties || typeof properties !== "object" || Array.isArray(properties)) {
    return []
  }
  return Object.entries(properties as Record<string, unknown>).map(
    ([key, value]) => ({
      key,
      value: value == null ? "" : String(value),
    }),
  )
}

const PROPERTY_UNITS: Record<string, string> = {
  potencia_wp: "Wp",
  potencia_w: "W",
  pv_max_w: "W",
  capacidad_kwh: "kWh",
  hp: "HP",
  mppt: "MPPT",
}

/** Valor de una propiedad con su unidad (ej. potencia_wp 460 → "460 Wp"). */
export function formatPropertyValue(key: string, value: string): string {
  const unit = PROPERTY_UNITS[key]
  return unit && value && !value.endsWith(unit) ? `${value} ${unit}` : value
}

/** Orden de importancia de las propiedades (jsonb no conserva el orden de las claves). */
const PROPERTY_PRIORITY = [
  "tipo",
  "potencia_wp",
  "potencia_w",
  "capacidad_kwh",
  "quimica",
  "fases",
  "tension_bateria",
  "tension",
  "corriente",
  "seccion",
  "formato",
  "tecnologia",
  "mppt",
  "pv_max_w",
  "marco",
  "hp",
]

/** Claves de texto largo que no se muestran en la versión compacta (filas de tabla). */
const COMPACT_HIDDEN = new Set([
  "notas",
  "compatible_con",
  "baterias_compatibles",
  "uso",
  "aplicacion",
  "dongle",
  "paralelo_max",
  "ciclos",
  "dod",
  "pv_max",
  "mppt_pv",
  "v_max",
  "i_max",
  "color",
  "norma",
  "sensibilidad",
  "peso",
])

export function orderProductProperties(
  items: Array<{ key: string; value: string }>,
  options?: { compact?: boolean },
): Array<{ key: string; value: string }> {
  const rank = (key: string) => {
    const i = PROPERTY_PRIORITY.indexOf(key)
    return i === -1 ? PROPERTY_PRIORITY.length : i
  }
  return items
    .filter(({ key, value }) => value !== "" && !(options?.compact && COMPACT_HIDDEN.has(key)))
    .map((item, index) => ({ item, index }))
    .sort((a, b) => rank(a.item.key) - rank(b.item.key) || a.index - b.index)
    .map(({ item }) => item)
}

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

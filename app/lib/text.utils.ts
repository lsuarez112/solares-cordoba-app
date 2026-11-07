/** Recorta un texto a `max` caracteres agregando "…" si se pasa. */
export function truncateText(text: string, max: number): string {
  const value = text.trim()
  if (value.length <= max) return value
  return `${value.slice(0, max).trimEnd()}…`
}

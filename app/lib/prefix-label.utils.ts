/** Etiqueta con prefijo opcional: `(PREFIJO) Nombre`. */
export function formatPrefixLabel(
  name: string,
  prefix?: string | null,
): string {
  const trimmedName = name.trim()
  const trimmedPrefix = prefix?.trim()
  if (!trimmedPrefix) return trimmedName
  return `(${trimmedPrefix}) ${trimmedName}`
}

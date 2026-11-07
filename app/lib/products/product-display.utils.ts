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

import { z } from "zod"

const ProductLinkSchema = z.object({
  label: z.string(),
  url: z.string().url(),
})

export type ProductLinkItem = z.infer<typeof ProductLinkSchema>

export function parseProductLinks(links: unknown): ProductLinkItem[] {
  if (!Array.isArray(links)) return []
  return links.flatMap((item) => {
    const parsed = ProductLinkSchema.safeParse(item)
    return parsed.success ? [parsed.data] : []
  })
}

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

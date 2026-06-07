const PRODUCT_CODE_MAX_LENGTH = 10

function normalizePrefix(value: string | null | undefined): string | null {
  const trimmed = value?.trim().toUpperCase()
  return trimmed || null
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function buildProductCode(
  supplier: string,
  category: string,
  sequence: number,
): string | null {
  const seqStr = String(sequence)
  const budget = PRODUCT_CODE_MAX_LENGTH - 2 - seqStr.length
  if (budget < 2) return null

  const supplierLen = Math.min(
    supplier.length,
    Math.max(1, Math.floor(budget / 2)),
  )
  const categoryLen = Math.min(category.length, budget - supplierLen)
  if (categoryLen < 1) return null

  const code = `${supplier.slice(0, supplierLen)}-${category.slice(0, categoryLen)}-${seqStr}`
  return code.length <= PRODUCT_CODE_MAX_LENGTH ? code : null
}

/** Propone código interno: `<prefijo proveedor>-<prefijo categoría>-<número>`. */
export function proposeProductCode({
  supplierPrefix,
  categoryPrefix,
  existingCodes,
}: {
  supplierPrefix: string | null | undefined
  categoryPrefix: string | null | undefined
  existingCodes: string[]
}): string | null {
  const supplier = normalizePrefix(supplierPrefix)
  const category = normalizePrefix(categoryPrefix)
  if (!supplier || !category) return null

  const existingSet = new Set(existingCodes.map((code) => code.toUpperCase()))

  const supplierLen = Math.min(
    supplier.length,
    Math.max(1, Math.floor((PRODUCT_CODE_MAX_LENGTH - 3) / 2)),
  )
  const categoryLen = Math.min(
    category.length,
    PRODUCT_CODE_MAX_LENGTH - 3 - supplierLen,
  )
  if (categoryLen < 1) return null

  const supplierPart = supplier.slice(0, supplierLen)
  const categoryPart = category.slice(0, categoryLen)
  const pattern = new RegExp(
    `^${escapeRegex(supplierPart)}-${escapeRegex(categoryPart)}-(\\d+)$`,
    "i",
  )

  let maxSequence = 0
  for (const code of existingCodes) {
    const match = code.match(pattern)
    if (match) {
      maxSequence = Math.max(maxSequence, Number.parseInt(match[1], 10))
    }
  }

  for (let sequence = maxSequence + 1; sequence < 10_000; sequence++) {
    const code = buildProductCode(supplier, category, sequence)
    if (code && !existingSet.has(code.toUpperCase())) {
      return code
    }
  }

  return null
}

export function getProductCodePlaceholder(
  supplierPrefix: string | null | undefined,
  categoryPrefix: string | null | undefined,
): string {
  const supplier = normalizePrefix(supplierPrefix) ?? "PROV"
  const category = normalizePrefix(categoryPrefix) ?? "CAT"
  return `${supplier}-${category}-1`
}

/**
 * Actualización masiva de precios: archivo de dos columnas (código + precio USD).
 * Lógica pura (sin DOM ni Supabase) para poder testearla.
 */

export type PriceImportStatus = "update" | "unchanged" | "not_found" | "invalid"

export type PriceImportRow = {
  /** Número de fila en el archivo (1 = primera fila). */
  line: number
  rawCode: string
  code: string
  price: number | null
  status: PriceImportStatus
  issue?: string
  productName?: string
  currentPrice?: number
}

export type PriceImportSummary = Record<PriceImportStatus, number> & {
  total: number
}

export type ProductPriceRef = { name: string; price_usd: number }

const CODE_HEADERS = ["codigo", "cod", "code", "sku", "articulo", "item", "producto"]
const PRICE_HEADERS = ["precio", "price", "usd", "importe", "valor", "pvp"]

/** Igual que public.normalize_product_code en la DB: SKU numérico → 6 dígitos. */
export function normalizeProductCode(code: string): string {
  const value = code.trim()
  if (/^\d{1,5}$/.test(value)) return value.padStart(6, "0")
  return value.toUpperCase()
}

function stripAccents(value: string) {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "")
}

function headerKey(value: unknown): string {
  return stripAccents(String(value ?? "")).toLowerCase().trim()
}

function codeFromCell(value: unknown): string {
  if (typeof value === "number") return String(Math.trunc(value))
  return String(value ?? "").trim()
}

/**
 * Interpreta un precio escrito en formato argentino o internacional.
 * "1.234,56" → 1234.56 · "1,234.56" → 1234.56 · "12,5" → 12.5 · "USD 99" → 99
 */
export function parsePriceValue(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null
  let text = String(value ?? "")
    .replace(/usd|u\$s|us\$|\$/gi, "")
    .replace(/\s/g, "")
  if (!text) return null

  const lastComma = text.lastIndexOf(",")
  const lastDot = text.lastIndexOf(".")

  if (lastComma >= 0 && lastDot >= 0) {
    // El separador que aparece último es el decimal.
    text =
      lastComma > lastDot
        ? text.replace(/\./g, "").replace(",", ".")
        : text.replace(/,/g, "")
  } else if (lastComma >= 0) {
    text = /^\d{1,3}(,\d{3})+$/.test(text)
      ? text.replace(/,/g, "")
      : text.replace(",", ".")
  } else if (/^\d{1,3}(\.\d{3}){2,}$/.test(text)) {
    // "1.234.567" → miles. "1.234" queda como decimal (precio USD habitual).
    text = text.replace(/\./g, "")
  }

  if (!/^-?\d+(\.\d+)?$/.test(text)) return null
  const n = Number(text)
  return Number.isFinite(n) ? n : null
}

type ColumnLayout = { codeIndex: number; priceIndex: number; hasHeader: boolean }

/** Detecta columnas por encabezado; si no hay, usa las dos primeras. */
export function detectColumns(firstRow: unknown[] | undefined): ColumnLayout {
  const cells = (firstRow ?? []).map(headerKey)
  const codeIndex = cells.findIndex((c) => CODE_HEADERS.some((h) => c.startsWith(h)))
  const priceIndex = cells.findIndex((c) => PRICE_HEADERS.some((h) => c.includes(h)))

  if (codeIndex >= 0 && priceIndex >= 0 && codeIndex !== priceIndex) {
    return { codeIndex, priceIndex, hasHeader: true }
  }
  // Sin encabezado reconocible: si la segunda celda no es un número, es un título.
  const hasHeader = firstRow !== undefined && parsePriceValue(firstRow[1]) === null
  return { codeIndex: 0, priceIndex: 1, hasHeader }
}

/** Convierte la matriz del archivo en filas evaluadas contra el catálogo. */
export function buildPriceImportRows(
  matrix: unknown[][],
  products: Map<string, ProductPriceRef>,
): PriceImportRow[] {
  const layout = detectColumns(matrix[0])
  const start = layout.hasHeader ? 1 : 0
  const rows: PriceImportRow[] = []
  const seen = new Map<string, number>()

  for (let i = start; i < matrix.length; i++) {
    const cells = matrix[i] ?? []
    const rawCode = codeFromCell(cells[layout.codeIndex])
    const rawPrice = cells[layout.priceIndex]
    if (!rawCode && (rawPrice === undefined || rawPrice === "")) continue

    const code = rawCode ? normalizeProductCode(rawCode) : ""
    const price = parsePriceValue(rawPrice)
    const line = i + 1
    const base = { line, rawCode, code, price }

    if (!code) {
      rows.push({ ...base, status: "invalid", issue: "Falta el código" })
      continue
    }
    if (price === null) {
      rows.push({ ...base, status: "invalid", issue: "Precio inválido" })
      continue
    }
    if (price < 0) {
      rows.push({ ...base, status: "invalid", issue: "Precio negativo" })
      continue
    }

    const previous = seen.get(code)
    if (previous !== undefined) {
      // La última aparición del código manda; la anterior se marca inválida.
      rows[previous] = { ...rows[previous], status: "invalid", issue: `Código repetido (fila ${line})` }
    }
    seen.set(code, rows.length)

    const product = products.get(code)
    if (!product) {
      rows.push({ ...base, status: "not_found", issue: "Código inexistente" })
      continue
    }

    const rounded = Math.round(price * 100) / 100
    rows.push({
      ...base,
      price: rounded,
      productName: product.name,
      currentPrice: product.price_usd,
      status: Math.abs(product.price_usd - rounded) < 0.005 ? "unchanged" : "update",
    })
  }
  return rows
}

export function summarizePriceImport(rows: PriceImportRow[]): PriceImportSummary {
  const summary: PriceImportSummary = {
    total: rows.length,
    update: 0,
    unchanged: 0,
    not_found: 0,
    invalid: 0,
  }
  for (const row of rows) summary[row.status] += 1
  return summary
}

/** Filas que se envían a la RPC (las inválidas no viajan). */
export function toPriceImportPayload(rows: PriceImportRow[]) {
  return rows
    .filter((row) => row.status !== "invalid" && row.price !== null)
    .map((row) => ({ code: row.code, price_usd: row.price as number }))
}

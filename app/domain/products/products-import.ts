export const MAX_IMPORT_ROWS = 100
export const IMPORT_BATCH_SIZE = 100

export type RawImportRow = {
  product_code: string
  description: string
  price_usd: number
}

export type ImportFileFormat = "csv" | "excel"

export type ImportRowStatus = "new" | "duplicate" | "invalid"

export interface ImportRow {
  index: number
  raw: Record<string, unknown>
  parsed: RawImportRow
  status: ImportRowStatus
  /** Mensaje para tooltip cuando hay duplicado o descripción vacía. */
  issue: string | null
  excluded: boolean
}

export interface ImportResult {
  inserted: number
  updated: number
  errors: number
}

/** Longitud máxima visible en celdas de preview (el valor completo se conserva al importar). */
export const IMPORT_DESCRIPTION_PREVIEW_MAX = 72

export const COLUMN_ALIASES: Record<string, keyof RawImportRow> = {
  code: "product_code",
  codigo: "product_code",
  "código": "product_code",
  product_code: "product_code",

  description: "description",
  descripcion: "description",
  "descripción": "description",
  desc: "description",
  nombre: "description",
  name: "description",
  producto: "description",

  price: "price_usd",
  precio: "price_usd",
  price_usd: "price_usd",
  "precio usd": "price_usd",
  usd: "price_usd",
}

export function normalizeImportRow(raw: Record<string, unknown>): RawImportRow {
  const product_code = String(raw.product_code ?? "").trim()
  const description = String(raw.description ?? "").trim()

  let price_usd = 0
  if (raw.price_usd != null && raw.price_usd !== "") {
    const price = Number(raw.price_usd)
    if (!Number.isNaN(price) && price >= 0) price_usd = price
  }

  return { product_code, description, price_usd }
}

export function resolveImportRowStatus(
  row: RawImportRow,
  existingCodes: Set<string>,
): {
  status: ImportRowStatus
  issue: string | null
  importable: boolean
} {
  if (!row.description) {
    return {
      status: "invalid",
      issue: "Falta la descripción",
      importable: false,
    }
  }

  if (existingCodes.has(row.product_code)) {
    return {
      status: "duplicate",
      issue: "Código existente — se actualizará al importar",
      importable: true,
    }
  }

  return { status: "new", issue: null, importable: true }
}

export function truncateImportDescription(
  text: string,
  max = IMPORT_DESCRIPTION_PREVIEW_MAX,
): string {
  if (text.length <= max) return text
  return `${text.slice(0, max)}…`
}

export function mapImportRowToUpsert(row: RawImportRow) {
  return {
    product_code: row.product_code,
    name: row.description,
    description: row.description,
    short_desc: truncateImportDescription(row.description, 100),
    price_usd: row.price_usd,
    active: true,
    stock: 0,
    is_composite: false,
  }
}

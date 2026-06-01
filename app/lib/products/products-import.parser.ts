import Papa from "papaparse"
import * as XLSX from "xlsx"

import {
  COLUMN_ALIASES,
  MAX_IMPORT_ROWS,
  normalizeImportRow,
  resolveImportRowStatus,
} from "~/domain/products/products-import"
import type {
  ImportFileFormat,
  ImportRow,
  RawImportRow,
} from "~/domain/products/products-import"

function normalizeHeaders(raw: Record<string, unknown>): Record<string, unknown> {
  const normalized: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(raw)) {
    const alias = COLUMN_ALIASES[key.toLowerCase().trim()]
    if (alias) normalized[alias] = value
    else normalized[key.toLowerCase().trim()] = value
  }
  return normalized
}

function normalizeImportRecord(raw: Record<string, unknown>): RawImportRow {
  return normalizeImportRow(normalizeHeaders(raw))
}

function isSkippableRow(row: RawImportRow): boolean {
  return !row.product_code && !row.description
}

export function validateImportRowData(
  raw: Record<string, unknown>,
  existingCodes: Set<string>,
): Pick<ImportRow, "parsed" | "status" | "issue"> {
  const parsed = normalizeImportRow(raw)
  const resolved = resolveImportRowStatus(parsed, existingCodes)

  return {
    parsed,
    status: resolved.status,
    issue: resolved.issue,
  }
}

export async function parseImportFile(
  file: File,
  format: ImportFileFormat,
): Promise<RawImportRow[]> {
  if (format === "excel") {
    return parseExcel(file)
  }
  return parseCSV(file)
}

function parseExcel(file: File): Promise<RawImportRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet)
        resolve(
          rows
            .map(normalizeImportRecord)
            .filter((row) => !isSkippableRow(row)),
        )
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

function parseCSV(file: File): Promise<RawImportRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        resolve(
          result.data
            .map(normalizeImportRecord)
            .filter((row) => !isSkippableRow(row)),
        )
      },
      error: reject,
    })
  })
}

export function buildImportRows(
  parsedRows: RawImportRow[],
  existingCodes: Set<string>,
): ImportRow[] {
  return parsedRows.map((parsed, index) => {
    const resolved = resolveImportRowStatus(parsed, existingCodes)

    return {
      index,
      raw: parsed,
      parsed,
      status: resolved.status,
      issue: resolved.issue,
      excluded: false,
    }
  })
}

export type ImportRowLimitInfo = {
  truncated: boolean
  message: string | null
}

export function applyImportRowLimit(
  parsedRows: RawImportRow[],
): { rows: RawImportRow[]; limit: ImportRowLimitInfo } {
  if (parsedRows.length <= MAX_IMPORT_ROWS) {
    return { rows: parsedRows, limit: { truncated: false, message: null } }
  }

  const limited = parsedRows.slice(0, MAX_IMPORT_ROWS)
  const last = limited[MAX_IMPORT_ROWS - 1]

  return {
    rows: limited,
    limit: {
      truncated: true,
      message: `El archivo supera el límite de ${MAX_IMPORT_ROWS} productos. Se importará hasta: ${last.product_code}, ${last.description}, $${last.price_usd.toFixed(2)}`,
    },
  }
}

export function formatImportRowLabel(row: RawImportRow): string {
  return `${row.product_code}, ${row.description}, $${row.price_usd.toFixed(2)}`
}

export function isImportRowImportable(row: ImportRow): boolean {
  return !row.excluded && row.status !== "invalid" && !!row.parsed.product_code
}

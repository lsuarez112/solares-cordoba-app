import {
  IMPORT_BATCH_SIZE,
  mapImportRowToUpsert,
} from "~/domain/products/products-import"
import type { ImportRow, ImportResult } from "~/domain/products/products-import"
import { isImportRowImportable } from "~/lib/products/products-import.parser"
import { devLog } from "~/lib/dev-log"
import { createClient } from "~/lib/supabase/client"

export async function importProducts(
  rows: ImportRow[],
  onProgress?: (done: number, total: number) => void,
): Promise<ImportResult> {
  const supabase = createClient()
  const toImport = rows.filter(isImportRowImportable)

  const result: ImportResult = { inserted: 0, updated: 0, errors: 0 }

  const newCodes = new Set(
    rows
      .filter((row) => row.status === "new" && isImportRowImportable(row))
      .map((row) => row.parsed.product_code),
  )

  let done = 0

  for (let i = 0; i < toImport.length; i += IMPORT_BATCH_SIZE) {
    const batch = toImport
      .slice(i, i + IMPORT_BATCH_SIZE)
      .map((row) => mapImportRowToUpsert(row.parsed))

    devLog("[import] upsert batch", {
      from: i,
      to: i + batch.length,
      total: toImport.length,
    })

    const { error } = await supabase
      .from("products")
      .upsert(batch, { onConflict: "product_code" })

    if (error) {
      devLog("[import] upsert error", error.message)
      result.errors += batch.length
    } else {
      for (const row of batch) {
        if (newCodes.has(row.product_code)) result.inserted++
        else result.updated++
      }
    }

    done += batch.length
    onProgress?.(done, toImport.length)
  }

  return result
}

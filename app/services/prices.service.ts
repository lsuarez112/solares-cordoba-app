import { z } from "zod"

import { devLog } from "~/lib/dev-log"
import { createClient } from "~/lib/supabase/client"

const PriceImportResultSchema = z.object({
  rows_total: z.number(),
  rows_updated: z.number(),
  rows_unchanged: z.number(),
  codes_not_found: z.array(z.string()),
})
export type PriceImportResult = z.infer<typeof PriceImportResultSchema>

const PriceImportLogSchema = PriceImportResultSchema.extend({
  id: z.string(),
  file_name: z.string(),
  created_at: z.string(),
  created_by: z.string().nullable(),
})
export type PriceImportLog = z.infer<typeof PriceImportLogSchema>

export const pricesService = {
  async applyImport(
    rows: Array<{ code: string; price_usd: number }>,
    fileName: string,
  ): Promise<PriceImportResult> {
    const supabase = createClient()
    const { data, error } = await supabase.rpc("apply_price_import", {
      p_rows: rows,
      p_file_name: fileName,
    })
    if (error) {
      devLog("[prices-service] applyImport error", error)
      throw error
    }
    return PriceImportResultSchema.parse(data)
  },

  async listImports(limit = 20): Promise<PriceImportLog[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("price_imports")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit)
    if (error) {
      devLog("[prices-service] listImports error", error)
      throw error
    }
    return z.array(PriceImportLogSchema).parse(data ?? [])
  },
}

import { z } from "zod"

import { devLog } from "~/lib/dev-log"
import { createClient } from "~/lib/supabase/client"

const ProductUsageSchema = z.object({
  kits: z.array(
    z.object({ id: z.string(), code: z.string(), name: z.string(), in_base: z.boolean() }),
  ),
  quotes: z.coerce.number(),
})
export type ProductUsage = z.infer<typeof ProductUsageSchema>

export function isProductInUse(usage: ProductUsage | null): boolean {
  return !!usage && (usage.kits.length > 0 || usage.quotes > 0)
}

/** Dónde se usa un producto o una categoría, para avisar antes de borrar. */
export const usageService = {
  async product(productId: string): Promise<ProductUsage> {
    const { data, error } = await createClient().rpc("product_usage", { p_product_id: productId })
    if (error) {
      devLog("[usage] product error", error)
      throw error
    }
    return ProductUsageSchema.parse(data)
  },

  async categoryProductsCount(categoryId: string): Promise<number> {
    const { count, error } = await createClient()
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("category_id", categoryId)
    if (error) {
      devLog("[usage] category error", error)
      throw error
    }
    return count ?? 0
  },
}

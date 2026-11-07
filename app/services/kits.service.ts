import { z } from "zod"

import {
  AssemblyRuleSchema,
  KitItemSchema,
  KitOptionSchema,
  KitSchema,
  type AssemblyRule,
  type Kit,
  type KitFormValues,
  type KitItem,
  type KitOption,
} from "~/domain/kits/kits.schemas"
import { devLog } from "~/lib/dev-log"
import { createClient } from "~/lib/supabase/client"

export type KitDetail = {
  kit: Kit
  items: KitItem[]
  options: KitOption[]
}

function fail(scope: string, error: unknown): never {
  devLog(`[kits-service] ${scope} error`, error)
  throw error
}

export const kitsService = {
  async list(): Promise<Kit[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("v_kits_with_totals")
      .select("*")
      .order("sort_order")
      .order("code")
    if (error) fail("list", error)
    return z.array(KitSchema).parse(data ?? [])
  },

  async getDetail(id: string): Promise<KitDetail> {
    const supabase = createClient()
    const [kitRes, itemsRes, optionsRes] = await Promise.all([
      supabase.from("v_kits_with_totals").select("*").eq("id", id).single(),
      supabase
        .from("kit_items")
        .select("product_id, qty, sort_order, product:products ( id, product_code, name, price_usd, active )")
        .eq("kit_id", id)
        .order("sort_order"),
      supabase.from("kit_options").select("*").eq("kit_id", id).order("sort_order"),
    ])
    if (kitRes.error) fail("getDetail kit", kitRes.error)
    if (itemsRes.error) fail("getDetail items", itemsRes.error)
    if (optionsRes.error) fail("getDetail options", optionsRes.error)

    return {
      kit: KitSchema.parse(kitRes.data),
      items: z.array(KitItemSchema).parse(itemsRes.data ?? []),
      options: z.array(KitOptionSchema).parse(optionsRes.data ?? []),
    }
  },

  /**
   * Guarda cabecera, BOM y opcionales. El BOM y los opcionales se reemplazan
   * completos (son pocos registros y así se respeta el orden de la UI).
   */
  async save(
    id: string | null,
    values: KitFormValues,
    productIdsByCode: Map<string, string>,
  ): Promise<string> {
    const supabase = createClient()
    const header = {
      code: values.code.trim().toUpperCase(),
      name: values.name.trim(),
      grid_type: values.grid_type,
      phases: values.phases,
      battery_voltage: values.battery_voltage,
      kwp: values.kwp,
      battery_kwh: values.grid_type === "ON-GRID" ? 0 : values.battery_kwh,
      inverter_kw: values.inverter_kw,
      est_kwh_month: values.est_kwh_month,
      ref_kwh_month_min: values.ref_kwh_month_min,
      ref_kwh_month_max: values.ref_kwh_month_max,
      description: values.description.trim() || null,
      notes: values.notes.trim() || null,
      active: values.active,
    }

    let kitId = id
    if (kitId) {
      const { error } = await supabase.from("kits").update(header).eq("id", kitId)
      if (error) fail("save update", error)
    } else {
      const { data, error } = await supabase.from("kits").insert(header).select("id").single()
      if (error) fail("save insert", error)
      kitId = (data as { id: string }).id
    }

    const items = values.items.map((item, i) => {
      const productId = productIdsByCode.get(item.product_code)
      if (!productId) throw new Error(`Producto inexistente: ${item.product_code}`)
      return { kit_id: kitId, product_id: productId, qty: item.qty, sort_order: i + 1 }
    })

    const { error: delItemsError } = await supabase.from("kit_items").delete().eq("kit_id", kitId)
    if (delItemsError) fail("save delete items", delItemsError)
    const { error: itemsError } = await supabase.from("kit_items").insert(items)
    if (itemsError) fail("save items", itemsError)

    const { error: delOptError } = await supabase.from("kit_options").delete().eq("kit_id", kitId)
    if (delOptError) fail("save delete options", delOptError)
    if (values.options.length > 0) {
      const { error: optError } = await supabase.from("kit_options").insert(
        values.options.map((option, i) => ({
          kit_id: kitId,
          code: option.code.trim().toUpperCase(),
          kind: option.kind,
          name: option.name.trim(),
          kwp: option.kwp,
          battery_kwh: option.battery_kwh,
          est_kwh_month: option.est_kwh_month,
          notes: option.notes.trim() || null,
          changes: option.changes.map((c) => ({
            op: c.op,
            product_code: c.product_code,
            ...(c.op === "remove" ? {} : { qty: Number(c.qty ?? 0) }),
          })),
          sort_order: i + 1,
        })),
      )
      if (optError) fail("save options", optError)
    }

    return kitId as string
  },

  async setActive(id: string, active: boolean): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase.from("kits").update({ active }).eq("id", id)
    if (error) fail("setActive", error)
  },

  async remove(id: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase.from("kits").delete().eq("id", id)
    if (error) fail("remove", error)
  },

  // ------------------------------------------------------------ reglas
  async listRules(): Promise<AssemblyRule[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("assembly_rules")
      .select("*")
      .order("sort_order")
      .order("created_at")
    if (error) fail("listRules", error)
    return z.array(AssemblyRuleSchema).parse(data ?? [])
  },

  async saveRule(rule: Omit<AssemblyRule, "id"> & { id?: string }): Promise<AssemblyRule> {
    const supabase = createClient()
    const payload = {
      grid_type: rule.grid_type,
      text: rule.text.trim(),
      active: rule.active,
      sort_order: rule.sort_order,
    }
    const query = rule.id
      ? supabase.from("assembly_rules").update(payload).eq("id", rule.id)
      : supabase.from("assembly_rules").insert(payload)
    const { data, error } = await query.select().single()
    if (error) fail("saveRule", error)
    return AssemblyRuleSchema.parse(data)
  },

  async removeRule(id: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase.from("assembly_rules").delete().eq("id", id)
    if (error) fail("removeRule", error)
  },
}

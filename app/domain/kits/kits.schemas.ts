import { z } from "zod"

import { GridTypeSchema } from "~/domain/products/products.schemas"

const num = z.coerce.number()
const numOrNull = z.coerce.number().nullable()

export const KitPhasesSchema = z.enum(["mono", "tri"])
export type KitPhases = z.infer<typeof KitPhasesSchema>

/** Fila de v_kits_with_totals. */
export const KitSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  grid_type: GridTypeSchema,
  phases: KitPhasesSchema,
  battery_voltage: numOrNull,
  kwp: num,
  battery_kwh: num,
  inverter_kw: numOrNull,
  est_kwh_month: numOrNull,
  ref_kwh_month_min: numOrNull,
  ref_kwh_month_max: numOrNull,
  description: z.string().nullable(),
  notes: z.string().nullable(),
  active: z.boolean(),
  sort_order: num,
  total_usd: num.default(0),
  items_count: num.default(0),
  items_without_price: num.default(0),
})
export type Kit = z.infer<typeof KitSchema>

export const KitOptionChangeSchema = z.object({
  op: z.enum(["add", "set", "remove"]),
  product_code: z.string().min(1, "Elegí un producto"),
  qty: z.coerce.number().min(0).optional(),
})

export const KitOptionKindSchema = z.enum(["autonomy", "generation", "extra"])
export type KitOptionKind = z.infer<typeof KitOptionKindSchema>

export const KitOptionSchema = z.object({
  id: z.string().optional(),
  code: z.string(),
  kind: KitOptionKindSchema,
  name: z.string(),
  changes: z.array(KitOptionChangeSchema),
  kwp: numOrNull.optional(),
  battery_kwh: numOrNull.optional(),
  est_kwh_month: numOrNull.optional(),
  notes: z.string().nullable().optional(),
  sort_order: num.default(0),
})
export type KitOption = z.infer<typeof KitOptionSchema>

export const KitItemSchema = z.object({
  product_id: z.string(),
  qty: num,
  sort_order: num.default(0),
  product: z.object({
    id: z.string(),
    product_code: z.string(),
    name: z.string(),
    price_usd: num,
    active: z.boolean(),
  }),
})
export type KitItem = z.infer<typeof KitItemSchema>

const optionalNumber = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? null : v),
  z.coerce.number().nonnegative().nullable(),
)

export const KitFormSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, "Mínimo 3 caracteres")
      .max(40)
      .regex(/^[A-Z0-9_-]+$/, "Solo mayúsculas, números, _ y -"),
    name: z.string().trim().min(3, "Mínimo 3 caracteres").max(120),
    grid_type: GridTypeSchema,
    phases: KitPhasesSchema,
    battery_voltage: optionalNumber,
    kwp: z.coerce.number().positive("Mayor a 0"),
    battery_kwh: z.coerce.number().min(0),
    inverter_kw: optionalNumber,
    est_kwh_month: optionalNumber,
    ref_kwh_month_min: optionalNumber,
    ref_kwh_month_max: optionalNumber,
    description: z.string().max(500),
    notes: z.string().max(500),
    active: z.boolean(),
    items: z
      .array(
        z.object({
          product_code: z.string().min(1),
          qty: z.coerce.number().positive("Mayor a 0"),
        }),
      )
      .min(1, "Agregá al menos un producto"),
    options: z.array(
      z.object({
        code: z.string().trim().min(1, "Código").max(10),
        kind: KitOptionKindSchema,
        name: z.string().trim().min(2, "Nombre"),
        kwp: optionalNumber,
        battery_kwh: optionalNumber,
        est_kwh_month: optionalNumber,
        notes: z.string().max(300),
        changes: z.array(KitOptionChangeSchema).min(1, "Agregá al menos un cambio"),
      }),
    ),
  })
  .refine((v) => v.grid_type !== "ON-GRID" || v.battery_kwh === 0, {
    path: ["battery_kwh"],
    message: "Un kit on-grid no lleva batería",
  })
  .refine((v) => new Set(v.options.map((o) => o.code)).size === v.options.length, {
    path: ["options"],
    message: "Hay códigos de opcional repetidos",
  })

export type KitFormValues = z.infer<typeof KitFormSchema>

export const AssemblyRuleSchema = z.object({
  id: z.string(),
  grid_type: GridTypeSchema.nullable(),
  text: z.string(),
  active: z.boolean(),
  sort_order: num,
})
export type AssemblyRule = z.infer<typeof AssemblyRuleSchema>

export const KIT_OPTION_KIND_LABELS: Record<KitOptionKind, string> = {
  autonomy: "Autonomía",
  generation: "Generación / inversor",
  extra: "Extra",
}

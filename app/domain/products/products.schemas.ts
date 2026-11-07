import { z } from "zod"

export const GridTypeSchema = z.enum(["ON-GRID", "OFF-GRID", "HYBRID"])

export const ProductCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  slug: z.string().nullable(),
  icon: z.string().nullable(),
  prefix: z.string().nullable().optional(),
})

export const ProductSchema = z.object({
  id: z.string().uuid(),
  product_code: z.string(),
  name: z.string(),
  short_desc: z.string().nullable(),
  description: z.string().nullable(),
  category_id: z.string().uuid().nullable(),
  category: ProductCategorySchema.nullable().optional(),
  grid_type: GridTypeSchema.nullable(),
  generic_properties: z.record(z.string(), z.unknown()).default({}),
  price_usd: z.coerce.number(),
  /** Se agrega en F1; opcional hasta que exista la columna. */
  price_updated_at: z.string().nullable().optional(),
  active: z.boolean(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
})

export const ProductFormSchema = z.object({
  product_code: z
    .string()
    .trim()
    .min(1, "El código es obligatorio")
    .max(20, "Máximo 20 caracteres"),
  name: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(255, "Máximo 255 caracteres"),
  short_desc: z
    .string()
    .max(300, "Máximo 300 caracteres")
    .nullable()
    .optional(),
  description: z.string().nullable().optional(),
  category_id: z.string().uuid().nullable().optional(),
  grid_type: GridTypeSchema.nullable().optional(),
  price_usd: z
    .number({ error: "Ingresá un precio válido" })
    .min(0, "El precio no puede ser negativo"),
  active: z.boolean(),
  generic_properties: z.array(
    z.object({
      key: z.string().min(1, "La clave es obligatoria"),
      value: z.string(),
    }),
  ),
})

export type GridType = z.infer<typeof GridTypeSchema>
export type ProductCategory = z.infer<typeof ProductCategorySchema>
export type Product = z.infer<typeof ProductSchema>
export type ProductFormValues = z.infer<typeof ProductFormSchema>

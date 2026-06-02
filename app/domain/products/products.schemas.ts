import { z } from "zod"

export const GridTypeSchema = z.enum(["ON-GRID", "OFF-GRID", "HYBRID"])

export const ProductCategorySchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    description: z.string().nullable(),
    slug: z.string().nullable(),
    icon: z.string().nullable(),
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
    links: z.array(z.unknown()).default([]),
    is_composite: z.boolean().default(false),
    price_usd: z.number(),
    stock: z.number(),
    stock_alert_at: z.number().nullable(),
    active: z.boolean(),
    created_at: z.string().nullable(),
    updated_at: z.string().nullable(),
})

export const ProductComponentSchema = z.object({
    parent_product_id: z.string().uuid(),
    child_product_id: z.string().uuid(),
    quantity: z.number(),
    notes: z.string().nullable(),
    child: ProductSchema.optional(),
})

export const ProductFormSchema = z.object({
  product_code: z
    .string()
    .min(1, "El código es obligatorio")
    .max(10, "Máximo 10 caracteres"),
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
  supplier_id: z.string().uuid().nullable().optional(),
  price_usd: z
    .number({ error: "Ingresá un precio válido" })
    .min(0, "El precio no puede ser negativo"),
  cost_usd: z.number().min(0).nullable().optional(),
  stock: z.number().int().min(0, "El stock no puede ser negativo"),
  stock_alert_at: z.number().int().min(0).nullable().optional(),
  is_composite: z.boolean(),
  active: z.boolean(),
  links: z.array(
    z.object({
      label: z.string().min(1, "El label es obligatorio"),
      url: z.string().url("URL inválida"),
    }),
  ),
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
export type ProductComponent = z.infer<typeof ProductComponentSchema>
export type ProductFormValues = z.infer<typeof ProductFormSchema>
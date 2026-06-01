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

export type GridType = z.infer<typeof GridTypeSchema>
export type ProductCategory = z.infer<typeof ProductCategorySchema>
export type Product = z.infer<typeof ProductSchema>
export type ProductComponent = z.infer<typeof ProductComponentSchema>
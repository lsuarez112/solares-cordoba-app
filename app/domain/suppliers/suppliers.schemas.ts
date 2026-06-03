import { z } from "zod"

export const SupplierCurrencySchema = z.enum(["ARS", "USD"])

export const SupplierSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  legal_name: z.string().nullable(),
  tax_id: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  whatsapp: z.string().nullable(),
  website: z.string().nullable(),
  notes: z.string().nullable(),
  active: z.boolean(),
  contact_name: z.string().nullable(),
  address: z.string().nullable(),
  city: z.string().nullable(),
  province: z.string().nullable(),
  country: z.string(),
  currency: SupplierCurrencySchema,
  payment_days: z.number().int().nullable(),
  category: z.string().nullable(),
  rating: z.number().nullable(),
  tags: z
    .array(z.string())
    .nullable()
    .transform((value) => value ?? []),
  created_at: z.string(),
  updated_at: z.string(),
})

export const SupplierFormSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(150, "Máximo 150 caracteres"),

  legal_name: z.string().max(200).nullable().optional(),

  tax_id: z.string().max(30).nullable().optional(),

  contact_name: z.string().max(150).nullable().optional(),

  email: z
    .string()
    .email("Email inválido")
    .nullable()
    .optional()
    .or(z.literal("")),

  phone: z.string().max(30).nullable().optional(),

  whatsapp: z.string().max(30).nullable().optional(),

  website: z
    .string()
    .url("URL inválida")
    .nullable()
    .optional()
    .or(z.literal("")),

  address: z.string().nullable().optional(),

  city: z.string().max(100).nullable().optional(),

  province: z.string().max(100).nullable().optional(),

  country: z.string().max(100).default("Argentina"),

  currency: SupplierCurrencySchema.default("ARS"),

  payment_days: z
    .number()
    .int()
    .min(0, "No puede ser negativo")
    .max(365)
    .nullable()
    .optional(),

  category: z.string().max(100).nullable().optional(),

  rating: z.number().int().min(1).max(5).nullable().optional(),

  tags: z.array(z.string()).default([]),

  notes: z.string().nullable().optional(),

  active: z.boolean().default(true),
})

export type SupplierCurrency = z.infer<typeof SupplierCurrencySchema>
export type Supplier = z.infer<typeof SupplierSchema>
export type SupplierFormValues = z.infer<typeof SupplierFormSchema>

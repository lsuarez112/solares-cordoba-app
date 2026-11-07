import { z } from "zod"

export const CompanySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  legal_name: z.string().nullable(),
  tax_id: z.string().nullable(),
  address: z.string().nullable(),
  city: z.string().nullable(),
  province: z.string().nullable(),
  country: z.string(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  website: z.string().nullable(),
  logo_url: z.string().nullable(),
  active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const CompanyFormSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(150, "Máximo 150 caracteres"),

  legal_name: z.string().max(200).nullable().optional(),

  tax_id: z.string().max(30).nullable().optional(),

  email: z
    .string()
    .email("Email inválido")
    .nullable()
    .optional()
    .or(z.literal("")),

  phone: z.string().max(30).nullable().optional(),

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

  active: z.boolean().default(true),
})

export type Company = z.infer<typeof CompanySchema>
export type CompanyFormValues = z.infer<typeof CompanyFormSchema>

import { z } from "zod"

export const CategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  slug: z.string().nullable(),
  icon: z.string().nullable(),
  prefix: z.string().nullable(),
})

export const CategoryFormSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "Máximo 100 caracteres"),
  description: z.string().max(500).nullable().optional(),
  slug: z.string().max(100).nullable().optional(),
  icon: z.string().nullable().optional(),
  prefix: z
    .string()
    .max(10, "Máximo 10 caracteres")
    .toUpperCase()
    .nullable()
    .optional(),
})

export type Category = z.infer<typeof CategorySchema>
export type CategoryFormValues = z.infer<typeof CategoryFormSchema>

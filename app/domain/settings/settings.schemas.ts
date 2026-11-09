import { z } from "zod"

/** Fila única de public.app_settings. */
export const AppSettingsSchema = z.object({
  id: z.number(),
  number_prefix: z.string(),
  default_validity_days: z.coerce.number(),
  default_iva_pct: z.coerce.number(),
  quote_footer: z.string().nullable(),
  rate_mode: z.enum(["api", "manual"]),
  quote_logo_mode: z.enum(["company", "custom", "none"]).default("company"),
  quote_logo_url: z.string().nullable().default(null),
  system_efficiency: z.coerce.number(),
  default_hsp: z.coerce.number(),
  kwp_tolerance_pct: z.coerce.number(),
  dod_lifepo4: z.coerce.number(),
  dod_lead: z.coerce.number(),
  battery_eff_lifepo4: z.coerce.number(),
  battery_eff_lead: z.coerce.number(),
  ai_enabled: z.boolean().default(true),
  ai_low_balance_usd: z.coerce.number().default(2),
  updated_at: z.string(),
})
export type AppSettings = z.infer<typeof AppSettingsSchema>
export type RateMode = AppSettings["rate_mode"]
export type QuoteLogoMode = AppSettings["quote_logo_mode"]

export const QuoteSettingsFormSchema = z.object({
  number_prefix: z
    .string()
    .trim()
    .min(1, "Requerido")
    .max(10, "Máximo 10 caracteres"),
  default_validity_days: z.coerce
    .number()
    .int("Número entero")
    .min(1, "Mínimo 1 día")
    .max(365, "Máximo 365 días"),
  default_iva_pct: z.coerce.number().min(0).max(100),
  quote_footer: z.string().max(1000, "Máximo 1000 caracteres"),
  system_efficiency: z.coerce.number().min(0.5, "Entre 0,5 y 1").max(1, "Entre 0,5 y 1"),
  default_hsp: z.coerce.number().min(2, "Entre 2 y 8").max(8, "Entre 2 y 8"),
  kwp_tolerance_pct: z.coerce.number().min(1).max(50),
})
export type QuoteSettingsFormValues = z.infer<typeof QuoteSettingsFormSchema>

export const ExchangeRateSchema = z.object({
  id: z.string(),
  date: z.string(),
  usd_to_ars: z.coerce.number(),
  source: z.enum(["api", "manual"]),
  notes: z.string().nullable(),
  fetched_at: z.string(),
  created_by: z.string().nullable(),
})
export type ExchangeRate = z.infer<typeof ExchangeRateSchema>

/** Resultado de public.current_exchange_rate(). */
export const CurrentExchangeRateSchema = z.object({
  id: z.string(),
  usd_to_ars: z.coerce.number(),
  source: z.enum(["api", "manual"]),
  rate_date: z.string(),
  fetched_at: z.string(),
})
export type CurrentExchangeRate = z.infer<typeof CurrentExchangeRateSchema>

export const ManualRateFormSchema = z.object({
  usd_to_ars: z.coerce
    .number({ message: "Ingresá un número" })
    .positive("Debe ser mayor a 0")
    .max(100000, "Valor fuera de rango"),
  notes: z.string().max(200).optional(),
})
export type ManualRateFormValues = z.infer<typeof ManualRateFormSchema>

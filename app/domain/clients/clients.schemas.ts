import { z } from "zod"

import { isLikelyValidPhone } from "~/lib/clients/phone"

const num = z.coerce.number()

/** Fila de public.clients. */
export const ClientSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string().nullable(),
  phone_normalized: z.string().nullable(),
  email: z.string().nullable(),
  city: z.string().nullable(),
  address: z.string().nullable(),
  cuit: z.string().nullable(),
  notes: z.string().nullable(),
  created_by: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})
export type Client = z.infer<typeof ClientSchema>

/** Fila de v_clients_list. */
export const ClientListItemSchema = ClientSchema.extend({
  quotes_count: num.default(0),
  issued_count: num.default(0),
  last_quote_at: z.string().nullable(),
})
export type ClientListItem = z.infer<typeof ClientListItemSchema>

const optionalText = (max: number) => z.string().trim().max(max, `Máximo ${max} caracteres`)

export const ClientFormSchema = z.object({
  name: z.string().trim().min(1, "Ingresá el nombre").max(120, "Máximo 120 caracteres"),
  phone: optionalText(40).refine((v) => !v || isLikelyValidPhone(v), {
    message: "Revisá el número (código de área + número)",
  }),
  email: optionalText(120).refine((v) => !v || z.email().safeParse(v).success, {
    message: "Email inválido",
  }),
  city: optionalText(80),
  address: optionalText(160),
  cuit: optionalText(20),
  notes: optionalText(1000),
})
export type ClientFormValues = z.infer<typeof ClientFormSchema>

export const emptyClientFormValues: ClientFormValues = {
  name: "",
  phone: "",
  email: "",
  city: "",
  address: "",
  cuit: "",
  notes: "",
}

export function clientToFormValues(client: Client): ClientFormValues {
  return {
    name: client.name,
    phone: client.phone ?? "",
    email: client.email ?? "",
    city: client.city ?? "",
    address: client.address ?? "",
    cuit: client.cuit ?? "",
    notes: client.notes ?? "",
  }
}

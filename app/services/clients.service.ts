import { z } from "zod"

import {
  ClientListItemSchema,
  ClientSchema,
  type Client,
  type ClientFormValues,
  type ClientListItem,
} from "~/domain/clients/clients.schemas"
import { devLog } from "~/lib/dev-log"
import { createClient } from "~/lib/supabase/client"

function fail(scope: string, error: unknown): never {
  devLog(`[clients-service] ${scope} error`, error)
  throw error
}

const toRow = (values: ClientFormValues) => ({
  name: values.name.trim(),
  phone: values.phone.trim() || null,
  email: values.email.trim() || null,
  city: values.city.trim() || null,
  address: values.address.trim() || null,
  cuit: values.cuit.trim() || null,
  notes: values.notes.trim() || null,
})

export const clientsService = {
  async list(): Promise<ClientListItem[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("v_clients_list")
      .select("*")
      .order("name")
    if (error) fail("list", error)
    return z.array(ClientListItemSchema).parse(data ?? [])
  },

  async get(id: string): Promise<ClientListItem> {
    const supabase = createClient()
    const { data, error } = await supabase.from("v_clients_list").select("*").eq("id", id).single()
    if (error) fail("get", error)
    return ClientListItemSchema.parse(data)
  },

  async create(values: ClientFormValues): Promise<Client> {
    const supabase = createClient()
    const { data, error } = await supabase.from("clients").insert(toRow(values)).select().single()
    if (error) fail("create", error)
    return ClientSchema.parse(data)
  },

  async update(id: string, values: ClientFormValues): Promise<Client> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("clients")
      .update(toRow(values))
      .eq("id", id)
      .select()
      .single()
    if (error) fail("update", error)
    return ClientSchema.parse(data)
  },

  /** Falla si tiene presupuestos (FK restrict): la UI ofrece unificar. */
  async remove(id: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase.from("clients").delete().eq("id", id)
    if (error) fail("remove", error)
  },

  /** Clientes con el mismo teléfono normalizado (aviso D8, no bloquea). */
  async findByPhone(phone: string, excludeId?: string | null): Promise<Client[]> {
    if (!phone.trim()) return []
    const supabase = createClient()
    const { data, error } = await supabase.rpc("find_clients_by_phone", {
      p_phone: phone,
      p_exclude_id: excludeId ?? undefined,
    })
    if (error) fail("findByPhone", error)
    return z.array(ClientSchema).parse(data ?? [])
  },

  /** Pasa los presupuestos de `mergeIds` a `keepId`, completa datos vacíos y borra los demás. */
  async merge(keepId: string, mergeIds: string[]): Promise<Client> {
    const supabase = createClient()
    const { data, error } = await supabase.rpc("merge_clients", {
      p_keep_id: keepId,
      p_merge_ids: mergeIds,
    })
    if (error) fail("merge", error)
    return ClientSchema.parse(data)
  },
}

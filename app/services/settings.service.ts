import { z } from "zod"

import {
  AppSettingsSchema,
  CurrentExchangeRateSchema,
  ExchangeRateSchema,
  type AppSettings,
  type CurrentExchangeRate,
  type ExchangeRate,
} from "~/domain/settings/settings.schemas"
import { devLog } from "~/lib/dev-log"
import { createClient } from "~/lib/supabase/client"

export type AppSettingsUpdate = Partial<Omit<AppSettings, "id" | "updated_at">>

export const settingsService = {
  async get(): Promise<AppSettings> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("app_settings")
      .select("*")
      .eq("id", 1)
      .single()
    if (error) {
      devLog("[settings-service] get error", error)
      throw error
    }
    return AppSettingsSchema.parse(data)
  },

  async update(payload: AppSettingsUpdate): Promise<AppSettings> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("app_settings")
      .update(payload)
      .eq("id", 1)
      .select()
      .single()
    if (error) {
      devLog("[settings-service] update error", error)
      throw error
    }
    return AppSettingsSchema.parse(data)
  },
}

export const exchangeRatesService = {
  async getCurrent(): Promise<CurrentExchangeRate | null> {
    const supabase = createClient()
    const { data, error } = await supabase.rpc("current_exchange_rate")
    if (error) {
      devLog("[exchange-rates] getCurrent error", error)
      throw error
    }
    const row = Array.isArray(data) ? data[0] : data
    return row ? CurrentExchangeRateSchema.parse(row) : null
  },

  async list(limit = 15): Promise<ExchangeRate[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("exchange_rates")
      .select("*")
      .order("fetched_at", { ascending: false })
      .limit(limit)
    if (error) {
      devLog("[exchange-rates] list error", error)
      throw error
    }
    return z.array(ExchangeRateSchema).parse(data ?? [])
  },

  async addManual(usdToArs: number, notes?: string): Promise<void> {
    const supabase = createClient()
    const { data: auth } = await supabase.auth.getUser()
    const { error } = await supabase.from("exchange_rates").insert({
      date: new Date().toISOString().slice(0, 10),
      usd_to_ars: usdToArs,
      source: "manual",
      notes: notes?.trim() || null,
      created_by: auth.user?.id ?? null,
    })
    if (error) {
      devLog("[exchange-rates] addManual error", error)
      throw error
    }
  },

  /** Pide a la Edge Function la cotización oficial (venta) y la guarda. */
  async fetchFromApi(): Promise<CurrentExchangeRate> {
    const supabase = createClient()
    const { data, error } = await supabase.functions.invoke("fetch-exchange-rate", {
      method: "POST",
    })
    if (error) {
      devLog("[exchange-rates] fetchFromApi error", error)
      throw error
    }
    return CurrentExchangeRateSchema.parse(data)
  },
}

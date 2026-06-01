import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from "@supabase/ssr"

import { getSupabaseCookieOptions } from "./cookie-options"
import { getSupabaseAnonKey, getSupabaseUrl } from "./env"

/** Cliente Supabase para loaders/actions (cookies de la petición). */
export function createServerSupabaseClient(request: Request) {
  const headers = new Headers()
  const cookieOptions = getSupabaseCookieOptions(request)

  const supabase = createServerClient(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookieOptions,
      cookies: {
        getAll() {
          const parsed = parseCookieHeader(request.headers.get("Cookie") ?? "")
          return parsed
            .filter(
              (cookie): cookie is { name: string; value: string } =>
                typeof cookie.value === "string",
            )
            .map((cookie) => ({
              name: cookie.name,
              value: cookie.value,
            }))
        },
        setAll(cookiesToSet, cacheHeaders) {
          cookiesToSet.forEach(({ name, value, options }) => {
            headers.append(
              "Set-Cookie",
              serializeCookieHeader(name, value, options),
            )
          })
          Object.entries(cacheHeaders).forEach(([key, value]) => {
            headers.set(key, value)
          })
        },
      },
    },
  )

  return { supabase, headers }
}

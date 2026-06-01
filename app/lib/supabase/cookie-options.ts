import type { CookieOptionsWithName } from "@supabase/ssr"

/** Cookies auth compatibles con dev en LAN por HTTP (sin flag Secure). */
export function getSupabaseCookieOptions(
  request?: Request,
): CookieOptionsWithName {
  const secure = request
    ? new URL(request.url).protocol === "https:"
    : typeof window !== "undefined" && window.location.protocol === "https:"

  return {
    secure,
    sameSite: "lax",
    path: "/",
  }
}

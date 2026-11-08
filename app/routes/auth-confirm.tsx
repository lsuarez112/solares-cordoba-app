import type { EmailOtpType } from "@supabase/supabase-js"
import { redirect } from "react-router"

import type { Route } from "./+types/auth-confirm"
import { authLinkErrorPath, safeInternalPath } from "~/lib/auth/safe-redirect"
import { createServerSupabaseClient } from "~/lib/supabase/server"

const OTP_TYPES: EmailOtpType[] = ["recovery", "signup", "invite", "magiclink", "email_change", "email"]

/**
 * Links con token_hash (plantilla de email recomendada para SSR):
 *   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/restablecer-clave
 * A diferencia de ?code=, funciona aunque el mail se abra en otro dispositivo.
 */
export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url)
  const tokenHash = url.searchParams.get("token_hash")
  const type = url.searchParams.get("type") as EmailOtpType | null
  const next =
    safeInternalPath(url.searchParams.get("next")) ??
    (type === "recovery" ? "/restablecer-clave" : "/dashboard")

  if (tokenHash && type && OTP_TYPES.includes(type)) {
    const { supabase, headers } = createServerSupabaseClient(request)
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    if (!error) return redirect(next, { headers })
    return redirect(authLinkErrorPath(next, error.code === "otp_expired" ? "expired" : "invalid"))
  }

  return redirect(authLinkErrorPath(next, "invalid"))
}

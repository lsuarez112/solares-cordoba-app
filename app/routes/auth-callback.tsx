import { redirect } from "react-router"

import type { Route } from "./+types/auth-callback"
import { resolvePostLoginPath } from "~/lib/auth/post-login-redirect"
import { authLinkErrorPath, safeInternalPath } from "~/lib/auth/safe-redirect"
import { createServerSupabaseClient } from "~/lib/supabase/server"
import { fetchUserProfile } from "~/services/profile.service"

/**
 * Vuelta de los links de Supabase (confirmación de email y recuperación de
 * contraseña) con flujo PKCE: ?code=… → sesión → ?redirect=… o home del perfil.
 */
export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const target = safeInternalPath(url.searchParams.get("redirect"))

  // Supabase devuelve ?error=…&error_code=otp_expired cuando el link venció o ya se usó.
  const errorCode = url.searchParams.get("error_code") ?? url.searchParams.get("error")
  if (errorCode) {
    return redirect(authLinkErrorPath(target, errorCode === "otp_expired" ? "expired" : "invalid"))
  }

  if (code) {
    const { supabase, headers } = createServerSupabaseClient(request)
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const profile = await fetchUserProfile(supabase, data.user.id)
      return redirect(resolvePostLoginPath(target, profile), { headers })
    }
  }

  return redirect(authLinkErrorPath(target, "invalid"))
}

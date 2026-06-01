import { redirect } from "react-router"

import type { Route } from "./+types/auth-callback"
import { resolvePostLoginPath } from "~/lib/auth/post-login-redirect"
import { createServerSupabaseClient } from "~/lib/supabase/server"
import { fetchUserProfile } from "~/services/profile.service"

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const redirectParam = url.searchParams.get("redirect")

  if (code) {
    const { supabase, headers } = createServerSupabaseClient(request)
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const profile = await fetchUserProfile(supabase, data.user.id)
      const next = resolvePostLoginPath(redirectParam, profile)
      return redirect(next, { headers })
    }
  }

  return redirect("/?error=auth")
}

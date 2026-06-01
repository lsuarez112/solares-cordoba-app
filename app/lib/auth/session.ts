import type { User } from "@supabase/supabase-js"

import type { UserProfile } from "~/domain/auth/auth.types"
import { fetchUserProfile } from "~/services/profile.service"
import { createServerSupabaseClient } from "~/lib/supabase/server"

export async function getServerAuthUser(request: Request): Promise<{
  user: User | null
  profile: UserProfile | null
  headers: Headers
}> {
  const { supabase, headers } = createServerSupabaseClient(request)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { user: null, profile: null, headers }
  }

  const profile = await fetchUserProfile(supabase, user.id)

  return { user, profile, headers }
}

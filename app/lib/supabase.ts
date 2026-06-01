import { createServerSupabaseClient } from "~/lib/supabase/server"

/** @deprecated Usá createClient desde ~/lib/supabase/client o createServerSupabaseClient */
export function getSupabaseServerClient(request: Request) {
  return createServerSupabaseClient(request)
}

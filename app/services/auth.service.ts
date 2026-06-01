import type { Session, User } from "@supabase/supabase-js"

import { getAuthCallbackUrl } from "~/lib/app-origin"
import { createClient } from "~/lib/supabase/client"

export async function signInWithPassword(email: string, password: string) {
  const supabase = createClient()
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signUp(params: {
  email: string
  password: string
  fullName: string
}) {
  const supabase = createClient()
  return supabase.auth.signUp({
    email: params.email.trim(),
    password: params.password,
    options: {
      data: { full_name: params.fullName.trim() },
      emailRedirectTo: getAuthCallbackUrl(),
    },
  })
}

export async function signOut() {
  const supabase = createClient()
  return supabase.auth.signOut()
}

export async function getBrowserSession(): Promise<{
  session: Session | null
  user: User | null
}> {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return { session, user: session?.user ?? null }
}

export function subscribeToAuthChanges(
  onChange: (user: User | null) => void,
) {
  const supabase = createClient()
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    onChange(session?.user ?? null)
  })

  return () => subscription.unsubscribe()
}

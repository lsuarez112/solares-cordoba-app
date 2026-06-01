import type { User } from "@supabase/supabase-js"
import { createContext } from "react"

import type { UserProfile } from "~/domain/auth/auth.types"

export type AuthContextValue = {
  profile: UserProfile | null
  supabaseUser: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (
    email: string,
    password: string,
  ) => Promise<
    | { ok: true; profile: UserProfile | null }
    | { ok: false; error: string }
  >
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

"use client"

import type { UserProfile } from "~/domain/auth/auth.types"
import type { User } from "@supabase/supabase-js"
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

import { translateAuthError } from "~/lib/auth/auth-messages"
import { devLog } from "~/lib/dev-log"
import { resetAppStores } from "~/lib/stores/reset-app-stores"
import { createClient } from "~/lib/supabase/client"
import {
  signInWithPassword,
  signOut,
  subscribeToAuthChanges,
} from "~/services/auth.service"
import { fetchUserProfile } from "~/services/profile.service"

import { AuthContext, type AuthContextValue } from "./auth-context"

type AuthProviderProps = {
  children: ReactNode
  initialUser: User | null
  initialProfile: UserProfile | null
}

async function loadProfile(user: User): Promise<UserProfile | null> {
  const supabase = createClient()
  return fetchUserProfile(supabase, user.id)
}

function logLoginSession(user: User, profile: UserProfile | null) {
  devLog("[auth] login → respuesta usuario", {
    id: user.id,
    email: user.email,
  })
  if (!profile) return

  const { role, ...perfil } = profile
  devLog("[auth] login → perfil", perfil)
  devLog("[auth] login → rol", {
    id: role?.id,
    name: role?.name,
    active: role?.active,
  })
  devLog("[auth] login → permisos", role?.permissions ?? null)
}

export function AuthProvider({
  children,
  initialUser,
  initialProfile,
}: AuthProviderProps) {
  const [supabaseUser, setSupabaseUser] = useState<User | null>(initialUser)
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile)
  const [loading, setLoading] = useState(false)
  const profileRef = useRef(profile)
  profileRef.current = profile

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      queueMicrotask(() => {
        if (!user) {
          resetAppStores()
          setSupabaseUser(null)
          setProfile(null)
          setLoading(false)
          return
        }

        setSupabaseUser(user)

        if (profileRef.current?.id === user.id) {
          return
        }

        resetAppStores()
        setProfile(null)
        setLoading(true)

        void loadProfile(user)
          .then((resolved) => {
            setProfile(resolved)
          })
          .finally(() => {
            setLoading(false)
          })
      })
    })

    return unsubscribe
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const trimmedEmail = email.trim()
    devLog("[auth] login → usuario / contraseña", {
      email: trimmedEmail,
      password,
    })

    const { data, error } = await signInWithPassword(trimmedEmail, password)

    if (error) {
      devLog("[auth] login → respuesta usuario", { user: null, error: error.message })
      return { ok: false as const, error: translateAuthError(error) }
    }

    let resolved: UserProfile | null = null

    if (data.user) {
      if (profileRef.current?.id !== data.user.id) {
        resetAppStores()
        setProfile(null)
      }

      setSupabaseUser(data.user)
      setLoading(true)
      try {
        resolved = await loadProfile(data.user)
        setProfile(resolved)
        logLoginSession(data.user, resolved)
      } finally {
        setLoading(false)
      }
    } else {
      devLog("[auth] login → respuesta usuario", { user: null })
    }

    return { ok: true as const, profile: resolved }
  }, [])

  const logout = useCallback(async () => {
    await signOut()
    resetAppStores()
    setSupabaseUser(null)
    setProfile(null)
    setLoading(false)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      profile,
      supabaseUser,
      isAuthenticated: supabaseUser !== null,
      loading,
      login,
      logout,
    }),
    [profile, supabaseUser, loading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

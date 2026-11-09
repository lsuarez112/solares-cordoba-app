"use client"

import * as React from "react"

import { useAuth } from "~/hooks/use-auth"
import { devLog } from "~/lib/dev-log"
import { createClient } from "~/lib/supabase/client"
import {
  THEME_STORAGE_KEY,
  applyTheme,
  isTheme,
  resolveTheme,
  type ResolvedTheme,
  type Theme,
} from "~/lib/theme"

type ThemeContextValue = {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

function readStoredTheme(): Theme {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY)
    return isTheme(value) ? value : "system"
  } catch {
    return "system"
  }
}

function prefersDark() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
}

/**
 * Tema claro/oscuro. Se guarda en localStorage (este navegador) y, si hay sesión,
 * en el perfil del usuario (public.set_my_theme) para seguirlo en otros dispositivos.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth()
  const [theme, setThemeState] = React.useState<Theme>("system")
  const [systemDark, setSystemDark] = React.useState(false)

  // Estado inicial desde el navegador (el script del <head> ya aplicó la clase).
  React.useEffect(() => {
    setThemeState(readStoredTheme())
    setSystemDark(prefersDark())
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [])

  // Al iniciar sesión, manda el tema guardado en el perfil.
  const profileTheme = (profile as { theme?: string | null } | null)?.theme
  React.useEffect(() => {
    if (!isTheme(profileTheme)) return
    setThemeState(profileTheme)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, profileTheme)
    } catch {
      /* almacenamiento no disponible */
    }
  }, [profileTheme])

  const resolvedTheme = resolveTheme(theme, systemDark)
  React.useEffect(() => {
    applyTheme(resolvedTheme)
  }, [resolvedTheme])

  const setTheme = React.useCallback(
    (next: Theme) => {
      setThemeState(next)
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next)
      } catch {
        /* almacenamiento no disponible */
      }
      if (profile) {
        void createClient()
          .rpc("set_my_theme", { p_theme: next })
          .then(({ error }) => error && devLog("[theme] set_my_theme error", error))
      }
    },
    [profile],
  )

  const value = React.useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const context = React.useContext(ThemeContext)
  if (!context) throw new Error("useTheme debe usarse dentro de ThemeProvider")
  return context
}

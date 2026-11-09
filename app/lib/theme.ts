export type Theme = "light" | "dark" | "system"
export type ResolvedTheme = "light" | "dark"

export const THEMES: Theme[] = ["light", "dark", "system"]
export const THEME_STORAGE_KEY = "solares-theme"

export const THEME_LABELS: Record<Theme, string> = {
  light: "Claro",
  dark: "Oscuro",
  system: "Según el sistema",
}

export function isTheme(value: unknown): value is Theme {
  return typeof value === "string" && (THEMES as string[]).includes(value)
}

export function resolveTheme(theme: Theme, prefersDark: boolean): ResolvedTheme {
  if (theme === "system") return prefersDark ? "dark" : "light"
  return theme
}

/** Aplica el tema al <html> (clase .dark + color-scheme para controles nativos). */
export function applyTheme(resolved: ResolvedTheme) {
  const root = document.documentElement
  root.classList.toggle("dark", resolved === "dark")
  root.style.colorScheme = resolved
}

/**
 * Script inline para el <head>: aplica el tema guardado antes del primer pintado
 * (evita el parpadeo claro → oscuro con SSR).
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)})||"system";var d=t==="dark"||(t==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light"}catch(e){}})()`

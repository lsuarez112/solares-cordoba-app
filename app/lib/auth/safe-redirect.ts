/** Acepta solo rutas internas ("/algo"); evita redirecciones abiertas (//dominio, http://…). */
export function safeInternalPath(value: string | null | undefined): string | null {
  if (!value) return null
  const path = value.trim()
  if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) return null
  return path
}

const RECOVERY_PATH = "/restablecer-clave"

/** Destino cuando falla un link de auth: si era de recuperación, volver a pedirlo. */
export function authLinkErrorPath(target: string | null, reason: "expired" | "invalid"): string {
  return target === RECOVERY_PATH
    ? `/recuperar-clave?error=${reason}`
    : "/?error=auth"
}

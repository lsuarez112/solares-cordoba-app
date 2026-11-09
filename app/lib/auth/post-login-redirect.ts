import type { UserProfile } from "~/domain/auth/auth.types"
import { safeInternalPath } from "~/lib/auth/safe-redirect"

const DEFAULT_POST_LOGIN_PATH = "/dashboard"

/**
 * Destino tras login: `?redirect=` tiene prioridad; si no, `home_page` del perfil.
 * Solo acepta rutas internas: un `?redirect=https://…` o `//dominio` se ignora.
 */
export function resolvePostLoginPath(
  redirectParam: string | null,
  profile: UserProfile | null,
): string {
  return (
    safeInternalPath(redirectParam) ??
    safeInternalPath(profile?.home_page) ??
    DEFAULT_POST_LOGIN_PATH
  )
}

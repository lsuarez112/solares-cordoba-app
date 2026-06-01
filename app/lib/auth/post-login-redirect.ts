import type { UserProfile } from "~/domain/auth/auth.types"

const DEFAULT_POST_LOGIN_PATH = "/dashboard"

/** Destino tras login: `?redirect=` tiene prioridad; si no, `home_page` del perfil. */
export function resolvePostLoginPath(
  redirectParam: string | null,
  profile: UserProfile | null,
): string {
  if (redirectParam) {
    return redirectParam
  }

  const homePage = profile?.home_page?.trim()
  if (homePage) {
    return homePage
  }

  return DEFAULT_POST_LOGIN_PATH
}

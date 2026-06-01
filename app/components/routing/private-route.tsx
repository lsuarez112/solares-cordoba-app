import { useEffect, type ReactNode } from "react"
import { useLocation, useMatches, useNavigate } from "react-router"

import {
  hasAllModuleAccess,
  hasAnyModuleAccess,
  type ModuleAccess,
} from "~/domain/auth/auth.permissions"
import { useAuth } from "~/hooks/use-auth"
import type { AppRouteHandle } from "~/routing/route-handle.types"

type PrivateRouteProps = {
  children: ReactNode
  access?: ModuleAccess[]
  anyAccess?: ModuleAccess[]
  loginTo?: string
  unauthorizedTo?: string
}

function getAccessFromMatches(matches: ReturnType<typeof useMatches>) {
  const handles = matches
    .map((m) => m.handle as AppRouteHandle | undefined)
    .filter(Boolean) as AppRouteHandle[]

  const access = handles.flatMap((h) => h.access ?? [])
  const anyAccess = handles.flatMap((h) => h.anyAccess ?? [])

  return { access, anyAccess }
}

export function PrivateRoute({
  children,
  access: extraAccess = [],
  anyAccess: extraAnyAccess = [],
  loginTo = "/",
  unauthorizedTo = "/unauthorized",
}: PrivateRouteProps) {
  const { isAuthenticated, profile, supabaseUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const matches = useMatches()

  const routeAccess = getAccessFromMatches(matches)
  const requiredAll = [...routeAccess.access, ...extraAccess]
  const requiredAny = [...routeAccess.anyAccess, ...extraAnyAccess]

  const allowedByAll =
    requiredAll.length === 0 || hasAllModuleAccess(profile, requiredAll)

  const allowedByAny =
    requiredAny.length === 0 || hasAnyModuleAccess(profile, requiredAny)

  const allowed =
    isAuthenticated &&
    profile?.active !== false &&
    allowedByAll &&
    (requiredAny.length === 0 || allowedByAny)

  const waitingForProfile =
    isAuthenticated && !profile && supabaseUser !== null

  useEffect(() => {
    if (waitingForProfile) return

    if (!isAuthenticated) {
      const redirect = `${loginTo}?redirect=${encodeURIComponent(location.pathname + location.search)}`
      navigate(redirect, { replace: true })
      return
    }

    if (!allowed) {
      navigate(unauthorizedTo, { replace: true })
    }
  }, [
    allowed,
    isAuthenticated,
    waitingForProfile,
    location.pathname,
    location.search,
    loginTo,
    navigate,
    unauthorizedTo,
  ])

  if (!isAuthenticated || waitingForProfile) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-6 text-sm text-muted-foreground">
        Verificando acceso…
      </div>
    )
  }

  if (!allowed) {
    return null
  }

  return <>{children}</>
}

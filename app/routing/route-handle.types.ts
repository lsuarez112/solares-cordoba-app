import type { ModuleAccess } from "~/domain/auth/auth.permissions"

/** Metadatos de ruta para control de acceso (usado por PrivateRoute vía useMatches). */
export type AppRouteHandle = {
  /** Todas deben estar presentes en el perfil. */
  access?: ModuleAccess[]
  /** Al menos una debe estar presente. */
  anyAccess?: ModuleAccess[]
  title?: string
}

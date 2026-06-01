import { UsersManagement } from "~/components/users/users-management"
import { metaFromRouteHandle } from "~/routing/route-page"
import type { AppRouteHandle } from "~/routing/route-handle.types"

import type { Route } from "./+types/permisos-usuarios"

export const handle = {
  title: "Usuarios",
  access: [{ module: "user_profiles", action: "read" }],
} satisfies AppRouteHandle

export function meta({ matches }: Route.MetaArgs) {
  return metaFromRouteHandle(matches)
}

export default function PermisosUsuariosPage() {
  return <UsersManagement />
}

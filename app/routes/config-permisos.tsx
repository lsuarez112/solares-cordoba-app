import { RolesManagement } from "~/components/roles/roles-management"
import { metaFromRouteHandle } from "~/routing/route-page"
import type { AppRouteHandle } from "~/routing/route-handle.types"

import type { Route } from "./+types/config-permisos"

export const handle = {
  title: "Permisos y roles",
  access: [{ module: "configs", action: "read" }],
} satisfies AppRouteHandle

export function meta({ matches }: Route.MetaArgs) {
  return metaFromRouteHandle(matches)
}

export default function ConfigPermisosPage() {
  return <RolesManagement />
}

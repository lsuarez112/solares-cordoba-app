import { ConfigGeneralPage } from "~/components/config/config-general-page"
import { metaFromRouteHandle } from "~/routing/route-page"
import type { AppRouteHandle } from "~/routing/route-handle.types"

import type { Route } from "./+types/config-general"

export const handle = {
  title: "Configuración",
  access: [{ module: "configs", action: "read" }],
} satisfies AppRouteHandle

export function meta({ matches }: Route.MetaArgs) {
  return metaFromRouteHandle(matches)
}

export default function ConfigGeneralRoute() {
  return <ConfigGeneralPage />
}

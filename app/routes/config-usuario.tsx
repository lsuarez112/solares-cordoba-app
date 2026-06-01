import { PlaceholderPage } from "~/components/pages/placeholder-page"
import { metaFromRouteHandle } from "~/routing/route-page"
import type { AppRouteHandle } from "~/routing/route-handle.types"

import type { Route } from "./+types/config-usuario"

export const handle = {
  title: "Mi configuración",
  access: [{ module: "user_settings", action: "read" }],
} satisfies AppRouteHandle

export function meta({ matches }: Route.MetaArgs) {
  return metaFromRouteHandle(matches)
}

export default function ConfigUsuarioPage() {
  return (
    <PlaceholderPage
      title="Mi configuración"
      description="Preferencias y datos personales de tu cuenta."
    />
  )
}

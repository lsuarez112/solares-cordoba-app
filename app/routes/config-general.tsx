import { PlaceholderPage } from "~/components/pages/placeholder-page"
import { metaFromRouteHandle } from "~/routing/route-page"
import type { AppRouteHandle } from "~/routing/route-handle.types"

import type { Route } from "./+types/config-general"

export const handle = {
  title: "Configuración general",
  access: [{ module: "configs", action: "read" }],
} satisfies AppRouteHandle

export function meta({ matches }: Route.MetaArgs) {
  return metaFromRouteHandle(matches)
}

export default function ConfigGeneralPage() {
  return (
    <PlaceholderPage
      title="Configuración general"
      description="Parámetros globales de la aplicación (solo administradores)."
    />
  )
}

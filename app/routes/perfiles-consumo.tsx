import { PlaceholderPage } from "~/components/pages/placeholder-page"
import { metaFromRouteHandle } from "~/routing/route-page"
import type { AppRouteHandle } from "~/routing/route-handle.types"

import type { Route } from "./+types/perfiles-consumo"

export const handle = {
  title: "Perfiles de consumo",
  access: [{ module: "consumption_profiles", action: "read" }],
} satisfies AppRouteHandle

export function meta({ matches }: Route.MetaArgs) {
  return metaFromRouteHandle(matches)
}

export default function PerfilesConsumoPage() {
  return (
    <PlaceholderPage
      title="Perfiles de consumo"
      description="Exploración de perfiles de consumo energético."
    />
  )
}

import { PlaceholderPage } from "~/components/pages/placeholder-page"
import { metaFromRouteHandle } from "~/routing/route-page"
import type { AppRouteHandle } from "~/routing/route-handle.types"

import type { Route } from "./+types/kits"

export const handle = {
  title: "Kits",
  access: [{ module: "kits", action: "read" }],
} satisfies AppRouteHandle

export function meta({ matches }: Route.MetaArgs) {
  return metaFromRouteHandle(matches)
}

export default function KitsPage() {
  return (
    <PlaceholderPage
      title="Kits"
      description="Kits predefinidos y reglas de armado (se implementa en F2)."
    />
  )
}

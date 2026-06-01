import { PlaceholderPage } from "~/components/pages/placeholder-page"
import { metaFromRouteHandle } from "~/routing/route-page"
import type { AppRouteHandle } from "~/routing/route-handle.types"

import type { Route } from "./+types/ventas"

export const handle = {
  title: "Ventas",
  access: [{ module: "financing", action: "read" }],
} satisfies AppRouteHandle

export function meta({ matches }: Route.MetaArgs) {
  return metaFromRouteHandle(matches)
}

export default function VentasPage() {
  return (
    <PlaceholderPage
      title="Ventas"
      description="Registro y seguimiento de ventas cerradas."
    />
  )
}

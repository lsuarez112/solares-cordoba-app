import { PlaceholderPage } from "~/components/pages/placeholder-page"
import { metaFromRouteHandle } from "~/routing/route-page"
import type { AppRouteHandle } from "~/routing/route-handle.types"

import type { Route } from "./+types/reports"

export const handle = {
  title: "Reportes",
  access: [{ module: "reports", action: "read" }],
} satisfies AppRouteHandle

export function meta({ matches }: Route.MetaArgs) {
  return metaFromRouteHandle(matches)
}

export default function ReportsPage() {
  return (
    <PlaceholderPage
      title="Reportes"
      description="Informes y métricas de la operación."
    />
  )
}

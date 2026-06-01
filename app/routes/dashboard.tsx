import { PlaceholderPage } from "~/components/pages/placeholder-page"
import { metaFromRouteHandle } from "~/routing/route-page"
import type { AppRouteHandle } from "~/routing/route-handle.types"

import type { Route } from "./+types/dashboard"

export const handle = {
  title: "Dashboard",
  access: [{ module: "dashboards", action: "read" }],
} satisfies AppRouteHandle

export function meta({ matches }: Route.MetaArgs) {
  return metaFromRouteHandle(matches)
}

export default function DashboardPage() {
  return (
    <PlaceholderPage
      title="Dashboard"
      description="Panel inicial con resumen de actividad y accesos rápidos."
    />
  )
}

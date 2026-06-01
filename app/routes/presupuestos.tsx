import { PlaceholderPage } from "~/components/pages/placeholder-page"
import { metaFromRouteHandle } from "~/routing/route-page"
import type { AppRouteHandle } from "~/routing/route-handle.types"

import type { Route } from "./+types/presupuestos"

export const handle = {
  title: "Presupuestos",
  access: [{ module: "budgets", action: "read" }],
} satisfies AppRouteHandle

export function meta({ matches }: Route.MetaArgs) {
  return metaFromRouteHandle(matches)
}

export default function PresupuestosPage() {
  return (
    <PlaceholderPage
      title="Presupuestos"
      description="Creación y seguimiento de presupuestos comerciales."
    />
  )
}

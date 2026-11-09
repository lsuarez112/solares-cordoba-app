import { QuotesPage } from "~/components/quotes/quotes-page"
import { metaFromRouteHandle } from "~/routing/route-page"
import type { AppRouteHandle } from "~/routing/route-handle.types"

import type { Route } from "./+types/presupuestos"

export const handle = {
  title: "Presupuestos",
  access: [{ module: "quotes", action: "read" }],
} satisfies AppRouteHandle

export function meta({ matches }: Route.MetaArgs) {
  return metaFromRouteHandle(matches)
}

export default function PresupuestosRoute() {
  return <QuotesPage />
}

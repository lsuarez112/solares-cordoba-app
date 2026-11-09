import { QuoteWizardPage } from "~/components/quotes/wizard/quote-wizard-page"
import { metaFromRouteHandle } from "~/routing/route-page"
import type { AppRouteHandle } from "~/routing/route-handle.types"

import type { Route } from "./+types/presupuesto-nuevo"

export const handle = {
  title: "Nuevo presupuesto",
  access: [{ module: "quotes", action: "create" }],
} satisfies AppRouteHandle

export function meta({ matches }: Route.MetaArgs) {
  return metaFromRouteHandle(matches)
}

export default function PresupuestoNuevoRoute() {
  return <QuoteWizardPage />
}

import { useParams } from "react-router"

import { QuoteDetailPage } from "~/components/quotes/quote-detail-page"
import { metaFromRouteHandle } from "~/routing/route-page"
import type { AppRouteHandle } from "~/routing/route-handle.types"

import type { Route } from "./+types/presupuesto-detalle"

export const handle = {
  title: "Presupuesto",
  access: [{ module: "quotes", action: "read" }],
} satisfies AppRouteHandle

export function meta({ matches }: Route.MetaArgs) {
  return metaFromRouteHandle(matches)
}

export default function PresupuestoDetalleRoute() {
  const { quoteId = "" } = useParams()
  return <QuoteDetailPage key={quoteId} quoteId={quoteId} />
}

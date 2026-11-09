import { useParams } from "react-router"

import { ClientDetailPage } from "~/components/clients/client-detail-page"
import { metaFromRouteHandle } from "~/routing/route-page"
import type { AppRouteHandle } from "~/routing/route-handle.types"

import type { Route } from "./+types/cliente-detalle"

export const handle = {
  title: "Cliente",
  access: [{ module: "clients", action: "read" }],
} satisfies AppRouteHandle

export function meta({ matches }: Route.MetaArgs) {
  return metaFromRouteHandle(matches)
}

export default function ClienteDetalleRoute() {
  const { clientId = "" } = useParams()
  return <ClientDetailPage key={clientId} clientId={clientId} />
}

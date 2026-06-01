import { PlaceholderPage } from "~/components/pages/placeholder-page"
import { metaFromRouteHandle } from "~/routing/route-page"
import type { AppRouteHandle } from "~/routing/route-handle.types"

import type { Route } from "./+types/pedidos"

export const handle = {
  title: "Pedidos",
  access: [{ module: "orders", action: "read" }],
} satisfies AppRouteHandle

export function meta({ matches }: Route.MetaArgs) {
  return metaFromRouteHandle(matches)
}

export default function PedidosPage() {
  return (
    <PlaceholderPage
      title="Pedidos"
      description="Órdenes de compra y pedidos a proveedores."
    />
  )
}

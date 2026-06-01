import { PlaceholderPage } from "~/components/pages/placeholder-page"
import { metaFromRouteHandle } from "~/routing/route-page"
import type { AppRouteHandle } from "~/routing/route-handle.types"

import type { Route } from "./+types/clientes"

export const handle = {
  title: "Clientes",
  access: [{ module: "clients", action: "read" }],
} satisfies AppRouteHandle

export function meta({ matches }: Route.MetaArgs) {
  return metaFromRouteHandle(matches)
}

export default function ClientesPage() {
  return (
    <PlaceholderPage
      title="Clientes"
      description="Gestión de clientes y cuentas comerciales."
    />
  )
}

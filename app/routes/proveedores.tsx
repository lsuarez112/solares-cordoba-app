import { SuppliersManagement } from "~/components/suppliers/suppliers-management"
import { metaFromRouteHandle } from "~/routing/route-page"
import type { AppRouteHandle } from "~/routing/route-handle.types"

import type { Route } from "./+types/proveedores"

export const handle = {
  title: "Proveedores",
  access: [{ module: "suppliers", action: "read" }],
} satisfies AppRouteHandle

export function meta({ matches }: Route.MetaArgs) {
  return metaFromRouteHandle(matches)
}

export default function ProveedoresPage() {
  return <SuppliersManagement />
}

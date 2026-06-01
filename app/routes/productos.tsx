import { ProductsManagement } from "~/components/products/products-management"
import { metaFromRouteHandle } from "~/routing/route-page"
import type { AppRouteHandle } from "~/routing/route-handle.types"

import type { Route } from "./+types/productos"

export const handle = {
  title: "Productos",
  access: [{ module: "products", action: "read" }],
} satisfies AppRouteHandle

export function meta({ matches }: Route.MetaArgs) {
  return metaFromRouteHandle(matches)
}

export default function ProductosPage() {
  return <ProductsManagement />
}

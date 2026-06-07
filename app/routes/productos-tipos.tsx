import { CategoriesManagement } from "~/components/categories/categories-management"
import { metaFromRouteHandle } from "~/routing/route-page"
import type { AppRouteHandle } from "~/routing/route-handle.types"

import type { Route } from "./+types/productos-tipos"

export const handle = {
  title: "Categorías de productos",
  access: [{ module: "products", action: "read" }],
} satisfies AppRouteHandle

export function meta({ matches }: Route.MetaArgs) {
  return metaFromRouteHandle(matches)
}

export default function CategoriasProductoPage() {
  return <CategoriesManagement />
}

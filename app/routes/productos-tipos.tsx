import { CatalogBrowsePage } from "~/components/catalog/catalog-browse-page"
import { TIPOS_PRODUCTO_COLUMNS } from "~/data/catalog-mocks"
import { metaFromRouteHandle } from "~/routing/route-page"
import type { AppRouteHandle } from "~/routing/route-handle.types"

import type { Route } from "./+types/productos-tipos"

export const handle = {
  title: "Tipos de productos",
  access: [{ module: "products", action: "read" }],
} satisfies AppRouteHandle

export function meta({ matches }: Route.MetaArgs) {
  return metaFromRouteHandle(matches)
}

export default function TiposProductoPage() {
  return (
    <CatalogBrowsePage
      title="Tipos de productos"
      description="Clasificación y categorías del catálogo de productos."
      columns={TIPOS_PRODUCTO_COLUMNS}
      data={[]}
    />
  )
}

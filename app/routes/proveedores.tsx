import { CatalogBrowsePage } from "~/components/catalog/catalog-browse-page"
import { PROVEEDORES_COLUMNS } from "~/data/catalog-mocks"
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
  return (
    <CatalogBrowsePage
      title="Proveedores"
      description="Directorio de proveedores y contactos comerciales."
      columns={PROVEEDORES_COLUMNS}
      data={[]}
    />
  )
}

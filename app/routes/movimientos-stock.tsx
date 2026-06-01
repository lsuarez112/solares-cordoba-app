import { CatalogBrowsePage } from "~/components/catalog/catalog-browse-page"
import { STOCK_MOVEMENTS_COLUMNS } from "~/data/catalog-mocks"
import { metaFromRouteHandle } from "~/routing/route-page"
import type { AppRouteHandle } from "~/routing/route-handle.types"

import type { Route } from "./+types/movimientos-stock"

export const handle = {
  title: "Movimientos de stock",
  access: [{ module: "stock_movements", action: "read" }],
} satisfies AppRouteHandle

export function meta({ matches }: Route.MetaArgs) {
  return metaFromRouteHandle(matches)
}

export default function MovimientosStockPage() {
  return (
    <CatalogBrowsePage
      title="Movimientos de stock"
      description="Historial de ingresos, egresos y ajustes de inventario."
      columns={STOCK_MOVEMENTS_COLUMNS}
      data={[]}
    />
  )
}

import { CatalogBrowsePage } from "~/components/catalog/catalog-browse-page"
import { KITS_COLUMNS } from "~/data/catalog-mocks"
import { metaFromRouteHandle } from "~/routing/route-page"
import type { AppRouteHandle } from "~/routing/route-handle.types"

import type { Route } from "./+types/kits"

export const handle = {
  title: "Kits",
  access: [{ module: "kits", action: "read" }],
} satisfies AppRouteHandle

export function meta({ matches }: Route.MetaArgs) {
  return metaFromRouteHandle(matches)
}

export default function KitsPage() {
  return (
    <CatalogBrowsePage
      title="Kits"
      description="Exploración de kits prearmados."
      columns={KITS_COLUMNS}
      data={[]}
    />
  )
}

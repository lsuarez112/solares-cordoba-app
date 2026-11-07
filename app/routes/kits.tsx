import { KitsPage } from "~/components/kits/kits-page"
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

export default function KitsRoute() {
  return <KitsPage />
}

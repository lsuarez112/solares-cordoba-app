import { useParams, useSearchParams } from "react-router"

import { KitEditorPage } from "~/components/kits/kit-editor-page"
import { metaFromRouteHandle } from "~/routing/route-page"
import type { AppRouteHandle } from "~/routing/route-handle.types"

import type { Route } from "./+types/kit-editor"

export const handle = {
  title: "Kit",
  access: [{ module: "kits", action: "read" }],
} satisfies AppRouteHandle

export function meta({ matches }: Route.MetaArgs) {
  return metaFromRouteHandle(matches)
}

/** /kits/nuevo (opcional ?desde=<id> para duplicar) y /kits/:kitId */
export default function KitEditorRoute() {
  const { kitId } = useParams()
  const [searchParams] = useSearchParams()
  const id = kitId ?? null

  return (
    <KitEditorPage
      key={id ?? `new-${searchParams.get("desde") ?? ""}`}
      kitId={id}
      duplicateFromId={id ? null : searchParams.get("desde")}
    />
  )
}

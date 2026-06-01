import { pageTitle } from "~/lib/page-meta"
import type { AppRouteHandle } from "~/routing/route-handle.types"

export function metaFromRouteHandle(
  matches: ReadonlyArray<{ handle?: unknown } | undefined>,
): { title: string }[] {
  const lastMatch = [...matches].filter(Boolean).at(-1)
  const handle = lastMatch?.handle as AppRouteHandle | undefined
  return [{ title: pageTitle(handle?.title) }]
}

import { Separator } from "~/components/ui/separator"
import { SidebarTrigger } from "~/components/ui/sidebar"

import { ThemeToggleButton } from "~/components/theme/theme-toggle"

import { RouteHeaderBreadcrumb } from "./route-header-breadcrumb"

export function AppHeader() {
  return (
    <div
      role="banner"
      className="flex h-12 min-h-12 min-w-0 shrink-0 items-center gap-2 border-b px-4"
    >
      <SidebarTrigger className="shrink-0 cursor-pointer" />
      <Separator orientation="vertical" className="h-full shrink-0" />
      <div className="min-w-0 flex-1">
        <RouteHeaderBreadcrumb />
      </div>
      <ThemeToggleButton />
    </div>
  )
}

import * as React from "react"
import { Outlet, useLocation } from "react-router"

import { AppHeader } from "~/components/header"
import { AppSidebar } from "~/components/sidebar/app-sidebar"
import { PrivateRoute } from "~/components/routing/private-route"
import { ScrollArea } from "~/components/ui/scroll-area"
import {
  SidebarInset,
  SidebarProvider,
} from "~/components/ui/sidebar"

/** Shell con sidebar para el área autenticada. */
export default function AppLayout() {
  const { pathname } = useLocation()
  const viewportRef = React.useRef<HTMLDivElement>(null)

  // El scroll es del viewport (no de window): al cambiar de sección vuelve arriba.
  React.useEffect(() => {
    viewportRef.current?.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <PrivateRoute>
      <SidebarProvider className="h-svh min-w-0 overflow-hidden">
        <AppSidebar />
        <SidebarInset className="flex h-svh min-h-0 min-w-0 flex-col overflow-hidden">
          <AppHeader />
          {/* Scroll vertical con la barra de shadcn (no la nativa). */}
          <ScrollArea
            className="page-scroll"
            viewportRef={viewportRef}
            viewportClassName="page-scroll-viewport"
          >
            {/* key: cada sección entra con un fundido suave. */}
            <div key={pathname} className="page-content page-in p-4 md:p-6">
              <Outlet />
            </div>
          </ScrollArea>
        </SidebarInset>
      </SidebarProvider>
    </PrivateRoute>
  )
}

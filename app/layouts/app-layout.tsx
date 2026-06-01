import { Outlet } from "react-router"

import { AppHeader } from "~/components/header"
import { AppSidebar } from "~/components/sidebar/app-sidebar"
import { PrivateRoute } from "~/components/routing/private-route"
import {
  SidebarInset,
  SidebarProvider,
} from "~/components/ui/sidebar"

/** Shell con sidebar para el área autenticada. */
export default function AppLayout() {
  return (
    <PrivateRoute>
      <SidebarProvider className="h-svh min-w-0 overflow-hidden">
        <AppSidebar />
        <SidebarInset className="flex h-svh min-h-0 min-w-0 flex-col overflow-hidden">
          <AppHeader />
          <div className="page-scroll">
            <div className="page-content p-4 md:p-6">
              <Outlet />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </PrivateRoute>
  )
}

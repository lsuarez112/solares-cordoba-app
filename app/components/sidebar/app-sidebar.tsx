import { Link, useLocation } from "react-router"
import { LogOutIcon } from "lucide-react"

import { Button } from "~/components/ui/button"
import { ScrollArea } from "~/components/ui/scroll-area"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "~/components/ui/sidebar"
import { useAuth } from "~/hooks/use-auth"

import { renderSectionEntry } from "./app-sidebar-nav"
import { SIDEBAR_NAV } from "./sidebar-nav.config"
import { filterSidebarNavByPermissions } from "./sidebar-nav.utils"

export function AppSidebar() {
  const { pathname } = useLocation()
  const { profile, logout } = useAuth()

  const nav = profile
    ? filterSidebarNavByPermissions(SIDEBAR_NAV, profile)
    : { sections: [] }

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="bg-background">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild title="JRJ Gestión">
              <Link to="/dashboard">
                <img
                  src="/favicon.svg"
                  alt=""
                  className="size-4 shrink-0"
                  aria-hidden
                />
                <span className="truncate font-semibold">JRJ Gestión</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="min-h-0 flex-1 overflow-hidden bg-background">
        <ScrollArea className="h-full min-h-0">
          {nav.sections.map((section) => (
            <SidebarGroup key={section.id}>
              <SidebarGroupLabel title={section.description}>
                {section.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.entries.map((entry) =>
                    renderSectionEntry(pathname, entry),
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="border-t bg-background p-2">
        {profile && (
          <div className="flex flex-col gap-2 group-data-[collapsible=icon]:items-center">
            <p className="truncate px-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
              {profile.full_name ?? "Usuario"}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-0"
              onClick={logout}
              title="Cerrar sesión"
            >
              <LogOutIcon className="hidden group-data-[collapsible=icon]:block" />
              <span className="group-data-[collapsible=icon]:hidden">Salir</span>
            </Button>
          </div>
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

import * as React from "react"
import { Link, useLocation } from "react-router"
import { ChevronsUpDownIcon, LogOutIcon, SunIcon } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { ScrollArea } from "~/components/ui/scroll-area"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "~/components/ui/sidebar"
import { useAuth } from "~/hooks/use-auth"
import { useCompanyStore } from "~/stores/company.store"

import { ThemeMenuRadioGroup } from "~/components/theme/theme-toggle"

import { NavEntry } from "./app-sidebar-nav"
import { SIDEBAR_NAV } from "./sidebar-nav.config"
import { filterSidebarNavByPermissions } from "./sidebar-nav.utils"

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U"
  )
}

function NavUser() {
  const { profile, supabaseUser, logout } = useAuth()
  const { isMobile } = useSidebar()
  if (!profile) return null

  const name = profile.full_name?.trim() || "Usuario"
  const email = supabaseUser?.email ?? ""

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent text-xs font-medium">
                {initials(name)}
              </span>
              <span className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {profile.role?.name ?? email}
                </span>
              </span>
              <ChevronsUpDownIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="font-normal">
              <div className="grid text-sm leading-tight">
                <span className="truncate font-medium">{name}</span>
                {email ? (
                  <span className="truncate text-xs text-muted-foreground">
                    {email}
                  </span>
                ) : null}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
              Tema
            </DropdownMenuLabel>
            <ThemeMenuRadioGroup />
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => void logout()}>
              <LogOutIcon />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export function AppSidebar() {
  const { pathname } = useLocation()
  const { profile } = useAuth()
  const company = useCompanyStore((s) => s.company)
  const fetchCompany = useCompanyStore((s) => s.fetch)
  const companyName = company?.name?.trim() || "Solares Córdoba"

  React.useEffect(() => {
    if (profile) void fetchCompany()
  }, [profile, fetchCompany])

  const nav = profile
    ? filterSidebarNavByPermissions(SIDEBAR_NAV, profile)
    : { sections: [] }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip={companyName}>
              <Link to="/dashboard">
                {company?.logo_url ? (
                  <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-white">
                    <img
                      src={company.logo_url}
                      alt=""
                      className="size-full object-contain p-0.5"
                      aria-hidden
                    />
                  </span>
                ) : (
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <SunIcon className="size-4" />
                  </span>
                )}
                <span className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{companyName}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Presupuestos
                  </span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="overflow-hidden">
        <ScrollArea className="min-h-0 flex-1">
        {nav.sections.map((section) => (
          <SidebarGroup key={section.id}>
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            <SidebarMenu>
              {section.entries.map((entry) => (
                <NavEntry key={entry.id} pathname={pathname} entry={entry} />
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

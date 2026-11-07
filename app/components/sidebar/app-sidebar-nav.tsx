import { ChevronRightIcon } from "lucide-react"
import { Link } from "react-router"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible"
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "~/components/ui/sidebar"

import { getSidebarNavIcon } from "./sidebar-nav-icons"
import type {
  SidebarNavLink,
  SidebarNavSectionEntry,
  SidebarNavSubmenu,
} from "./sidebar-nav.schema"
import { isRouteActive } from "./sidebar-nav.utils"

function NavLinkItem({
  pathname,
  entry,
}: {
  pathname: string
  entry: SidebarNavLink
}) {
  const Icon = getSidebarNavIcon(entry.icon)
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isRouteActive(pathname, entry.to)}
        tooltip={entry.title}
      >
        <Link to={entry.to}>
          {Icon ? <Icon /> : null}
          <span>{entry.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function NavSubmenuItem({
  pathname,
  entry,
}: {
  pathname: string
  entry: SidebarNavSubmenu
}) {
  const { state, isMobile } = useSidebar()
  const Icon = getSidebarNavIcon(entry.icon)
  const links = entry.items.filter(
    (item): item is SidebarNavLink => item.type === "link",
  )
  const isActive = links.some((item) => isRouteActive(pathname, item.to))

  // Colapsado (solo íconos): el ícono navega a la ruta principal del submenú.
  if (state === "collapsed" && !isMobile) {
    const to = entry.to ?? links[0]?.to
    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isActive} tooltip={entry.title}>
          <Link to={to ?? "#"}>
            {Icon ? <Icon /> : null}
            <span>{entry.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <Collapsible asChild defaultOpen={isActive} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={entry.title}>
            {Icon ? <Icon /> : null}
            <span>{entry.title}</span>
            <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {links.map((item) => (
              <SidebarMenuSubItem key={item.id}>
                <SidebarMenuSubButton asChild isActive={pathname === item.to}>
                  <Link to={item.to}>
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

export function NavEntry({
  pathname,
  entry,
}: {
  pathname: string
  entry: SidebarNavSectionEntry
}) {
  if (entry.type === "link") {
    return <NavLinkItem pathname={pathname} entry={entry} />
  }
  return <NavSubmenuItem pathname={pathname} entry={entry} />
}

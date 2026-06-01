import type { ReactNode } from "react"
import { Link } from "react-router"

import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "~/components/ui/sidebar"

import { getSidebarNavIcon } from "./sidebar-nav-icons"
import type {
  SidebarNavLink,
  SidebarNavPlaceholder,
  SidebarNavSectionEntry,
  SidebarNavSubmenu,
  SidebarNavSubmenuItem,
} from "./sidebar-nav.schema"
import { isRouteActive } from "./sidebar-nav.utils"

function renderSubmenuItem(
  pathname: string,
  item: SidebarNavSubmenuItem,
): ReactNode {
  if (item.type === "link") {
    return renderLinkAsSubButton(pathname, item)
  }
  return renderPlaceholderAsSubButton(item)
}

function renderLinkAsSubButton(
  pathname: string,
  item: SidebarNavLink,
): ReactNode {
  const Icon = getSidebarNavIcon(item.icon)
  return (
    <SidebarMenuSubItem key={item.id}>
      <SidebarMenuSubButton
        asChild
        isActive={pathname === item.to}
        title={item.description ?? item.title}
      >
        <Link to={item.to}>
          {Icon ? <Icon /> : null}
          <span>{item.title}</span>
        </Link>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  )
}

function renderPlaceholderAsSubButton(
  item: SidebarNavPlaceholder,
): ReactNode {
  return (
    <SidebarMenuSubItem key={item.id}>
      <SidebarMenuSubButton asChild>
        <button
          type="button"
          disabled
          className="w-full"
          title={item.description}
        >
          <span>{item.title}</span>
        </button>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  )
}

function renderSubmenu(pathname: string, entry: SidebarNavSubmenu): ReactNode {
  const Icon = getSidebarNavIcon(entry.icon)
  const anyChildActive = entry.items.some(
    (i) => i.type === "link" && isRouteActive(pathname, i.to),
  )
  const hubActive = entry.to ? isRouteActive(pathname, entry.to) : false
  const isParentActive = entry.to ? hubActive : anyChildActive

  return (
    <SidebarMenuItem key={entry.id} className="mb-2">
      {entry.to ? (
        <SidebarMenuButton
          asChild
          isActive={isParentActive}
          tooltip={entry.title}
          title={entry.description}
        >
          <Link to={entry.to}>
            {Icon ? <Icon /> : null}
            <span>{entry.title}</span>
          </Link>
        </SidebarMenuButton>
      ) : (
        <SidebarMenuButton
          isActive={isParentActive}
          tooltip={entry.title}
          title={entry.description}
        >
          {Icon ? <Icon /> : null}
          <span>{entry.title}</span>
        </SidebarMenuButton>
      )}
      <SidebarMenuSub>
        {entry.items.map((item) => renderSubmenuItem(pathname, item))}
      </SidebarMenuSub>
    </SidebarMenuItem>
  )
}

export function renderSectionEntry(
  pathname: string,
  entry: SidebarNavSectionEntry,
): ReactNode {
  if (entry.type === "link") {
    const Icon = getSidebarNavIcon(entry.icon)
    return (
      <SidebarMenuItem key={entry.id}>
        <SidebarMenuButton
          asChild
          isActive={isRouteActive(pathname, entry.to)}
          tooltip={entry.title}
          title={entry.description ?? entry.title}
        >
          <Link to={entry.to}>
            {Icon ? <Icon /> : null}
            <span>{entry.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return renderSubmenu(pathname, entry)
}

import {
  hasAllModuleAccess,
  hasAnyModuleAccess,
  type ModuleAccess,
} from "~/domain/auth/auth.permissions"
import type { UserProfile } from "~/domain/auth/auth.types"

import type {
  SidebarNavConfig,
  SidebarNavLink,
  SidebarNavSection,
  SidebarNavSectionEntry,
  SidebarNavSubmenu,
  SidebarNavSubmenuItem,
} from "./sidebar-nav.schema"

/** Indica si la ruta actual corresponde a un `to` del menú. */
export function isRouteActive(pathname: string, to: string): boolean {
  if (to === "/") {
    return pathname === "/"
  }
  return pathname === to || pathname.startsWith(`${to}/`)
}

function canAccessNavItem(
  profile: UserProfile | null,
  access?: ModuleAccess[],
  anyAccess?: ModuleAccess[],
): boolean {
  const requiredAll = access ?? []
  const requiredAny = anyAccess ?? []

  if (requiredAll.length > 0 && !hasAllModuleAccess(profile, requiredAll)) {
    return false
  }

  if (requiredAny.length > 0 && !hasAnyModuleAccess(profile, requiredAny)) {
    return false
  }

  return true
}

function filterSubmenuItem(
  profile: UserProfile | null,
  item: SidebarNavSubmenuItem,
): SidebarNavSubmenuItem | null {
  if (item.type === "placeholder") return item

  if (!canAccessNavItem(profile, item.access, item.anyAccess)) {
    return null
  }

  return item
}

function filterSubmenu(
  profile: UserProfile | null,
  entry: SidebarNavSubmenu,
): SidebarNavSubmenu | null {
  const items = entry.items
    .map((item) => filterSubmenuItem(profile, item))
    .filter(Boolean) as SidebarNavSubmenuItem[]

  if (items.length === 0) return null

  return { ...entry, items }
}

function filterSectionEntry(
  profile: UserProfile | null,
  entry: SidebarNavSectionEntry,
): SidebarNavSectionEntry | null {
  if (entry.type === "link") {
    if (!canAccessNavItem(profile, entry.access, entry.anyAccess)) {
      return null
    }
    return entry
  }

  return filterSubmenu(profile, entry)
}

function filterSection(
  profile: UserProfile | null,
  section: SidebarNavSection,
): SidebarNavSection | null {
  const entries = section.entries
    .map((entry) => filterSectionEntry(profile, entry))
    .filter(Boolean) as SidebarNavSectionEntry[]

  if (entries.length === 0) return null

  return { ...section, entries }
}

export function filterSidebarNavByPermissions(
  config: SidebarNavConfig,
  profile: UserProfile | null,
): SidebarNavConfig {
  const sections = config.sections
    .map((section) => filterSection(profile, section))
    .filter(Boolean) as SidebarNavSection[]

  return { sections }
}

export function findSidebarLinkByPath(
  config: SidebarNavConfig,
  pathname: string,
): SidebarNavLink | undefined {
  for (const section of config.sections) {
    for (const entry of section.entries) {
      if (entry.type === "link" && isRouteActive(pathname, entry.to)) {
        return entry
      }
      if (entry.type === "submenu") {
        for (const item of entry.items) {
          if (item.type === "link" && isRouteActive(pathname, item.to)) {
            return item
          }
        }
      }
    }
  }
  return undefined
}

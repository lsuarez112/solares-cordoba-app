import type { ModuleAccess } from "~/domain/auth/auth.permissions"

/** Claves de icono serializables para el menú (mapeadas a Lucide en la UI). */
export type SidebarIconKey =
  | "home"
  | "layout"
  | "user"
  | "package"
  | "boxes"
  | "chart"
  | "settings"
  | "report"
  | "truck"
  | "warehouse"
  | "users"
  | "file"
  | "clipboard"
  | "sales"
  | "shield"
  | "building"

type SidebarNavAccess = {
  access?: ModuleAccess[]
  anyAccess?: ModuleAccess[]
}

export type SidebarNavLink = SidebarNavAccess & {
  id: string
  type: "link"
  title: string
  description?: string
  icon?: SidebarIconKey
  to: string
}

export type SidebarNavPlaceholder = {
  id: string
  type: "placeholder"
  title: string
  description?: string
}

export type SidebarNavSubmenuItem = SidebarNavLink | SidebarNavPlaceholder

export type SidebarNavSubmenu = {
  id: string
  type: "submenu"
  title: string
  description?: string
  icon?: SidebarIconKey
  to?: string
  items: SidebarNavSubmenuItem[]
}

export type SidebarNavSectionEntry = SidebarNavLink | SidebarNavSubmenu

export type SidebarNavSection = {
  id: string
  label: string
  description?: string
  entries: SidebarNavSectionEntry[]
}

export type SidebarNavConfig = {
  sections: SidebarNavSection[]
}

import type { LucideIcon } from "lucide-react"
import {
  BoxesIcon,
  Building2Icon,
  ChartLineIcon,
  ClipboardListIcon,
  FileBarChartIcon,
  FileTextIcon,
  HomeIcon,
  LayoutDashboardIcon,
  PackageIcon,
  SettingsIcon,
  ShieldIcon,
  TrendingUpIcon,
  TruckIcon,
  UserIcon,
  UsersIcon,
  WarehouseIcon,
} from "lucide-react"

import type { SidebarIconKey } from "./sidebar-nav.schema"

export const SIDEBAR_NAV_ICON_MAP: Record<SidebarIconKey, LucideIcon> = {
  home: HomeIcon,
  layout: LayoutDashboardIcon,
  user: UserIcon,
  package: PackageIcon,
  boxes: BoxesIcon,
  chart: ChartLineIcon,
  settings: SettingsIcon,
  report: FileBarChartIcon,
  truck: TruckIcon,
  warehouse: WarehouseIcon,
  users: UsersIcon,
  file: FileTextIcon,
  clipboard: ClipboardListIcon,
  sales: TrendingUpIcon,
  shield: ShieldIcon,
  building: Building2Icon,
}

export function getSidebarNavIcon(
  key: SidebarIconKey | undefined,
): LucideIcon | undefined {
  if (!key) return undefined
  return SIDEBAR_NAV_ICON_MAP[key]
}

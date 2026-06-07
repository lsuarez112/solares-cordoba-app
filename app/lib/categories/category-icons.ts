import type { LucideIcon } from "lucide-react"
import {
  Battery,
  BatteryCharging,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  BatteryPlus,
  BatteryWarning,
  Cable,
  EvCharger,
  Factory,
  Layers,
  LayoutPanelTop,
  Monitor,
  Plug,
  Pyramid,
  SolarPanel,
  ToyBrick,
  Unplug,
  UtilityPole,
} from "lucide-react"

import { getSidebarNavIcon } from "~/components/sidebar/sidebar-nav-icons"
import type { SidebarIconKey } from "~/components/sidebar/sidebar-nav.schema"

export type CategorySolarIconKey =
  | "battery"
  | "battery-charging"
  | "battery-full"
  | "battery-low"
  | "battery-medium"
  | "battery-plus"
  | "battery-warning"
  | "cable"
  | "plug"
  | "toy-brick"
  | "unplug"
  | "pyramid"
  | "layout-panel-top"
  | "solar-panel"
  | "utility-pole"
  | "ev-charger"
  | "factory"
  | "monitor"

export type CategoryIconKey = SidebarIconKey | CategorySolarIconKey

export type CategoryIconOption = {
  value: CategoryIconKey
  label: string
}

export type CategoryIconGroup = {
  label: string
  items: CategoryIconOption[]
}

const CATEGORY_SOLAR_ICON_MAP: Record<CategorySolarIconKey, LucideIcon> = {
  battery: Battery,
  "battery-charging": BatteryCharging,
  "battery-full": BatteryFull,
  "battery-low": BatteryLow,
  "battery-medium": BatteryMedium,
  "battery-plus": BatteryPlus,
  "battery-warning": BatteryWarning,
  cable: Cable,
  plug: Plug,
  "toy-brick": ToyBrick,
  unplug: Unplug,
  pyramid: Pyramid,
  "layout-panel-top": LayoutPanelTop,
  "solar-panel": SolarPanel,
  "utility-pole": UtilityPole,
  "ev-charger": EvCharger,
  factory: Factory,
  monitor: Monitor,
}

export const CATEGORY_ICON_GROUPS: CategoryIconGroup[] = [
  {
    label: "General",
    items: [
      { value: "package", label: "Paquete" },
      { value: "boxes", label: "Cajas" },
      { value: "warehouse", label: "Depósito" },
      { value: "truck", label: "Transporte" },
      { value: "chart", label: "Gráfico" },
      { value: "report", label: "Reporte" },
      { value: "file", label: "Archivo" },
      { value: "clipboard", label: "Portapapeles" },
      { value: "settings", label: "Configuración" },
      { value: "layout", label: "Panel" },
    ],
  },
  {
    label: "Batería",
    items: [
      { value: "battery", label: "Batería" },
      { value: "battery-charging", label: "Batería cargando" },
      { value: "battery-full", label: "Batería llena" },
      { value: "battery-low", label: "Batería baja" },
      { value: "battery-medium", label: "Batería media" },
      { value: "battery-plus", label: "Batería plus" },
      { value: "battery-warning", label: "Batería alerta" },
    ],
  },
  {
    label: "Cable",
    items: [
      { value: "cable", label: "Cable" },
      { value: "plug", label: "Enchufe" },
      { value: "toy-brick", label: "Conector" },
      { value: "unplug", label: "Desenchufe" },
    ],
  },
  {
    label: "Estructura",
    items: [
      { value: "pyramid", label: "Pirámide" },
      { value: "layout-panel-top", label: "Panel superior" },
    ],
  },
  {
    label: "Panel",
    items: [
      { value: "solar-panel", label: "Panel solar" },
      { value: "utility-pole", label: "Poste eléctrico" },
    ],
  },
  {
    label: "Energía",
    items: [
      { value: "ev-charger", label: "Cargador EV" },
      { value: "factory", label: "Fábrica" },
    ],
  },
  {
    label: "Display",
    items: [{ value: "monitor", label: "Monitor" }],
  },
]

export const CATEGORY_ICON_OPTIONS: CategoryIconOption[] =
  CATEGORY_ICON_GROUPS.flatMap((group) => group.items)

export function isCategoryIconKey(
  value: string | null | undefined,
): value is CategoryIconKey {
  if (!value) return false
  return CATEGORY_ICON_OPTIONS.some((option) => option.value === value)
}

export function getCategoryIcon(icon: string | null | undefined): LucideIcon {
  if (isCategoryIconKey(icon)) {
    const solarIcon = CATEGORY_SOLAR_ICON_MAP[icon as CategorySolarIconKey]
    if (solarIcon) return solarIcon
    return getSidebarNavIcon(icon as SidebarIconKey) ?? Layers
  }
  return Layers
}

export function getCategoryIconLabel(
  icon: string | null | undefined,
): string | undefined {
  if (!icon) return undefined
  return CATEGORY_ICON_OPTIONS.find((option) => option.value === icon)?.label
}

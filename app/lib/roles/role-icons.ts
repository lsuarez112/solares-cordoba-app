import type { LucideIcon } from "lucide-react"
import { ShieldIcon } from "lucide-react"

import {
  ROLE_ICON_KEYS,
  type RoleIconKey,
} from "~/domain/roles/role-metadata.schema"
import { getSidebarNavIcon } from "~/components/sidebar/sidebar-nav-icons"

export const ROLE_ICON_OPTIONS: { value: RoleIconKey; label: string }[] = [
  { value: "shield", label: "Escudo" },
  { value: "users", label: "Usuarios" },
  { value: "user", label: "Usuario" },
  { value: "settings", label: "Configuración" },
  { value: "layout", label: "Panel" },
  { value: "home", label: "Inicio" },
  { value: "package", label: "Paquete" },
  { value: "boxes", label: "Cajas" },
  { value: "chart", label: "Gráfico" },
  { value: "report", label: "Reporte" },
  { value: "truck", label: "Transporte" },
  { value: "warehouse", label: "Depósito" },
  { value: "file", label: "Archivo" },
  { value: "clipboard", label: "Portapapeles" },
  { value: "sales", label: "Ventas" },
]

export function isRoleIconKey(value: string | undefined): value is RoleIconKey {
  if (!value) return false
  return (ROLE_ICON_KEYS as readonly string[]).includes(value)
}

export function getRoleIcon(icon: string | undefined): LucideIcon {
  if (isRoleIconKey(icon)) {
    return getSidebarNavIcon(icon) ?? ShieldIcon
  }
  return ShieldIcon
}

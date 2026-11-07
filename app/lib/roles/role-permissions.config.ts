import type { Action, Module } from "~/domain/auth/auth.schemas"

export const PERMISSION_ACTIONS: { value: Action; label: string }[] = [
  { value: "read", label: "Ver" },
  { value: "create", label: "Crear" },
  { value: "update", label: "Editar" },
  { value: "delete", label: "Eliminar" },
]

export const ALL_PERMISSION_ACTIONS = PERMISSION_ACTIONS.map(
  (action) => action.value,
)

export type PermissionSectionConfig = {
  id: string
  label: string
  modules: { module: Module; label: string }[]
}

export const PERMISSION_SECTIONS: PermissionSectionConfig[] = [
  {
    id: "commercial",
    label: "Comercial",
    modules: [
      { module: "dashboards", label: "Inicio" },
      { module: "quotes", label: "Presupuestos" },
      { module: "clients", label: "Clientes" },
    ],
  },
  {
    id: "catalog",
    label: "Catálogo",
    modules: [
      { module: "products", label: "Productos y categorías" },
      { module: "kits", label: "Kits y reglas de armado" },
    ],
  },
  {
    id: "admin",
    label: "Administración",
    modules: [
      { module: "configs", label: "Configuración y roles" },
      { module: "exchange_rates", label: "Cotización del dólar" },
      { module: "user_profiles", label: "Usuarios" },
    ],
  },
]

export const ALL_PERMISSION_MODULES = PERMISSION_SECTIONS.flatMap(
  (section) => section.modules.map((item) => item.module),
)

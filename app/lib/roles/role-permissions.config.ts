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
    id: "main",
    label: "Principal",
    modules: [
      { module: "dashboards", label: "Dashboard" },
      { module: "notifications", label: "Notificaciones" },
      { module: "reports", label: "Reportes" },
    ],
  },
  {
    id: "catalog",
    label: "Catálogo",
    modules: [
      { module: "products", label: "Productos" },
      { module: "kits", label: "Kits" },
      { module: "suppliers", label: "Proveedores" },
      { module: "stock_movements", label: "Movimientos de stock" },
    ],
  },
  {
    id: "clients",
    label: "Clientes",
    modules: [
      { module: "clients", label: "Clientes" },
      { module: "consumption_profiles", label: "Perfiles de consumo" },
    ],
  },
  {
    id: "commercial",
    label: "Comercial",
    modules: [
      { module: "budgets", label: "Presupuestos" },
      { module: "orders", label: "Pedidos" },
      { module: "financing", label: "Ventas / Financiación" },
    ],
  },
  {
    id: "operations",
    label: "Operaciones",
    modules: [
      { module: "installations", label: "Instalaciones" },
      { module: "technical_visits", label: "Visitas técnicas" },
      { module: "warranties", label: "Garantías" },
    ],
  },
  {
    id: "admin",
    label: "Administración",
    modules: [
      { module: "user_profiles", label: "Usuarios" },
      { module: "configs", label: "Configuración" },
      { module: "exchange_rates", label: "Tipos de cambio" },
      { module: "user_settings", label: "Preferencias de usuario" },
    ],
  },
]

export const ALL_PERMISSION_MODULES = PERMISSION_SECTIONS.flatMap(
  (section) => section.modules.map((item) => item.module),
)

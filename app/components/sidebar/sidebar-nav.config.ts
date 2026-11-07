import type { SidebarNavConfig } from "./sidebar-nav.schema"

/** Menú lateral alineado con módulos y permisos de la app (V0). */
export const SIDEBAR_NAV: SidebarNavConfig = {
  sections: [
    {
      id: "main",
      label: "Principal",
      entries: [
        {
          id: "dashboard",
          type: "link",
          title: "Inicio",
          description: "Último presupuesto y accesos rápidos",
          to: "/dashboard",
          icon: "home",
          access: [{ module: "dashboards", action: "read" }],
        },
        {
          id: "presupuestos",
          type: "link",
          title: "Presupuestos",
          description: "Presupuestos emitidos y borradores",
          to: "/presupuestos",
          icon: "file",
          access: [{ module: "quotes", action: "read" }],
        },
        {
          id: "clientes",
          type: "link",
          title: "Clientes",
          description: "Fichas e historial",
          to: "/clientes",
          icon: "users",
          access: [{ module: "clients", action: "read" }],
        },
      ],
    },
    {
      id: "catalog",
      label: "Catálogo",
      entries: [
        {
          id: "productos",
          type: "submenu",
          title: "Productos",
          description: "Catálogo de productos",
          to: "/productos",
          icon: "package",
          items: [
            {
              id: "productos-listado",
              type: "link",
              title: "Listado",
              description: "Catálogo de productos",
              to: "/productos",
              access: [{ module: "products", action: "read" }],
            },
            {
              id: "productos-categorias",
              type: "link",
              title: "Categorías",
              description: "Clasificación del catálogo",
              to: "/productos/tipos",
              access: [{ module: "products", action: "read" }],
            },
          ],
        },
        {
          id: "kits",
          type: "link",
          title: "Kits",
          description: "Kits predefinidos",
          to: "/kits",
          icon: "boxes",
          access: [{ module: "kits", action: "read" }],
        },
      ],
    },
    {
      id: "admin",
      label: "Administración",
      entries: [
        {
          id: "config-permisos",
          type: "submenu",
          title: "Permisos y roles",
          description: "Perfiles de acceso",
          to: "/config/permisos",
          icon: "shield",
          items: [
            {
              id: "config-permisos-roles",
              type: "link",
              title: "Permisos",
              description: "Roles y permisos por módulo",
              to: "/config/permisos",
              access: [{ module: "configs", action: "read" }],
            },
            {
              id: "config-permisos-usuarios",
              type: "link",
              title: "Usuarios",
              description: "Cuentas y perfiles de usuario",
              to: "/config/permisos/usuarios",
              access: [{ module: "user_profiles", action: "read" }],
            },
          ],
        },
        {
          id: "config-general",
          type: "link",
          title: "Configuración",
          description: "Empresa, presupuestos y cotización",
          to: "/config/general",
          icon: "settings",
          access: [{ module: "configs", action: "read" }],
        },
      ],
    },
  ],
}

import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes"

export default [
  layout("layouts/public-layout.tsx", [
    layout("layouts/auth-layout.tsx", [
      index("routes/login.tsx"),
      route("login", "routes/login-redirect.tsx"),
      route("register", "routes/register.tsx"),
    ]),
    route("auth/callback", "routes/auth-callback.tsx"),
    route("unauthorized", "routes/unauthorized.tsx"),
  ]),
  layout("layouts/app-layout.tsx", [
    route("dashboard", "routes/dashboard.tsx"),
    route("presupuestos", "routes/presupuestos.tsx"),
    route("clientes", "routes/clientes.tsx"),
    route("productos", "routes/productos.tsx"),
    route("productos/tipos", "routes/productos-tipos.tsx"),
    route("kits", "routes/kits.tsx"),
    route("kits/nuevo", "routes/kit-editor.tsx", { id: "kit-new" }),
    route("kits/:kitId", "routes/kit-editor.tsx", { id: "kit-edit" }),
    route("config/permisos", "routes/config-permisos.tsx"),
    route("config/permisos/usuarios", "routes/permisos-usuarios.tsx"),
    route("config/general", "routes/config-general.tsx"),
  ]),
] satisfies RouteConfig

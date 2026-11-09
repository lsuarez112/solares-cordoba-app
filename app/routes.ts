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
      route("recuperar-clave", "routes/recuperar-clave.tsx"),
    ]),
    route("restablecer-clave", "routes/restablecer-clave.tsx"),
    route("auth/callback", "routes/auth-callback.tsx"),
    route("auth/confirm", "routes/auth-confirm.tsx"),
    route("unauthorized", "routes/unauthorized.tsx"),
  ]),
  layout("layouts/app-layout.tsx", [
    route("dashboard", "routes/dashboard.tsx"),
    route("presupuestos", "routes/presupuestos.tsx"),
    route("presupuestos/nuevo", "routes/presupuesto-nuevo.tsx"),
    route("presupuestos/:quoteId", "routes/presupuesto-detalle.tsx"),
    route("clientes", "routes/clientes.tsx"),
    route("clientes/:clientId", "routes/cliente-detalle.tsx"),
    route("productos", "routes/productos.tsx"),
    route("productos/tipos", "routes/productos-tipos.tsx"),
    route("kits", "routes/kits.tsx"),
    route("kits/nuevo", "routes/kit-editor.tsx", { id: "kit-new" }),
    route("kits/:kitId", "routes/kit-editor.tsx", { id: "kit-edit" }),
    route("config", "routes/config-index.tsx"),
    route("config/permisos", "routes/config-permisos.tsx"),
    route("config/permisos/usuarios", "routes/permisos-usuarios.tsx"),
    route("config/general", "routes/config-general.tsx"),
  ]),
] satisfies RouteConfig

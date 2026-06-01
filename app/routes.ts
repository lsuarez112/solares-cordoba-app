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
    route("reports", "routes/reports.tsx"),
    route("productos", "routes/productos.tsx"),
    route("productos/tipos", "routes/productos-tipos.tsx"),
    route("kits", "routes/kits.tsx"),
    route("proveedores", "routes/proveedores.tsx"),
    route("movimientos-stock", "routes/movimientos-stock.tsx"),
    route("clientes", "routes/clientes.tsx"),
    route("perfiles-consumo", "routes/perfiles-consumo.tsx"),
    route("presupuestos", "routes/presupuestos.tsx"),
    route("pedidos", "routes/pedidos.tsx"),
    route("ventas", "routes/ventas.tsx"),
    route("config/usuario", "routes/config-usuario.tsx"),
    route("config/permisos", "routes/config-permisos.tsx"),
    route("config/permisos/usuarios", "routes/permisos-usuarios.tsx"),
    route("config/general", "routes/config-general.tsx"),
  ]),
] satisfies RouteConfig

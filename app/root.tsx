import {
  data,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteLoaderData,
  type ShouldRevalidateFunctionArgs,
} from "react-router"

import type { Route } from "./+types/root"
import { RouteErrorPage } from "./components/pages/route-error-page"
import { getServerAuthUser } from "./lib/auth/session"
import { APP_TITLE } from "./lib/page-meta"
import { THEME_INIT_SCRIPT } from "./lib/theme"
import { AppProviders } from "./providers/app-providers"
import "./app.css"

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
  { rel: "icon", href: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
  { rel: "apple-touch-icon", href: "/icons/apple-touch-icon.png" },
  { rel: "manifest", href: "/manifest.webmanifest" },
]

const APP_DESCRIPTION = "Presupuestos de energía solar: clientes, kits, PDF y envío por WhatsApp."

export function meta() {
  return [{ title: APP_TITLE }]
}

export async function loader({ request }: Route.LoaderArgs) {
  const { user, profile, headers } = await getServerAuthUser(request)
  // Origen público para las URLs absolutas de la vista previa (og:image).
  const origin = new URL(request.url).origin
  return data({ user, profile, origin }, { headers })
}

/**
 * La sesión ya vive en AuthProvider (cliente). Sin esto, cada clic del sidebar
 * re-ejecuta este loader (SSR + Supabase) y se percibe demora antes de cambiar de ruta.
 */
export function shouldRevalidate({
  formAction,
  formMethod,
  currentUrl,
  nextUrl,
}: ShouldRevalidateFunctionArgs) {
  if (formAction != null || (formMethod != null && formMethod !== "GET")) {
    return true
  }
  return currentUrl.pathname === nextUrl.pathname
}

export function Layout({ children }: { children: React.ReactNode }) {
  // Van acá y no en meta(): el meta() de cada ruta hija reemplaza al de root.
  const origin = useRouteLoaderData<typeof loader>("root")?.origin
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="description" content={APP_DESCRIPTION} />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#191919" media="(prefers-color-scheme: dark)" />
        <meta name="apple-mobile-web-app-title" content="Presupuestos" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="es_AR" />
        <meta property="og:site_name" content="Solares Córdoba" />
        <meta property="og:title" content={APP_TITLE} />
        <meta property="og:description" content={APP_DESCRIPTION} />
        {origin ? (
          <>
            <meta property="og:url" content={origin} />
            <meta property="og:image" content={`${origin}/og-image.png`} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
          </>
        ) : null}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="robots" content="noindex, nofollow" />
        <Meta />
        <Links />
        {/* Aplica el tema guardado antes del primer pintado (sin parpadeo). */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body suppressHydrationWarning>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App({ loaderData }: Route.ComponentProps) {
  return (
    <AppProviders
      initialUser={loaderData.user}
      initialProfile={loaderData.profile}
    >
      <Outlet />
    </AppProviders>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const status = isRouteErrorResponse(error) ? error.status : null
  const stack =
    import.meta.env.DEV && error instanceof Error ? `${error.message}\n\n${error.stack ?? ""}` : undefined
  return <RouteErrorPage status={status} stack={stack} />
}

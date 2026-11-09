import {
  data,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  type ShouldRevalidateFunctionArgs,
} from "react-router"

import type { Route } from "./+types/root"
import { getServerAuthUser } from "./lib/auth/session"
import { APP_TITLE } from "./lib/page-meta"
import { THEME_INIT_SCRIPT } from "./lib/theme"
import { AppProviders } from "./providers/app-providers"
import "./app.css"

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
]

export function meta() {
  return [{ title: APP_TITLE }]
}

export async function loader({ request }: Route.LoaderArgs) {
  const { user, profile, headers } = await getServerAuthUser(request)
  return data({ user, profile }, { headers })
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
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
  let message = "Oops!"
  let details = "An unexpected error occurred."
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error"
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  return (
    <main className="container mx-auto p-4 pt-16">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full overflow-x-auto p-4">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  )
}

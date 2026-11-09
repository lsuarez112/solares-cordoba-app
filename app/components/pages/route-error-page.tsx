import { Home, RotateCcw } from "lucide-react"
import { Link } from "react-router"

import { Button } from "~/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "~/components/ui/empty"

type RouteErrorPageProps = {
  /** 404 = página inexistente; cualquier otro = error inesperado. */
  status: number | null
  /** Solo en desarrollo. */
  stack?: string
}

/**
 * Error de ruta (ErrorBoundary de root): se renderiza sin los providers de la app,
 * así que no usa sesión ni stores. "Ir al inicio" lleva a /dashboard; sin sesión,
 * la guarda de rutas privadas redirige al login.
 */
export function RouteErrorPage({ status, stack }: RouteErrorPageProps) {
  const notFound = status === 404
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-background p-4">
      <Empty className="max-w-md flex-none border">
        <EmptyHeader>
          <EmptyMedia>
            <img src="/icons/icon-192.png" alt="" className="size-20" />
          </EmptyMedia>
          <p className="font-mono text-xs text-muted-foreground">{notFound ? "Error 404" : `Error${status ? ` ${status}` : ""}`}</p>
          <EmptyTitle>{notFound ? "No encontramos esta página" : "Algo salió mal"}</EmptyTitle>
          <EmptyDescription>
            {notFound
              ? "La dirección no existe o cambió. Revisá el link o volvé al inicio."
              : "Ocurrió un error inesperado. Probá recargar la página; si sigue pasando, avisá al administrador."}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center">
          {notFound ? null : (
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RotateCcw data-icon="inline-start" />
              Recargar
            </Button>
          )}
          <Button asChild>
            <Link to="/dashboard">
              <Home data-icon="inline-start" />
              Ir al inicio
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
      {stack ? (
        <pre className="mt-6 w-full max-w-4xl overflow-x-auto rounded-lg border bg-muted p-4 text-xs">
          <code>{stack}</code>
        </pre>
      ) : null}
    </main>
  )
}

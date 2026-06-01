import { Link, useLocation, useMatches } from "react-router"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb"
import type { AppRouteHandle } from "~/routing/route-handle.types"

export function RouteHeaderBreadcrumb() {
  const { pathname } = useLocation()
  const matches = useMatches()

  const titledMatches = matches.filter((m) => {
    const handle = m.handle as AppRouteHandle | undefined
    return handle?.title
  })

  if (pathname === "/") {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Inicio</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  if (titledMatches.length === 0) {
    const segment = pathname.split("/").filter(Boolean).at(-1) ?? "Página"
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="capitalize">{segment}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {titledMatches.map((match, index) => {
          const handle = match.handle as AppRouteHandle
          const isLast = index === titledMatches.length - 1
          const to = match.pathname

          return (
            <span key={match.id} className="contents">
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{handle.title}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={to}>{handle.title}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </span>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

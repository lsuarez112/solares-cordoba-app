import { CompaniesManagement } from "~/components/companies/companies-management"
import { metaFromRouteHandle } from "~/routing/route-page"
import type { AppRouteHandle } from "~/routing/route-handle.types"

import type { Route } from "./+types/config-empresas"

export const handle = {
  title: "Empresas",
  access: [{ module: "companies", action: "read" }],
} satisfies AppRouteHandle

export function meta({ matches }: Route.MetaArgs) {
  return metaFromRouteHandle(matches)
}

export default function ConfigEmpresasPage() {
  return <CompaniesManagement />
}

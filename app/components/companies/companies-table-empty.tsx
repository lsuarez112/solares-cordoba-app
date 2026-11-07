import { Building2, FilterX, Plus, RefreshCcw, Search } from "lucide-react"

import { TableEmptyState } from "~/components/ui/table-empty-state"
import { Button } from "~/components/ui/button"
import {
  defaultCompanyFilters,
  type CompanyFilters,
} from "~/domain/companies/companies.types"
import { hasActiveCompanyFilters } from "~/lib/companies/company-display.utils"

type CompaniesTableEmptyProps = {
  totalCount: number
  filters: CompanyFilters
  canCreate?: boolean
  onNewCompany?: () => void
  onRefresh: () => void
  onClearFilters: () => void
}

export function CompaniesTableEmpty({
  totalCount,
  filters,
  canCreate = false,
  onNewCompany,
  onRefresh,
  onClearFilters,
}: CompaniesTableEmptyProps) {
  const refreshButton = (
    <Button type="button" variant="outline" onClick={onRefresh}>
      <RefreshCcw data-icon="inline-start" />
      Actualizar
    </Button>
  )

  const hasActiveFilters = hasActiveCompanyFilters(
    filters,
    defaultCompanyFilters,
  )

  if (totalCount === 0 && !hasActiveFilters) {
    return (
      <TableEmptyState
        icon={Building2}
        title="No hay empresas"
        description="El directorio está vacío. Creá la primera empresa o actualizá los datos si acabás de cargar información."
        actions={
          <>
            {canCreate ? (
              <Button type="button" onClick={onNewCompany}>
                <Plus data-icon="inline-start" />
                Nueva empresa
              </Button>
            ) : null}
            {refreshButton}
          </>
        }
      />
    )
  }

  if (filters.search.trim()) {
    return (
      <TableEmptyState
        icon={Search}
        title="Sin resultados de búsqueda"
        description={`No encontramos empresas que coincidan con "${filters.search.trim()}". Probá con otro término o limpiá los filtros.`}
        actions={
          <>
            <Button type="button" variant="outline" onClick={onClearFilters}>
              <FilterX data-icon="inline-start" />
              Limpiar filtros
            </Button>
            {refreshButton}
          </>
        }
      />
    )
  }

  if (hasActiveFilters) {
    return (
      <TableEmptyState
        icon={FilterX}
        title="Sin empresas con estos filtros"
        description="Ninguna empresa coincide con la combinación de filtros. Limpiá los filtros o actualizá el listado."
        actions={
          <>
            <Button type="button" variant="outline" onClick={onClearFilters}>
              <FilterX data-icon="inline-start" />
              Limpiar filtros
            </Button>
            {refreshButton}
          </>
        }
      />
    )
  }

  return (
    <TableEmptyState
      icon={Building2}
      muted
      title="Sin empresas para mostrar"
      description="No hay filas visibles en este momento. Probá actualizar el listado."
      actions={refreshButton}
    />
  )
}

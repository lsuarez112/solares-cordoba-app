import { FilterX, RefreshCcw, Search, Shield } from "lucide-react"

import { TableEmptyState } from "~/components/ui/table-empty-state"
import { Button } from "~/components/ui/button"
import type { RoleStatusFilter } from "~/domain/roles/roles.types"

type RolesTableEmptyProps = {
  totalCount: number
  hasTableFilters: boolean
  search: string
  statusFilter: RoleStatusFilter
  onRefresh: () => void
  onClearTableFilters: () => void
}

export function RolesTableEmpty({
  totalCount,
  hasTableFilters,
  search,
  statusFilter,
  onRefresh,
  onClearTableFilters,
}: RolesTableEmptyProps) {
  const refreshButton = (
    <Button type="button" variant="outline" onClick={onRefresh}>
      <RefreshCcw data-icon="inline-start" />
      Actualizar
    </Button>
  )

  if (totalCount === 0) {
    if (statusFilter === "active") {
      return (
        <TableEmptyState
          icon={Shield}
          muted
          title="No hay roles activos"
          description="No hay roles habilitados en este momento."
          actions={refreshButton}
        />
      )
    }

    if (statusFilter === "inactive") {
      return (
        <TableEmptyState
          icon={Shield}
          muted
          title="No hay roles inactivos"
          description="No hay roles deshabilitados en este momento."
          actions={refreshButton}
        />
      )
    }

    return (
      <TableEmptyState
        icon={Shield}
        title="No hay roles"
        description="Todavía no hay roles configurados en el sistema."
        actions={refreshButton}
      />
    )
  }

  if (search.trim()) {
    return (
      <TableEmptyState
        icon={Search}
        title="Sin resultados de búsqueda"
        description={`No encontramos roles que coincidan con "${search.trim()}".`}
        actions={
          <>
            <Button type="button" variant="outline" onClick={onClearTableFilters}>
              <FilterX data-icon="inline-start" />
              Limpiar búsqueda
            </Button>
            {refreshButton}
          </>
        }
      />
    )
  }

  if (hasTableFilters) {
    return (
      <TableEmptyState
        icon={FilterX}
        muted
        title="Sin resultados"
        description="Ningún rol coincide con la búsqueda en la pestaña actual."
        actions={
          <>
            <Button type="button" variant="outline" onClick={onClearTableFilters}>
              <FilterX data-icon="inline-start" />
              Limpiar búsqueda
            </Button>
            {refreshButton}
          </>
        }
      />
    )
  }

  return (
    <TableEmptyState
      icon={Shield}
      muted
      title="Sin roles para mostrar"
      description="No hay filas visibles. Probá actualizar el listado."
      actions={refreshButton}
    />
  )
}

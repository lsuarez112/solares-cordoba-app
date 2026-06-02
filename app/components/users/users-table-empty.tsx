import { FilterX, RefreshCcw, Search, UserRound, Users } from "lucide-react"

import { TableEmptyState } from "~/components/ui/table-empty-state"
import { Button } from "~/components/ui/button"
import type { UserStatusFilter } from "~/domain/users/users.types"

type UsersTableEmptyProps = {
  totalCount: number
  hasTableFilters: boolean
  search: string
  roleFilter: string
  roleName?: string
  statusFilter: UserStatusFilter
  onRefresh: () => void
  onClearTableFilters: () => void
}

const statusEmptyCopy: Record<
  Exclude<UserStatusFilter, "all">,
  { title: string; description: string }
> = {
  pending: {
    title: "No hay usuarios pendientes",
    description:
      "No hay cuentas esperando activación. Cuando alguien se registre, aparecerá en esta lista.",
  },
  active: {
    title: "No hay usuarios activos",
    description: "No hay cuentas activas en este momento.",
  },
  inactive: {
    title: "No hay usuarios inactivos",
    description: "No hay cuentas desactivadas en este momento.",
  },
}

export function UsersTableEmpty({
  totalCount,
  hasTableFilters,
  search,
  roleFilter,
  roleName,
  statusFilter,
  onRefresh,
  onClearTableFilters,
}: UsersTableEmptyProps) {
  const refreshButton = (
    <Button type="button" variant="outline" onClick={onRefresh}>
      <RefreshCcw data-icon="inline-start" />
      Actualizar
    </Button>
  )

  if (totalCount === 0) {
    if (statusFilter !== "all") {
      const copy = statusEmptyCopy[statusFilter]
      return (
        <TableEmptyState
          icon={Users}
          muted
          title={copy.title}
          description={copy.description}
          actions={refreshButton}
        />
      )
    }

    return (
      <TableEmptyState
        icon={Users}
        title="No hay usuarios"
        description="Todavía no hay cuentas cargadas en el sistema. Actualizá el listado si esperás ver registros."
        actions={refreshButton}
      />
    )
  }

  if (search.trim()) {
    return (
      <TableEmptyState
        icon={Search}
        title="Sin resultados de búsqueda"
        description={`No encontramos usuarios que coincidan con "${search.trim()}".`}
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

  if (roleFilter !== "all" && roleName) {
    return (
      <TableEmptyState
        icon={UserRound}
        title="Sin usuarios con este rol"
        description={`No hay usuarios asignados al rol "${roleName}" en la pestaña actual.`}
        actions={
          <>
            <Button type="button" variant="outline" onClick={onClearTableFilters}>
              <FilterX data-icon="inline-start" />
              Quitar filtro de rol
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
        description="Ningún usuario coincide con los filtros de la tabla."
        actions={
          <>
            <Button type="button" variant="outline" onClick={onClearTableFilters}>
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
      icon={Users}
      muted
      title="Sin usuarios para mostrar"
      description="No hay filas visibles. Probá actualizar el listado."
      actions={refreshButton}
    />
  )
}

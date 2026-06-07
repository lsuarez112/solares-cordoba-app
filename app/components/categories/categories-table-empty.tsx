import { FilterX, Layers, Plus, RefreshCcw, Search } from "lucide-react"

import { TableEmptyState } from "~/components/ui/table-empty-state"
import { Button } from "~/components/ui/button"
import {
  defaultCategoryFilters,
  type CategoryFilters,
} from "~/domain/categories/categories.types"
import { hasActiveCategoryFilters } from "~/lib/categories/category-display.utils"

type CategoriesTableEmptyProps = {
  totalCount: number
  filters: CategoryFilters
  canCreate?: boolean
  onNewCategory?: () => void
  onRefresh: () => void
  onClearFilters: () => void
}

export function CategoriesTableEmpty({
  totalCount,
  filters,
  canCreate = false,
  onNewCategory,
  onRefresh,
  onClearFilters,
}: CategoriesTableEmptyProps) {
  const refreshButton = (
    <Button type="button" variant="outline" onClick={onRefresh}>
      <RefreshCcw data-icon="inline-start" />
      Actualizar
    </Button>
  )

  const hasActiveFilters = hasActiveCategoryFilters(
    filters,
    defaultCategoryFilters,
  )

  if (totalCount === 0 && !hasActiveFilters) {
    return (
      <TableEmptyState
        icon={Layers}
        title="No hay categorías"
        description="El catálogo no tiene categorías definidas. Creá la primera o actualizá los datos si acabás de cargar información."
        actions={
          <>
            {canCreate ? (
              <Button type="button" onClick={onNewCategory}>
                <Plus data-icon="inline-start" />
                Nueva categoría
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
        description={`No encontramos categorías que coincidan con "${filters.search.trim()}". Probá con otro término o limpiá los filtros.`}
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
      icon={Layers}
      muted
      title="Sin categorías para mostrar"
      description="No hay filas visibles en este momento. Probá actualizar el listado."
      actions={refreshButton}
    />
  )
}

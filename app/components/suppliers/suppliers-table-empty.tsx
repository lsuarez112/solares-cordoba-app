import { FilterX, Plus, RefreshCcw, Search, Truck } from "lucide-react"

import { TableEmptyState } from "~/components/ui/table-empty-state"
import { Button } from "~/components/ui/button"
import {
  defaultSupplierFilters,
  type SupplierFilters,
} from "~/domain/suppliers/suppliers.types"
import { hasActiveSupplierFilters } from "~/lib/suppliers/supplier-display.utils"

type SuppliersTableEmptyProps = {
  totalCount: number
  filters: SupplierFilters
  canCreate?: boolean
  onNewSupplier?: () => void
  onRefresh: () => void
  onClearFilters: () => void
}

export function SuppliersTableEmpty({
  totalCount,
  filters,
  canCreate = false,
  onNewSupplier,
  onRefresh,
  onClearFilters,
}: SuppliersTableEmptyProps) {
  const refreshButton = (
    <Button type="button" variant="outline" onClick={onRefresh}>
      <RefreshCcw data-icon="inline-start" />
      Actualizar
    </Button>
  )

  const hasActiveFilters = hasActiveSupplierFilters(
    filters,
    defaultSupplierFilters,
  )

  if (totalCount === 0 && !hasActiveFilters) {
    return (
      <TableEmptyState
        icon={Truck}
        title="No hay proveedores"
        description="El directorio está vacío. Creá el primer proveedor o actualizá los datos si acabás de cargar información."
        actions={
          <>
            {canCreate ? (
              <Button type="button" onClick={onNewSupplier}>
                <Plus data-icon="inline-start" />
                Nuevo proveedor
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
        description={`No encontramos proveedores que coincidan con "${filters.search.trim()}". Probá con otro término o limpiá los filtros.`}
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
        title="Sin proveedores con estos filtros"
        description="Ningún proveedor coincide con la combinación de filtros. Limpiá los filtros o actualizá el listado."
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
      icon={Truck}
      muted
      title="Sin proveedores para mostrar"
      description="No hay filas visibles en este momento. Probá actualizar el listado."
      actions={refreshButton}
    />
  )
}

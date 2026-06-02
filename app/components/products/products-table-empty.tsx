import {
  FilterX,
  Package,
  Plus,
  RefreshCcw,
  Search,
  Tags,
} from "lucide-react"

import { TableEmptyState } from "~/components/ui/table-empty-state"
import { Button } from "~/components/ui/button"
import type { GridType } from "~/domain/products/products.schemas"
import type { ProductStatusFilter } from "~/domain/products/products.types"
import { GRID_TYPE_LABELS } from "~/lib/products/grid-type.utils"

export type ProductsTableEmptyContext = {
  totalCount: number
  hasActiveFilters: boolean
  search: string
  categoryId: string
  categoryName?: string
  gridType: "all" | GridType
  statusFilter: ProductStatusFilter
  canCreate: boolean
  onNewProduct: () => void
  onNewProductInCategory: (categoryId: string) => void
  onRefresh: () => void
  onClearFilters: () => void
}

export function ProductsTableEmpty({
  totalCount,
  hasActiveFilters,
  search,
  categoryId,
  categoryName,
  gridType,
  statusFilter,
  canCreate,
  onNewProduct,
  onNewProductInCategory,
  onRefresh,
  onClearFilters,
}: ProductsTableEmptyContext) {
  const refreshButton = (
    <Button type="button" variant="outline" onClick={onRefresh}>
      <RefreshCcw data-icon="inline-start" />
      Actualizar
    </Button>
  )

  if (totalCount === 0) {
    return (
      <TableEmptyState
        icon={Package}
        title="No hay productos"
        description="El catálogo está vacío. Creá el primer producto o actualizá los datos si acabás de importar información."
        actions={
          <>
            {canCreate ? (
              <Button type="button" onClick={onNewProduct}>
                <Plus data-icon="inline-start" />
                Nuevo producto
              </Button>
            ) : null}
            {refreshButton}
          </>
        }
      />
    )
  }

  if (!hasActiveFilters) {
    return (
      <TableEmptyState
        icon={Package}
        muted
        title="Sin productos para mostrar"
        description="No hay filas visibles en este momento. Probá actualizar el listado."
        actions={refreshButton}
      />
    )
  }

  if (search.trim()) {
    return (
      <TableEmptyState
        icon={Search}
        title="Sin resultados de búsqueda"
        description={`No encontramos productos que coincidan con "${search.trim()}". Probá con otro término o limpiá los filtros.`}
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

  if (categoryId !== "all" && categoryName) {
    return (
      <TableEmptyState
        icon={Tags}
        title="Sin productos en esta categoría"
        description={`No hay productos en "${categoryName}". Podés crear uno con esa categoría o elegir otra en el filtro.`}
        actions={
          <>
            {canCreate ? (
              <Button
                type="button"
                onClick={() => onNewProductInCategory(categoryId)}
              >
                <Plus data-icon="inline-start" />
                Crear en {categoryName}
              </Button>
            ) : null}
            <Button type="button" variant="outline" onClick={onClearFilters}>
              <FilterX data-icon="inline-start" />
              Limpiar filtros
            </Button>
          </>
        }
      />
    )
  }

  if (gridType !== "all") {
    const gridLabel = GRID_TYPE_LABELS[gridType]
    return (
      <TableEmptyState
        icon={FilterX}
        title={`Sin productos ${gridLabel}`}
        description={`No hay productos con tipo de red "${gridLabel}". Ajustá el filtro o creá un producto con ese tipo.`}
        actions={
          <>
            {canCreate ? (
              <Button type="button" onClick={onNewProduct}>
                <Plus data-icon="inline-start" />
                Nuevo producto
              </Button>
            ) : null}
            <Button type="button" variant="outline" onClick={onClearFilters}>
              <FilterX data-icon="inline-start" />
              Limpiar filtros
            </Button>
          </>
        }
      />
    )
  }

  if (statusFilter !== "all") {
    const statusLabels: Record<ProductStatusFilter, string> = {
      all: "Todos",
      active: "activos",
      inactive: "inactivos",
      stock_alert: "con alerta de stock",
    }
    return (
      <TableEmptyState
        icon={FilterX}
        title="Sin productos con este estado"
        description={`No hay productos ${statusLabels[statusFilter]} con los filtros actuales.`}
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
      icon={FilterX}
      title="Sin productos con estos filtros"
      description="Ningún producto coincide con la combinación de filtros. Limpiá los filtros o actualizá el listado."
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

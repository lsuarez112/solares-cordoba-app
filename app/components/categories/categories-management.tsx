"use client"

import * as React from "react"
import { Layers, Package, Plus } from "lucide-react"

import { CategoriesCreateActions } from "./categories-create-actions"
import { CategoriesDataTable } from "./categories-data-table"
import { CategoryFormModal } from "./category-form-modal"
import { DataActionsMenu } from "~/components/ui/data-actions-menu"
import { DataRefreshActions } from "~/components/ui/data-refresh-actions"
import { Badge } from "~/components/ui/badge"
import { DropdownMenuItem } from "~/components/ui/dropdown-menu"
import { Skeleton } from "~/components/ui/skeleton"
import type { Category } from "~/domain/categories/categories.schemas"
import { useCategories } from "~/hooks/use-categories"
import { usePermission } from "~/hooks/use-permission"
import { getCategoryStats } from "~/lib/categories/category-display.utils"

function CategoriesMetricsSkeleton() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex items-center gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-8" />
        </div>
      ))}
    </div>
  )
}

export function CategoriesManagement() {
  const {
    categories,
    productCounts,
    isLoading,
    hasFetched,
    fetchedAt,
    filters,
    setFilters,
    resetFilters,
    fetch,
    openModal,
  } = useCategories()

  const canCreate = usePermission("products", "create")
  const canUpdate = usePermission("products", "update")
  const canOpenForm = canCreate || canUpdate

  const handleNewCategory = () => openModal()
  // Callback estable (ver products-management): evita remontar las celdas de la tabla.
  const openModalRef = React.useRef(openModal)
  openModalRef.current = openModal
  const handleEditCategory = React.useCallback(
    (category: Category) => openModalRef.current(category),
    [],
  )

  const stats = React.useMemo(
    () => getCategoryStats(categories, productCounts),
    [categories, productCounts],
  )

  const isInitialLoading = isLoading && !hasFetched
  const isRefreshing = isLoading && hasFetched

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-col gap-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">
            Categorías de productos
          </h1>
          <p className="text-sm text-muted-foreground">
            Clasificación y organización del catálogo de productos
          </p>
        </div>
        <div className="flex shrink-0 items-start gap-2">
          <div className="sm:hidden">
            <DataActionsMenu
              refreshing={isRefreshing}
              lastFetchedAt={fetchedAt}
              onRefresh={() => void fetch()}
              label="Datos"
            >
              {canCreate ? (
                <DropdownMenuItem onSelect={handleNewCategory}>
                  <Plus data-icon="inline-start" />
                  Nueva categoría
                </DropdownMenuItem>
              ) : null}
            </DataActionsMenu>
          </div>
          <div className="hidden sm:block">
            <DataRefreshActions
              refreshing={isRefreshing}
              lastFetchedAt={fetchedAt}
              onRefresh={() => void fetch()}
            >
              {canCreate ? (
                <CategoriesCreateActions onNewCategory={handleNewCategory} />
              ) : null}
            </DataRefreshActions>
          </div>
        </div>
      </div>

      {isInitialLoading ? (
        <CategoriesMetricsSkeleton />
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="h-6 gap-1.5 px-2.5">
            <Layers data-icon="inline-start" />
            Total
            <span className="font-semibold text-foreground tabular-nums">{stats.total}</span>
          </Badge>
          <Badge variant="secondary" className="h-6 gap-1.5 px-2.5">
            <Package data-icon="inline-start" className="text-green-600" />
            Con productos
            <span className="font-semibold text-foreground tabular-nums">{stats.withProducts}</span>
          </Badge>
          <Badge variant="secondary" className="h-6 gap-1.5 px-2.5">
            <Layers data-icon="inline-start" className="text-muted-foreground" />
            Vacías
            <span className="font-semibold text-foreground tabular-nums">{stats.empty}</span>
          </Badge>
        </div>
      )}

      <CategoriesDataTable
        data={categories}
        productCounts={productCounts}
        filters={filters}
        loading={isInitialLoading}
        canCreate={canCreate}
        onFiltersChange={setFilters}
        onResetFilters={resetFilters}
        onOpenEdit={canOpenForm ? handleEditCategory : undefined}
        onNewCategory={canCreate ? handleNewCategory : undefined}
        onRefresh={() => void fetch()}
      />

      {canOpenForm ? <CategoryFormModal /> : null}
    </div>
  )
}

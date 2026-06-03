"use client"

import * as React from "react"
import { Plus, Truck } from "lucide-react"

import { SupplierFormModal } from "./supplier-form-modal"
import { SuppliersCreateActions } from "./suppliers-create-actions"
import { SuppliersDataTable } from "./suppliers-data-table"
import { DataActionsMenu } from "~/components/ui/data-actions-menu"
import { DataRefreshActions } from "~/components/ui/data-refresh-actions"
import { Badge } from "~/components/ui/badge"
import { DropdownMenuItem } from "~/components/ui/dropdown-menu"
import { Skeleton } from "~/components/ui/skeleton"
import { usePermission } from "~/hooks/use-permission"
import { useSuppliers } from "~/hooks/use-suppliers"
import { getSupplierStats } from "~/lib/suppliers/supplier-display.utils"
import type { Supplier } from "~/domain/suppliers/suppliers.schemas"

function SuppliersMetricsSkeleton() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="flex items-center gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-8" />
        </div>
      ))}
    </div>
  )
}

export function SuppliersManagement() {
  const {
    suppliers,
    isLoading,
    hasFetched,
    fetchedAt,
    filters,
    setFilters,
    resetFilters,
    fetch,
    openModal,
  } = useSuppliers()

  const canCreate = usePermission("suppliers", "create")
  const canUpdate = usePermission("suppliers", "update")
  const canOpenForm = canCreate || canUpdate

  const handleNewSupplier = () => openModal()
  const handleEditSupplier = (supplier: Supplier) => openModal(supplier)

  const stats = React.useMemo(() => getSupplierStats(suppliers), [suppliers])

  const isInitialLoading = isLoading && !hasFetched
  const isRefreshing = isLoading && hasFetched

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-col gap-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">Proveedores</h1>
          <p className="text-sm text-muted-foreground">
            Directorio de proveedores y contactos comerciales
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
                <DropdownMenuItem onSelect={handleNewSupplier}>
                  <Plus data-icon="inline-start" />
                  Nuevo proveedor
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
                <SuppliersCreateActions onNewSupplier={handleNewSupplier} />
              ) : null}
            </DataRefreshActions>
          </div>
        </div>
      </div>

      {isInitialLoading ? (
        <SuppliersMetricsSkeleton />
      ) : (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              <Truck data-icon="inline-start" />
              Total
            </Badge>
            <span className="text-sm font-semibold tabular-nums">
              {stats.total}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              <Truck data-icon="inline-start" className="text-green-600" />
              Activos
            </Badge>
            <span className="text-sm font-semibold tabular-nums">
              {stats.active}
            </span>
          </div>
        </div>
      )}

      <SuppliersDataTable
        data={suppliers}
        filters={filters}
        loading={isInitialLoading}
        canCreate={canCreate}
        onFiltersChange={setFilters}
        onResetFilters={resetFilters}
        onOpenEdit={canOpenForm ? handleEditSupplier : undefined}
        onNewSupplier={canCreate ? handleNewSupplier : undefined}
        onRefresh={() => void fetch()}
      />

      {canOpenForm ? <SupplierFormModal /> : null}
    </div>
  )
}

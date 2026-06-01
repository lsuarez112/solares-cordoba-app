"use client"

import * as React from "react"
import {
  AlertTriangle,
  Layers,
  Package,
  Plus,
} from "lucide-react"

import { ProductsCreateActions } from "~/components/products/products-create-actions"
import { ProductsDataTable } from "~/components/products/products-data-table"
import { DataActionsMenu } from "~/components/ui/data-actions-menu"
import { DataRefreshActions } from "~/components/ui/data-refresh-actions"
import { Badge } from "~/components/ui/badge"
import { DropdownMenuItem } from "~/components/ui/dropdown-menu"
import { Skeleton } from "~/components/ui/skeleton"
import { usePermission } from "~/hooks/use-permission"
import { useProductsStorePageSync } from "~/hooks/use-products-store-sync"
import { getProductStats } from "~/lib/products/product-list.utils"
import { useProductsStore } from "~/stores/products.store"

function ProductsMetricsSkeleton() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex items-center gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-8" />
        </div>
      ))}
    </div>
  )
}

export function ProductsManagement() {
  useProductsStorePageSync()

  const products = useProductsStore((s) => s.products)
  const categories = useProductsStore((s) => s.categories)
  const loading = useProductsStore((s) => s.loading)
  const initialized = useProductsStore((s) => s.initialized)
  const fetchedAt = useProductsStore((s) => s.fetchedAt)
  const fetchAll = useProductsStore((s) => s.fetchAll)

  const canCreate = usePermission("products", "create")

  const stats = React.useMemo(() => getProductStats(products), [products])

  const isInitialLoading = loading && !initialized
  const isRefreshing = loading && initialized

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-col gap-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">Productos</h1>
          <p className="text-sm text-muted-foreground">
            Catálogo completo de productos del sistema
          </p>
        </div>
        <div className="flex shrink-0 items-start gap-2">
          <div className="sm:hidden">
            <DataActionsMenu
              refreshing={isRefreshing}
              lastFetchedAt={fetchedAt}
              onRefresh={() => void fetchAll({ force: true })}
              label="Data"
            >
              {canCreate ? (
                <DropdownNewProductItem />
              ) : null}
            </DataActionsMenu>
          </div>
          <div className="hidden sm:block">
            <DataRefreshActions
              refreshing={isRefreshing}
              lastFetchedAt={fetchedAt}
              onRefresh={() => void fetchAll({ force: true })}
            >
              {canCreate ? <ProductsCreateActions /> : null}
            </DataRefreshActions>
          </div>
        </div>
      </div>

      {isInitialLoading ? (
        <ProductsMetricsSkeleton />
      ) : (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              <Package data-icon="inline-start" />
              Total
            </Badge>
            <span className="text-sm font-semibold tabular-nums">
              {stats.total}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              <Package data-icon="inline-start" className="text-green-600" />
              Activos
            </Badge>
            <span className="text-sm font-semibold tabular-nums">
              {stats.active}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              <Layers data-icon="inline-start" className="text-blue-600" />
              Kits/Compuestos
            </Badge>
            <span className="text-sm font-semibold tabular-nums">
              {stats.composite}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              <AlertTriangle data-icon="inline-start" className="text-amber-600" />
              Alerta stock
            </Badge>
            <span className="text-sm font-semibold tabular-nums">
              {stats.stockAlert}
            </span>
          </div>
        </div>
      )}

      <ProductsDataTable
        data={products}
        categories={categories}
        loading={isInitialLoading}
      />
    </div>
  )
}

function DropdownNewProductItem() {
  return (
    <DropdownMenuItem onSelect={() => {}}>
      <Plus className="size-4" />
      Nuevo producto
    </DropdownMenuItem>
  )
}

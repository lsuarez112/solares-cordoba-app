"use client"

import * as React from "react"
import {
  AlertTriangle,
  Package,
  Plus,
} from "lucide-react"
import { useSearchParams } from "react-router"

import { ProductFormModal } from "~/components/products/product-form-modal"
import { ProductsCreateActions } from "~/components/products/products-create-actions"
import { ProductsDataTable } from "~/components/products/products-data-table"
import type { Product } from "~/domain/products/products.schemas"
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
      {Array.from({ length: 3 }).map((_, index) => (
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
  const [searchParams] = useSearchParams()
  const initialCategoryId = searchParams.get("category")

  const products = useProductsStore((s) => s.products)
  const categories = useProductsStore((s) => s.categories)
  const loading = useProductsStore((s) => s.loading)
  const initialized = useProductsStore((s) => s.initialized)
  const fetchedAt = useProductsStore((s) => s.fetchedAt)
  const fetchAll = useProductsStore((s) => s.fetchAll)

  const canCreate = usePermission("products", "create")
  const canUpdate = usePermission("products", "update")

  const [formOpen, setFormOpen] = React.useState(false)
  const [editingProduct, setEditingProduct] = React.useState<
    Product | undefined
  >()
  const [duplicateFrom, setDuplicateFrom] = React.useState<
    Product | undefined
  >()
  const [presetCategoryId, setPresetCategoryId] = React.useState<
    string | null
  >(null)

  const closeForm = () => {
    setFormOpen(false)
    setEditingProduct(undefined)
    setDuplicateFrom(undefined)
    setPresetCategoryId(null)
  }

  const handleNewProduct = () => {
    setEditingProduct(undefined)
    setDuplicateFrom(undefined)
    setPresetCategoryId(null)
    setFormOpen(true)
  }

  const handleNewProductInCategory = (categoryId: string) => {
    setEditingProduct(undefined)
    setDuplicateFrom(undefined)
    setPresetCategoryId(categoryId)
    setFormOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setDuplicateFrom(undefined)
    setEditingProduct(product)
    setFormOpen(true)
  }

  const handleDuplicateProduct = (product: Product) => {
    setEditingProduct(undefined)
    setDuplicateFrom(product)
    setFormOpen(true)
  }

  const canOpenForm = canCreate || canUpdate
  const canDuplicateProduct = canCreate

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
                <DropdownNewProductItem onSelect={handleNewProduct} />
              ) : null}
            </DataActionsMenu>
          </div>
          <div className="hidden sm:block">
            <DataRefreshActions
              refreshing={isRefreshing}
              lastFetchedAt={fetchedAt}
              onRefresh={() => void fetchAll({ force: true })}
            >
              {canCreate ? (
                <ProductsCreateActions onNewProduct={handleNewProduct} />
              ) : null}
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
              <AlertTriangle data-icon="inline-start" className="text-amber-600" />
              Sin precio
            </Badge>
            <span className="text-sm font-semibold tabular-nums">
              {stats.noPrice}
            </span>
          </div>
        </div>
      )}

      <ProductsDataTable
        data={products}
        categories={categories}
        loading={isInitialLoading}
        canCreate={canCreate}
        initialCategoryId={initialCategoryId}
        onOpenEdit={canOpenForm ? handleEditProduct : undefined}
        onDuplicate={canDuplicateProduct ? handleDuplicateProduct : undefined}
        onNewProduct={canCreate ? handleNewProduct : undefined}
        onNewProductInCategory={
          canCreate ? handleNewProductInCategory : undefined
        }
        onRefresh={() => void fetchAll({ force: true })}
      />

      {canOpenForm ? (
        <ProductFormModal
          open={formOpen}
          onClose={closeForm}
          product={editingProduct}
          duplicateFrom={duplicateFrom}
          presetCategoryId={presetCategoryId}
        />
      ) : null}
    </div>
  )
}

function DropdownNewProductItem({ onSelect }: { onSelect: () => void }) {
  return (
    <DropdownMenuItem onSelect={onSelect}>
      <Plus data-icon="inline-start" />
      Nuevo producto
    </DropdownMenuItem>
  )
}

import { useState } from "react"

import type { Category } from "~/domain/categories/categories.schemas"
import { usePermission } from "~/hooks/use-permission"
import { getCategoryProductCount } from "~/lib/categories/category-display.utils"
import { appToast } from "~/lib/toast"
import { useCategoriesStore } from "~/stores/categories.store"

interface UseCategoryActionsOptions {
  category?: Category
  onClose?: () => void
  onOpenEdit?: () => void
}

export function useCategoryActions({
  category,
  onClose,
  onOpenEdit,
}: UseCategoryActionsOptions) {
  const isCategoryReady = !!category
  const remove = useCategoriesStore((s) => s.remove)
  const productCounts = useCategoriesStore((s) => s.productCounts)

  const canRead = usePermission("products", "read")
  const canCreate = usePermission("products", "create")
  const canUpdate = usePermission("products", "update")
  const canDelete = usePermission("products", "delete")

  const canEdit = canCreate || canUpdate

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const productCount = category
    ? getCategoryProductCount(category.id, productCounts)
    : 0

  const handleEdit = () => {
    if (!canEdit) return
    onOpenEdit?.()
  }

  const openDeleteDialog = () => {
    if (!canDelete) return
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!canDelete || !category) return
    setIsDeleting(true)
    const ok = await remove(category.id)
    setIsDeleting(false)

    if (ok) {
      appToast.success("Categoría eliminada", {
        description: `"${category.name}" se eliminó del catálogo.`,
      })
      setDeleteDialogOpen(false)
      onClose?.()
      return
    }

    appToast.error("No se pudo eliminar la categoría", {
      description:
        productCount > 0
          ? "Hay productos asociados a esta categoría. Reasigná o eliminá esos productos primero."
          : "Intentá de nuevo en unos momentos.",
    })
  }

  const hasManagementActions = isCategoryReady && canEdit
  const hasAdminActions = isCategoryReady && canDelete
  const hasAnyAction = hasManagementActions || hasAdminActions

  return {
    canRead,
    canCreate,
    canUpdate,
    canDelete,
    canEdit,
    productCount,
    hasAnyAction,
    deleteDialogOpen,
    setDeleteDialogOpen,
    isDeleting,
    handleEdit,
    openDeleteDialog,
    handleDeleteConfirm,
  }
}

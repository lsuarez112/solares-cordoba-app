import { useState } from "react"
import { useCopyToClipboard } from "@uidotdev/usehooks"

import type { Product } from "~/domain/products/products.schemas"
import { usePermission } from "~/hooks/use-permission"
import { productToFormValues } from "~/lib/products/product-form.utils"
import {
  buildCopyText,
  buildWhatsAppText,
  buildWhatsAppUrl,
} from "~/lib/products/product-share.utils"
import { appToast } from "~/lib/toast"
import { useProductsStore } from "~/stores/products.store"

interface UseProductActionsOptions {
  product?: Product
  onClose?: () => void
  onOpenEdit?: () => void
  onDuplicate?: () => void
}

export function useProductActions({
  product,
  onClose,
  onOpenEdit,
  onDuplicate,
}: UseProductActionsOptions) {
  const isProductReady = !!product
  const [, copyToClipboard] = useCopyToClipboard()
  const updateProduct = useProductsStore((s) => s.updateProduct)
  const deleteProduct = useProductsStore((s) => s.deleteProduct)

  const canRead = usePermission("products", "read")
  const canCreate = usePermission("products", "create")
  const canUpdate = usePermission("products", "update")
  const canDelete = usePermission("products", "delete")

  const canEdit = canCreate || canUpdate
  const canDuplicate = canCreate
  const canToggleActive = canUpdate

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isTogglingActive, setIsTogglingActive] = useState(false)

  const handleEdit = () => {
    if (!canEdit) return
    onOpenEdit?.()
  }

  const handleDuplicate = () => {
    if (!canDuplicate) return
    onDuplicate?.()
  }

  const handleToggleActive = async () => {
    if (!canToggleActive || !product) return
    setIsTogglingActive(true)
    const values = productToFormValues(product)
    const nextActive = !product.active
    const ok = await updateProduct(product.id, {
      ...values,
      active: nextActive,
    })
    setIsTogglingActive(false)

    if (ok) {
      appToast.success(
        nextActive ? "Producto reactivado" : "Producto desactivado",
        {
          description: nextActive
            ? `"${product.name}" volvió a estar activo en el catálogo.`
            : `"${product.name}" ya no aparece en el catálogo ni en presupuestos.`,
        },
      )
      return
    }

    appToast.error("No se pudo cambiar el estado del producto", {
      description: "Intentá de nuevo en unos momentos.",
    })
  }

  const handleCopySpecs = () => {
    if (!canRead || !product) return
    const text = buildCopyText(product)
    copyToClipboard(text)
    appToast.success("Especificaciones copiadas", {
      description: "El detalle del producto está en el portapapeles.",
    })
  }

  const handleWhatsApp = () => {
    if (!canRead || !product) return
    const text = buildWhatsAppText(product)
    window.open(buildWhatsAppUrl(text), "_blank")
  }

  const openDeleteDialog = () => {
    if (!canDelete) return
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!canDelete || !product) return
    setIsDeleting(true)
    const ok = await deleteProduct(product.id)
    setIsDeleting(false)
    if (ok) {
      appToast.success("Producto eliminado", {
        description: `"${product.name}" (${product.product_code}) se eliminó del catálogo.`,
      })
      setDeleteDialogOpen(false)
      onClose?.()
      return
    }

    appToast.error("No se pudo eliminar el producto", {
      description: "Intentá de nuevo en unos momentos.",
    })
  }

  const hasManagementActions = isProductReady && (canEdit || canDuplicate)
  const hasShareActions = isProductReady && canRead
  const hasAdminActions = isProductReady && (canToggleActive || canDelete)
  const hasAnyAction =
    hasManagementActions || hasShareActions || hasAdminActions

  return {
    canRead,
    canCreate,
    canUpdate,
    canDelete,
    canEdit,
    canDuplicate,
    canToggleActive,
    hasAnyAction,
    deleteDialogOpen,
    setDeleteDialogOpen,
    isDeleting,
    isTogglingActive,
    handleEdit,
    handleDuplicate,
    handleToggleActive,
    handleCopySpecs,
    handleWhatsApp,
    openDeleteDialog,
    handleDeleteConfirm,
  }
}

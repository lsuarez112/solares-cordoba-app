import { useState } from "react"

import type { Supplier } from "~/domain/suppliers/suppliers.schemas"
import { usePermission } from "~/hooks/use-permission"
import { supplierWhatsAppUrl } from "~/lib/suppliers/supplier-display.utils"
import { appToast } from "~/lib/toast"
import { useSuppliersStore } from "~/stores/suppliers.store"

interface UseSupplierActionsOptions {
  supplier?: Supplier
  onClose?: () => void
  onOpenEdit?: () => void
}

export function useSupplierActions({
  supplier,
  onClose,
  onOpenEdit,
}: UseSupplierActionsOptions) {
  const isSupplierReady = !!supplier
  const toggleActive = useSuppliersStore((s) => s.toggleActive)
  const remove = useSuppliersStore((s) => s.remove)

  const canRead = usePermission("suppliers", "read")
  const canCreate = usePermission("suppliers", "create")
  const canUpdate = usePermission("suppliers", "update")
  const canDelete = usePermission("suppliers", "delete")

  const canEdit = canCreate || canUpdate
  const canToggleActive = canUpdate

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isTogglingActive, setIsTogglingActive] = useState(false)

  const handleEdit = () => {
    if (!canEdit) return
    onOpenEdit?.()
  }

  const handleToggleActive = async () => {
    if (!canToggleActive || !supplier) return
    setIsTogglingActive(true)
    const nextActive = !supplier.active
    const ok = await toggleActive(supplier.id, nextActive)
    setIsTogglingActive(false)

    if (ok) {
      appToast.success(
        nextActive ? "Proveedor activado" : "Proveedor desactivado",
        {
          description: nextActive
            ? `"${supplier.name}" volvió a estar activo.`
            : `"${supplier.name}" quedó inactivo en el directorio.`,
        },
      )
      return
    }

    appToast.error("No se pudo cambiar el estado del proveedor", {
      description: "Intentá de nuevo en unos momentos.",
    })
  }

  const openDeleteDialog = () => {
    if (!canDelete) return
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!canDelete || !supplier) return
    setIsDeleting(true)
    const ok = await remove(supplier.id)
    setIsDeleting(false)

    if (ok) {
      appToast.success("Proveedor eliminado", {
        description: `"${supplier.name}" se eliminó del directorio.`,
      })
      setDeleteDialogOpen(false)
      onClose?.()
      return
    }

    appToast.error("No se pudo eliminar el proveedor", {
      description: "Intentá de nuevo en unos momentos.",
    })
  }

  const whatsAppUrl =
    supplier?.whatsapp && canRead
      ? supplierWhatsAppUrl(supplier.whatsapp)
      : null

  const mailtoUrl =
    supplier?.email && canRead ? `mailto:${supplier.email}` : null

  const hasContactActions =
    isSupplierReady && canRead && !!(whatsAppUrl || mailtoUrl)
  const hasManagementActions = isSupplierReady && canEdit
  const hasAdminActions = isSupplierReady && (canToggleActive || canDelete)
  const hasAnyAction =
    hasManagementActions || hasContactActions || hasAdminActions

  return {
    canRead,
    canCreate,
    canUpdate,
    canDelete,
    canEdit,
    canToggleActive,
    hasAnyAction,
    hasContactActions,
    whatsAppUrl,
    mailtoUrl,
    deleteDialogOpen,
    setDeleteDialogOpen,
    isDeleting,
    isTogglingActive,
    handleEdit,
    handleToggleActive,
    openDeleteDialog,
    handleDeleteConfirm,
  }
}

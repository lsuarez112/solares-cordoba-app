import { useState } from "react"

import type { RoleListItem } from "~/domain/roles/roles.types"
import { usePermission } from "~/hooks/use-permission"
import { canDeleteRole } from "~/lib/roles/role-display.utils"
import { appToast } from "~/lib/toast"
import { useRolesStore } from "~/stores/roles.store"

export function useRoleActions(role: RoleListItem) {
  const removeRole = useRolesStore((s) => s.removeRole)

  const canUpdate = usePermission("configs", "update")
  const canDelete = usePermission("configs", "delete")
  const isDeletable = canDeleteRole(role)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const openDeleteDialog = () => {
    if (!canDelete || !isDeletable) return
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!canDelete || !isDeletable) return

    setIsDeleting(true)
    const ok = await removeRole(role.id)
    setIsDeleting(false)

    if (ok) {
      appToast.success("Rol eliminado", {
        description: `"${role.name}" se eliminó del sistema.`,
      })
      setDeleteDialogOpen(false)
      return
    }

    appToast.error("No se pudo eliminar el rol", {
      description:
        "Puede estar asignado a usuarios o no tener permisos (RLS) en Supabase.",
    })
  }

  const hasAnyAction = canUpdate || (canDelete && isDeletable)

  return {
    canUpdate,
    canDelete: canDelete && isDeletable,
    hasAnyAction,
    deleteDialogOpen,
    setDeleteDialogOpen,
    isDeleting,
    openDeleteDialog,
    handleDeleteConfirm,
  }
}

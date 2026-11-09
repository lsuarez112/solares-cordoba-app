"use client"

import { Copy, Pencil, Trash2 } from "lucide-react"

import { RoleDeleteAlertDialog } from "~/components/roles/role-delete-alert-dialog"
import { RowActionsMenu } from "~/components/ui/row-actions-menu"
import type { RoleListItem } from "~/domain/roles/roles.types"
import { useRoleActions } from "~/hooks/use-role-actions"
import { appToast } from "~/lib/toast"

type RoleRowActionsProps = {
  role: RoleListItem
  canUpdate?: boolean
  onOpenEdit?: (role: RoleListItem) => void
}

export function RoleRowActions({ role, canUpdate = false, onOpenEdit }: RoleRowActionsProps) {
  const actions = useRoleActions(role)

  if (!actions.hasAnyAction) return null

  return (
    <>
      <RowActionsMenu
        actions={[
          {
            key: "edit",
            label: "Editar rol",
            icon: Pencil,
            tone: "edit",
            hidden: !canUpdate || !onOpenEdit,
            onSelect: () => onOpenEdit?.(role),
          },
          {
            key: "copy",
            label: "Copiar ID",
            icon: Copy,
            tone: "neutral",
            onSelect: () => {
              void navigator.clipboard.writeText(role.id)
              appToast.success("ID copiado")
            },
          },
          {
            key: "delete",
            label: "Eliminar",
            icon: Trash2,
            tone: "delete",
            hidden: !actions.canDelete,
            onSelect: actions.openDeleteDialog,
          },
        ]}
      />

      {actions.canDelete ? (
        <RoleDeleteAlertDialog
          role={role}
          open={actions.deleteDialogOpen}
          onOpenChange={actions.setDeleteDialogOpen}
          isDeleting={actions.isDeleting}
          onConfirm={actions.handleDeleteConfirm}
        />
      ) : null}
    </>
  )
}

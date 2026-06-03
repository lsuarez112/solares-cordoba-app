"use client"

import { MoreHorizontal, Trash2 } from "lucide-react"

import { RoleDeleteAlertDialog } from "~/components/roles/role-delete-alert-dialog"
import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import type { RoleListItem } from "~/domain/roles/roles.types"
import { useRoleActions } from "~/hooks/use-role-actions"

type RoleRowActionsProps = {
  role: RoleListItem
  canUpdate?: boolean
  onOpenEdit?: (role: RoleListItem) => void
}

export function RoleRowActions({
  role,
  canUpdate = false,
  onOpenEdit,
}: RoleRowActionsProps) {
  const actions = useRoleActions(role)

  if (!actions.hasAnyAction) return null

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(role.id)}
            >
              Copiar ID
            </DropdownMenuItem>
          </DropdownMenuGroup>

          {canUpdate ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault()
                    onOpenEdit?.(role)
                  }}
                >
                  Editar rol
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </>
          ) : null}

          {actions.canDelete ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel>Administración</DropdownMenuLabel>
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={actions.openDeleteDialog}
                >
                  <Trash2 data-icon="inline-start" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

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

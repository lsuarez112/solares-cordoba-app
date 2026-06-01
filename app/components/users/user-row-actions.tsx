"use client"

import * as React from "react"
import { MoreHorizontal } from "lucide-react"

import { UserEditDialog } from "~/components/users/user-edit-dialog"
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
import type { User } from "~/domain/users/users.types"
import { appToast } from "~/lib/toast"
import { useUsersStore } from "~/stores/users.store"

type UserRowActionsProps = {
  user: User
}

export function UserRowActions({ user }: UserRowActionsProps) {
  const updateUser = useUsersStore((state) => state.updateUser)
  const [editOpen, setEditOpen] = React.useState(false)

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
              onClick={() => navigator.clipboard.writeText(user.id)}
            >
              Copiar ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {user.status === "pending" ? (
              <DropdownMenuItem>Activar cuenta</DropdownMenuItem>
            ) : null}
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault()
                setEditOpen(true)
              }}
            >
              Editar usuario
            </DropdownMenuItem>
            <DropdownMenuItem>Cambiar rol</DropdownMenuItem>
            {user.status === "active" ? (
              <DropdownMenuItem variant="destructive">
                Desactivar
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <UserEditDialog
        user={user}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={async (values) => {
          const ok = await updateUser(user.id, values)
          if (ok) {
            appToast.success("Usuario actualizado", {
              description: `Los cambios en "${values.fullName.trim() || user.fullName || "el usuario"}" se guardaron correctamente.`,
            })
            return true
          }

          appToast.error("No se pudo actualizar el usuario", {
            description: "Revisá los datos e intentá de nuevo.",
          })
          return false
        }}
      />
    </>
  )
}

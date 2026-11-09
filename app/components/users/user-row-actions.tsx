"use client"

import * as React from "react"
import { CircleCheck, CircleMinus, Copy, Pencil, ShieldCheck } from "lucide-react"

import { UserEditDialog } from "~/components/users/user-edit-dialog"
import { RowActionsMenu } from "~/components/ui/row-actions-menu"
import type { User } from "~/domain/users/users.types"
import { usePermission } from "~/hooks/use-permission"
import { appToast } from "~/lib/toast"
import { useUsersStore } from "~/stores/users.store"

type UserRowActionsProps = {
  user: User
}

export function UserRowActions({ user }: UserRowActionsProps) {
  const updateUser = useUsersStore((state) => state.updateUser)
  const toggleActive = useUsersStore((state) => state.toggleActive)
  const canUpdate = usePermission("user_profiles", "update")
  const [editOpen, setEditOpen] = React.useState(false)

  const setActive = async (active: boolean) => {
    await toggleActive(user.id, active)
    appToast.success(active ? "Cuenta activada" : "Cuenta desactivada", {
      description: user.fullName ?? undefined,
    })
  }

  const isActive = user.status === "active"

  return (
    <>
      <RowActionsMenu
        actions={[
          {
            key: "edit",
            label: "Editar usuario",
            icon: Pencil,
            tone: "edit",
            hidden: !canUpdate,
            onSelect: () => setEditOpen(true),
          },
          {
            key: "role",
            label: "Cambiar rol",
            icon: ShieldCheck,
            tone: "neutral",
            hidden: !canUpdate,
            onSelect: () => setEditOpen(true),
          },
          {
            key: "toggle",
            label: isActive ? "Desactivar" : "Activar cuenta",
            icon: isActive ? CircleMinus : CircleCheck,
            tone: isActive ? "deactivate" : "activate",
            hidden: !canUpdate,
            onSelect: () => void setActive(!isActive),
          },
          {
            key: "copy",
            label: "Copiar ID",
            icon: Copy,
            tone: "neutral",
            onSelect: () => {
              void navigator.clipboard.writeText(user.id)
              appToast.success("ID copiado")
            },
          },
        ]}
      />

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

"use client"

import * as React from "react"

import { UserEditDialog } from "~/components/users/user-edit-dialog"
import { Button } from "~/components/ui/button"
import type { User } from "~/domain/users/users.types"
import { appToast } from "~/lib/toast"
import { cn } from "~/lib/utils"
import { useUsersStore } from "~/stores/users.store"

type UserNameEditLinkProps = {
  user: User
  className?: string
}

export function UserNameEditLink({ user, className }: UserNameEditLinkProps) {
  const updateUser = useUsersStore((state) => state.updateUser)
  const [open, setOpen] = React.useState(false)
  const displayName = user.fullName?.trim() || "—"

  return (
    <>
      <Button
        type="button"
        variant="link"
        className={cn(
          "h-auto p-0 text-left font-normal text-foreground",
          className,
        )}
        onClick={() => setOpen(true)}
      >
        {displayName}
      </Button>

      <UserEditDialog
        user={user}
        open={open}
        onOpenChange={setOpen}
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

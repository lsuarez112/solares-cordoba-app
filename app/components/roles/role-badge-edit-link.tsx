"use client"

import * as React from "react"

import { RoleBadge } from "~/components/roles/role-badge"
import { RoleEditDialog } from "~/components/roles/role-edit-dialog"
import { Button } from "~/components/ui/button"
import type { RoleListItem } from "~/domain/roles/roles.types"
import { appToast } from "~/lib/toast"
import { cn } from "~/lib/utils"
import { useRolesStore } from "~/stores/roles.store"

type RoleBadgeEditLinkProps = {
  role: RoleListItem
  className?: string
}

export function RoleBadgeEditLink({ role, className }: RoleBadgeEditLinkProps) {
  const updateRole = useRolesStore((s) => s.updateRole)
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <Button
        type="button"
        variant="link"
        className={cn(
          "inline h-auto min-h-0 p-0 font-normal text-inherit no-underline hover:underline",
          "[&_[data-slot=badge]]:pointer-events-none",
          className,
        )}
        onClick={() => setOpen(true)}
      >
        <RoleBadge
          name={role.name}
          metadata={role.metadata}
          muted={!role.active}
        />
      </Button>

      <RoleEditDialog
        role={role}
        open={open}
        onOpenChange={setOpen}
        onSave={async (values) => {
          const ok = await updateRole(role.id, values)
          if (ok) {
            appToast.success("Rol actualizado", {
              description: `Los cambios en "${values.name.trim()}" se guardaron correctamente.`,
            })
            return true
          }

          appToast.error("No se pudo actualizar el rol", {
            description:
              "La base de datos no aplicó cambios. Suele deberse a permisos (RLS) en la tabla roles de Supabase.",
          })
          return false
        }}
      />
    </>
  )
}

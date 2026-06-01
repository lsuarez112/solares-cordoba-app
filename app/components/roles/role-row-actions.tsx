"use client"

import * as React from "react"
import { MoreHorizontal } from "lucide-react"

import { RoleEditDialog } from "~/components/roles/role-edit-dialog"
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
import { appToast } from "~/lib/toast"
import { useRolesStore } from "~/stores/roles.store"

type RoleRowActionsProps = {
  role: RoleListItem
}

export function RoleRowActions({ role }: RoleRowActionsProps) {
  const updateRole = useRolesStore((s) => s.updateRole)
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
              onClick={() => navigator.clipboard.writeText(role.id)}
            >
              Copiar ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault()
                setEditOpen(true)
              }}
            >
              Editar rol
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <RoleEditDialog
        role={role}
        open={editOpen}
        onOpenChange={setEditOpen}
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

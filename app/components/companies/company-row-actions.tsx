"use client"

import { MoreHorizontal, Pencil, Users } from "lucide-react"

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
import type { Company } from "~/domain/companies/companies.schemas"
import { usePermission } from "~/hooks/use-permission"

type CompanyRowActionsProps = {
  company: Company
  canUpdate?: boolean
  onOpenEdit?: (company: Company) => void
  onOpenUsers?: (company: Company) => void
}

export function CompanyRowActions({
  company,
  canUpdate = false,
  onOpenEdit,
  onOpenUsers,
}: CompanyRowActionsProps) {
  const canManageUsers = usePermission("companies", "update")

  const hasManagementActions = canUpdate || canManageUsers

  if (!hasManagementActions) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <span className="sr-only">Abrir menú</span>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56 w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(company.id)}
          >
            Copiar ID
          </DropdownMenuItem>
        </DropdownMenuGroup>

        {canUpdate && onOpenEdit ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault()
                  onOpenEdit(company)
                }}
              >
                <Pencil data-icon="inline-start" />
                Editar empresa
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        ) : null}

        {canManageUsers && onOpenUsers ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault()
                  onOpenUsers(company)
                }}
              >
                <Users data-icon="inline-start" />
                Gestionar usuarios
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

"use client"

import * as React from "react"

import { RoleBadge } from "~/components/roles/role-badge"
import { UserFormField } from "~/components/users/user-form-field"
import { UserNotificationsBadge } from "~/components/users/user-notifications-badge"
import { UserStatusBadge } from "~/components/users/user-status-badge"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogScrollableContent,
} from "~/components/ui/dialog"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Switch } from "~/components/ui/switch"
import type { User, UserEditFormValues } from "~/domain/users/users.types"
import { USER_HOME_PAGE_OPTIONS } from "~/lib/users/user-home-pages.config"
import { previewUserStatus } from "~/lib/users/user-status.utils"
import { usePermissionsStore } from "~/stores/permissions.store"

type UserEditDialogProps = {
  user: User
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (values: UserEditFormValues) => Promise<boolean | void>
}

export function UserEditDialog({
  user,
  open,
  onOpenChange,
  onSave,
}: UserEditDialogProps) {
  const permissionRoles = usePermissionsStore((state) => state.roles)
  const assignableRoles = React.useMemo(
    () => permissionRoles.filter((role) => role.active),
    [permissionRoles],
  )

  const [fullName, setFullName] = React.useState(user.fullName ?? "")
  const [phone, setPhone] = React.useState(user.phone ?? "")
  const [active, setActive] = React.useState(user.active)
  const [roleId, setRoleId] = React.useState(user.roleId)
  const [homePage, setHomePage] = React.useState(user.homePage)
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(
    user.notificationsEnabled,
  )
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const [pending, setPending] = React.useState(false)

  const selectedRole = React.useMemo(
    () => permissionRoles.find((role) => role.id === roleId),
    [permissionRoles, roleId],
  )

  const previewStatus = React.useMemo(
    () => previewUserStatus(active, user),
    [active, user],
  )

  React.useEffect(() => {
    if (!open) return
    setFullName(user.fullName ?? "")
    setPhone(user.phone ?? "")
    setActive(user.active)
    setRoleId(user.roleId)
    setHomePage(user.homePage)
    setNotificationsEnabled(user.notificationsEnabled)
    setSubmitError(null)
  }, [open, user])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitError(null)

    if (!roleId) {
      setSubmitError("Seleccioná un rol para el usuario.")
      return
    }

    setPending(true)
    const ok = await onSave?.({
      fullName,
      phone,
      active,
      roleId,
      homePage,
      notificationsEnabled,
    })
    setPending(false)

    if (ok !== false) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(92vh,720px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-4 py-3">
          <DialogTitle className="text-base">Editar usuario</DialogTitle>
          <DialogDescription className="text-xs">
            Configurá el perfil, rol y preferencias de{" "}
            <span className="font-medium text-foreground">
              {user.fullName ?? "este usuario"}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <DialogScrollableContent fill className="space-y-3 !py-3">
            <section className="space-y-2">
              <h3 className="text-xs font-semibold">Información general</h3>

              <div className="grid gap-2 sm:grid-cols-2">
                <UserFormField label="Nombre completo" htmlFor={`${user.id}-fullName`}>
                  <Input
                    id={`${user.id}-fullName`}
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Nombre y apellido"
                    maxLength={200}
                  />
                </UserFormField>

                <UserFormField label="Teléfono" htmlFor={`${user.id}-phone`}>
                  <Input
                    id={`${user.id}-phone`}
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="+54 351 000 0000"
                    maxLength={20}
                  />
                </UserFormField>
              </div>

              <FieldGroup className="gap-3">
                <FieldLabel htmlFor={`${user.id}-active`}>
                  <Field orientation="horizontal">
                    <FieldContent>
                      <div className="flex flex-wrap items-center gap-2">
                        <FieldTitle>Cuenta activa</FieldTitle>
                        <UserStatusBadge status={previewStatus} />
                      </div>
                      <FieldDescription>
                        Permite o bloquea el acceso del usuario al sistema.
                      </FieldDescription>
                    </FieldContent>
                    <Switch
                      id={`${user.id}-active`}
                      checked={active}
                      onCheckedChange={setActive}
                    />
                  </Field>
                </FieldLabel>
              </FieldGroup>
            </section>

            <section className="space-y-2">
              <h3 className="text-xs font-semibold">Rol y acceso</h3>

              <div className="grid gap-2 sm:grid-cols-2">
                <UserFormField label="Rol" htmlFor={`${user.id}-role`}>
                  <Select value={roleId} onValueChange={setRoleId}>
                    <SelectTrigger id={`${user.id}-role`} className="w-full">
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {assignableRoles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </UserFormField>

                <UserFormField label="Página de inicio" htmlFor={`${user.id}-home-page`}>
                  <Select value={homePage} onValueChange={setHomePage}>
                    <SelectTrigger id={`${user.id}-home-page`} className="w-full">
                      <SelectValue placeholder="Ruta inicial" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {USER_HOME_PAGE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </UserFormField>

                <div className="flex min-h-8 items-center sm:col-span-2">
                  {selectedRole ? (
                    <RoleBadge
                      name={selectedRole.name}
                      metadata={selectedRole.metadata}
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Seleccioná un rol para ver el badge.
                    </span>
                  )}
                </div>
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-xs font-semibold">Preferencias</h3>

              <FieldGroup className="gap-3">
                <FieldLabel htmlFor={`${user.id}-notifications`}>
                  <Field orientation="horizontal">
                    <FieldContent>
                      <div className="flex flex-wrap items-center gap-2">
                        <FieldTitle>Notificaciones</FieldTitle>
                        <UserNotificationsBadge enabled={notificationsEnabled} />
                      </div>
                      <FieldDescription>
                        Define si el usuario recibe alertas y avisos del sistema.
                      </FieldDescription>
                    </FieldContent>
                    <Switch
                      id={`${user.id}-notifications`}
                      checked={notificationsEnabled}
                      onCheckedChange={setNotificationsEnabled}
                    />
                  </Field>
                </FieldLabel>
              </FieldGroup>
            </section>

            {submitError ? (
              <p className="text-xs text-destructive" role="alert">
                {submitError}
              </p>
            ) : null}
          </DialogScrollableContent>

          <DialogFooter className="border-t bg-background px-4 py-3">
            <DialogClose asChild>
              <Button type="button" variant="outline" size="sm" disabled={pending}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "Guardando…" : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

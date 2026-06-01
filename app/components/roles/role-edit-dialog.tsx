"use client"

import * as React from "react"

import { RoleBadge } from "~/components/roles/role-badge"
import { RolePermissionsEditor } from "~/components/roles/role-permissions-editor"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Textarea } from "~/components/ui/textarea"
import {
  RoleMetadataSchema,
  type RoleMetadata,
  type RoleIconKey,
} from "~/domain/roles/role-metadata.schema"
import type { RoleEditFormValues, RoleListItem } from "~/domain/roles/roles.types"
import {
  getBadgeColorPresetOrDefault,
  ROLE_BADGE_COLOR_PRESETS,
  type RoleBadgeColorPreset,
} from "~/lib/roles/role-badge-presets"
import { ROLE_ICON_OPTIONS, getRoleIcon } from "~/lib/roles/role-icons"
import {
  editorStateToPermissions,
  permissionsToEditorState,
  type PermissionsEditorState,
} from "~/lib/roles/role-permissions.utils"

type RoleEditDialogProps = {
  role: RoleListItem
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (values: RoleEditFormValues) => Promise<boolean | void>
}

const ICON_NONE_VALUE = "none"

function RoleFormField({
  label,
  htmlFor,
  children,
  className,
}: {
  label: string
  htmlFor?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className ?? "flex flex-col gap-1"}>
      <label htmlFor={htmlFor} className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  )
}

function buildMetadata(values: {
  colorPreset: RoleBadgeColorPreset
  icon: RoleIconKey | ""
  displayOrder: string
}): RoleMetadata {
  const metadata: RoleMetadata = {
    badge_color: values.colorPreset.badge_color,
    badge_text_color: values.colorPreset.badge_text_color,
  }

  if (values.icon) {
    metadata.icon = values.icon
  }

  if (values.displayOrder.trim()) {
    const parsedOrder = Number.parseInt(values.displayOrder, 10)
    if (!Number.isNaN(parsedOrder)) {
      metadata.display_order = parsedOrder
    }
  }

  const validated = RoleMetadataSchema.safeParse(metadata)
  if (!validated.success) {
    throw new Error("Invalid metadata")
  }

  return validated.data
}

export function RoleEditDialog({
  role,
  open,
  onOpenChange,
  onSave,
}: RoleEditDialogProps) {
  const [name, setName] = React.useState(role.name)
  const [description, setDescription] = React.useState(role.description ?? "")
  const [active, setActive] = React.useState(role.active)
  const [colorPresetId, setColorPresetId] = React.useState(
    getBadgeColorPresetOrDefault(
      role.metadata.badge_color,
      role.metadata.badge_text_color,
    ).id,
  )
  const [icon, setIcon] = React.useState<RoleIconKey | "">(
    (role.metadata.icon as RoleIconKey | undefined) ?? "",
  )
  const [displayOrder, setDisplayOrder] = React.useState(
    role.metadata.display_order?.toString() ?? "",
  )
  const [permissions, setPermissions] = React.useState<PermissionsEditorState>(
    permissionsToEditorState(role.permissions),
  )
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const [pending, setPending] = React.useState(false)

  const selectedColorPreset = React.useMemo(
    () =>
      ROLE_BADGE_COLOR_PRESETS.find((preset) => preset.id === colorPresetId) ??
      ROLE_BADGE_COLOR_PRESETS[0],
    [colorPresetId],
  )

  const previewMetadata = React.useMemo(
    () =>
      buildMetadata({
        colorPreset: selectedColorPreset,
        icon,
        displayOrder,
      }),
    [displayOrder, icon, selectedColorPreset],
  )

  React.useEffect(() => {
    if (!open) return
    setName(role.name)
    setDescription(role.description ?? "")
    setActive(role.active)
    setColorPresetId(
      getBadgeColorPresetOrDefault(
        role.metadata.badge_color,
        role.metadata.badge_text_color,
      ).id,
    )
    setIcon((role.metadata.icon as RoleIconKey | undefined) ?? "")
    setDisplayOrder(role.metadata.display_order?.toString() ?? "")
    setPermissions(permissionsToEditorState(role.permissions))
    setSubmitError(null)
  }, [open, role])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitError(null)

    let metadata: RoleMetadata
    try {
      metadata = buildMetadata({
        colorPreset: selectedColorPreset,
        icon,
        displayOrder,
      })
    } catch {
      setSubmitError("Revisá la configuración visual del rol.")
      return
    }

    setPending(true)
    const ok = await onSave?.({
      name,
      description,
      active,
      permissions: editorStateToPermissions(permissions),
      metadata,
    })
    setPending(false)

    if (ok !== false) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(92vh,820px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-4 py-3">
          <DialogTitle className="text-base">Editar rol</DialogTitle>
          <DialogDescription className="text-xs">
            Configurá la información, apariencia y permisos del rol{" "}
            <span className="font-medium text-foreground">{role.name}</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            <section className="space-y-2">
              <h3 className="text-xs font-semibold">Información general</h3>

              <div className="grid gap-2 sm:grid-cols-2">
                <RoleFormField label="Nombre" htmlFor={`${role.id}-name`}>
                  <Input
                    id={`${role.id}-name`}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Nombre del rol"
                    maxLength={50}
                    required
                  />
                </RoleFormField>

                <RoleFormField label="Orden" htmlFor={`${role.id}-display-order`}>
                  <Input
                    id={`${role.id}-display-order`}
                    type="number"
                    min={0}
                    value={displayOrder}
                    onChange={(event) => setDisplayOrder(event.target.value)}
                    placeholder="1"
                  />
                </RoleFormField>

                <RoleFormField label="Estado" htmlFor={`${role.id}-active`}>
                  <Select
                    value={active ? "active" : "inactive"}
                    onValueChange={(value) => setActive(value === "active")}
                  >
                    <SelectTrigger id={`${role.id}-active`} className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="active">Activo</SelectItem>
                        <SelectItem value="inactive">Inactivo</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </RoleFormField>

                <RoleFormField
                  label="Descripción"
                  htmlFor={`${role.id}-description`}
                  className="flex flex-col gap-1 sm:col-span-2"
                >
                  <Textarea
                    id={`${role.id}-description`}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Descripción opcional"
                    rows={2}
                    className="min-h-14"
                  />
                </RoleFormField>
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-xs font-semibold">Apariencia</h3>

              <div className="flex flex-wrap items-end gap-2">
                <div className="flex min-w-28 flex-1 items-center justify-center rounded-lg border border-dashed bg-muted/20 px-3 py-2">
                  <RoleBadge
                    name={name || role.name}
                    metadata={previewMetadata}
                  />
                </div>

                <RoleFormField label="Color" className="min-w-36 flex-1">
                  <Select value={colorPresetId} onValueChange={setColorPresetId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {ROLE_BADGE_COLOR_PRESETS.map((preset) => (
                          <SelectItem key={preset.id} value={preset.id}>
                            <span className="flex items-center gap-2">
                              <span
                                className="size-3 shrink-0 rounded-full border border-black/10"
                                style={{ backgroundColor: preset.badge_color }}
                              />
                              {preset.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </RoleFormField>

                <RoleFormField label="Icono" className="min-w-36 flex-1">
                  <Select
                    value={icon || ICON_NONE_VALUE}
                    onValueChange={(value) =>
                      setIcon(value === ICON_NONE_VALUE ? "" : (value as RoleIconKey))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Icono" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value={ICON_NONE_VALUE}>Sin icono</SelectItem>
                        {ROLE_ICON_OPTIONS.map((option) => {
                          const Icon = getRoleIcon(option.value)
                          return (
                            <SelectItem key={option.value} value={option.value}>
                              <span className="flex items-center gap-2">
                                <Icon className="size-3.5" />
                                {option.label}
                              </span>
                            </SelectItem>
                          )
                        })}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </RoleFormField>
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-xs font-semibold">Permisos por módulo</h3>
              <RolePermissionsEditor
                value={permissions}
                onChange={setPermissions}
              />
            </section>

            {submitError ? (
              <p className="text-xs text-destructive" role="alert">
                {submitError}
              </p>
            ) : null}
          </div>

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

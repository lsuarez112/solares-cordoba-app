"use client"

import * as React from "react"
import { Save } from "lucide-react"

import { RoleBadge } from "~/components/roles/role-badge"
import { RolePermissionsEditor } from "~/components/roles/role-permissions-editor"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form"
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
import type { RoleIconKey } from "~/domain/roles/role-metadata.schema"
import { useRoleForm } from "~/hooks/use-role-form"
import {
  ROLE_BADGE_COLOR_PRESETS,
  type RoleBadgeColorPreset,
} from "~/lib/roles/role-badge-presets"
import { getRoleFormPreviewMetadata } from "~/lib/roles/role-form.utils"
import { ROLE_ICON_OPTIONS, getRoleIcon } from "~/lib/roles/role-icons"
import { useRolesStore } from "~/stores/roles.store"

const ICON_NONE_VALUE = "none"

export function RoleFormModal() {
  const modalOpen = useRolesStore((s) => s.modalOpen)
  const editingRole = useRolesStore((s) => s.editingRole)
  const closeModal = useRolesStore((s) => s.closeModal)

  const { form, isSubmitting, submitError, isEditing, onSubmit } = useRoleForm({
    role: editingRole,
    open: modalOpen,
    onSuccess: closeModal,
  })

  const watchedName = form.watch("name")
  const watchedValues = form.watch()

  const previewMetadata = React.useMemo(
    () => getRoleFormPreviewMetadata(watchedValues),
    [watchedValues],
  )

  return (
    <Dialog
      open={modalOpen}
      onOpenChange={(next) => {
        if (!next) closeModal()
      }}
    >
      <DialogContent className="flex max-h-[min(92vh,820px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-4 py-3">
          <DialogTitle className="text-base">
            {isEditing ? "Editar rol" : "Nuevo rol"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {isEditing ? (
              <>
                Configurá la información, apariencia y permisos del rol{" "}
                <span className="font-medium text-foreground">
                  {editingRole?.name}
                </span>
                .
              </>
            ) : (
              "Definí el nombre, apariencia y permisos del nuevo rol."
            )}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
              <section className="space-y-2">
                <h3 className="text-xs font-semibold">Información general</h3>

                <div className="grid gap-2 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nombre del rol"
                            maxLength={50}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="displayOrder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Orden</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            placeholder="1"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select
                          value={field.value ? "active" : "inactive"}
                          onValueChange={(value) =>
                            field.onChange(value === "active")
                          }
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="active">Activo</SelectItem>
                              <SelectItem value="inactive">Inactivo</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descripción opcional"
                            rows={2}
                            className="min-h-14"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-xs font-semibold">Apariencia</h3>

                <div className="flex flex-wrap items-end gap-2">
                  <div className="flex min-w-28 flex-1 items-center justify-center rounded-lg border border-dashed bg-muted/20 px-3 py-2">
                    <RoleBadge
                      name={watchedName || "Nuevo rol"}
                      metadata={previewMetadata}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="colorPresetId"
                    render={({ field }) => (
                      <FormItem className="min-w-36 flex-1">
                        <FormLabel>Color</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Color" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              {ROLE_BADGE_COLOR_PRESETS.map(
                                (preset: RoleBadgeColorPreset) => (
                                  <SelectItem key={preset.id} value={preset.id}>
                                    <span className="flex items-center gap-2">
                                      <span
                                        className="size-3 shrink-0 rounded-full border border-black/10"
                                        style={{
                                          backgroundColor: preset.badge_color,
                                        }}
                                      />
                                      {preset.label}
                                    </span>
                                  </SelectItem>
                                ),
                              )}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="icon"
                    render={({ field }) => (
                      <FormItem className="min-w-36 flex-1">
                        <FormLabel>Icono</FormLabel>
                        <Select
                          value={field.value || ICON_NONE_VALUE}
                          onValueChange={(value) =>
                            field.onChange(
                              value === ICON_NONE_VALUE
                                ? ""
                                : (value as RoleIconKey),
                            )
                          }
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Icono" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value={ICON_NONE_VALUE}>
                                Sin icono
                              </SelectItem>
                              {ROLE_ICON_OPTIONS.map((option) => {
                                const Icon = getRoleIcon(option.value)
                                return (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-xs font-semibold">Permisos por módulo</h3>
                <FormField
                  control={form.control}
                  name="permissions"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RolePermissionsEditor
                          value={field.value ?? {}}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>

              {submitError ? (
                <p className="text-xs text-destructive" role="alert">
                  {submitError}
                </p>
              ) : null}
            </div>

            <DialogFooter className="border-t bg-background px-4 py-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSubmitting}
                onClick={closeModal}
              >
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting}>
                <Save data-icon="inline-start" />
                {isSubmitting
                  ? "Guardando…"
                  : isEditing
                    ? "Guardar cambios"
                    : "Crear rol"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

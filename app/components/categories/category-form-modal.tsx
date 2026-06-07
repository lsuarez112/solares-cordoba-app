"use client"

import { Save } from "lucide-react"

import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
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
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Textarea } from "~/components/ui/textarea"
import { useCategoryForm } from "~/hooks/use-category-form"
import {
  CATEGORY_ICON_GROUPS,
  getCategoryIcon,
  getCategoryIconLabel,
} from "~/lib/categories/category-icons"
import { slugifyCategoryName } from "~/lib/categories/category-form.utils"
import { useCategoriesStore } from "~/stores/categories.store"

export function CategoryFormModal() {
  const modalOpen = useCategoriesStore((s) => s.modalOpen)
  const editingCategory = useCategoriesStore((s) => s.editingCategory)
  const closeModal = useCategoriesStore((s) => s.closeModal)

  const { form, isSubmitting, submitError, isEditing, onSubmit } =
    useCategoryForm({
      category: editingCategory,
      open: modalOpen,
      onSuccess: closeModal,
    })

  return (
    <Dialog
      open={modalOpen}
      onOpenChange={(next) => {
        if (!next) closeModal()
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[min(92vh,720px)] max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
      >
        <DialogHeader className="shrink-0 border-b px-4 py-3">
          <DialogTitle>
            {isEditing ? "Editar categoría" : "Nueva categoría"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Paneles solares"
                        {...field}
                        onChange={(event) => {
                          field.onChange(event)
                          const currentSlug = form.getValues("slug")
                          if (!currentSlug?.trim()) {
                            form.setValue(
                              "slug",
                              slugifyCategoryName(event.target.value),
                              { shouldValidate: true },
                            )
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="prefix"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prefijo</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej: PAN"
                          className="font-mono uppercase"
                          maxLength={10}
                          {...field}
                          value={field.value ?? ""}
                          onChange={(event) => {
                            const value = event.target.value.toUpperCase()
                            field.onChange(value === "" ? null : value)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="paneles-solares"
                          className="font-mono text-sm"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => {
                  const SelectedIcon = getCategoryIcon(field.value)

                  return (
                    <FormItem>
                      <FormLabel>Icono</FormLabel>
                      <Select
                        value={field.value ?? "package"}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seleccionar icono">
                              <span className="flex items-center gap-2">
                                <SelectedIcon className="size-4" />
                                {getCategoryIconLabel(field.value)}
                              </span>
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CATEGORY_ICON_GROUPS.map((group) => (
                            <SelectGroup key={group.label}>
                              <SelectLabel>{group.label}</SelectLabel>
                              {group.items.map((option) => {
                                const Icon = getCategoryIcon(option.value)
                                return (
                                  <SelectItem key={option.value} value={option.value}>
                                    <Icon className="size-4" />
                                    {option.label}
                                  </SelectItem>
                                )
                              })}
                            </SelectGroup>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descripción breve de la categoría..."
                        className="resize-none"
                        rows={3}
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {submitError ? (
                <p className="text-sm text-destructive">{submitError}</p>
              ) : null}
            </div>

            <DialogFooter className="shrink-0 border-t px-4 py-3">
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Save data-icon="inline-start" />
                {isSubmitting
                  ? "Guardando..."
                  : isEditing
                    ? "Guardar cambios"
                    : "Crear categoría"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

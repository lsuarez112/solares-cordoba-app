"use client"

import { useFieldArray } from "react-hook-form"
import {
  CircleDollarSign,
  ListTree,
  Package,
  Save,
  Trash2,
} from "lucide-react"

import { ProductDeleteAlertDialog } from "~/components/products/product-delete-alert-dialog"
import { useProductActions } from "~/hooks/use-product-actions"
import { useProductForm } from "~/hooks/use-product-form"
import { formatPrefixLabel } from "~/lib/prefix-label.utils"
import { useProductsStore } from "~/stores/products.store"
import type { Product } from "~/domain/products/products.schemas"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { Button } from "~/components/ui/button"
import { ScrollArea } from "~/components/ui/scroll-area"
import { Switch } from "~/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"

interface ProductFormModalProps {
  open: boolean
  onClose: () => void
  product?: Product
  duplicateFrom?: Product
  presetCategoryId?: string | null
}

export function ProductFormModal({
  open,
  onClose,
  product,
  duplicateFrom,
  presetCategoryId,
}: ProductFormModalProps) {
  const categories = useProductsStore((s) => s.categories)

  const { form, isSubmitting, submitError, isEditing, isDuplicating, onSubmit } =
    useProductForm({
      product,
      duplicateFrom,
      presetCategoryId,
      open,
      onSuccess: onClose,
    })

  const deleteActions = useProductActions({
    product,
    onClose,
  })

  const props = useFieldArray({
    control: form.control,
    name: "generic_properties",
  })


  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[min(92vh,720px)] max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl"
      >
        <DialogHeader className="shrink-0 border-b px-4 py-3">
          <DialogTitle>
            {isEditing
              ? "Editar producto"
              : isDuplicating
                ? "Duplicar producto"
                : "Agregar producto"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="flex min-h-0 flex-1 flex-col"
          >
            <Tabs
              defaultValue="general"
              className="flex min-h-0 flex-1 flex-col px-4 pt-4 pb-4"
            >
              <TabsList className="w-full shrink-0">
                <TabsTrigger value="general" className="flex-1">
                  <Package data-icon="inline-start" />
                  General
                </TabsTrigger>
                <TabsTrigger value="precios" className="flex-1">
                  <CircleDollarSign data-icon="inline-start" />
                  Precio
                </TabsTrigger>
                <TabsTrigger value="detalles" className="flex-1">
                  <ListTree data-icon="inline-start" />
                  Detalles
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="general"
                className="flex min-h-0 flex-1 flex-col"
              >
                <ScrollArea className="min-h-0 flex-1" viewportClassName="[&>div]:!block">
                <div className="flex flex-col gap-4 pt-2 pr-3">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="product_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ej: 037046"
                              className="font-mono uppercase"
                              maxLength={20}
                              {...field}
                              onChange={(event) =>
                                field.onChange(event.target.value.toUpperCase())
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nombre del producto"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="short_desc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción corta</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Máximo 300 caracteres"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción larga</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descripción detallada del producto"
                            rows={4}
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoría</FormLabel>
                          <Select
                            value={field.value ?? "none"}
                            onValueChange={(value) =>
                              field.onChange(value === "none" ? null : value)
                            }
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Sin categoría" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value="none">Sin categoría</SelectItem>
                                {categories.map((category) => (
                                  <SelectItem key={category.id} value={category.id}>
                                    {formatPrefixLabel(
                                      category.name,
                                      category.prefix,
                                    )}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="grid_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de red</FormLabel>
                          <Select
                            value={field.value ?? "none"}
                            onValueChange={(v) =>
                              field.onChange(v === "none" ? null : v)
                            }
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sin tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value="none">Sin tipo</SelectItem>
                                <SelectItem value="ON-GRID">On Grid</SelectItem>
                                <SelectItem value="OFF-GRID">
                                  Off Grid
                                </SelectItem>
                                <SelectItem value="HYBRID">Híbrido</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent
                value="precios"
                className="flex min-h-0 flex-1 flex-col"
              >
                <ScrollArea className="min-h-0 flex-1" viewportClassName="[&>div]:!block">
                <div className="flex flex-col gap-4 pt-2 pr-3">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price_usd"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Precio de venta USD *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              name={field.name}
                              ref={field.ref}
                              onBlur={field.onBlur}
                              value={field.value}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ""
                                    ? 0
                                    : Number(e.target.value),
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>


                  <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="flex flex-col gap-1">
                          <FormLabel>Producto activo</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Los productos inactivos no aparecen en el catálogo
                            ni en presupuestos
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent
                value="detalles"
                className="flex min-h-0 flex-1 flex-col"
              >
                <ScrollArea className="min-h-0 flex-1" viewportClassName="[&>div]:!block">
                <div className="flex flex-col gap-4 pt-2 pr-3">

                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <FormLabel>Propiedades técnicas</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => props.append({ key: "", value: "" })}
                      >
                        <ListTree data-icon="inline-start" />
                        Agregar propiedad
                      </Button>
                    </div>
                    {props.fields.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No hay propiedades cargadas para este producto
                      </p>
                    ) : null}
                    {props.fields.map((field, index) => (
                      <div key={field.id} className="flex items-start gap-2">
                        <FormField
                          control={form.control}
                          name={`generic_properties.${index}.key`}
                          render={({ field: propField }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input
                                  placeholder="Clave (ej: Potencia)"
                                  {...propField}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`generic_properties.${index}.value`}
                          render={({ field: propField }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input
                                  placeholder="Valor (ej: 400W)"
                                  {...propField}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Eliminar propiedad"
                          onClick={() => props.remove(index)}
                        >
                          <Trash2 data-icon="inline-start" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>

            {submitError ? (
              <p className="px-4 text-sm text-destructive">{submitError}</p>
            ) : null}

            <DialogFooter className="shrink-0 flex flex-col gap-2 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              {isEditing && deleteActions.canDelete ? (
                <Button
                  type="button"
                  variant="outline"
                  className="order-3 w-full text-destructive sm:order-1 sm:w-auto"
                  onClick={deleteActions.openDeleteDialog}
                >
                  <Trash2 data-icon="inline-start" />
                  Eliminar
                </Button>
              ) : (
                <div className="order-3 hidden sm:order-1 sm:block sm:flex-1" />
              )}

              <div className="flex flex-col gap-2 order-1 w-full sm:order-2 sm:ml-auto sm:w-auto sm:flex-row sm:justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="order-1 w-full sm:order-2 sm:w-auto"
                >
                  <Save data-icon="inline-start" />
                  {isSubmitting
                    ? "Guardando..."
                    : isEditing
                      ? "Guardar cambios"
                      : "Guardar producto"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="order-2 w-full sm:order-1 sm:w-auto"
                >
                  Descartar
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>

      {isEditing && product && deleteActions.canDelete ? (
        <ProductDeleteAlertDialog
          product={product}
          open={deleteActions.deleteDialogOpen}
          onOpenChange={deleteActions.setDeleteDialogOpen}
          isDeleting={deleteActions.isDeleting}
          onConfirm={deleteActions.handleDeleteConfirm}
          onDeactivate={deleteActions.handleToggleActive}
        />
      ) : null}
    </Dialog>
  )
}

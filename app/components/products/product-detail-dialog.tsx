"use client"

import {
  CheckCircle2,
  CircleX,
  ClipboardCopy,
  Copy,
  FileText,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  PowerOff,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react"

import { ProductDeleteAlertDialog } from "~/components/products/product-delete-alert-dialog"
import { ProductTechnicalPropertyBadges } from "~/components/products/product-technical-property-badges"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import type { Product } from "~/domain/products/products.schemas"
import { useProductActions } from "~/hooks/use-product-actions"
import { GRID_TYPE_LABELS } from "~/lib/products/grid-type.utils"
import {
  displayTextField,
  emptyFieldLabel,
  parseProductGenericProperties,
} from "~/lib/products/product-display.utils"
import { hasNoPrice } from "~/lib/products/product-list.utils"

type ProductDetailDialogProps = {
  product: Product
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenEdit?: () => void
  onDuplicate?: () => void
}

export function ProductDetailDialog({
  product,
  open,
  onOpenChange,
  onOpenEdit,
  onDuplicate,
}: ProductDetailDialogProps) {
  const actions = useProductActions({
    product,
    onClose: () => onOpenChange(false),
    onOpenEdit,
    onDuplicate,
  })

  const properties = parseProductGenericProperties(product.generic_properties)

  const handleClose = () => onOpenChange(false)

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="flex max-h-[min(92vh,720px)] max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
        >
          <DialogHeader className="flex shrink-0 flex-row items-start justify-between gap-3 border-b px-4 py-3">
            <div className="flex min-w-0 flex-col gap-1">
              <DialogTitle className="text-base">{product.name}</DialogTitle>
              <DialogDescription className="font-mono text-xs">
                Código: {product.product_code}
              </DialogDescription>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              {actions.hasAnyAction ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Acciones del producto"
                    >
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-56">
                    {actions.canEdit || actions.canDuplicate ? (
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Producto</DropdownMenuLabel>
                        {actions.canEdit ? (
                          <DropdownMenuItem onSelect={actions.handleEdit}>
                            <Pencil data-icon="inline-start" />
                            Editar
                          </DropdownMenuItem>
                        ) : null}
                        {actions.canDuplicate ? (
                          <DropdownMenuItem onSelect={actions.handleDuplicate}>
                            <Copy data-icon="inline-start" />
                            Duplicar
                          </DropdownMenuItem>
                        ) : null}
                      </DropdownMenuGroup>
                    ) : null}

                    {actions.canRead ? (
                      <>
                        {actions.canEdit || actions.canDuplicate ? (
                          <DropdownMenuSeparator />
                        ) : null}
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Compartir</DropdownMenuLabel>
                          <DropdownMenuItem
                            onSelect={actions.handleCopySpecs}
                          >
                            <ClipboardCopy data-icon="inline-start" />
                            Copiar especificaciones
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={actions.handleWhatsApp}>
                            <MessageCircle data-icon="inline-start" />
                            Compartir por WhatsApp
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </>
                    ) : null}


                    {actions.canToggleActive || actions.canDelete ? (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Administración</DropdownMenuLabel>
                          {actions.canToggleActive ? (
                            <DropdownMenuItem
                              disabled={actions.isTogglingActive}
                              onSelect={() => void actions.handleToggleActive()}
                            >
                              <PowerOff data-icon="inline-start" />
                              {product.active ? "Desactivar" : "Reactivar"}
                            </DropdownMenuItem>
                          ) : null}
                          {actions.canDelete ? (
                            <DropdownMenuItem
                              variant="destructive"
                              onSelect={actions.openDeleteDialog}
                            >
                              <Trash2 data-icon="inline-start" />
                              Eliminar
                            </DropdownMenuItem>
                          ) : null}
                        </DropdownMenuGroup>
                      </>
                    ) : null}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}

              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Cerrar"
                onClick={handleClose}
              >
                <X />
              </Button>
            </div>
          </DialogHeader>

          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 text-sm">
            <div className="flex flex-wrap gap-2">
              {product.active ? (
                <Badge
                  variant="secondary"
                  className="border-green-200 bg-green-100 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300"
                >
                  <CheckCircle2 data-icon="inline-start" className="text-green-600" />
                  Activo
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="border-muted-foreground/20 bg-muted text-muted-foreground"
                >
                  <CircleX data-icon="inline-start" />
                  Inactivo
                </Badge>
              )}
              {hasNoPrice(product) ? (
                <Badge
                  variant="secondary"
                  className="border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300"
                >
                  <TriangleAlert data-icon="inline-start" className="text-amber-600" />
                  Sin precio
                </Badge>
              ) : null}
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Descripción corta
              </p>
              <p className="text-muted-foreground">
                {displayTextField(product.short_desc, "descripción corta")}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Descripción
              </p>
              <p className="text-muted-foreground">
                {displayTextField(product.description, "descripción")}
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-3">
              <div>
                <dt className="text-xs text-muted-foreground">Código</dt>
                <dd className="font-mono">{product.product_code}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Categoría</dt>
                <dd>
                  {product.category?.name?.trim() ? (
                    <span className="inline-flex flex-wrap items-center gap-2">
                      {product.category.name}
                      {product.category.prefix ? (
                        <Badge variant="outline" className="font-mono text-xs">
                          {product.category.prefix}
                        </Badge>
                      ) : null}
                    </span>
                  ) : (
                    emptyFieldLabel("categoría")
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Tipo de red</dt>
                <dd>
                  {product.grid_type
                    ? GRID_TYPE_LABELS[product.grid_type]
                    : emptyFieldLabel("tipo de red")}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Precio USD</dt>
                <dd className="tabular-nums">
                  ${product.price_usd.toFixed(2)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">
                  Precio actualizado
                </dt>
                <dd className="tabular-nums">
                  {product.price_updated_at
                    ? new Date(product.price_updated_at).toLocaleDateString("es-AR")
                    : emptyFieldLabel("fecha")}
                </dd>
              </div>
            </dl>

            <section className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground">
                Propiedades técnicas
              </p>
              {properties.length > 0 ? (
                <ProductTechnicalPropertyBadges
                  items={properties}
                  className="gap-2"
                />
              ) : (
                <p className="text-muted-foreground">
                  {emptyFieldLabel("propiedades técnicas")}
                </p>
              )}
            </section>
          </div>
        </DialogContent>
      </Dialog>

      {actions.canDelete ? (
        <ProductDeleteAlertDialog
          product={product}
          open={actions.deleteDialogOpen}
          onOpenChange={actions.setDeleteDialogOpen}
          isDeleting={actions.isDeleting}
          onConfirm={actions.handleDeleteConfirm}
        />
      ) : null}
    </>
  )
}

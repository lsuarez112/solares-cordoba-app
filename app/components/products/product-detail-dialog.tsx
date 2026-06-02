"use client"

import {
  ClipboardCopy,
  Copy,
  Cpu,
  FileText,
  History,
  Link2,
  MessageCircle,
  MoreHorizontal,
  PackageMinus,
  Pencil,
  PowerOff,
  Trash2,
  X,
} from "lucide-react"

import { ProductDeleteAlertDialog } from "~/components/products/product-delete-alert-dialog"
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
  parseProductLinks,
} from "~/lib/products/product-display.utils"
import { isStockAlert } from "~/lib/products/product-list.utils"

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

  const links = parseProductLinks(product.links)
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
                {product.product_code}
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

                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Próximamente</DropdownMenuLabel>
                      <DropdownMenuItem disabled>
                        <History data-icon="inline-start" />
                        Ver movimientos de stock
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled>
                        <FileText data-icon="inline-start" />
                        Ver presupuestos que lo usan
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled>
                        <PackageMinus data-icon="inline-start" />
                        Actualizar stock rápido
                      </DropdownMenuItem>
                    </DropdownMenuGroup>

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
                <dt className="text-xs text-muted-foreground">Categoría</dt>
                <dd>
                  {product.category?.name?.trim()
                    ? product.category.name
                    : emptyFieldLabel("categoría")}
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
                <dt className="text-xs text-muted-foreground">Stock</dt>
                <dd className="tabular-nums">{product.stock}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Alerta stock</dt>
                <dd className="tabular-nums">
                  {product.stock_alert_at != null
                    ? product.stock_alert_at
                    : emptyFieldLabel("alerta de stock")}
                </dd>
              </div>
            </dl>

            <div className="flex flex-wrap gap-2">
              <Badge variant={product.active ? "default" : "secondary"}>
                {product.active ? "Activo" : "Inactivo"}
              </Badge>
              <Badge variant="secondary">
                {product.is_composite ? "Kit" : "Simple"}
              </Badge>
              {isStockAlert(product) ? (
                <Badge variant="secondary">Alerta stock</Badge>
              ) : null}
            </div>

            <section className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground">
                Links y recursos
              </p>
              {links.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {links.map((link) => (
                    <Badge
                      key={`${link.label}-${link.url}`}
                      variant="outline"
                      asChild
                    >
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={link.url}
                      >
                        <Link2 data-icon="inline-start" />
                        {link.label}
                      </a>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  {emptyFieldLabel("links")}
                </p>
              )}
            </section>

            <section className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground">
                Propiedades técnicas
              </p>
              {properties.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {properties.map(({ key, value }) => (
                    <Badge key={key} variant="secondary">
                      <Cpu data-icon="inline-start" />
                      {key}: {value}
                    </Badge>
                  ))}
                </div>
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

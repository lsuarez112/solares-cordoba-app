"use client"

import type { ReactNode } from "react"

import {
  CheckCircle2,
  CircleX,
  Mail,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  PowerOff,
  Trash2,
  Truck,
  X,
} from "lucide-react"

import { SupplierDeleteAlertDialog } from "./supplier-delete-alert-dialog"
import { SuppliersRatingStars } from "./suppliers-rating-stars"
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
import type { Supplier } from "~/domain/suppliers/suppliers.schemas"
import { useSupplierActions } from "~/hooks/use-supplier-actions"
import { displayTextField } from "~/lib/suppliers/supplier-display.utils"

type SupplierDetailDialogProps = {
  supplier: Supplier
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenEdit?: () => void
}

function DetailField({
  label,
  value,
}: {
  label: string
  value: ReactNode
}) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="text-sm text-foreground">{value}</div>
    </div>
  )
}

export function SupplierDetailDialog({
  supplier,
  open,
  onOpenChange,
  onOpenEdit,
}: SupplierDetailDialogProps) {
  const actions = useSupplierActions({
    supplier,
    onClose: () => onOpenChange(false),
    onOpenEdit,
  })

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
              <DialogTitle className="text-base">{supplier.name}</DialogTitle>
              <DialogDescription className="text-xs">
                {supplier.tax_id ?? "Sin CUIT"}
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
                      aria-label="Acciones del proveedor"
                    >
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-56">
                    {actions.canEdit ? (
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Proveedor</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={actions.handleEdit}>
                          <Pencil data-icon="inline-start" />
                          Editar
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    ) : null}

                    {actions.hasContactActions ? (
                      <>
                        {actions.canEdit ? <DropdownMenuSeparator /> : null}
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Contacto</DropdownMenuLabel>
                          {actions.mailtoUrl ? (
                            <DropdownMenuItem asChild>
                              <a href={actions.mailtoUrl}>
                                <Mail data-icon="inline-start" />
                                Enviar email
                              </a>
                            </DropdownMenuItem>
                          ) : null}
                          {actions.whatsAppUrl ? (
                            <DropdownMenuItem asChild>
                              <a
                                href={actions.whatsAppUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <MessageCircle data-icon="inline-start" />
                                Abrir WhatsApp
                              </a>
                            </DropdownMenuItem>
                          ) : null}
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
                              {supplier.active ? "Desactivar" : "Activar"}
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
              {supplier.active ? (
                <Badge
                  variant="secondary"
                  className="border-green-200 bg-green-100 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300"
                >
                  <CheckCircle2
                    data-icon="inline-start"
                    className="text-green-600"
                  />
                  Activo
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <CircleX data-icon="inline-start" />
                  Inactivo
                </Badge>
              )}
              <Badge variant="outline" className="font-mono">
                {supplier.currency}
              </Badge>
              {supplier.category ? (
                <Badge variant="secondary">
                  <Truck data-icon="inline-start" className="text-muted-foreground" />
                  {supplier.category}
                </Badge>
              ) : null}
            </div>

            <DetailField
              label="Razón social"
              value={displayTextField(supplier.legal_name, "razón social")}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <DetailField
                label="Contacto"
                value={displayTextField(supplier.contact_name, "contacto")}
              />
              <DetailField
                label="Email"
                value={
                  supplier.email ? (
                    <a
                      href={`mailto:${supplier.email}`}
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      {supplier.email}
                    </a>
                  ) : (
                    displayTextField(null, "email")
                  )
                }
              />
              <DetailField
                label="Teléfono"
                value={displayTextField(supplier.phone, "teléfono")}
              />
              <DetailField
                label="WhatsApp"
                value={displayTextField(supplier.whatsapp, "WhatsApp")}
              />
            </div>

            <DetailField
              label="Sitio web"
              value={
                supplier.website ? (
                  <a
                    href={supplier.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    {supplier.website}
                  </a>
                ) : (
                  displayTextField(null, "sitio web")
                )
              }
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <DetailField
                label="Ciudad"
                value={displayTextField(supplier.city, "ciudad")}
              />
              <DetailField
                label="Provincia"
                value={displayTextField(supplier.province, "provincia")}
              />
            </div>

            <DetailField
              label="Dirección"
              value={displayTextField(supplier.address, "dirección")}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <DetailField
                label="Plazo de pago"
                value={
                  supplier.payment_days != null && supplier.payment_days > 0
                    ? `${supplier.payment_days} días`
                    : "Sin plazo definido"
                }
              />
              <DetailField
                label="Rating"
                value={<SuppliersRatingStars rating={supplier.rating} />}
              />
            </div>

            <DetailField
              label="Notas"
              value={displayTextField(supplier.notes, "notas")}
            />
          </div>
        </DialogContent>
      </Dialog>

      {actions.canDelete ? (
        <SupplierDeleteAlertDialog
          supplier={supplier}
          open={actions.deleteDialogOpen}
          onOpenChange={actions.setDeleteDialogOpen}
          isDeleting={actions.isDeleting}
          onConfirm={actions.handleDeleteConfirm}
        />
      ) : null}
    </>
  )
}

"use client"

import {
  CircleCheck,
  CircleMinus,
  Copy,
  CopyPlus,
  MessageCircle,
  Pencil,
  Trash2,
} from "lucide-react"

import { ProductDeleteAlertDialog } from "~/components/products/product-delete-alert-dialog"
import { RowActionsMenu } from "~/components/ui/row-actions-menu"
import type { Product } from "~/domain/products/products.schemas"
import { useProductActions } from "~/hooks/use-product-actions"

type ProductRowActionsProps = {
  product: Product
  onOpenEdit?: (product: Product) => void
  onDuplicate?: (product: Product) => void
}

/** Columna de acciones de la tabla de productos (edición rápida, estado, borrar). */
export function ProductRowActions({ product, onOpenEdit, onDuplicate }: ProductRowActionsProps) {
  const actions = useProductActions({
    product,
    onOpenEdit: onOpenEdit ? () => onOpenEdit(product) : undefined,
    onDuplicate: onDuplicate ? () => onDuplicate(product) : undefined,
  })

  return (
    <>
      <RowActionsMenu
        actions={[
          {
            key: "edit",
            label: "Editar",
            icon: Pencil,
            tone: "edit",
            hidden: !actions.canEdit || !onOpenEdit,
            onSelect: actions.handleEdit,
          },
          {
            key: "duplicate",
            label: "Duplicar",
            icon: CopyPlus,
            tone: "duplicate",
            hidden: !actions.canDuplicate || !onDuplicate,
            onSelect: actions.handleDuplicate,
          },
          {
            key: "copy",
            label: "Copiar especificaciones",
            icon: Copy,
            tone: "neutral",
            onSelect: actions.handleCopySpecs,
          },
          {
            key: "whatsapp",
            label: "Enviar por WhatsApp",
            icon: MessageCircle,
            tone: "share",
            onSelect: actions.handleWhatsApp,
          },
          {
            key: "toggle",
            label: product.active ? "Desactivar" : "Activar",
            icon: product.active ? CircleMinus : CircleCheck,
            tone: product.active ? "deactivate" : "activate",
            hidden: !actions.canToggleActive,
            disabled: actions.isTogglingActive,
            onSelect: () => void actions.handleToggleActive(),
          },
          {
            key: "delete",
            label: "Eliminar",
            icon: Trash2,
            tone: "delete",
            hidden: !actions.canDelete,
            onSelect: actions.openDeleteDialog,
          },
        ]}
      />
      {actions.canDelete ? (
        <ProductDeleteAlertDialog
          product={product}
          open={actions.deleteDialogOpen}
          onOpenChange={actions.setDeleteDialogOpen}
          isDeleting={actions.isDeleting}
          onConfirm={actions.handleDeleteConfirm}
          onDeactivate={actions.handleToggleActive}
        />
      ) : null}
    </>
  )
}

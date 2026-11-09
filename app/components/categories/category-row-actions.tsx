"use client"

import { ListFilter, Pencil, Trash2 } from "lucide-react"
import { useNavigate } from "react-router"

import { CategoryDeleteAlertDialog } from "~/components/categories/category-delete-alert-dialog"
import { RowActionsMenu } from "~/components/ui/row-actions-menu"
import type { Category } from "~/domain/categories/categories.schemas"
import { useCategoryActions } from "~/hooks/use-category-actions"

type CategoryRowActionsProps = {
  category: Category
  onOpenEdit?: (category: Category) => void
}

export function CategoryRowActions({ category, onOpenEdit }: CategoryRowActionsProps) {
  const navigate = useNavigate()
  const actions = useCategoryActions({
    category,
    onOpenEdit: onOpenEdit ? () => onOpenEdit(category) : undefined,
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
            key: "products",
            label: "Ver productos",
            icon: ListFilter,
            tone: "neutral",
            onSelect: () => navigate(`/productos?category=${category.id}`),
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
        <CategoryDeleteAlertDialog
          category={category}
          productCount={actions.productCount}
          open={actions.deleteDialogOpen}
          onOpenChange={actions.setDeleteDialogOpen}
          isDeleting={actions.isDeleting}
          onConfirm={actions.handleDeleteConfirm}
        />
      ) : null}
    </>
  )
}

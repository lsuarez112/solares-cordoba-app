"use client"

import type { ReactNode } from "react"

import {
  ExternalLink,
  Layers,
  MoreHorizontal,
  Package,
  Pencil,
  Trash2,
  X,
} from "lucide-react"
import { Link } from "react-router"

import { CategoryDeleteAlertDialog } from "./category-delete-alert-dialog"
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
import type { Category } from "~/domain/categories/categories.schemas"
import { useCategoryActions } from "~/hooks/use-category-actions"
import { getCategoryIcon } from "~/lib/categories/category-icons"
import { displayTextField } from "~/lib/categories/category-display.utils"

type CategoryDetailDialogProps = {
  category: Category
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

export function CategoryDetailDialog({
  category,
  open,
  onOpenChange,
  onOpenEdit,
}: CategoryDetailDialogProps) {
  const actions = useCategoryActions({
    category,
    onClose: () => onOpenChange(false),
    onOpenEdit,
  })

  const CategoryIcon = getCategoryIcon(category.icon)
  const productsUrl = `/productos?category=${category.id}`

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
              <DialogTitle className="text-base">{category.name}</DialogTitle>
              <DialogDescription className="text-xs">
                {category.slug ?? "Sin slug"}
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
                      aria-label="Acciones de la categoría"
                    >
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-56">
                    {actions.canEdit ? (
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Categoría</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={actions.handleEdit}>
                          <Pencil data-icon="inline-start" />
                          Editar
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    ) : null}

                    {actions.canDelete ? (
                      <>
                        {actions.canEdit ? <DropdownMenuSeparator /> : null}
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Administración</DropdownMenuLabel>
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={actions.openDeleteDialog}
                          >
                            <Trash2 data-icon="inline-start" />
                            Eliminar
                          </DropdownMenuItem>
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
              <Badge
                variant="secondary"
                className="border-violet-200 bg-violet-100 text-violet-800 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-300"
              >
                <CategoryIcon
                  data-icon="inline-start"
                  className="text-violet-600"
                />
                Categoría
              </Badge>
              <Badge variant="secondary">
                <Package data-icon="inline-start" className="text-green-600" />
                {actions.productCount} producto
                {actions.productCount === 1 ? "" : "s"}
              </Badge>
              {category.prefix ? (
                <Badge variant="outline" className="font-mono text-xs">
                  {category.prefix}
                </Badge>
              ) : null}
              {category.slug ? (
                <Badge variant="outline" className="font-mono text-xs">
                  {category.slug}
                </Badge>
              ) : null}
            </div>

            <DetailField
              label="Prefijo"
              value={
                category.prefix?.trim() ? (
                  <span className="font-mono">{category.prefix}</span>
                ) : (
                  <span className="text-muted-foreground">Sin prefijo</span>
                )
              }
            />

            <DetailField
              label="Descripción"
              value={displayTextField(category.description, "descripción")}
            />

            {actions.canRead && actions.productCount > 0 ? (
              <div className="rounded-lg border bg-muted/30 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Layers className="size-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      Productos en esta categoría
                    </span>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={productsUrl} onClick={handleClose}>
                      <ExternalLink data-icon="inline-start" />
                      Ver listado
                    </Link>
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

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

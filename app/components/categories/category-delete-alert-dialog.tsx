"use client"

import { Trash2 } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog"
import type { Category } from "~/domain/categories/categories.schemas"

type CategoryDeleteAlertDialogProps = {
  category: Category
  productCount: number
  open: boolean
  onOpenChange: (open: boolean) => void
  isDeleting: boolean
  onConfirm: () => void | Promise<void>
}

export function CategoryDeleteAlertDialog({
  category,
  productCount,
  open,
  onOpenChange,
  isDeleting,
  onConfirm,
}: CategoryDeleteAlertDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
          <AlertDialogDescription>
            Vas a eliminar permanentemente{" "}
            <span className="font-medium text-foreground">{category.name}</span>
            {category.slug ? ` (${category.slug})` : null}.
            {productCount > 0 ? (
              <>
                {" "}
                Hay {productCount} producto{productCount === 1 ? "" : "s"}{" "}
                asociado{productCount === 1 ? "" : "s"}; la eliminación puede
                fallar si no se reasignan antes.
              </>
            ) : (
              <> Esta acción no se puede deshacer.</>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isDeleting}
            onClick={(event) => {
              event.preventDefault()
              void onConfirm()
            }}
          >
            <Trash2 data-icon="inline-start" />
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

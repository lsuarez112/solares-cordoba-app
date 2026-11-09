"use client"

import { Trash2 } from "lucide-react"
import { Link } from "react-router"

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
          <AlertDialogTitle>
            {productCount > 0 ? "La categoría tiene productos" : "¿Eliminar categoría?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-medium text-foreground">{category.name}</span>
            {category.slug ? ` (${category.slug})` : null}.{" "}
            {productCount > 0 ? (
              <>
                Tiene {productCount} producto{productCount === 1 ? "" : "s"}: movelos a otra
                categoría antes de borrarla.{" "}
                <Link
                  to={`/productos?category=${category.id}`}
                  className="font-medium text-foreground underline"
                >
                  Ver productos
                </Link>
              </>
            ) : (
              <>No tiene productos. Esta acción no se puede deshacer.</>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isDeleting || productCount > 0}
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

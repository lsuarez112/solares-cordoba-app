"use client"

import * as React from "react"
import { CircleMinus, Trash2 } from "lucide-react"
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
import { Spinner } from "~/components/ui/spinner"
import type { Product } from "~/domain/products/products.schemas"
import { isProductInUse, usageService, type ProductUsage } from "~/services/usage.service"

type ProductDeleteAlertDialogProps = {
  product: Product
  open: boolean
  onOpenChange: (open: boolean) => void
  isDeleting: boolean
  onConfirm: () => void | Promise<void>
  /** Alternativa cuando el producto está en uso. */
  onDeactivate?: () => void | Promise<void>
}

/** Antes de borrar revisa si el producto está en kits (base u opcionales) o presupuestos. */
export function ProductDeleteAlertDialog({
  product,
  open,
  onOpenChange,
  isDeleting,
  onConfirm,
  onDeactivate,
}: ProductDeleteAlertDialogProps) {
  const [usage, setUsage] = React.useState<ProductUsage | null>(null)
  const [checking, setChecking] = React.useState(false)

  React.useEffect(() => {
    if (!open) return
    let cancelled = false
    setUsage(null)
    setChecking(true)
    usageService
      .product(product.id)
      .then((u) => !cancelled && setUsage(u))
      .catch(() => !cancelled && setUsage(null))
      .finally(() => !cancelled && setChecking(false))
    return () => {
      cancelled = true
    }
  }, [open, product.id])

  const inUse = isProductInUse(usage)

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {inUse ? "Este producto está en uso" : "¿Eliminar producto?"}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">{product.name}</span> (
                {product.product_code})
              </p>
              {checking ? (
                <p className="flex items-center gap-2">
                  <Spinner className="size-3.5" /> Revisando kits y presupuestos…
                </p>
              ) : inUse && usage ? (
                <>
                  <p>No se puede borrar porque se usa en:</p>
                  <ul className="list-disc pl-5">
                    {usage.kits.map((kit) => (
                      <li key={kit.id}>
                        <Link
                          to={`/kits/${kit.id}`}
                          className="font-medium text-foreground hover:underline"
                        >
                          {kit.code}
                        </Link>{" "}
                        {kit.in_base ? "(lista de materiales)" : "(opcional)"}
                      </li>
                    ))}
                    {usage.quotes > 0 ? <li>{usage.quotes} presupuesto(s)</li> : null}
                  </ul>
                  <p>Podés desactivarlo: deja de ofrecerse sin romper kits ni presupuestos.</p>
                </>
              ) : (
                <p>No se usa en kits ni presupuestos. Esta acción no se puede deshacer.</p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          {inUse ? (
            onDeactivate && product.active ? (
              <AlertDialogAction
                onClick={(event) => {
                  event.preventDefault()
                  void Promise.resolve(onDeactivate()).then(() => onOpenChange(false))
                }}
              >
                <CircleMinus data-icon="inline-start" />
                Desactivar
              </AlertDialogAction>
            ) : null
          ) : (
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting || checking}
              onClick={(event) => {
                event.preventDefault()
                void onConfirm()
              }}
            >
              <Trash2 data-icon="inline-start" />
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

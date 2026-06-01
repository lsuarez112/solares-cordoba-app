"use client"

import { Badge } from "~/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import type { Product } from "~/domain/products/products.schemas"
import {
  GRID_TYPE_LABELS,
} from "~/lib/products/grid-type.utils"
import { isStockAlert } from "~/lib/products/product-list.utils"

type ProductDetailDialogProps = {
  product: Product
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductDetailDialog({
  product,
  open,
  onOpenChange,
}: ProductDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(92vh,720px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b px-4 py-3">
          <DialogTitle className="text-base">{product.name}</DialogTitle>
          <DialogDescription className="font-mono text-xs">
            {product.product_code}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 overflow-y-auto px-4 py-4 text-sm">
          {product.short_desc ? (
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Nombre corto
              </p>
              <p>{product.short_desc}</p>
            </div>
          ) : null}

          {product.description ? (
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Descripción
              </p>
              <p className="text-muted-foreground">{product.description}</p>
            </div>
          ) : null}

          <dl className="grid grid-cols-2 gap-3">
            <div>
              <dt className="text-xs text-muted-foreground">Categoría</dt>
              <dd>{product.category?.name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Tipo de red</dt>
              <dd>
                {product.grid_type
                  ? GRID_TYPE_LABELS[product.grid_type]
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Precio USD</dt>
              <dd className="tabular-nums">${product.price_usd.toFixed(2)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Stock</dt>
              <dd className="tabular-nums">{product.stock}</dd>
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
        </div>
      </DialogContent>
    </Dialog>
  )
}

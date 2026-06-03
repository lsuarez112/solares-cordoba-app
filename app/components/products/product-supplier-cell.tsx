import { Badge } from "~/components/ui/badge"
import type { Product } from "~/domain/products/products.schemas"
import { getProductSupplierDisplay } from "~/lib/products/product-supplier.utils"

export function ProductSupplierCell({ product }: { product: Product }) {
  const supplier = getProductSupplierDisplay(product)

  if (!supplier) {
    return <span className="text-sm text-muted-foreground">—</span>
  }

  return (
    <div className="flex min-w-0 max-w-xs flex-col gap-0.5">
      <span className="truncate text-sm font-medium">{supplier.name}</span>
      {supplier.taxId ? (
        <span className="truncate text-xs text-muted-foreground">
          {supplier.taxId}
        </span>
      ) : supplier.phone ? (
        <span className="truncate text-xs text-muted-foreground">
          {supplier.phone}
        </span>
      ) : null}
      {supplier.paymentDays != null && supplier.paymentDays > 0 ? (
        <span className="text-xs text-muted-foreground">
          {supplier.paymentDays}d pago
        </span>
      ) : null}
      {supplier.currency ? (
        <Badge variant="outline" className="w-fit font-mono text-xs">
          {supplier.currency}
        </Badge>
      ) : null}
      {supplier.active === false ? (
        <span className="text-xs text-muted-foreground">Proveedor inactivo</span>
      ) : null}
    </div>
  )
}

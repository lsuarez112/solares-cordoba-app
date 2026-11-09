"use client"

import * as React from "react"
import { HintTooltip } from "~/components/ui/hint-tooltip"

import { ProductDetailDialog } from "~/components/products/product-detail-dialog"
import { Button } from "~/components/ui/button"
import type { Product } from "~/domain/products/products.schemas"
import { cn } from "~/lib/utils"

const NAME_MAX_LENGTH = 40

function formatProductName(name: string) {
  if (name.length <= NAME_MAX_LENGTH) return name
  return `${name.slice(0, NAME_MAX_LENGTH)}…`
}

type ProductNameLinkProps = {
  product: Product
  className?: string
  onOpenEdit?: (product: Product) => void
  onDuplicate?: (product: Product) => void
}

export function ProductNameLink({
  product,
  className,
  onOpenEdit,
  onDuplicate,
}: ProductNameLinkProps) {
  const [open, setOpen] = React.useState(false)
  const displayName = formatProductName(product.name)
  const isTruncated = product.name.length > NAME_MAX_LENGTH

  return (
    <>
      <HintTooltip content={isTruncated ? product.name : undefined}>
        <Button
          type="button"
          variant="link"
          className={cn(
            "h-auto max-w-xs justify-start truncate p-0 font-medium text-foreground",
            className,
          )}
          onClick={() => setOpen(true)}
        >
          {displayName}
        </Button>
      </HintTooltip>

      <ProductDetailDialog
        product={product}
        open={open}
        onOpenChange={setOpen}
        onOpenEdit={
          onOpenEdit
            ? () => {
                setOpen(false)
                onOpenEdit(product)
              }
            : undefined
        }
        onDuplicate={
          onDuplicate
            ? () => {
                setOpen(false)
                onDuplicate(product)
              }
            : undefined
        }
      />
    </>
  )
}

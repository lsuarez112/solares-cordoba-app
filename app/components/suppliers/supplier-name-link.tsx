"use client"

import * as React from "react"

import { SupplierDetailDialog } from "./supplier-detail-dialog"
import { Button } from "~/components/ui/button"
import type { Supplier } from "~/domain/suppliers/suppliers.schemas"
import { cn } from "~/lib/utils"

const NAME_MAX_LENGTH = 40

function formatSupplierName(name: string) {
  if (name.length <= NAME_MAX_LENGTH) return name
  return `${name.slice(0, NAME_MAX_LENGTH)}…`
}

type SupplierNameLinkProps = {
  supplier: Supplier
  className?: string
  onOpenEdit?: (supplier: Supplier) => void
}

export function SupplierNameLink({
  supplier,
  className,
  onOpenEdit,
}: SupplierNameLinkProps) {
  const [open, setOpen] = React.useState(false)
  const displayName = formatSupplierName(supplier.name)
  const isTruncated = supplier.name.length > NAME_MAX_LENGTH

  return (
    <>
      <Button
        type="button"
        variant="link"
        className={cn(
          "h-auto max-w-xs justify-start truncate p-0 font-medium text-foreground",
          className,
        )}
        title={isTruncated ? supplier.name : undefined}
        onClick={() => setOpen(true)}
      >
        {displayName}
      </Button>

      <SupplierDetailDialog
        supplier={supplier}
        open={open}
        onOpenChange={setOpen}
        onOpenEdit={
          onOpenEdit
            ? () => {
                setOpen(false)
                onOpenEdit(supplier)
              }
            : undefined
        }
      />
    </>
  )
}

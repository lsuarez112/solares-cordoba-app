"use client"

import { Plus } from "lucide-react"

import { Button } from "~/components/ui/button"

type SuppliersCreateActionsProps = {
  onNewSupplier?: () => void
}

export function SuppliersCreateActions({
  onNewSupplier,
}: SuppliersCreateActionsProps) {
  return (
    <Button size="sm" onClick={onNewSupplier}>
      <Plus data-icon="inline-start" />
      Nuevo proveedor
    </Button>
  )
}

"use client"

import * as React from "react"
import { EllipsisVertical, FileSpreadsheet, FileText, Plus } from "lucide-react"

import { ImportProductsModal } from "~/components/products/products-import-modal"
import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import type { ImportFileFormat } from "~/domain/products/products-import"

type ProductsCreateActionsProps = {
  onNewProduct?: () => void
}

export function ProductsCreateActions({
  onNewProduct,
}: ProductsCreateActionsProps) {
  const [importFormat, setImportFormat] =
    React.useState<ImportFileFormat | null>(null)

  return (
    <>
      <Button size="sm" onClick={onNewProduct}>
        <Plus data-icon="inline-start" />
        Nuevo producto
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" aria-label="Más acciones">
            <EllipsisVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-56 w-56">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setImportFormat("excel")}>
            <FileSpreadsheet className="size-4" />
            Importar desde Excel
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setImportFormat("csv")}>
            <FileText className="size-4" />
            Importar desde CSV
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ImportProductsModal
        open={importFormat !== null}
        format={importFormat ?? "csv"}
        onClose={() => setImportFormat(null)}
      />
    </>
  )
}

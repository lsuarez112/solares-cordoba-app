"use client"

import type { Column, ColumnDef } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"

import { SupplierNameLink } from "./supplier-name-link"
import { SuppliersRatingStars } from "./suppliers-rating-stars"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import type { Supplier } from "~/domain/suppliers/suppliers.schemas"
import { supplierWhatsAppUrl } from "~/lib/suppliers/supplier-display.utils"
import { cn } from "~/lib/utils"

function SortableHeader({
  column,
  title,
  className,
}: {
  column: Column<Supplier, unknown>
  title: string
  className?: string
}) {
  const sorted = column.getIsSorted()

  return (
    <Button
      variant="ghost"
      className={cn("h-8 px-0", className)}
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {title}
      {sorted === "asc" ? (
        <ArrowUp data-icon="inline-end" />
      ) : sorted === "desc" ? (
        <ArrowDown data-icon="inline-end" />
      ) : (
        <ArrowUpDown data-icon="inline-end" />
      )}
    </Button>
  )
}

type SuppliersTableColumnsOptions = {
  onOpenEdit?: (supplier: Supplier) => void
}

export function suppliersTableColumns(
  options?: SuppliersTableColumnsOptions,
): ColumnDef<Supplier>[] {
  const { onOpenEdit } = options ?? {}

  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <SortableHeader column={column} title="Proveedor" />
      ),
      cell: ({ row }) => {
        const supplier = row.original
        return (
          <div className="flex min-w-0 max-w-xs flex-col gap-0.5">
            <SupplierNameLink supplier={supplier} onOpenEdit={onOpenEdit} />
            {supplier.legal_name ? (
              <span className="truncate text-xs text-muted-foreground">
                {supplier.legal_name}
              </span>
            ) : null}
          </div>
        )
      },
    },
    {
      accessorKey: "tax_id",
      header: ({ column }) => <SortableHeader column={column} title="CUIT" />,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.tax_id ?? "—"}
        </span>
      ),
    },
    {
      id: "contact",
      header: "Contacto",
      cell: ({ row }) => {
        const supplier = row.original
        const whatsAppUrl = supplier.whatsapp
          ? supplierWhatsAppUrl(supplier.whatsapp)
          : null

        return (
          <div className="flex min-w-0 max-w-xs flex-col gap-0.5">
            {supplier.contact_name ? (
              <span className="text-sm">{supplier.contact_name}</span>
            ) : null}
            {supplier.email ? (
              <a
                href={`mailto:${supplier.email}`}
                className="truncate text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {supplier.email}
              </a>
            ) : null}
            {whatsAppUrl ? (
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-xs text-green-600 transition-colors hover:text-green-700"
              >
                WA: {supplier.whatsapp}
              </a>
            ) : null}
            {!supplier.contact_name && !supplier.email && !supplier.whatsapp ? (
              <span className="text-sm text-muted-foreground">—</span>
            ) : null}
          </div>
        )
      },
    },
    {
      id: "location",
      header: "Categoría / Ciudad",
      cell: ({ row }) => {
        const supplier = row.original
        return (
          <div className="flex flex-col gap-1">
            {supplier.category ? (
              <Badge variant="secondary" className="w-fit text-xs">
                {supplier.category}
              </Badge>
            ) : null}
            {supplier.city ? (
              <span className="text-xs text-muted-foreground">
                {supplier.city}
              </span>
            ) : null}
            {!supplier.category && !supplier.city ? (
              <span className="text-sm text-muted-foreground">—</span>
            ) : null}
          </div>
        )
      },
    },
    {
      id: "commercial",
      header: "Moneda / Plazo",
      cell: ({ row }) => {
        const supplier = row.original
        return (
          <div className="flex flex-col gap-0.5">
            <Badge variant="outline" className="w-fit font-mono text-xs">
              {supplier.currency}
            </Badge>
            {supplier.payment_days != null && supplier.payment_days > 0 ? (
              <span className="text-xs text-muted-foreground">
                {supplier.payment_days}d
              </span>
            ) : null}
          </div>
        )
      },
    },
    {
      accessorKey: "rating",
      header: ({ column }) => (
        <SortableHeader column={column} title="Rating" className="mx-auto" />
      ),
      cell: ({ row }) => <SuppliersRatingStars rating={row.original.rating} />,
      meta: {
        headerClassName: "text-center",
        cellClassName: "text-center",
      },
    },
    {
      accessorKey: "active",
      header: ({ column }) => (
        <SortableHeader column={column} title="Estado" className="mx-auto" />
      ),
      cell: ({ row }) => (
        <Badge variant={row.original.active ? "default" : "secondary"}>
          {row.original.active ? "Activo" : "Inactivo"}
        </Badge>
      ),
      meta: {
        headerClassName: "text-center",
        cellClassName: "text-center",
      },
    },
  ]
}

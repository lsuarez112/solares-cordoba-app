import { CheckCircle2, CircleX } from "lucide-react"

import type { CatalogColumn } from "~/components/catalog/catalog-browse-table"
import { Badge } from "~/components/ui/badge"
import type { Supplier } from "~/domain/suppliers/suppliers.schemas"

export type SupplierTableRow = {
  name: string
  legal_name: string | null
  category: string | null
  location: string | null
  contact_name: string | null
  email: string | null
  phone: string | null
  tax_id: string
  currency: string
  payment_label: string | null
  active: boolean
  estado: string
}

function formatLocation(supplier: Supplier): string | null {
  const parts = [supplier.city, supplier.province].filter(
    (part): part is string => Boolean(part?.trim()),
  )
  return parts.length > 0 ? parts.join(", ") : null
}

function formatPaymentLabel(supplier: Supplier): string | null {
  if (supplier.payment_days == null) return null
  return `${supplier.payment_days} días`
}

function SupplierNameCell({ row }: { row: SupplierTableRow }) {
  const meta = [row.category, row.location].filter(Boolean)

  return (
    <div className="flex min-w-0 max-w-[280px] flex-col gap-0.5">
      <span className="font-medium leading-snug">{row.name}</span>
      {row.legal_name ? (
        <span className="truncate text-xs text-muted-foreground">
          {row.legal_name}
        </span>
      ) : null}
      {meta.length > 0 ? (
        <span className="truncate text-xs text-muted-foreground">
          {meta.join(" · ")}
        </span>
      ) : null}
    </div>
  )
}

function SupplierContactCell({ row }: { row: SupplierTableRow }) {
  const channels = [row.email, row.phone].filter(Boolean)

  if (!row.contact_name && channels.length === 0) {
    return <span className="text-muted-foreground">—</span>
  }

  return (
    <div className="flex min-w-0 max-w-[220px] flex-col gap-0.5">
      {row.contact_name ? (
        <span className="leading-snug">{row.contact_name}</span>
      ) : null}
      {channels.map((line) => (
        <span
          key={line}
          className="truncate text-xs text-muted-foreground"
        >
          {line}
        </span>
      ))}
    </div>
  )
}

function SupplierCurrencyCell({ row }: { row: SupplierTableRow }) {
  return (
    <div className="flex flex-col gap-0.5 tabular-nums">
      <span>{row.currency}</span>
      {row.payment_label ? (
        <span className="text-xs text-muted-foreground">
          {row.payment_label}
        </span>
      ) : null}
    </div>
  )
}

function SupplierStatusCell({ row }: { row: SupplierTableRow }) {
  if (row.active) {
    return (
      <Badge
        variant="secondary"
        className="border-green-200 bg-green-100 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300"
      >
        <CheckCircle2 data-icon="inline-start" className="text-green-600" />
        Activo
      </Badge>
    )
  }

  return (
    <Badge
      variant="secondary"
      className="border-muted-foreground/20 bg-muted text-muted-foreground"
    >
      <CircleX data-icon="inline-start" />
      Inactivo
    </Badge>
  )
}

export const SUPPLIERS_COLUMNS: CatalogColumn<SupplierTableRow>[] = [
  {
    key: "name",
    header: "Nombre",
    skeletonClassName: "w-[200px]",
    cell: (row) => <SupplierNameCell row={row} />,
  },
  {
    key: "contact_name",
    header: "Contacto",
    skeletonClassName: "w-[180px]",
    cell: (row) => <SupplierContactCell row={row} />,
  },
  { key: "tax_id", header: "CUIT", skeletonClassName: "w-[120px]" },
  {
    key: "currency",
    header: "Moneda",
    skeletonClassName: "w-[80px]",
    cell: (row) => <SupplierCurrencyCell row={row} />,
  },
  {
    key: "estado",
    header: "Estado",
    skeletonClassName: "w-[88px]",
    cell: (row) => <SupplierStatusCell row={row} />,
  },
]

export function mapSupplierToTableRow(supplier: Supplier): SupplierTableRow {
  return {
    name: supplier.name,
    legal_name: supplier.legal_name?.trim() || null,
    category: supplier.category?.trim() || null,
    location: formatLocation(supplier),
    contact_name: supplier.contact_name?.trim() || null,
    email: supplier.email?.trim() || null,
    phone: supplier.phone?.trim() || supplier.whatsapp?.trim() || null,
    tax_id: supplier.tax_id?.trim() || "—",
    currency: supplier.currency,
    payment_label: formatPaymentLabel(supplier),
    active: supplier.active,
    estado: supplier.active ? "Activo" : "Inactivo",
  }
}

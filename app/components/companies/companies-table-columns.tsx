"use client"

import type { Column, ColumnDef } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"

import { CompanyNameLink } from "./company-name-link"
import { CompanyRowActions } from "./company-row-actions"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import type { Company } from "~/domain/companies/companies.schemas"
import { cn } from "~/lib/utils"

function SortableHeader({
  column,
  title,
  className,
}: {
  column: Column<Company, unknown>
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

type CompaniesTableColumnsOptions = {
  onOpenEdit?: (company: Company) => void
  onOpenUsers?: (company: Company) => void
  memberCounts?: Record<string, number>
  canUpdate?: boolean
}

export function companiesTableColumns(
  options?: CompaniesTableColumnsOptions,
): ColumnDef<Company>[] {
  const { onOpenEdit, onOpenUsers, memberCounts = {}, canUpdate = false } =
    options ?? {}

  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <SortableHeader column={column} title="Empresa" />
      ),
      cell: ({ row }) => {
        const company = row.original
        return (
          <div className="flex min-w-0 max-w-xs flex-col gap-0.5">
            <CompanyNameLink company={company} onOpenEdit={onOpenEdit} />
            {company.legal_name ? (
              <span className="truncate text-xs text-muted-foreground">
                {company.legal_name}
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
        const company = row.original
        return (
          <div className="flex min-w-0 max-w-xs flex-col gap-0.5">
            {company.email ? (
              <a
                href={`mailto:${company.email}`}
                className="truncate text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {company.email}
              </a>
            ) : null}
            {company.phone ? (
              <span className="text-xs text-muted-foreground">
                {company.phone}
              </span>
            ) : null}
            {!company.email && !company.phone ? (
              <span className="text-sm text-muted-foreground">—</span>
            ) : null}
          </div>
        )
      },
    },
    {
      id: "location",
      header: "Ciudad / Provincia",
      cell: ({ row }) => {
        const company = row.original
        const location = [company.city, company.province]
          .filter(Boolean)
          .join(", ")
        return (
          <span className="text-sm text-muted-foreground">
            {location || "—"}
          </span>
        )
      },
    },
    {
      id: "users",
      enableSorting: false,
      header: "Usuarios",
      accessorFn: (row) => memberCounts[row.id] ?? 0,
      cell: ({ row }) => {
        const count = memberCounts[row.original.id] ?? 0
        return (
          <Badge
            variant={count > 0 ? "secondary" : "outline"}
            className="tabular-nums"
          >
            {count}
          </Badge>
        )
      },
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
          {row.original.active ? "Activa" : "Inactiva"}
        </Badge>
      ),
      meta: {
        headerClassName: "text-center",
        cellClassName: "text-center",
      },
    },
    {
      id: "actions",
      enableSorting: false,
      header: () => <span className="sr-only">Acciones</span>,
      cell: ({ row }) => (
        <CompanyRowActions
          company={row.original}
          canUpdate={canUpdate}
          onOpenEdit={onOpenEdit}
          onOpenUsers={onOpenUsers}
        />
      ),
      meta: {
        headerClassName: "w-10 px-1",
        cellClassName: "w-10 px-1",
      },
    },
  ]
}

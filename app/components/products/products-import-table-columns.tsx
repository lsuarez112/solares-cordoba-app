"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { AlertTriangle, Trash2 } from "lucide-react"

import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip"
import type { ImportRow, RawImportRow } from "~/domain/products/products-import"
import { IMPORT_DESCRIPTION_PREVIEW_MAX } from "~/domain/products/products-import"

type ImportProductsTableColumnsOptions = {
  onUpdateRow: (
    index: number,
    field: keyof RawImportRow,
    value: string | number,
  ) => void
  onRemoveRow: (index: number) => void
}

export function createImportProductsTableColumns({
  onUpdateRow,
  onRemoveRow,
}: ImportProductsTableColumnsOptions): ColumnDef<ImportRow>[] {
  return [
    {
      id: "status",
      header: () => null,
      cell: ({ row }) => {
        if (!row.original.issue) return null

        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <AlertTriangle
                  className="size-4 text-amber-500"
                  aria-label={row.original.issue}
                />
              </span>
            </TooltipTrigger>
            <TooltipContent>{row.original.issue}</TooltipContent>
          </Tooltip>
        )
      },
      meta: {
        headerClassName: "w-10 px-2",
        cellClassName: "w-10 px-2",
      },
    },
    {
      id: "product_code",
      header: "Código",
      cell: ({ row }) => (
        <Input
          value={row.original.parsed.product_code}
          onChange={(event) =>
            onUpdateRow(row.original.index, "product_code", event.target.value)
          }
          className="h-8 min-w-24 font-mono text-sm"
        />
      ),
      meta: {
        headerClassName: "min-w-28",
        cellClassName: "min-w-28 align-top",
      },
    },
    {
      id: "description",
      header: "Descripción",
      cell: ({ row }) => {
        const description = row.original.parsed.description
        const isLong = description.length > IMPORT_DESCRIPTION_PREVIEW_MAX

        return (
          <Tooltip open={isLong ? undefined : false}>
            <TooltipTrigger asChild>
              <Textarea
                value={description}
                onChange={(event) =>
                  onUpdateRow(
                    row.original.index,
                    "description",
                    event.target.value,
                  )
                }
                rows={2}
                className="field-sizing-fixed min-h-14 max-h-16 min-w-48 resize-none overflow-y-auto text-sm"
              />
            </TooltipTrigger>
            {isLong ? (
              <TooltipContent side="top" className="max-w-sm whitespace-pre-wrap">
                {description}
              </TooltipContent>
            ) : null}
          </Tooltip>
        )
      },
      meta: {
        headerClassName: "min-w-52",
        cellClassName: "min-w-52 align-top",
      },
    },
    {
      id: "price_usd",
      header: () => <span className="block text-right">Precio USD</span>,
      cell: ({ row }) => (
        <Input
          type="number"
          min={0}
          step="0.01"
          value={row.original.parsed.price_usd}
          onChange={(event) =>
            onUpdateRow(
              row.original.index,
              "price_usd",
              event.target.value === "" ? 0 : Number(event.target.value),
            )
          }
          className="h-8 text-right tabular-nums"
        />
      ),
      meta: {
        headerClassName: "min-w-28 text-right",
        cellClassName: "min-w-28 align-top text-right",
      },
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Acciones</span>,
      cell: ({ row }) => (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => onRemoveRow(row.original.index)}
          aria-label="Quitar fila"
        >
          <Trash2 className="size-4" />
        </Button>
      ),
      meta: {
        headerClassName: "w-10 px-1",
        cellClassName: "w-10 px-1 align-top",
      },
    },
  ]
}

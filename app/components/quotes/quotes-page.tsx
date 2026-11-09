"use client"

import * as React from "react"
import { Link } from "react-router"
import { FileCheck2, FilePen, FileText, Plus } from "lucide-react"

import { QuotesDataTable } from "~/components/quotes/quotes-data-table"
import { Badge } from "~/components/ui/badge"
import { BadgesSkeleton } from "~/components/ui/badges-skeleton"
import { Button } from "~/components/ui/button"
import { Skeleton } from "~/components/ui/skeleton"
import type { QuoteListItem } from "~/domain/quotes/quotes.schemas"
import { usePermission } from "~/hooks/use-permission"
import { useQuoteActions } from "~/hooks/use-quote-actions"
import { appToast } from "~/lib/toast"
import { quotesService } from "~/services/quotes.service"

export function QuotesPage() {
  const canCreate = usePermission("quotes", "create")
  const canUpdate = usePermission("quotes", "update")
  const canDelete = usePermission("quotes", "delete")

  const [quotes, setQuotes] = React.useState<QuoteListItem[] | null>(null)

  const load = React.useCallback(async () => {
    try {
      setQuotes(await quotesService.list())
    } catch {
      setQuotes([])
      appToast.error("No se pudieron cargar los presupuestos")
    }
  }, [])

  React.useEffect(() => {
    void load()
  }, [load])

  const actions = useQuoteActions({ onDeleted: () => void load() })

  const current = quotes?.filter((q) => q.is_current) ?? []

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex max-w-3xl flex-col gap-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">Presupuestos</h1>
          <p className="text-sm text-muted-foreground">
            Un emitido no se modifica: al editarlo se crea una revisión (R1, R2…) que reemplaza a la
            anterior cuando se emite. Los borradores toman los precios vigentes hasta que se emiten.
          </p>
        </div>
        {canCreate ? (
          <Button size="sm" asChild>
            <Link to="/presupuestos/nuevo">
              <Plus data-icon="inline-start" />
              Nuevo presupuesto
            </Link>
          </Button>
        ) : null}
      </div>

      {quotes ? (
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="h-6 gap-1.5 px-2.5">
            <FileText data-icon="inline-start" />
            Total
            <span className="font-semibold text-foreground tabular-nums">{current.length}</span>
          </Badge>
          <Badge variant="secondary" className="h-6 gap-1.5 px-2.5">
            <FileCheck2 data-icon="inline-start" className="text-emerald-600" />
            Emitidos
            <span className="font-semibold text-foreground tabular-nums">
              {current.filter((q) => q.status === "issued").length}
            </span>
          </Badge>
          <Badge variant="secondary" className="h-6 gap-1.5 px-2.5">
            <FilePen data-icon="inline-start" className="text-amber-600" />
            Borradores
            <span className="font-semibold text-foreground tabular-nums">
              {quotes.filter((q) => q.status === "draft").length}
            </span>
          </Badge>
        </div>
      ) : (
        <BadgesSkeleton count={3} />
      )}

      {quotes === null ? (
        <Skeleton className="h-80" />
      ) : (
        <QuotesDataTable
          data={quotes}
          canCreate={canCreate}
          canUpdate={canUpdate}
          canDelete={canDelete}
          {...actions}
        />
      )}
    </div>
  )
}

"use client"

import * as React from "react"
import { Link } from "react-router"
import { FileText, Plus } from "lucide-react"

import { QuotesDataTable } from "~/components/quotes/quotes-data-table"
import { Badge } from "~/components/ui/badge"
import { BadgesSkeleton } from "~/components/ui/badges-skeleton"
import { Button } from "~/components/ui/button"
import { PageHeader } from "~/components/ui/page-header"
import { QUOTE_STATUS_KINDS, StatusIcon } from "~/components/ui/status-indicator"
import { Skeleton } from "~/components/ui/skeleton"
import type { QuoteListItem, QuoteStatus } from "~/domain/quotes/quotes.schemas"
import { QUOTE_STATUS_PLURAL } from "~/lib/quotes/quote-status"
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

  const actions = useQuoteActions({ onDeleted: () => void load(), onChanged: () => void load() })

  const current = quotes?.filter((q) => q.is_current) ?? []

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <PageHeader
        title="Presupuestos"
        description="Un emitido no se modifica: al editarlo se crea una revisión (R1, R2…) que reemplaza a la anterior cuando se emite. Los borradores toman los precios vigentes hasta que se emiten."
        actions={
          canCreate ? (
            <Button size="sm" asChild>
              <Link to="/presupuestos/nuevo">
                <Plus data-icon="inline-start" />
                <span className="sm:hidden">Nuevo</span>
              <span className="hidden sm:inline">Nuevo presupuesto</span>
              </Link>
            </Button>
          ) : null
        }
      />

      {quotes ? (
        <div className="stagger-x flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="h-6 gap-1.5 px-2.5">
            <FileText data-icon="inline-start" />
            Total
            <span className="font-semibold text-foreground tabular-nums">{current.length}</span>
          </Badge>
          {QUOTE_STATUS_KINDS.map((status) => {
            const n = (status === "draft" ? quotes : current).filter((q) => q.status === status).length
            return n > 0 || status === "draft" || status === "issued" ? (
              <Badge key={status} variant="secondary" className="h-6 gap-1.5 px-2.5">
                <StatusIcon status={status} />
                {QUOTE_STATUS_PLURAL[status as QuoteStatus]}
                <span className="font-semibold text-foreground tabular-nums">{n}</span>
              </Badge>
            ) : null
          })}
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

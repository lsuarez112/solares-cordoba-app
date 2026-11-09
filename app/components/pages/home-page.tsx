"use client"

import * as React from "react"
import { Link } from "react-router"
import { ArrowRight, FilePlus2, FileText, Users } from "lucide-react"

import { Button } from "~/components/ui/button"
import { PageHeader } from "~/components/ui/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Skeleton } from "~/components/ui/skeleton"
import { StatusIcon } from "~/components/ui/status-indicator"
import type { QuoteListItem } from "~/domain/quotes/quotes.schemas"
import { usePermission } from "~/hooks/use-permission"
import { formatDateTime } from "~/lib/dates"
import { GRID_TYPE_LABELS } from "~/lib/products/grid-type.utils"
import { formatArs, formatUsd } from "~/lib/quotes/quote-totals"
import { computeHomeStats } from "~/lib/quotes/home-stats"
import { quotesService } from "~/services/quotes.service"
import { WeeklyQuotesChart } from "~/components/pages/weekly-quotes-chart"

function QuoteRow({ q }: { q: QuoteListItem }) {
  return (
    <Link
      to={`/presupuestos/${q.id}`}
      className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/50"
    >
      <StatusIcon status={q.status} />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium">{q.client_name}</span>
        <span className="truncate text-xs text-muted-foreground">
          {q.display_number ?? "Borrador"}
          {q.grid_type ? ` · ${GRID_TYPE_LABELS[q.grid_type]}` : ""}
          {q.kit_code ? ` · ${q.kit_code}` : ""}
        </span>
      </span>
      <span className="shrink-0 text-right font-mono text-xs tabular-nums">
        USD {formatUsd(q.total_usd ?? q.subtotal_usd)}
      </span>
    </Link>
  )
}

function StatTile({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 rounded-xl border bg-card card-surface px-3 py-2.5">
      <span className="truncate text-[11px] text-muted-foreground">{label}</span>
      <span className="truncate font-mono text-base font-semibold tabular-nums sm:text-lg">{value}</span>
      <span className="truncate text-[11px] text-muted-foreground">{hint}</span>
    </div>
  )
}

/** Inicio: último presupuesto, recientes y "Nuevo presupuesto" (pensado para el celular). */
export function HomePage() {
  const canCreate = usePermission("quotes", "create")
  const [all, setAll] = React.useState<QuoteListItem[] | null>(null)

  React.useEffect(() => {
    quotesService.list().then(setAll).catch(() => setAll([]))
  }, [])

  // Recientes: la revisión vigente de cada número, por última modificación.
  const quotes = React.useMemo(
    () =>
      all
        ? all
            .filter((q) => q.is_current)
            .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
            .slice(0, 6)
        : null,
    [all],
  )
  const stats = React.useMemo(() => (all ? computeHomeStats(all) : null), [all])
  const last = quotes?.[0] ?? null

  return (
    <div className="stagger-y mx-auto flex w-full max-w-3xl flex-col gap-5">
      <PageHeader
        title="Inicio"
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link to="/clientes">
                <Users data-icon="inline-start" />
                Clientes
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/presupuestos">
                <FileText data-icon="inline-start" />
                Presupuestos
              </Link>
            </Button>
          </>
        }
      />

      {canCreate ? (
        <Button asChild size="lg" className="h-12 text-base">
          <Link to="/presupuestos/nuevo">
            <FilePlus2 data-icon="inline-start" />
            Nuevo presupuesto
          </Link>
        </Button>
      ) : null}

      {stats === null ? (
        <>
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-[4.5rem]" />
            <Skeleton className="h-[4.5rem]" />
            <Skeleton className="h-[4.5rem]" />
          </div>
          <Skeleton className="h-56" />
        </>
      ) : (
        <>
          <div className="stagger-x grid grid-cols-3 gap-2">
            <StatTile label="Este mes" value={String(stats.month.created)} hint="presupuestos" />
            <StatTile
              label="Emitido"
              value={`USD ${Math.round(stats.month.issuedUsd).toLocaleString("es-AR")}`}
              hint={`${stats.month.issued} emitido${stats.month.issued === 1 ? "" : "s"}`}
            />
            <StatTile
              label="Emisión"
              value={stats.month.issueRate != null ? `${stats.month.issueRate} %` : "—"}
              hint="de los creados"
            />
          </div>
          <Card className="gap-3 py-4">
            <CardHeader className="px-4">
              <CardTitle className="text-sm">Presupuestos por semana</CardTitle>
            </CardHeader>
            <CardContent className="px-4">
              <WeeklyQuotesChart weeks={stats.weeks} />
            </CardContent>
          </Card>
        </>
      )}

      {quotes === null ? (
        <Skeleton className="h-40" />
      ) : last ? (
        <Card className="gap-3 py-4">
          <CardHeader className="px-4">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-sm text-muted-foreground">Último presupuesto</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/presupuestos/${last.id}`}>
                  {last.status === "draft" ? "Continuar" : "Abrir"}
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 px-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="flex items-center gap-2">
                  <StatusIcon status={last.status} />
                  <span className="font-mono text-sm">{last.display_number ?? "Borrador"}</span>
                </span>
                <span className="truncate text-lg font-semibold">{last.client_name}</span>
                <span className="text-xs text-muted-foreground">
                  {last.kit_name ?? "Sin kit"} · {formatDateTime(last.issued_at ?? last.updated_at)}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-mono text-lg font-semibold tabular-nums">
                  USD {formatUsd(last.total_usd ?? last.subtotal_usd)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {last.status !== "draft" ? formatArs(last.total_ars) : "borrador, sin IVA"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          Todavía no hay presupuestos.
        </p>
      )}

      {quotes && quotes.length > 1 ? (
        <Card className="gap-2 py-3">
          <CardHeader className="px-4">
            <CardTitle className="text-sm">Recientes</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col px-2">
            {quotes.slice(1).map((q) => (
              <QuoteRow key={q.id} q={q} />
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

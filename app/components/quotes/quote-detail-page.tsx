"use client"

import * as React from "react"
import { Link, useBlocker, useNavigate } from "react-router"
import {
  AlertTriangle,
  ArrowLeft,
  CopyPlus,
  FileCheck2,
  GitBranchPlus,
  History,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react"

import { QuoteItemsEditor, itemsToDraftLines } from "~/components/quotes/quote-items-editor"
import {
  QuoteRequestEditDialog,
  storedToRequest,
  type QuoteRequestEdit,
} from "~/components/quotes/quote-request-edit-dialog"
import { QuoteRequestSummary } from "~/components/quotes/quote-request-summary"
import { QuoteShareMenu } from "~/components/quotes/quote-share-menu"
import { IvaChoiceField, QuoteTotalsCard } from "~/components/quotes/quote-totals-card"
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { HintTooltip } from "~/components/ui/hint-tooltip"
import { Label } from "~/components/ui/label"
import { Skeleton } from "~/components/ui/skeleton"
import { Spinner } from "~/components/ui/spinner"
import { StatusIcon } from "~/components/ui/status-indicator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { TableScrollArea } from "~/components/ui/table-scroll-area"
import { Textarea } from "~/components/ui/textarea"
import { formatAiUsd } from "~/domain/ai/ai.schemas"
import type { QuoteDraftLine } from "~/domain/quotes/quotes.schemas"
import type { CurrentExchangeRate } from "~/domain/settings/settings.schemas"
import { usePermission } from "~/hooks/use-permission"
import { useQuoteActions } from "~/hooks/use-quote-actions"
import { useQuoteShare } from "~/hooks/use-quote-share"
import { formatDate, formatDateTime } from "~/lib/dates"
import { GRID_TYPE_COLORS, GRID_TYPE_LABELS } from "~/lib/products/grid-type.utils"
import {
  computeQuoteTotals,
  formatArs,
  formatUsd,
  ivaChoiceFromPct,
  ivaPctFromChoice,
  revisionLabel,
  type IvaChoice,
} from "~/lib/quotes/quote-totals"
import { appToast } from "~/lib/toast"
import { cn } from "~/lib/utils"
import { quotesService, type QuoteDetail } from "~/services/quotes.service"
import { exchangeRatesService } from "~/services/settings.service"
import { useProductsStore } from "~/stores/products.store"

const errorDescription = (error: unknown) => (error instanceof Error ? error.message : undefined)

type DraftState = {
  lines: QuoteDraftLine[]
  notes: string
  client_notes: string
  iva: IvaChoice
  /** Pedido editado (null = sin cambios). */
  request: QuoteRequestEdit | null
}

export function QuoteDetailPage({ quoteId }: { quoteId: string }) {
  const navigate = useNavigate()
  const canUpdate = usePermission("quotes", "update")
  const canCreate = usePermission("quotes", "create")
  const canDelete = usePermission("quotes", "delete")

  const products = useProductsStore((s) => s.products)
  const categories = useProductsStore((s) => s.categories)
  const productsReady = useProductsStore((s) => s.initialized)
  const fetchProducts = useProductsStore((s) => s.fetchAll)
  const fetchCategories = useProductsStore((s) => s.fetchCategories)

  const [detail, setDetail] = React.useState<QuoteDetail | null>(null)
  const [draft, setDraft] = React.useState<DraftState | null>(null)
  const [dirty, setDirty] = React.useState(false)
  const [rate, setRate] = React.useState<CurrentExchangeRate | null>(null)
  const [busy, setBusy] = React.useState<null | "save" | "issue">(null)
  const [confirmIssue, setConfirmIssue] = React.useState(false)
  const [notFound, setNotFound] = React.useState(false)
  const [editRequest, setEditRequest] = React.useState(false)
  const share = useQuoteShare()

  const catalogById = React.useMemo(() => new Map(products.map((p) => [p.id, p])), [products])

  React.useEffect(() => {
    void fetchProducts({ force: true })
    void fetchCategories()
    exchangeRatesService.getCurrent().then(setRate).catch(() => setRate(null))
  }, [fetchProducts, fetchCategories])

  const load = React.useCallback(async () => {
    try {
      setDetail(await quotesService.getDetail(quoteId))
    } catch {
      setNotFound(true)
    }
  }, [quoteId])

  React.useEffect(() => {
    setDetail(null)
    setDraft(null)
    setDirty(false)
    setNotFound(false)
    void load()
  }, [load])

  const isDraft = detail?.quote.status === "draft"
  const editable = Boolean(isDraft && canUpdate)

  // Estado editable del borrador (precios vigentes del catálogo).
  React.useEffect(() => {
    if (!detail) return
    if (detail.quote.status !== "draft") {
      setDraft(null)
      return
    }
    if (!productsReady) return
    setDraft({
      lines: itemsToDraftLines(detail.items, catalogById),
      notes: detail.quote.notes ?? "",
      client_notes: detail.quote.client_notes ?? "",
      iva: ivaChoiceFromPct(detail.quote.iva_pct),
      request: null,
    })
    setDirty(false)
    // catalogById cambia de identidad al refrescar; alcanza con que el catálogo esté listo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail, productsReady])

  const patchDraft = (patch: Partial<DraftState>) => {
    setDraft((d) => (d ? { ...d, ...patch } : d))
    setDirty(true)
  }

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => dirty && busy === null && currentLocation.pathname !== nextLocation.pathname,
  )
  React.useEffect(() => {
    if (blocker.state !== "blocked") return
    if (window.confirm("Hay cambios sin guardar. ¿Salir igual?")) blocker.proceed()
    else blocker.reset()
  }, [blocker])

  const actions = useQuoteActions({ onDeleted: () => navigate("/presupuestos", { replace: true }) })

  if (notFound) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-sm text-muted-foreground">El presupuesto no existe o fue eliminado.</p>
        <Button variant="outline" size="sm" asChild>
          <Link to="/presupuestos">
            <ArrowLeft data-icon="inline-start" />
            Volver a presupuestos
          </Link>
        </Button>
      </div>
    )
  }

  if (!detail || (isDraft && !draft)) return <Skeleton className="h-[32rem]" />

  const { quote, listItem, revisions } = detail
  const ivaPct = draft ? ivaPctFromChoice(draft.iva) : quote.iva_pct
  const draftTotals = draft ? computeQuoteTotals(draft.lines, ivaPct, rate?.usd_to_ars ?? null) : null
  const totals =
    isDraft && draftTotals
      ? draftTotals
      : {
          subtotal_usd: quote.subtotal_usd ?? 0,
          iva_pct: quote.iva_pct,
          iva_usd: quote.iva_usd ?? 0,
          total_usd: quote.total_usd ?? 0,
          total_ars: quote.total_ars,
        }

  const linesWithoutPrice = draft?.lines.filter((l) => !(l.unit_price_usd > 0)) ?? []
  const issueBlocker = !draft
    ? null
    : draft.lines.length === 0
      ? "Agregá al menos un ítem"
      : linesWithoutPrice.length > 0
        ? `Hay ${linesWithoutPrice.length} ítem(s) sin precio`
        : !rate
          ? "No hay cotización del dólar cargada"
          : null

  const title = listItem.display_number ?? "Borrador"
  const currentIssued = revisions.find((r) => r.is_current && r.status === "issued")
  const newerRevision = revisions.find((r) => r.revision > quote.revision)
  const requestInput = draft?.request?.input ?? quote.input
  const requestSizing = draft?.request ? draft.request.sizing : quote.sizing

  const draftPatch = (d: DraftState) => ({
    iva_pct: ivaPct,
    notes: d.notes,
    client_notes: d.client_notes,
    ...(d.request
      ? {
          input: d.request.input as unknown as Record<string, unknown>,
          sizing: d.request.sizing as unknown as Record<string, unknown> | null,
          grid_type: d.request.grid_type,
        }
      : {}),
  })

  const save = async (): Promise<boolean> => {
    if (!draft) return false
    setBusy("save")
    try {
      const saved = await quotesService.saveDraft(quote.id, draftPatch(draft), draft.lines)
      if (draft.request) {
        // El encabezado (tipo de sistema) y el resumen salen de la fila guardada.
        setDetail((d) => (d ? { ...d, quote: saved, listItem: { ...d.listItem, grid_type: saved.grid_type } } : d))
      }
      setDirty(false)
      appToast.success("Borrador guardado")
      return true
    } catch (error) {
      appToast.error("No se pudo guardar", { description: errorDescription(error) })
      return false
    } finally {
      setBusy(null)
    }
  }

  const issue = async () => {
    if (!draft) return
    setBusy("issue")
    try {
      await quotesService.saveDraft(quote.id, draftPatch(draft), draft.lines)
      await quotesService.issue(quote.id, ivaPct)
      setDirty(false)
      setConfirmIssue(false)
      appToast.success(`Presupuesto ${title} emitido`)
      await load()
    } catch (error) {
      appToast.error("No se pudo emitir", { description: errorDescription(error) })
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-5 pb-20 sm:pb-0">
      {/* Encabezado */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <Link to="/presupuestos" className="inline-flex w-fit items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-3.5" />
            Presupuestos
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <StatusIcon status={isDraft ? "draft" : "issued"} className="size-5" />
            <h1 className="font-mono text-2xl font-semibold tracking-tight">{title}</h1>
            <Badge variant={isDraft ? "outline" : "secondary"}>
              {isDraft ? "Borrador" : "Emitido"}
              {quote.number != null ? ` · ${revisionLabel(quote.revision)}` : ""}
            </Badge>
            {(draft?.request?.grid_type ?? quote.grid_type) ? (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium",
                  GRID_TYPE_COLORS[(draft?.request?.grid_type ?? quote.grid_type)!],
                )}
              >
                {GRID_TYPE_LABELS[(draft?.request?.grid_type ?? quote.grid_type)!]}
              </span>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">
            <Link to={`/clientes/${quote.client_id}`} className="font-medium text-foreground hover:underline">
              {listItem.client_name}
            </Link>
            {listItem.client_phone ? ` · ${listItem.client_phone}` : ""}
            {listItem.kit_code ? ` · Kit ${listItem.kit_code}` : ""}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <QuoteShareMenu
            quoteId={quote.id}
            share={share}
            clientPhone={listItem.client_phone}
            blockedReason={dirty ? "Guardá el borrador antes de compartirlo" : null}
          />
          {canCreate ? (
            <Button variant="outline" size="sm" onClick={() => void actions.onDuplicate(listItem)}>
              <CopyPlus data-icon="inline-start" className="text-violet-600 dark:text-violet-400" />
              Duplicar
            </Button>
          ) : null}
          {isDraft && canDelete ? (
            <Button variant="outline" size="sm" onClick={() => void actions.onDelete(listItem)}>
              <Trash2 data-icon="inline-start" className="text-destructive" />
              Eliminar
            </Button>
          ) : null}
          {!isDraft && quote.is_current && canUpdate ? (
            <Button size="sm" onClick={() => void actions.onRevise(listItem)}>
              <GitBranchPlus data-icon="inline-start" />
              Editar (crea {revisionLabel(Math.max(...revisions.map((r) => r.revision)) + 1)})
            </Button>
          ) : null}
        </div>
      </div>

      {/* Avisos de revisión */}
      {isDraft && quote.revision > 0 && currentIssued ? (
        <Alert>
          <History />
          <AlertTitle>Revisión {revisionLabel(quote.revision)} en borrador</AlertTitle>
          <AlertDescription>
            <span>
              La vigente es{" "}
              <Link to={`/presupuestos/${currentIssued.id}`} className="font-medium underline-offset-2 hover:underline">
                {currentIssued.display_number}
              </Link>
              . Al emitir esta revisión la reemplaza; si la borrás, sigue vigente la anterior.
            </span>
          </AlertDescription>
        </Alert>
      ) : null}
      {!isDraft && newerRevision ? (
        <Alert className="border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          <AlertTriangle className="text-amber-600" />
          <AlertTitle>
            {quote.is_current ? "Hay una revisión en borrador" : "Este presupuesto fue reemplazado"}
          </AlertTitle>
          <AlertDescription className="text-amber-900/90 dark:text-amber-200/90">
            <Link to={`/presupuestos/${newerRevision.id}`} className="font-medium underline-offset-2 hover:underline">
              Ver {newerRevision.display_number} ({newerRevision.status === "draft" ? "borrador" : "emitido"})
            </Link>
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid min-w-0 items-start gap-5 lg:grid-cols-[1fr_20rem]">
        <div className="flex min-w-0 flex-col gap-5">
          {draft ? (
            <QuoteItemsEditor
              lines={draft.lines}
              onChange={(lines) => patchDraft({ lines })}
              products={products}
              categories={categories}
              catalogById={catalogById}
              canEdit={editable}
            />
          ) : (
            <IssuedItemsTable detail={detail} />
          )}

          <div className="grid items-start gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="client-notes">Observaciones para el cliente</Label>
              {draft ? (
                <Textarea
                  id="client-notes"
                  rows={3}
                  disabled={!editable}
                  value={draft.client_notes}
                  onChange={(e) => patchDraft({ client_notes: e.target.value })}
                  placeholder="Salen en el PDF (ej. plazos de instalación)."
                />
              ) : (
                <p className="min-h-9 rounded-md border bg-muted/30 p-2 text-sm whitespace-pre-line">
                  {quote.client_notes || <span className="text-muted-foreground">—</span>}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="notes">Notas internas</Label>
              {draft ? (
                <Textarea
                  id="notes"
                  rows={3}
                  disabled={!editable}
                  value={draft.notes}
                  onChange={(e) => patchDraft({ notes: e.target.value })}
                  placeholder="No se muestran al cliente."
                />
              ) : (
                <p className="min-h-9 rounded-md border bg-muted/30 p-2 text-sm whitespace-pre-line">
                  {quote.notes || <span className="text-muted-foreground">—</span>}
                </p>
              )}
            </div>
          </div>

          <QuoteRequestSummary
            input={requestInput as Record<string, unknown> | null}
            sizing={requestSizing}
            onEdit={editable ? () => setEditRequest(true) : undefined}
          />
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-4">
          <QuoteTotalsCard
            totals={totals}
            usdArs={isDraft ? (rate?.usd_to_ars ?? null) : quote.usd_ars}
            frozen={!isDraft}
            rateLabel={
              isDraft
                ? rate
                  ? `Cotización ${rate.source === "api" ? "oficial" : "manual"} del ${formatDate(rate.rate_date)}. Los precios y el dólar se congelan al emitir.`
                  : "Sin cotización cargada (Configuración → Cotización)."
                : `Dólar ${quote.rate_source === "api" ? "oficial" : "manual"} del ${formatDate(quote.rate_date)} · válido hasta ${formatDate(quote.valid_until)}`
            }
          >
            {draft ? (
              <IvaChoiceField value={draft.iva} disabled={!editable} onChange={(iva) => patchDraft({ iva })} />
            ) : null}
          </QuoteTotalsCard>

          {editable ? (
            <div className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-2 gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur sm:static sm:grid-cols-1 sm:border-0 sm:bg-transparent sm:p-0">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={!dirty || busy !== null}
                onClick={() => void save()}
              >
                {busy === "save" ? <Spinner data-icon="inline-start" /> : <Save data-icon="inline-start" />}
                Guardar borrador
              </Button>
              <HintTooltip content={issueBlocker ?? "Congela precios y cotización"}>
                <span className="flex">
                  <Button
                    type="button"
                    className="w-full"
                    disabled={issueBlocker != null || busy !== null}
                    onClick={() => setConfirmIssue(true)}
                  >
                    <FileCheck2 data-icon="inline-start" />
                    Emitir
                  </Button>
                </span>
              </HintTooltip>
            </div>
          ) : null}

          {revisions.length > 1 ? (
            <Card className="gap-2 py-3">
              <CardHeader className="px-4">
                <CardTitle className="flex items-center gap-1.5 text-sm">
                  <History className="size-4 text-muted-foreground" />
                  Revisiones
                </CardTitle>
              </CardHeader>
              <CardContent className="px-2">
                <ul className="flex flex-col">
                  {revisions.map((r) => (
                    <li key={r.id}>
                      <Link
                        to={`/presupuestos/${r.id}`}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50",
                          r.id === quote.id && "bg-muted",
                        )}
                      >
                        <StatusIcon status={r.status === "issued" ? "issued" : "draft"} />
                        <span className="font-mono text-xs">{revisionLabel(r.revision)}</span>
                        {r.is_current ? <Badge variant="secondary" className="h-4 px-1 text-[10px]">vigente</Badge> : null}
                        <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                          {r.status === "issued" ? `USD ${formatUsd(r.total_usd)}` : "borrador"}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}

          <AiNote quote={quote} costUsd={listItem.ai_cost_usd} requests={listItem.ai_requests_count} />

          <p className="px-1 text-xs text-muted-foreground">
            Creado {formatDateTime(quote.created_at)}
            {quote.issued_at ? ` · emitido ${formatDateTime(quote.issued_at)}` : ""}
          </p>
        </div>
      </div>

      {draft ? (
        <QuoteRequestEditDialog
          open={editRequest}
          onOpenChange={setEditRequest}
          initial={storedToRequest(requestInput as Record<string, unknown> | null, draft.request?.grid_type ?? quote.grid_type)}
          kitGridType={listItem.kit_id ? quote.grid_type : null}
          onApply={(request) => patchDraft({ request })}
        />
      ) : null}

      <AlertDialog open={confirmIssue} onOpenChange={(open) => busy === null && setConfirmIssue(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Emitir el presupuesto?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="flex flex-col gap-2 text-sm">
                <p>
                  Se congelan los precios vigentes y la cotización
                  {rate ? ` (USD 1 = $ ${rate.usd_to_ars.toLocaleString("es-AR")})` : ""} y queda como definitivo.
                  Después no se puede modificar: para cambiarlo se crea una revisión.
                </p>
                <p className="font-medium text-foreground">
                  Total: USD {formatUsd(totals.total_usd)} · {formatArs(totals.total_ars)} (IVA{" "}
                  {ivaPct.toLocaleString("es-AR")} %)
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy !== null}>Cancelar</AlertDialogCancel>
            <Button type="button" disabled={busy !== null} onClick={() => void issue()}>
              {busy === "issue" ? <Spinner data-icon="inline-start" /> : <FileCheck2 data-icon="inline-start" />}
              Emitir
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

/** Ítems de un emitido: precios congelados, solo lectura. */
function IssuedItemsTable({ detail }: { detail: QuoteDetail }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-medium">Ítems</h2>
        <Badge variant="secondary">{detail.items.length}</Badge>
      </div>
      <div className="overflow-hidden rounded-lg border bg-card">
        <TableScrollArea maxHeightClassName="max-h-[min(60svh,40rem)]">
          <Table className="w-full min-w-[32rem] table-fixed">
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow>
                <TableHead className="w-20">Código</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="w-16 text-right">Cant.</TableHead>
                <TableHead className="w-24 text-right">Unitario</TableHead>
                <TableHead className="w-24 text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detail.items.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="truncate font-mono text-xs">{i.code}</TableCell>
                  <TableCell>
                    <HintTooltip content={i.description}>
                      <span className="block truncate">{i.description}</span>
                    </HintTooltip>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{i.qty.toLocaleString("es-AR")}</TableCell>
                  <TableCell className="text-right font-mono text-xs tabular-nums">{formatUsd(i.unit_price_usd)}</TableCell>
                  <TableCell className="text-right font-mono text-xs tabular-nums">{formatUsd(i.subtotal_usd)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableScrollArea>
      </div>
    </section>
  )
}

type StoredAiSummary = {
  select?: { reason?: string; warnings?: string[]; source?: string; followed?: boolean } | null
} | null

/** Sugerencia de la IA guardada al crear el presupuesto + costo de sus consultas. */
function AiNote({ quote, costUsd, requests }: { quote: QuoteDetail["quote"]; costUsd: number; requests: number }) {
  const summary = quote.ai_summary as StoredAiSummary
  const select = summary?.select
  if (!select?.reason && requests === 0) return null
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-violet-200 bg-violet-50/50 p-3 text-xs dark:border-violet-900 dark:bg-violet-950/20">
      <span className="flex items-center gap-1.5 font-medium text-foreground">
        <Sparkles className="size-3.5 text-violet-600 dark:text-violet-400" />
        IA
        {requests > 0 ? (
          <span className="ml-auto font-mono font-normal text-muted-foreground tabular-nums">
            {requests} {requests === 1 ? "consulta" : "consultas"} · {formatAiUsd(costUsd)}
          </span>
        ) : null}
      </span>
      {select?.reason ? (
        <p className="text-muted-foreground">
          {select.source === "rule" ? "Kit sugerido sin IA: " : select.followed === false ? "Sugirió otro kit: " : "Kit sugerido: "}
          {select.reason}
        </p>
      ) : null}
    </div>
  )
}

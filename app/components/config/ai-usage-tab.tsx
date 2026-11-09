"use client"

import * as React from "react"
import { Link } from "react-router"
import type { ColumnDef, ColumnFiltersState, SortingState } from "@tanstack/react-table"
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { AlertTriangle, CircleCheck, CircleX, Plus, Sparkles, Trash2 } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { confirmDialog } from "~/components/ui/confirm-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { DataTableView } from "~/components/ui/data-table"
import { SortableHeader } from "~/components/ui/data-table-sortable-header"
import { DataTableToolbar, FILTER_ALL, type DataTableFilter } from "~/components/ui/data-table-toolbar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { HintTooltip } from "~/components/ui/hint-tooltip"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { MobileRowCard } from "~/components/ui/mobile-row-card"
import { Skeleton } from "~/components/ui/skeleton"
import { Spinner } from "~/components/ui/spinner"
import { Switch } from "~/components/ui/switch"
import { Textarea } from "~/components/ui/textarea"
import {
  AI_STEP_LABELS,
  AiTopupFormSchema,
  formatAiUsd,
  type AiCreditTopup,
  type AiRequestListItem,
  type AiUsageSummary,
} from "~/domain/ai/ai.schemas"
import type { AppSettings } from "~/domain/settings/settings.schemas"
import { formatDate, formatDateTime } from "~/lib/dates"
import { appToast } from "~/lib/toast"
import { cn } from "~/lib/utils"
import { aiService } from "~/services/ai.service"
import { settingsService } from "~/services/settings.service"

const errorDescription = (error: unknown) => (error instanceof Error ? error.message : undefined)
const MODEL_LABEL = (model: string) => model.replace(/^claude-/, "").replace(/-(\d)-(\d)$/, " $1.$2")
const today = () => new Date().toISOString().slice(0, 10)

function Stat({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: "danger" | "ok" }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 rounded-lg border p-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-mono text-lg font-semibold tabular-nums",
          tone === "danger" && "text-destructive",
          tone === "ok" && "text-emerald-700 dark:text-emerald-400",
        )}
      >
        {value}
      </span>
      {hint ? <span className="truncate text-xs text-muted-foreground">{hint}</span> : null}
    </div>
  )
}

/** Configuración → IA: saldo estimado, recargas, ajustes y consultas. */
export function AiUsageTab({
  settings,
  canEdit,
  onSettingsChange,
}: {
  settings: AppSettings
  canEdit: boolean
  onSettingsChange: (s: AppSettings) => void
}) {
  const [summary, setSummary] = React.useState<AiUsageSummary | null>(null)
  const [topups, setTopups] = React.useState<AiCreditTopup[] | null>(null)
  const [requests, setRequests] = React.useState<AiRequestListItem[] | null>(null)
  const [topupOpen, setTopupOpen] = React.useState(false)
  const [threshold, setThreshold] = React.useState(String(settings.ai_low_balance_usd))
  const [savingSettings, setSavingSettings] = React.useState(false)

  const load = React.useCallback(async () => {
    try {
      const [s, t, r] = await Promise.all([aiService.usageSummary(), aiService.listTopups(), aiService.listRequests()])
      setSummary(s)
      setTopups(t)
      setRequests(r)
    } catch {
      appToast.error("No se pudo cargar el consumo de IA")
    }
  }, [])

  React.useEffect(() => {
    void load()
  }, [load])

  const saveSettings = async (patch: Partial<Pick<AppSettings, "ai_enabled" | "ai_low_balance_usd">>) => {
    setSavingSettings(true)
    try {
      onSettingsChange(await settingsService.update(patch))
      appToast.success("Configuración de IA guardada")
    } catch (error) {
      appToast.error("No se pudo guardar", { description: errorDescription(error) })
    } finally {
      setSavingSettings(false)
    }
  }

  const removeTopup = async (t: AiCreditTopup) => {
    const ok = await confirmDialog({
      title: "¿Borrar la recarga?",
      description: `USD ${t.amount_usd} del ${formatDate(t.topped_at)}. El saldo estimado se recalcula.`,
      confirmLabel: "Borrar",
      destructive: true,
    })
    if (!ok) return
    try {
      await aiService.removeTopup(t.id)
      await load()
    } catch (error) {
      appToast.error("No se pudo borrar", { description: errorDescription(error) })
    }
  }

  const low = summary != null && summary.topups_usd > 0 && summary.balance_usd <= settings.ai_low_balance_usd
  const avgCost =
    summary && requests && requests.length > 0
      ? requests.reduce((s, r) => s + (r.cost_usd ?? 0), 0) / Math.max(1, new Set(requests.map((r) => r.quote_id ?? r.id)).size)
      : null

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-violet-600 dark:text-violet-400" />
            Crédito de IA
          </CardTitle>
          <CardDescription>
            Anthropic no informa el saldo por API: se estima con las recargas que registrás acá menos el costo de cada
            consulta (calculado con los tokens reales). Consultar este saldo no tiene costo.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {!summary ? (
            <Skeleton className="h-24" />
          ) : (
            <>
              {low ? (
                <Alert className="border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                  <AlertTriangle className="text-amber-600" />
                  <AlertTitle>Saldo bajo</AlertTitle>
                  <AlertDescription className="text-amber-900/90 dark:text-amber-200/90">
                    Quedan {formatAiUsd(summary.balance_usd, 2)}. Recargá en console.anthropic.com y registrá la recarga
                    acá. Con saldo en cero la app deja de consultar a la IA.
                  </AlertDescription>
                </Alert>
              ) : null}
              <div className="stagger-x grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Stat
                  label="Saldo estimado"
                  value={summary.topups_usd > 0 ? formatAiUsd(summary.balance_usd, 2) : "—"}
                  hint={summary.topups_usd > 0 ? undefined : "Registrá la primera recarga"}
                  tone={summary.topups_usd > 0 ? (low ? "danger" : "ok") : undefined}
                />
                <Stat
                  label="Recargado"
                  value={formatAiUsd(summary.topups_usd, 2)}
                  hint={summary.last_topup_at ? `Última: ${formatDate(summary.last_topup_at)}` : undefined}
                />
                <Stat
                  label="Consumido"
                  value={formatAiUsd(summary.spent_usd, 4)}
                  hint={`${summary.requests_count} consultas${summary.errors_count ? ` · ${summary.errors_count} con error` : ""}`}
                />
                <Stat
                  label="Este mes"
                  value={formatAiUsd(summary.spent_month_usd, 4)}
                  hint={`${summary.requests_month} consultas${avgCost != null ? ` · ~${formatAiUsd(avgCost, 4)} por presupuesto` : ""}`}
                />
              </div>
            </>
          )}

          <div className="grid items-end gap-4 border-t pt-4 sm:grid-cols-[1fr_auto_auto]">
            <label className="flex items-center gap-3 text-sm">
              <Switch
                checked={settings.ai_enabled}
                disabled={!canEdit || savingSettings}
                onCheckedChange={(checked) => void saveSettings({ ai_enabled: checked })}
              />
              <span className="flex flex-col">
                <span className="font-medium">IA habilitada</span>
                <span className="text-xs text-muted-foreground">
                  Apagada, el wizard funciona igual sin los botones de IA.
                </span>
              </span>
            </label>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ai-threshold">Avisar con saldo menor a (USD)</Label>
              <div className="flex gap-2">
                <Input
                  id="ai-threshold"
                  className="w-24 text-right tabular-nums"
                  inputMode="decimal"
                  disabled={!canEdit}
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={!canEdit || savingSettings || Number(threshold.replace(",", ".")) === settings.ai_low_balance_usd}
                  onClick={() => {
                    const n = Number(threshold.replace(",", "."))
                    if (!Number.isFinite(n) || n < 0) return appToast.warning("Ingresá un monto válido")
                    void saveSettings({ ai_low_balance_usd: n })
                  }}
                >
                  Guardar
                </Button>
              </div>
            </div>
            {canEdit ? (
              <Button type="button" onClick={() => setTopupOpen(true)}>
                <Plus data-icon="inline-start" />
                Registrar recarga
              </Button>
            ) : null}
          </div>

          {topups && topups.length > 0 ? (
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Recargas</span>
              <ul className="flex flex-col divide-y rounded-lg border">
                {topups.map((t) => (
                  <li key={t.id} className="flex items-center gap-3 px-3 py-1.5 text-sm">
                    <span className="w-24 shrink-0 tabular-nums text-muted-foreground">{formatDate(t.topped_at)}</span>
                    <span className="w-28 shrink-0 font-mono tabular-nums">{formatAiUsd(t.amount_usd, 2)}</span>
                    <span className="min-w-0 flex-1 truncate text-muted-foreground">{t.notes ?? ""}</span>
                    {canEdit ? (
                      <HintTooltip content="Borrar recarga">
                        <Button type="button" size="icon-sm" variant="ghost" onClick={() => void removeTopup(t)}>
                          <Trash2 className="text-destructive" />
                          <span className="sr-only">Borrar recarga</span>
                        </Button>
                      </HintTooltip>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Consultas a la IA</CardTitle>
          <CardDescription>Cada interpretación de pedido y sugerencia de kit, con tokens y costo.</CardDescription>
        </CardHeader>
        <CardContent>{requests ? <AiRequestsTable data={requests} /> : <Skeleton className="h-64" />}</CardContent>
      </Card>

      <TopupDialog
        open={topupOpen}
        onOpenChange={setTopupOpen}
        onSaved={() => {
          setTopupOpen(false)
          void load()
        }}
      />
    </div>
  )
}

function TopupDialog({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}) {
  const [values, setValues] = React.useState({ amount_usd: "", topped_at: today(), notes: "" })
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setValues({ amount_usd: "", topped_at: today(), notes: "" })
      setErrors({})
    }
  }, [open])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = AiTopupFormSchema.safeParse({ ...values, amount_usd: values.amount_usd.replace(",", ".") })
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])))
      return
    }
    setSaving(true)
    try {
      await aiService.addTopup(parsed.data)
      appToast.success("Recarga registrada")
      onSaved()
    } catch (error) {
      appToast.error("No se pudo registrar", { description: errorDescription(error) })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={(e) => void submit(e)} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Registrar recarga de crédito</DialogTitle>
            <DialogDescription>El monto que cargaste en console.anthropic.com (USD).</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="topup-amount">Monto (USD)</Label>
              <Input
                id="topup-amount"
                inputMode="decimal"
                autoFocus
                value={values.amount_usd}
                onChange={(e) => setValues((v) => ({ ...v, amount_usd: e.target.value }))}
                aria-invalid={Boolean(errors.amount_usd)}
              />
              {errors.amount_usd ? <p className="text-xs text-destructive">{errors.amount_usd}</p> : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="topup-date">Fecha</Label>
              <Input
                id="topup-date"
                type="date"
                value={values.topped_at}
                onChange={(e) => setValues((v) => ({ ...v, topped_at: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="topup-notes">Notas</Label>
            <Textarea
              id="topup-notes"
              rows={2}
              value={values.notes}
              onChange={(e) => setValues((v) => ({ ...v, notes: e.target.value }))}
              placeholder="Opcional (ej. tarjeta, factura)"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Spinner data-icon="inline-start" /> : <Plus data-icon="inline-start" />}
              Registrar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const requestColumns: ColumnDef<AiRequestListItem>[] = [
  {
    id: "created_at",
    accessorKey: "created_at",
    header: ({ column }) => <SortableHeader column={column} title="Fecha" />,
    cell: ({ row }) => (
      <span className="flex items-center gap-1.5 whitespace-nowrap tabular-nums">
        {row.original.error ? (
          <HintTooltip content={row.original.error}>
            <CircleX className="size-4 text-destructive" />
          </HintTooltip>
        ) : (
          <CircleCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
        )}
        {formatDateTime(row.original.created_at)}
      </span>
    ),
  },
  {
    id: "step",
    accessorKey: "step",
    header: ({ column }) => <SortableHeader column={column} title="Consulta" />,
    cell: ({ row }) => (
      <span className="flex flex-col">
        <span>{AI_STEP_LABELS[row.original.step]}</span>
        <span className="text-xs text-muted-foreground">{MODEL_LABEL(row.original.model)}</span>
      </span>
    ),
    filterFn: (row, _id, value) => !value || row.original.step === value,
  },
  {
    id: "quote",
    accessorFn: (r) => r.quote_number ?? "",
    header: ({ column }) => <SortableHeader column={column} title="Presupuesto" />,
    cell: ({ row }) =>
      row.original.step === "kit" ? (
        <span className="text-xs text-muted-foreground">Kit (Kits → Crear con IA)</span>
      ) : row.original.quote_id ? (
        <Link to={`/presupuestos/${row.original.quote_id}`} className="flex flex-col hover:underline">
          <span className="font-mono text-xs">{row.original.quote_number}</span>
          <span className="truncate text-xs text-muted-foreground">{row.original.client_name}</span>
        </Link>
      ) : (
        <span className="text-xs text-muted-foreground">Sin presupuesto</span>
      ),
    filterFn: (row, _id, value) =>
      !value || (value === "linked" ? row.original.quote_id != null : row.original.quote_id == null),
  },
  {
    id: "user",
    accessorFn: (r) => r.user_name ?? "",
    header: ({ column }) => <SortableHeader column={column} title="Usuario" />,
    cell: ({ row }) => <span className="truncate">{row.original.user_name ?? "—"}</span>,
  },
  {
    id: "tokens",
    accessorFn: (r) => (r.tokens_in ?? 0) + (r.tokens_out ?? 0),
    header: ({ column }) => <SortableHeader column={column} title="Tokens" />,
    cell: ({ row }) => (
      <HintTooltip content={`Entrada ${row.original.tokens_in ?? 0} · salida ${row.original.tokens_out ?? 0}`}>
        <span className="font-mono text-xs tabular-nums">
          {(row.original.tokens_in ?? 0).toLocaleString("es-AR")} / {(row.original.tokens_out ?? 0).toLocaleString("es-AR")}
        </span>
      </HintTooltip>
    ),
    meta: { headerClassName: "text-right", cellClassName: "text-right" },
  },
  {
    id: "cost",
    accessorFn: (r) => r.cost_usd ?? 0,
    header: ({ column }) => <SortableHeader column={column} title="Costo" />,
    cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{formatAiUsd(row.original.cost_usd)}</span>,
    meta: { headerClassName: "text-right", cellClassName: "text-right" },
  },
  {
    id: "duration",
    accessorFn: (r) => r.duration_ms ?? 0,
    header: ({ column }) => <SortableHeader column={column} title="Duración" />,
    cell: ({ row }) => (
      <span className="text-xs tabular-nums text-muted-foreground">
        {row.original.duration_ms != null ? `${(row.original.duration_ms / 1000).toLocaleString("es-AR", { maximumFractionDigits: 1 })} s` : "—"}
      </span>
    ),
    meta: { headerClassName: "text-right", cellClassName: "text-right" },
  },
  {
    id: "result",
    accessorFn: (r) => (r.error ? "error" : "ok"),
    header: () => null,
    cell: () => null,
    filterFn: (row, _id, value) => !value || (value === "error") === Boolean(row.original.error),
  },
  {
    id: "search",
    accessorFn: (r) => [r.quote_number, r.client_name, r.user_name, r.model].filter(Boolean).join(" ").toLowerCase(),
    header: () => null,
    cell: () => null,
    filterFn: (row, id, value) => {
      const q = String(value ?? "").trim().toLowerCase()
      return !q || String(row.getValue(id)).includes(q)
    },
  },
]

function AiRequestsTable({ data }: { data: AiRequestListItem[] }) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "created_at", desc: true }])

  const table = useReactTable({
    initialState: { columnVisibility: { result: false, search: false }, pagination: { pageIndex: 0, pageSize: 20 } },
    data,
    columns: requestColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    enableMultiSort: true,
    state: { columnFilters, sorting },
  })

  const filterValue = (id: string) => (table.getColumn(id)?.getFilterValue() as string | undefined) || FILTER_ALL
  const setFilter = (id: string) => (value: string) =>
    table.getColumn(id)?.setFilterValue(value === FILTER_ALL ? "" : value)

  const filters: DataTableFilter[] = [
    {
      id: "step",
      label: "Consulta",
      allLabel: "Todas las consultas",
      value: filterValue("step"),
      options: [
        { value: "extract", label: AI_STEP_LABELS.extract },
        { value: "select", label: AI_STEP_LABELS.select },
        { value: "kit", label: AI_STEP_LABELS.kit },
      ],
      onChange: setFilter("step"),
    },
    {
      id: "quote",
      label: "Presupuesto",
      allLabel: "Con y sin presupuesto",
      value: filterValue("quote"),
      options: [
        { value: "linked", label: "Con presupuesto" },
        { value: "unlinked", label: "Sin presupuesto" },
      ],
      onChange: setFilter("quote"),
    },
    {
      id: "result",
      label: "Resultado",
      allLabel: "OK y con error",
      value: filterValue("result"),
      options: [
        { value: "ok", label: "OK" },
        { value: "error", label: "Con error" },
      ],
      onChange: setFilter("result"),
    },
  ]

  const filteredCost = table.getFilteredRowModel().rows.reduce((s, r) => s + (r.original.cost_usd ?? 0), 0)

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-0 basis-full sm:basis-0 sm:flex-1">
          <DataTableToolbar
            search={(table.getColumn("search")?.getFilterValue() as string | undefined) ?? ""}
            onSearchChange={(value) => table.getColumn("search")?.setFilterValue(value)}
            searchPlaceholder="Buscar por presupuesto, cliente o usuario..."
            filters={filters}
            onClearFilters={() => table.resetColumnFilters(true)}
          />
        </div>
        <Badge variant="secondary" className="font-mono">
          Total filtrado: {formatAiUsd(filteredCost)}
        </Badge>
      </div>
      <DataTableView
        table={table}
        columnCount={table.getVisibleLeafColumns().length}
        emptyMessage={data.length === 0 ? "Todavía no hay consultas a la IA" : "Ninguna consulta coincide con los filtros"}
        showPagination
        showRowCount
        totalCount={data.length}
        rowCountLabel="consultas"
        maxHeightClassName="max-h-[min(60svh,36rem)]"
        mobileCard={(row) => {
          const r = row.original
          return (
            <MobileRowCard
              to={r.quote_id && r.step !== "kit" ? `/presupuestos/${r.quote_id}` : undefined}
              leading={
                r.error ? (
                  <CircleX className="size-4 shrink-0 text-destructive" aria-label="Con error" />
                ) : (
                  <CircleCheck className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-label="OK" />
                )
              }
              title={`${AI_STEP_LABELS[r.step]} · ${MODEL_LABEL(r.model)}`}
              subtitle={[
                formatDateTime(r.created_at),
                r.step === "kit" ? "Kit" : r.quote_number ? `${r.quote_number} ${r.client_name ?? ""}`.trim() : "Sin presupuesto",
                r.user_name,
              ]
                .filter(Boolean)
                .join(" · ")}
              meta={
                <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                  {(r.tokens_in ?? 0).toLocaleString("es-AR")} / {(r.tokens_out ?? 0).toLocaleString("es-AR")} tokens
                  {r.duration_ms != null
                    ? ` · ${(r.duration_ms / 1000).toLocaleString("es-AR", { maximumFractionDigits: 1 })} s`
                    : ""}
                  {r.error ? <span className="block font-sans text-destructive">{r.error}</span> : null}
                </span>
              }
              trailing={<span className="font-mono text-sm font-semibold tabular-nums">{formatAiUsd(r.cost_usd)}</span>}
            />
          )
        }}
      />
    </div>
  )
}

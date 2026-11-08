"use client"

import * as React from "react"
import { FileUp, History, Upload } from "lucide-react"

import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Spinner } from "~/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { TableScrollArea } from "~/components/ui/table-scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import {
  buildPriceImportRows,
  summarizePriceImport,
  toPriceImportPayload,
  type PriceImportRow,
  type PriceImportStatus,
} from "~/lib/prices/price-import"
import {
  PRICE_IMPORT_ACCEPT,
  readPriceMatrix,
} from "~/lib/prices/price-import.file"
import { appToast } from "~/lib/toast"
import { cn } from "~/lib/utils"
import {
  pricesService,
  type PriceImportLog,
  type PriceImportResult,
} from "~/services/prices.service"
import { useProductsStore } from "~/stores/products.store"

const STATUS_META: Record<PriceImportStatus, { label: string; className: string }> = {
  update: { label: "Se actualiza", className: "text-emerald-700 dark:text-emerald-400" },
  unchanged: { label: "Sin cambio", className: "text-muted-foreground" },
  not_found: { label: "No encontrado", className: "text-amber-700 dark:text-amber-400" },
  invalid: { label: "Inválido", className: "text-destructive" },
}

const usd = (value: number | null | undefined) =>
  value == null
    ? "—"
    : value.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

type PriceImportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PriceImportDialog({ open, onOpenChange }: PriceImportDialogProps) {
  const products = useProductsStore((s) => s.products)
  const refreshProducts = useProductsStore((s) => s.fetchAll)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const [fileName, setFileName] = React.useState<string | null>(null)
  const [rows, setRows] = React.useState<PriceImportRow[]>([])
  const [filter, setFilter] = React.useState<PriceImportStatus | "all">("all")
  const [reading, setReading] = React.useState(false)
  const [applying, setApplying] = React.useState(false)
  const [result, setResult] = React.useState<PriceImportResult | null>(null)
  const [history, setHistory] = React.useState<PriceImportLog[] | null>(null)

  const catalog = React.useMemo(
    () =>
      new Map(
        products.map((p) => [p.product_code, { name: p.name, price_usd: p.price_usd }]),
      ),
    [products],
  )
  const summary = React.useMemo(() => summarizePriceImport(rows), [rows])
  const visibleRows = filter === "all" ? rows : rows.filter((r) => r.status === filter)

  const reset = () => {
    setFileName(null)
    setRows([])
    setFilter("all")
    setResult(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  const handleOpenChange = (next: boolean) => {
    if (applying) return
    if (!next) reset()
    onOpenChange(next)
  }

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setReading(true)
    setResult(null)
    try {
      const matrix = await readPriceMatrix(file)
      const parsed = buildPriceImportRows(matrix, catalog)
      if (parsed.length === 0) {
        appToast.warning("El archivo no tiene filas con código y precio")
      }
      setFileName(file.name)
      setRows(parsed)
      setFilter("all")
    } catch (error) {
      appToast.error("No se pudo leer el archivo", {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setReading(false)
    }
  }

  const handleApply = async () => {
    if (!fileName) return
    setApplying(true)
    try {
      const res = await pricesService.applyImport(toPriceImportPayload(rows), fileName)
      setResult(res)
      setHistory(null)
      appToast.success(`Precios actualizados: ${res.rows_updated}`)
      void refreshProducts({ force: true })
    } catch (error) {
      appToast.error("No se pudieron aplicar los precios", {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setApplying(false)
    }
  }

  const loadHistory = React.useCallback(async () => {
    try {
      setHistory(await pricesService.listImports())
    } catch {
      setHistory([])
      appToast.error("No se pudo cargar el historial")
    }
  }, [])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[90svh] flex-col gap-4 sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Actualizar precios</DialogTitle>
          <DialogDescription>
            Excel o CSV con dos columnas: código de artículo y precio en USD (sin IVA).
            Los códigos se aceptan con o sin cero inicial.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="import"
          className="min-h-0 flex-1"
          onValueChange={(value) => {
            if (value === "history" && history === null) void loadHistory()
          }}
        >
          <TabsList>
            <TabsTrigger value="import">
              <FileUp data-icon="inline-start" />
              Importar
            </TabsTrigger>
            <TabsTrigger value="history">
              <History data-icon="inline-start" />
              Historial
            </TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="flex min-h-0 flex-col gap-3">
            <input
              ref={inputRef}
              type="file"
              accept={PRICE_IMPORT_ACCEPT}
              className="hidden"
              onChange={(e) => void handleFile(e.target.files?.[0])}
            />

            {rows.length === 0 && !result ? (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={reading}
                className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-sm text-muted-foreground transition-colors hover:bg-muted/50"
              >
                {reading ? <Spinner /> : <Upload className="size-6" />}
                <span className="font-medium text-foreground">
                  {reading ? "Leyendo archivo…" : "Elegir archivo"}
                </span>
                <span>.xlsx, .xls o .csv — ej.: 037046 ; 152,40</span>
              </button>
            ) : null}

            {result ? (
              <div className="flex flex-col gap-2 rounded-lg border p-4 text-sm">
                <p className="font-medium">Importación aplicada ({fileName})</p>
                <p>
                  Actualizados: <strong>{result.rows_updated}</strong> · Sin cambio:{" "}
                  {result.rows_unchanged} · No encontrados: {result.codes_not_found.length}
                </p>
                {result.codes_not_found.length > 0 ? (
                  <p className="text-xs break-all text-muted-foreground">
                    {result.codes_not_found.join(", ")}
                  </p>
                ) : null}
              </div>
            ) : null}

            {rows.length > 0 && !result ? (
              <>
                <div className="flex flex-wrap items-center gap-1.5">
                  <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
                    Todas {summary.total}
                  </FilterChip>
                  {(Object.keys(STATUS_META) as PriceImportStatus[]).map((status) => (
                    <FilterChip
                      key={status}
                      active={filter === status}
                      onClick={() => setFilter(status)}
                      disabled={summary[status] === 0}
                    >
                      {STATUS_META[status].label} {summary[status]}
                    </FilterChip>
                  ))}
                  <span className="ml-auto truncate text-xs text-muted-foreground">
                    {fileName}
                  </span>
                </div>

                <div className="min-h-0 overflow-hidden rounded-lg border">
                  <TableScrollArea maxHeightClassName="max-h-[45svh]">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-background">
                      <TableRow>
                        <TableHead>Fila</TableHead>
                        <TableHead>Código</TableHead>
                        <TableHead>Producto</TableHead>
                        <TableHead className="text-right">Actual</TableHead>
                        <TableHead className="text-right">Nuevo</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visibleRows.slice(0, 500).map((row) => (
                        <TableRow key={`${row.line}-${row.code}`}>
                          <TableCell className="text-muted-foreground tabular-nums">
                            {row.line}
                          </TableCell>
                          <TableCell className="font-mono">{row.code || row.rawCode}</TableCell>
                          <TableCell className="max-w-56 truncate" title={row.productName}>
                            {row.productName ?? "—"}
                          </TableCell>
                          <TableCell className="text-right font-mono tabular-nums">
                            {usd(row.currentPrice)}
                          </TableCell>
                          <TableCell className="text-right font-mono tabular-nums">
                            {usd(row.price)}
                          </TableCell>
                          <TableCell className={cn("text-xs", STATUS_META[row.status].className)}>
                            {row.issue ?? STATUS_META[row.status].label}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  </TableScrollArea>
                </div>
                {visibleRows.length > 500 ? (
                  <p className="text-xs text-muted-foreground">
                    Se muestran 500 de {visibleRows.length} filas.
                  </p>
                ) : null}
              </>
            ) : null}
          </TabsContent>

          <TabsContent value="history" className="min-h-0">
            {history === null ? (
              <div className="flex justify-center p-8">
                <Spinner />
              </div>
            ) : history.length === 0 ? (
              <p className="p-8 text-center text-sm text-muted-foreground">
                Todavía no hay importaciones.
              </p>
            ) : (
              <div className="overflow-hidden rounded-lg border">
              <TableScrollArea maxHeightClassName="max-h-[55svh]">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-background">
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Archivo</TableHead>
                    <TableHead className="text-right">Filas</TableHead>
                    <TableHead className="text-right">Actualizados</TableHead>
                    <TableHead className="text-right">No encontrados</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{new Date(log.created_at).toLocaleString("es-AR")}</TableCell>
                      <TableCell className="max-w-48 truncate" title={log.file_name}>
                        {log.file_name}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{log.rows_total}</TableCell>
                      <TableCell className="text-right tabular-nums">{log.rows_updated}</TableCell>
                      <TableCell
                        className="text-right tabular-nums"
                        title={log.codes_not_found.join(", ")}
                      >
                        {log.codes_not_found.length}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </TableScrollArea>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          {rows.length > 0 || result ? (
            <Button variant="ghost" onClick={reset} disabled={applying}>
              Otro archivo
            </Button>
          ) : null}
          {rows.length > 0 && !result ? (
            <Button
              onClick={() => void handleApply()}
              disabled={applying || summary.update === 0}
            >
              {applying ? <Spinner data-icon="inline-start" /> : null}
              Actualizar {summary.update} precio{summary.update === 1 ? "" : "s"}
            </Button>
          ) : (
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cerrar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function FilterChip({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Badge
      asChild
      variant={active ? "default" : "outline"}
      className={cn("h-6 cursor-pointer", disabled && "pointer-events-none opacity-40")}
    >
      <button type="button" onClick={onClick}>
        {children}
      </button>
    </Badge>
  )
}

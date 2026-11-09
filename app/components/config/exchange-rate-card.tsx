"use client"

import * as React from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { RefreshCw } from "lucide-react"

import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Skeleton } from "~/components/ui/skeleton"
import { Spinner } from "~/components/ui/spinner"
import { Switch } from "~/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { TableScrollArea } from "~/components/ui/table-scroll-area"
import {
  ManualRateFormSchema,
  type AppSettings,
  type CurrentExchangeRate,
  type ExchangeRate,
  type ManualRateFormValues,
} from "~/domain/settings/settings.schemas"
import { appToast } from "~/lib/toast"
import { exchangeRatesService, settingsService } from "~/services/settings.service"

const ars = (value: number) =>
  value.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const SOURCE_LABEL = { api: "API (dolarapi)", manual: "Manual" } as const

export function ExchangeRateCard({
  settings,
  canEditMode,
  canAddRate,
  onSettingsChange,
}: {
  settings: AppSettings
  canEditMode: boolean
  canAddRate: boolean
  onSettingsChange: (settings: AppSettings) => void
}) {
  const [current, setCurrent] = React.useState<CurrentExchangeRate | null>(null)
  const [history, setHistory] = React.useState<ExchangeRate[]>([])
  const [loading, setLoading] = React.useState(true)
  const [fetching, setFetching] = React.useState(false)
  const [savingManual, setSavingManual] = React.useState(false)
  const [savingMode, setSavingMode] = React.useState(false)

  const form = useForm<ManualRateFormValues>({
    resolver: zodResolver(ManualRateFormSchema as never) as Resolver<ManualRateFormValues>,
    defaultValues: { usd_to_ars: undefined as unknown as number, notes: "" },
  })

  const load = React.useCallback(async () => {
    try {
      const [cur, list] = await Promise.all([
        exchangeRatesService.getCurrent(),
        exchangeRatesService.list(),
      ])
      setCurrent(cur)
      setHistory(list)
    } catch {
      appToast.error("No se pudo cargar la cotización")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void load()
  }, [load, settings.rate_mode])

  const handleFetch = async () => {
    setFetching(true)
    try {
      const rate = await exchangeRatesService.fetchFromApi()
      appToast.success(`Dólar oficial: $ ${ars(rate.usd_to_ars)}`)
      await load()
    } catch (error) {
      appToast.error("No se pudo obtener la cotización", {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setFetching(false)
    }
  }

  const handleManual = form.handleSubmit(async (values) => {
    setSavingManual(true)
    try {
      await exchangeRatesService.addManual(values.usd_to_ars, values.notes)
      // Cargar un valor manual implica usarlo: se pasa a modo manual.
      if (settings.rate_mode !== "manual" && canEditMode) {
        onSettingsChange(await settingsService.update({ rate_mode: "manual" }))
      }
      form.reset({ usd_to_ars: undefined as unknown as number, notes: "" })
      appToast.success("Cotización manual guardada")
      await load()
    } catch (error) {
      appToast.error("No se pudo guardar", {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setSavingManual(false)
    }
  })

  const handleMode = async (manual: boolean) => {
    setSavingMode(true)
    try {
      onSettingsChange(await settingsService.update({ rate_mode: manual ? "manual" : "api" }))
    } catch {
      appToast.error("No se pudo cambiar el modo")
    } finally {
      setSavingMode(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cotización del dólar</CardTitle>
        <CardDescription>
          Los presupuestos guardan la cotización vigente al emitirse. Fuente automática:
          dólar oficial venta (dolarapi).
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4">
          {loading ? (
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
          ) : current ? (
            <div>
              <p className="text-2xl font-semibold tabular-nums">$ {ars(current.usd_to_ars)}</p>
              <p className="text-xs text-muted-foreground">
                {SOURCE_LABEL[current.source]} ·{" "}
                {new Date(current.fetched_at).toLocaleString("es-AR")}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Todavía no hay cotización. Sin cotización no se pueden emitir presupuestos.
            </p>
          )}
          <Button variant="outline" size="sm" onClick={() => void handleFetch()} disabled={fetching}>
            {fetching ? <Spinner data-icon="inline-start" /> : <RefreshCw data-icon="inline-start" className="text-sky-600 dark:text-sky-400" />}
            Actualizar desde API
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Switch
            id="rate-mode"
            checked={settings.rate_mode === "manual"}
            onCheckedChange={(checked) => void handleMode(checked)}
            disabled={!canEditMode || savingMode}
          />
          <Label htmlFor="rate-mode" className="flex flex-col items-start gap-0.5">
            <span>Usar cotización manual</span>
            <span className="text-xs font-normal text-muted-foreground">
              {settings.rate_mode === "manual"
                ? "Se usa el último valor cargado a mano."
                : "Se usa el último valor de la API (si no hay, el manual)."}
            </span>
          </Label>
        </div>

        {canAddRate ? (
          <Form {...form}>
            <form onSubmit={handleManual} className="flex flex-wrap items-end gap-3">
              <FormField
                control={form.control}
                name="usd_to_ars"
                render={({ field }) => (
                  <FormItem className="w-40">
                    <FormLabel>Valor manual (ARS)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        inputMode="decimal"
                        placeholder="1250"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="min-w-40 flex-1">
                    <FormLabel>Nota</FormLabel>
                    <FormControl>
                      <Input placeholder="Opcional" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={savingManual}>
                {savingManual ? <Spinner data-icon="inline-start" /> : null}
                Guardar valor
              </Button>
            </form>
          </Form>
        ) : null}

        {loading ? (
          <Skeleton className="h-48" />
        ) : history.length > 0 ? (
          <div className="overflow-hidden rounded-lg border">
            <TableScrollArea maxHeightClassName="max-h-96">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-card">
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Fuente</TableHead>
                  <TableHead className="text-right">ARS</TableHead>
                  <TableHead>Nota</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((rate) => (
                  <TableRow key={rate.id}>
                    <TableCell>{new Date(rate.fetched_at).toLocaleString("es-AR")}</TableCell>
                    <TableCell>
                      <Badge variant={rate.source === "api" ? "secondary" : "outline"}>
                        {SOURCE_LABEL[rate.source]}
                      </Badge>
                      {current?.id === rate.id ? (
                        <Badge className="ml-1">Vigente</Badge>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {ars(rate.usd_to_ars)}
                    </TableCell>
                    <TableCell className="max-w-48 truncate text-muted-foreground">
                      {rate.notes ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </TableScrollArea>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

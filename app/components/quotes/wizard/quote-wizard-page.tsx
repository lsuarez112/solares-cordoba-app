"use client"

import * as React from "react"
import { Link, useNavigate, useSearchParams } from "react-router"
import { AlertTriangle, ArrowLeft, ArrowRight, Check, FilePlus2 } from "lucide-react"

import { ClientPicker } from "~/components/quotes/wizard/client-picker"
import { KitChoiceStep, type KitChoice } from "~/components/quotes/wizard/kit-choice-step"
import { QuoteRequestForm } from "~/components/quotes/wizard/quote-request-form"
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { Skeleton } from "~/components/ui/skeleton"
import { Spinner } from "~/components/ui/spinner"
import type { ClientListItem } from "~/domain/clients/clients.schemas"
import type { Kit } from "~/domain/kits/kits.schemas"
import type { AppliancePreset, KitCandidate, SolarZone } from "~/domain/quotes/quotes.schemas"
import type { AppSettings } from "~/domain/settings/settings.schemas"
import { usePermission } from "~/hooks/use-permission"
import {
  computeSizing,
  emptyQuoteRequest,
  missingMinimums,
  type QuoteRequest,
  type SizingParams,
} from "~/lib/sizing/sizing"
import { appToast } from "~/lib/toast"
import { cn } from "~/lib/utils"
import { clientsService } from "~/services/clients.service"
import { kitsService } from "~/services/kits.service"
import { quotesService } from "~/services/quotes.service"
import { settingsService } from "~/services/settings.service"

type Step = 0 | 1 | 2
const STEPS = ["Cliente", "Pedido", "Kit"] as const

type WizardData = {
  clients: ClientListItem[]
  zones: SolarZone[]
  presets: AppliancePreset[]
  settings: AppSettings
  kits: Kit[]
}

export function sizingParamsFromSettings(s: AppSettings): SizingParams {
  return {
    efficiency: s.system_efficiency,
    default_hsp: s.default_hsp,
    dod_lifepo4: s.dod_lifepo4,
    dod_lead: s.dod_lead,
    battery_eff_lifepo4: s.battery_eff_lifepo4,
    battery_eff_lead: s.battery_eff_lead,
  }
}

function Stepper({ step, onGo }: { step: Step; onGo: (s: Step) => void }) {
  return (
    <ol className="flex items-center gap-2 text-sm">
      {STEPS.map((label, i) => {
        const done = i < step
        const current = i === step
        return (
          <li key={label} className="flex items-center gap-2">
            {i > 0 ? <span className="h-px w-4 bg-border sm:w-8" /> : null}
            <button
              type="button"
              disabled={i > step}
              onClick={() => onGo(i as Step)}
              className={cn(
                "flex items-center gap-1.5 rounded-full py-1 pr-2.5 pl-1 disabled:cursor-default",
                current ? "bg-primary/10 font-medium text-foreground" : "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "flex size-5 items-center justify-center rounded-full border text-xs tabular-nums",
                  current && "border-primary bg-primary text-primary-foreground",
                  done && "border-emerald-600 bg-emerald-600 text-white",
                )}
              >
                {done ? <Check className="size-3" /> : i + 1}
              </span>
              {label}
            </button>
          </li>
        )
      })}
    </ol>
  )
}

export function QuoteWizardPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const canCreateClient = usePermission("clients", "create")

  const [data, setData] = React.useState<WizardData | null>(null)
  const [step, setStep] = React.useState<Step>(0)
  const [clientId, setClientId] = React.useState<string | null>(params.get("cliente"))
  const [request, setRequest] = React.useState<QuoteRequest>(emptyQuoteRequest)
  const [showMissing, setShowMissing] = React.useState(false)
  const [candidates, setCandidates] = React.useState<KitCandidate[] | null>(null)
  const [choice, setChoice] = React.useState<KitChoice>({ kitId: null, optionCodes: [] })
  const [creating, setCreating] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false
    Promise.all([
      clientsService.list(),
      quotesService.solarZones(),
      quotesService.appliancePresets(),
      settingsService.get(),
      kitsService.list(),
    ])
      .then(([clients, zones, presets, settings, kits]) => {
        if (cancelled) return
        setData({ clients, zones, presets, settings, kits })
        // Con cliente preelegido (desde la ficha) se arranca en el pedido.
        if (clients.some((c) => c.id === params.get("cliente"))) setStep(1)
      })
      .catch(() => appToast.error("No se pudieron cargar los datos del presupuesto"))
    return () => {
      cancelled = true
    }
    // Solo al montar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const zone = data?.zones.find((z) => z.id === request.zone_id) ?? null
  const sizing = React.useMemo(
    () => (data ? computeSizing(request, sizingParamsFromSettings(data.settings), zone) : null),
    [data, request, zone],
  )
  const missing = missingMinimums(request)
  const client = data?.clients.find((c) => c.id === clientId) ?? null

  // Al entrar al paso Kit: candidatos de la base para el dimensionamiento actual.
  React.useEffect(() => {
    if (step !== 2 || !sizing || !request.grid_type) return
    let cancelled = false
    setCandidates(null)
    quotesService
      .suggestKits({
        grid_type: request.grid_type,
        kwp: sizing.target_kwp,
        battery_kwh: sizing.battery_kwh,
        phases: request.phases,
      })
      .then((rows) => {
        if (cancelled) return
        setCandidates(rows)
        setChoice((prev) =>
          prev.kitId && rows.some((r) => r.kit_id === prev.kitId)
            ? prev
            : { kitId: rows[0]?.kit_id ?? null, optionCodes: [] },
        )
      })
      .catch(() => {
        if (cancelled) return
        setCandidates([])
        appToast.error("No se pudieron buscar kits")
      })
    return () => {
      cancelled = true
    }
  }, [step, sizing, request.grid_type, request.phases])

  const next = () => {
    if (step === 0) {
      if (!clientId) return appToast.warning("Elegí o creá un cliente")
      setStep(1)
      return
    }
    if (step === 1) {
      if (missing.length > 0) {
        setShowMissing(true)
        return
      }
      setStep(2)
    }
  }

  const create = async () => {
    if (!data || !clientId) return
    setCreating(true)
    try {
      const input = { ...request, zone_name: zone?.name ?? null }
      const id = choice.kitId
        ? await quotesService.createFromKit({
            client_id: clientId,
            kit_id: choice.kitId,
            option_codes: choice.optionCodes,
            input,
            sizing,
          })
        : await quotesService.createEmpty({
            client_id: clientId,
            grid_type: request.grid_type,
            input,
            sizing,
            iva_pct: data.settings.default_iva_pct,
            validity_days: data.settings.default_validity_days,
          })
      appToast.success("Borrador creado: revisá los ítems y emitilo")
      navigate(`/presupuestos/${id}`, { replace: true })
    } catch (error) {
      appToast.error("No se pudo crear el presupuesto", {
        description: error instanceof Error ? error.message : undefined,
      })
      setCreating(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl min-w-0 flex-col gap-5 pb-20 sm:pb-0">
      <div className="flex flex-col gap-3">
        <Link
          to="/presupuestos"
          className="inline-flex w-fit items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Presupuestos
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Nuevo presupuesto</h1>
          <Stepper step={step} onGo={setStep} />
        </div>
        {client && step > 0 ? (
          <p className="text-sm text-muted-foreground">
            Cliente: <span className="font-medium text-foreground">{client.name}</span>
            {client.phone ? ` · ${client.phone}` : ""}
          </p>
        ) : null}
      </div>

      <Card className="py-4">
        <CardContent className="px-4">
          {!data ? (
            <Skeleton className="h-64" />
          ) : step === 0 ? (
            <ClientPicker
              clients={data.clients}
              selectedId={clientId}
              canCreate={canCreateClient}
              onSelect={(c) => {
                setClientId(c.id)
                setStep(1)
              }}
              onCreated={(c) => setData((d) => (d ? { ...d, clients: [c, ...d.clients] } : d))}
            />
          ) : step === 1 ? (
            <div className="flex flex-col gap-4">
              <QuoteRequestForm value={request} onChange={setRequest} zones={data.zones} presets={data.presets} />
              {showMissing && missing.length > 0 ? (
                <Alert className="border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                  <AlertTriangle className="text-amber-600" />
                  <AlertTitle>Faltan datos mínimos para dimensionar</AlertTitle>
                  <AlertDescription className="text-amber-900/90 dark:text-amber-200/90">
                    <ul className="list-disc pl-4">
                      {missing.map((m) => (
                        <li key={m}>{m}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              ) : null}
            </div>
          ) : sizing ? (
            <KitChoiceStep
              sizing={sizing}
              candidates={candidates}
              kits={data.kits}
              budgetCap={request.budget_cap_usd}
              value={choice}
              onChange={setChoice}
            />
          ) : null}
        </CardContent>
      </Card>

      {/* Navegación: fija abajo en el celular. */}
      {data && step > 0 ? (
        <div className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0">
          <Button type="button" variant="outline" onClick={() => setStep((s) => (s - 1) as Step)}>
            <ArrowLeft data-icon="inline-start" />
            Atrás
          </Button>
          {step === 1 ? (
            <Button type="button" onClick={next}>
              Ver kits
              <ArrowRight data-icon="inline-end" />
            </Button>
          ) : (
            <Button type="button" disabled={creating || candidates === null} onClick={() => void create()}>
              {creating ? <Spinner data-icon="inline-start" /> : <FilePlus2 data-icon="inline-start" />}
              Crear borrador
            </Button>
          )}
        </div>
      ) : null}
    </div>
  )
}

"use client"

import * as React from "react"
import { Building2, ImageOff, ImagePlus } from "lucide-react"

import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Label } from "~/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Spinner } from "~/components/ui/spinner"
import type { AppSettings, QuoteLogoMode } from "~/domain/settings/settings.schemas"
import { validateCompanyLogoFile } from "~/lib/companies/company-logo.utils"
import { resolveQuoteLogoUrl } from "~/lib/settings/quote-logo"
import { appToast } from "~/lib/toast"
import { settingsService } from "~/services/settings.service"
import { useCompanyStore } from "~/stores/company.store"

const MODE_LABELS: Record<QuoteLogoMode, string> = {
  company: "Usar el logo de la empresa",
  custom: "Usar otro logo para el presupuesto",
  none: "Sin logo",
}

/** Logo del PDF del presupuesto: el de la empresa (sidebar), uno propio o ninguno. */
export function QuoteLogoCard({
  settings,
  canEdit,
  onSaved,
}: {
  settings: AppSettings
  canEdit: boolean
  onSaved: (settings: AppSettings) => void
}) {
  const company = useCompanyStore((s) => s.company)
  const fetchCompany = useCompanyStore((s) => s.fetch)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [busy, setBusy] = React.useState(false)

  React.useEffect(() => {
    void fetchCompany()
  }, [fetchCompany])

  const preview = resolveQuoteLogoUrl(settings, company?.logo_url)

  const save = async (patch: Partial<AppSettings>, message: string) => {
    setBusy(true)
    try {
      onSaved(await settingsService.update(patch))
      appToast.success(message)
    } catch (error) {
      appToast.error("No se pudo guardar", {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setBusy(false)
    }
  }

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    const invalid = validateCompanyLogoFile(file)
    if (invalid) {
      appToast.error(invalid)
      return
    }
    setBusy(true)
    try {
      const url = await settingsService.uploadQuoteLogo(file)
      onSaved(await settingsService.update({ quote_logo_mode: "custom", quote_logo_url: url }))
      appToast.success("Logo del presupuesto actualizado")
    } catch (error) {
      appToast.error("No se pudo subir el logo", {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logo del presupuesto</CardTitle>
        <CardDescription>
          El logo de la empresa es el que se ve en el menú lateral. Para el PDF podés usar ese
          mismo, cargar otro (por ejemplo, horizontal o en alta resolución) o no mostrar logo.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex h-24 w-full shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-white sm:w-48">
          {busy ? (
            <Spinner />
          ) : preview ? (
            <img src={preview} alt="Logo del presupuesto" className="size-full object-contain p-2" />
          ) : settings.quote_logo_mode === "none" ? (
            <ImageOff className="size-8 text-muted-foreground/60" />
          ) : (
            <Building2 className="size-8 text-muted-foreground/60" />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="quote-logo-mode">Origen del logo</Label>
            <Select
              value={settings.quote_logo_mode}
              disabled={!canEdit || busy}
              onValueChange={(value) => {
                const mode = value as QuoteLogoMode
                if (mode === "custom" && !settings.quote_logo_url) {
                  inputRef.current?.click()
                  return
                }
                void save({ quote_logo_mode: mode }, "Logo del presupuesto actualizado")
              }}
            >
              <SelectTrigger id="quote-logo-mode" className="w-full sm:w-80">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(MODE_LABELS) as QuoteLogoMode[]).map((mode) => (
                  <SelectItem key={mode} value={mode}>
                    {MODE_LABELS[mode]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {settings.quote_logo_mode === "company" && !company?.logo_url ? (
            <p className="text-xs text-amber-700 dark:text-amber-400">
              La empresa todavía no tiene logo: cargalo en la pestaña Empresa.
            </p>
          ) : null}

          {canEdit ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="self-start"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              <ImagePlus data-icon="inline-start" className="text-emerald-600 dark:text-emerald-400" />
              {settings.quote_logo_url ? "Cambiar logo propio" : "Subir logo propio"}
            </Button>
          ) : null}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={(event) => void handleFile(event)}
        />
      </CardContent>
    </Card>
  )
}

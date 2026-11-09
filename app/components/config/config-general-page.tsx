"use client"

import * as React from "react"

import { CompanySettingsCard } from "~/components/config/company-settings-card"
import { ExchangeRateCard } from "~/components/config/exchange-rate-card"
import { QuoteLogoCard } from "~/components/config/quote-logo-card"
import { QuoteSettingsCard } from "~/components/config/quote-settings-card"
import { Skeleton } from "~/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import type { AppSettings } from "~/domain/settings/settings.schemas"
import { usePermission } from "~/hooks/use-permission"
import { appToast } from "~/lib/toast"
import { settingsService } from "~/services/settings.service"

export function ConfigGeneralPage() {
  const canEdit = usePermission("configs", "update")
  const canAddRate = usePermission("exchange_rates", "create")
  const [settings, setSettings] = React.useState<AppSettings | null>(null)

  React.useEffect(() => {
    settingsService
      .get()
      .then(setSettings)
      .catch(() => appToast.error("No se pudo cargar la configuración"))
  }, [])

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Configuración</h1>
        <p className="text-sm text-muted-foreground">
          Empresa, parámetros de presupuesto y cotización del dólar.
        </p>
      </div>

      <Tabs defaultValue="company" className="gap-4">
        <TabsList>
          <TabsTrigger value="company">Empresa</TabsTrigger>
          <TabsTrigger value="quotes">Presupuestos</TabsTrigger>
          <TabsTrigger value="rate">Cotización</TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <CompanySettingsCard canEdit={canEdit} />
        </TabsContent>
        <TabsContent value="quotes">
          {settings ? (
            <div className="flex flex-col gap-4">
              <QuoteSettingsCard settings={settings} canEdit={canEdit} onSaved={setSettings} />
              <QuoteLogoCard settings={settings} canEdit={canEdit} onSaved={setSettings} />
            </div>
          ) : (
            <Skeleton className="h-96" />
          )}
        </TabsContent>
        <TabsContent value="rate">
          {settings ? (
            <ExchangeRateCard
              settings={settings}
              canEditMode={canEdit}
              canAddRate={canAddRate}
              onSettingsChange={setSettings}
            />
          ) : (
            <Skeleton className="h-96" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

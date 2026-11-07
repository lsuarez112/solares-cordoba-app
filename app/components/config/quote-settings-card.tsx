"use client"

import * as React from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Save } from "lucide-react"

import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { Separator } from "~/components/ui/separator"
import { Spinner } from "~/components/ui/spinner"
import { Textarea } from "~/components/ui/textarea"
import {
  QuoteSettingsFormSchema,
  type AppSettings,
  type QuoteSettingsFormValues,
} from "~/domain/settings/settings.schemas"
import { appToast } from "~/lib/toast"
import { settingsService } from "~/services/settings.service"

function toFormValues(s: AppSettings): QuoteSettingsFormValues {
  return {
    number_prefix: s.number_prefix,
    default_validity_days: s.default_validity_days,
    default_iva_pct: s.default_iva_pct,
    quote_footer: s.quote_footer ?? "",
    system_efficiency: s.system_efficiency,
    default_hsp: s.default_hsp,
    kwp_tolerance_pct: s.kwp_tolerance_pct,
  }
}

type NumberField = {
  name: keyof QuoteSettingsFormValues
  label: string
  description?: string
  step?: string
  inputMode?: "numeric" | "decimal"
}

const QUOTE_FIELDS: NumberField[] = [
  { name: "default_validity_days", label: "Validez (días)", inputMode: "numeric" },
  { name: "default_iva_pct", label: "IVA por defecto (%)", step: "0.5", inputMode: "decimal" },
]

const SIZING_FIELDS: NumberField[] = [
  { name: "default_hsp", label: "HSP por defecto (h)", description: "4,4 si no se conoce el ángulo", step: "0.1", inputMode: "decimal" },
  { name: "system_efficiency", label: "Eficiencia del sistema (η)", description: "Pérdidas totales: 0,75", step: "0.01", inputMode: "decimal" },
  { name: "kwp_tolerance_pct", label: "Tolerancia de kits (± %)", description: "Para sugerir un kit", step: "1", inputMode: "numeric" },
]

export function QuoteSettingsCard({
  settings,
  canEdit,
  onSaved,
}: {
  settings: AppSettings
  canEdit: boolean
  onSaved: (settings: AppSettings) => void
}) {
  const [saving, setSaving] = React.useState(false)
  const form = useForm<QuoteSettingsFormValues>({
    resolver: zodResolver(QuoteSettingsFormSchema as never) as Resolver<QuoteSettingsFormValues>,
    defaultValues: toFormValues(settings),
  })

  React.useEffect(() => {
    form.reset(toFormValues(settings))
  }, [settings, form])

  const onSubmit = form.handleSubmit(async (values) => {
    setSaving(true)
    try {
      const saved = await settingsService.update({
        ...values,
        number_prefix: values.number_prefix.trim(),
        quote_footer: values.quote_footer.trim() || null,
      })
      onSaved(saved)
      appToast.success("Configuración guardada")
    } catch (error) {
      appToast.error("No se pudo guardar", {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setSaving(false)
    }
  })

  const renderNumber = (f: NumberField) => (
    <FormField
      key={f.name}
      control={form.control}
      name={f.name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{f.label}</FormLabel>
          <FormControl>
            <Input type="number" step={f.step ?? "1"} inputMode={f.inputMode} {...field} />
          </FormControl>
          {f.description ? <FormDescription>{f.description}</FormDescription> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Presupuestos</CardTitle>
        <CardDescription>Numeración, validez, IVA y parámetros de dimensionamiento.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={onSubmit}>
          <CardContent>
            <fieldset disabled={!canEdit} className="flex flex-col gap-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="number_prefix"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prefijo de número</FormLabel>
                      <FormControl>
                        <Input placeholder="P-" {...field} />
                      </FormControl>
                      <FormDescription>
                        Ej.: {form.watch("number_prefix") || "P-"}000042-R1
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {QUOTE_FIELDS.map(renderNumber)}
              </div>

              <FormField
                control={form.control}
                name="quote_footer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pie del PDF</FormLabel>
                    <FormControl>
                      <Textarea rows={3} placeholder="Condiciones comerciales…" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />
              <p className="text-sm font-medium">Dimensionamiento</p>
              <div className="grid gap-4 sm:grid-cols-3">{SIZING_FIELDS.map(renderNumber)}</div>
            </fieldset>
          </CardContent>
          {canEdit ? (
            <CardFooter className="justify-end pt-6">
              <Button type="submit" disabled={saving || !form.formState.isDirty}>
                {saving ? <Spinner data-icon="inline-start" /> : <Save data-icon="inline-start" />}
                Guardar
              </Button>
            </CardFooter>
          ) : null}
        </form>
      </Form>
    </Card>
  )
}

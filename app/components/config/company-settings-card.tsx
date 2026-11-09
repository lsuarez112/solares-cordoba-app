"use client"

import * as React from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Save } from "lucide-react"

import { CompanyLogoSection } from "~/components/companies/company-logo-section"
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { Skeleton } from "~/components/ui/skeleton"
import { Spinner } from "~/components/ui/spinner"
import {
  CompanyFormSchema,
  type Company,
  type CompanyFormValues,
} from "~/domain/companies/companies.schemas"
import {
  companyToFormValues,
  emptyCompanyFormValues,
  formValuesToCompanyInsert,
} from "~/lib/companies/company-form.utils"
import { appToast } from "~/lib/toast"
import { companiesService } from "~/services/companies.service"
import { useCompanyStore } from "~/stores/company.store"

type TextFieldName = Exclude<keyof CompanyFormValues, "active" | "country">

const FIELDS: Array<{ name: TextFieldName; label: string; placeholder?: string; span?: boolean }> = [
  { name: "name", label: "Nombre comercial *", placeholder: "Solares Córdoba" },
  { name: "legal_name", label: "Razón social", placeholder: "Solares Córdoba S.A." },
  { name: "tax_id", label: "CUIT", placeholder: "30-12345678-9" },
  { name: "phone", label: "Teléfono", placeholder: "+54 9 351 555-1234" },
  { name: "email", label: "Email", placeholder: "ventas@empresa.com" },
  { name: "website", label: "Sitio web", placeholder: "https://…" },
  { name: "address", label: "Dirección", span: true },
  { name: "city", label: "Ciudad" },
  { name: "province", label: "Provincia" },
]

export function CompanySettingsCard({ canEdit }: { canEdit: boolean }) {
  const [company, setCompany] = React.useState<Company | null>(null)
  const setStoreCompany = useCompanyStore((s) => s.setCompany)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(CompanyFormSchema as never) as Resolver<CompanyFormValues>,
    defaultValues: emptyCompanyFormValues,
  })

  React.useEffect(() => {
    let cancelled = false
    companiesService
      .getAll({ active: true })
      .then((rows) => {
        if (cancelled) return
        const main = rows[0] ?? null
        setCompany(main)
        if (main) form.reset(companyToFormValues(main))
      })
      .catch(() => appToast.error("No se pudieron cargar los datos de la empresa"))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [form])

  const onSubmit = form.handleSubmit(async (values) => {
    setSaving(true)
    try {
      const payload = formValuesToCompanyInsert({ ...values, active: true })
      const saved = company
        ? await companiesService.update(company.id, { ...payload, logo_url: company.logo_url })
        : await companiesService.create(payload)
      setCompany(saved)
      setStoreCompany(saved)
      form.reset(companyToFormValues(saved))
      appToast.success("Datos de la empresa guardados")
    } catch (error) {
      appToast.error("No se pudo guardar", {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setSaving(false)
    }
  })

  const handleLogo = async (file: File) => {
    if (!company) {
      appToast.info("Guardá primero los datos de la empresa")
      return
    }
    setUploading(true)
    try {
      const url = await companiesService.uploadLogo(company.id, file)
      const updated = await companiesService.update(company.id, { logo_url: url })
      setCompany(updated)
      setStoreCompany(updated)
      appToast.success("Logo actualizado")
    } catch (error) {
      appToast.error("No se pudo subir el logo", {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Empresa</CardTitle>
        <CardDescription>Datos que aparecen en el encabezado del PDF del presupuesto.</CardDescription>
      </CardHeader>
      {loading ? (
        <CardContent className="grid items-start gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </CardContent>
      ) : (
        <Form {...form}>
          <form onSubmit={onSubmit}>
            <CardContent className="flex flex-col gap-6">
              <CompanyLogoSection
                logoUrl={company?.logo_url ?? null}
                isEditing
                uploading={uploading}
                disabled={!canEdit || !company}
                onFileSelect={handleLogo}
              />
              <fieldset disabled={!canEdit} className="stagger-x grid items-start gap-4 sm:grid-cols-2">
                {FIELDS.map((f) => (
                  <FormField
                    key={f.name}
                    control={form.control}
                    name={f.name}
                    render={({ field }) => (
                      <FormItem className={f.span ? "sm:col-span-2" : undefined}>
                        <FormLabel>{f.label}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={f.placeholder}
                            {...field}
                            value={(field.value as string | null) ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
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
      )}
    </Card>
  )
}

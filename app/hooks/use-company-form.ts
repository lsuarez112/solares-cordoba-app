import { useEffect, useState } from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  CompanyFormSchema,
  type Company,
  type CompanyFormValues,
} from "~/domain/companies/companies.schemas"
import {
  emptyCompanyFormValues,
  formValuesToCompanyInsert,
  companyToFormValues,
} from "~/lib/companies/company-form.utils"
import { appToast } from "~/lib/toast"
import { companiesService } from "~/services/companies.service"
import { useCompaniesStore } from "~/stores/companies.store"

interface UseCompanyFormOptions {
  company?: Company | null
  open: boolean
  pendingLogoFile: File | null
  onSuccess?: () => void
  onClearPendingLogo?: () => void
}

export function useCompanyForm({
  company,
  open,
  pendingLogoFile,
  onSuccess,
  onClearPendingLogo,
}: UseCompanyFormOptions) {
  const create = useCompaniesStore((s) => s.create)
  const update = useCompaniesStore((s) => s.update)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(
      CompanyFormSchema as never,
    ) as Resolver<CompanyFormValues>,
    defaultValues: company
      ? companyToFormValues(company)
      : emptyCompanyFormValues,
  })

  useEffect(() => {
    if (!open) return
    form.reset(
      company ? companyToFormValues(company) : emptyCompanyFormValues,
    )
    setSubmitError(null)
  }, [open, company, form])

  const onSubmit = async (values: CompanyFormValues) => {
    setIsSubmitting(true)
    setSubmitError(null)

    const payload = formValuesToCompanyInsert(values)

    if (company) {
      const updated = await update(company.id, payload)
      setIsSubmitting(false)

      if (!updated) {
        setSubmitError(
          "Ocurrió un error al guardar la empresa. Intentá de nuevo.",
        )
        appToast.error("No se pudo actualizar la empresa", {
          description: "Revisá los datos e intentá de nuevo.",
        })
        return
      }

      appToast.success("Empresa actualizada", {
        description: `Los cambios en "${values.name.trim()}" se guardaron correctamente.`,
      })
      onSuccess?.()
      return
    }

    const created = await create(payload)

    if (!created) {
      setIsSubmitting(false)
      setSubmitError(
        "Ocurrió un error al crear la empresa. Intentá de nuevo.",
      )
      appToast.error("No se pudo crear la empresa", {
        description: "Revisá los datos e intentá de nuevo.",
      })
      return
    }

    if (pendingLogoFile) {
      try {
        const logoUrl = await companiesService.uploadLogo(
          created.id,
          pendingLogoFile,
        )
        const withLogo = await update(created.id, { logo_url: logoUrl })

        if (!withLogo) {
          appToast.warning("Empresa creada sin logo", {
            description:
              "La empresa se guardó, pero no se pudo vincular el logo. Podés subirlo desde la edición.",
          })
        }
      } catch {
        appToast.warning("Empresa creada sin logo", {
          description:
            "La empresa se guardó, pero falló la subida del logo. Podés subirlo desde la edición.",
        })
      } finally {
        onClearPendingLogo?.()
      }
    }

    setIsSubmitting(false)
    appToast.success("Empresa creada", {
      description: `"${values.name.trim()}" se agregó al directorio.`,
    })
    onSuccess?.()
  }

  return {
    form,
    isSubmitting,
    submitError,
    isEditing: !!company,
    onSubmit: form.handleSubmit(onSubmit),
  }
}

import { useEffect, useState } from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  SupplierFormSchema,
  type Supplier,
  type SupplierFormValues,
} from "~/domain/suppliers/suppliers.schemas"
import {
  emptySupplierFormValues,
  formValuesToSupplierInsert,
  supplierToFormValues,
} from "~/lib/suppliers/supplier-form.utils"
import { appToast } from "~/lib/toast"
import { useSuppliersStore } from "~/stores/suppliers.store"

interface UseSupplierFormOptions {
  supplier?: Supplier | null
  open: boolean
  onSuccess?: () => void
}

export function useSupplierForm({
  supplier,
  open,
  onSuccess,
}: UseSupplierFormOptions) {
  const create = useSuppliersStore((s) => s.create)
  const update = useSuppliersStore((s) => s.update)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(
      SupplierFormSchema as never,
    ) as Resolver<SupplierFormValues>,
    defaultValues: supplier
      ? supplierToFormValues(supplier)
      : emptySupplierFormValues,
  })

  useEffect(() => {
    if (!open) return
    form.reset(
      supplier ? supplierToFormValues(supplier) : emptySupplierFormValues,
    )
    setSubmitError(null)
  }, [open, supplier, form])

  const onSubmit = async (values: SupplierFormValues) => {
    setIsSubmitting(true)
    setSubmitError(null)

    const payload = formValuesToSupplierInsert(values)
    const ok = supplier
      ? await update(supplier.id, payload)
      : await create(payload)

    setIsSubmitting(false)

    if (!ok) {
      setSubmitError(
        "Ocurrió un error al guardar el proveedor. Intentá de nuevo.",
      )
      appToast.error(
        supplier
          ? "No se pudo actualizar el proveedor"
          : "No se pudo crear el proveedor",
        { description: "Revisá los datos e intentá de nuevo." },
      )
      return
    }

    if (supplier) {
      appToast.success("Proveedor actualizado", {
        description: `Los cambios en "${values.name.trim()}" se guardaron correctamente.`,
      })
    } else {
      appToast.success("Proveedor creado", {
        description: `"${values.name.trim()}" se agregó al directorio.`,
      })
    }

    onSuccess?.()
  }

  return {
    form,
    isSubmitting,
    submitError,
    isEditing: !!supplier,
    onSubmit: form.handleSubmit(onSubmit),
  }
}

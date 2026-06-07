import { useEffect, useState } from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  CategoryFormSchema,
  type Category,
  type CategoryFormValues,
} from "~/domain/categories/categories.schemas"
import {
  categoryToFormValues,
  emptyCategoryFormValues,
  formValuesToCategoryInsert,
} from "~/lib/categories/category-form.utils"
import { appToast } from "~/lib/toast"
import { useCategoriesStore } from "~/stores/categories.store"

interface UseCategoryFormOptions {
  category?: Category | null
  open: boolean
  onSuccess?: () => void
}

export function useCategoryForm({
  category,
  open,
  onSuccess,
}: UseCategoryFormOptions) {
  const create = useCategoriesStore((s) => s.create)
  const update = useCategoriesStore((s) => s.update)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(
      CategoryFormSchema as never,
    ) as Resolver<CategoryFormValues>,
    defaultValues: category
      ? categoryToFormValues(category)
      : emptyCategoryFormValues,
  })

  useEffect(() => {
    if (!open) return
    form.reset(
      category ? categoryToFormValues(category) : emptyCategoryFormValues,
    )
    setSubmitError(null)
  }, [open, category, form])

  const onSubmit = async (values: CategoryFormValues) => {
    setIsSubmitting(true)
    setSubmitError(null)

    const payload = formValuesToCategoryInsert(values)
    const ok = category
      ? await update(category.id, payload)
      : await create(payload)

    setIsSubmitting(false)

    if (!ok) {
      setSubmitError(
        "Ocurrió un error al guardar la categoría. Intentá de nuevo.",
      )
      appToast.error(
        category
          ? "No se pudo actualizar la categoría"
          : "No se pudo crear la categoría",
        { description: "Revisá los datos e intentá de nuevo." },
      )
      return
    }

    if (category) {
      appToast.success("Categoría actualizada", {
        description: `Los cambios en "${values.name.trim()}" se guardaron correctamente.`,
      })
    } else {
      appToast.success("Categoría creada", {
        description: `"${values.name.trim()}" se agregó al catálogo.`,
      })
    }

    onSuccess?.()
  }

  return {
    form,
    isSubmitting,
    submitError,
    isEditing: !!category,
    onSubmit: form.handleSubmit(onSubmit),
  }
}

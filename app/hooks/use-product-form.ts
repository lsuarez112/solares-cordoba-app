import { useEffect, useState } from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ProductFormSchema,
  type Product,
  type ProductFormValues,
} from "~/domain/products/products.schemas"
import {
  emptyProductFormValues,
  productToDuplicateFormValues,
  productToFormValues,
} from "~/lib/products/product-form.utils"
import { appToast } from "~/lib/toast"
import { useProductsStore } from "~/stores/products.store"

interface UseProductFormOptions {
  product?: Product
  duplicateFrom?: Product
  presetCategoryId?: string | null
  open: boolean
  onSuccess?: () => void
}

function resolveDefaultValues(
  product?: Product,
  duplicateFrom?: Product,
  presetCategoryId?: string | null,
): ProductFormValues {
  if (product) return productToFormValues(product)
  if (duplicateFrom) return productToDuplicateFormValues(duplicateFrom)
  if (presetCategoryId) {
    return { ...emptyProductFormValues, category_id: presetCategoryId }
  }
  return emptyProductFormValues
}

export function useProductForm({
  product,
  duplicateFrom,
  presetCategoryId,
  open,
  onSuccess,
}: UseProductFormOptions) {
  const createProduct = useProductsStore((s) => s.createProduct)
  const updateProduct = useProductsStore((s) => s.updateProduct)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(
      ProductFormSchema as never,
    ) as Resolver<ProductFormValues>,
    defaultValues: resolveDefaultValues(
      product,
      duplicateFrom,
      presetCategoryId,
    ),
  })

  useEffect(() => {
    if (!open) return
    form.reset(resolveDefaultValues(product, duplicateFrom, presetCategoryId))
    setSubmitError(null)
  }, [open, product, duplicateFrom, presetCategoryId, form])

  const onSubmit = async (values: ProductFormValues) => {
    setIsSubmitting(true)
    setSubmitError(null)

    const ok = product
      ? await updateProduct(product.id, values)
      : await createProduct(values)

    setIsSubmitting(false)

    if (!ok) {
      setSubmitError(
        "Ocurrió un error al guardar el producto. Intentá de nuevo.",
      )
      appToast.error(
        product ? "No se pudo actualizar el producto" : "No se pudo crear el producto",
        { description: "Revisá los datos e intentá de nuevo." },
      )
      return
    }

    if (product) {
      appToast.success("Producto actualizado", {
        description: `Los cambios en "${values.name.trim()}" se guardaron correctamente.`,
      })
    } else {
      appToast.success("Producto creado", {
        description: `"${values.name.trim()}" se agregó al catálogo.`,
      })
    }

    onSuccess?.()
  }

  return {
    form,
    isSubmitting,
    submitError,
    isEditing: !!product,
    isDuplicating: !!duplicateFrom && !product,
    onSubmit: form.handleSubmit(onSubmit),
  }
}

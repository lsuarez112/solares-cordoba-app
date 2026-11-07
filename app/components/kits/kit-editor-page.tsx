"use client"

import * as React from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Save } from "lucide-react"
import { Link, useBlocker, useNavigate } from "react-router"

import { KitBomSection } from "~/components/kits/kit-bom-section"
import { KitHeaderFields } from "~/components/kits/kit-header-fields"
import { KitOptionsSection } from "~/components/kits/kit-options-section"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { Form } from "~/components/ui/form"
import { Skeleton } from "~/components/ui/skeleton"
import { Spinner } from "~/components/ui/spinner"
import { KitFormSchema, type KitFormValues } from "~/domain/kits/kits.schemas"
import { usePermission } from "~/hooks/use-permission"
import {
  duplicateKitFormValues,
  emptyKitFormValues,
  kitDetailToFormValues,
} from "~/lib/kits/kit-form.utils"
import { sortByGroup } from "~/lib/kits/kit-groups"
import { appToast } from "~/lib/toast"
import { kitsService } from "~/services/kits.service"
import { useProductsStore } from "~/stores/products.store"

type KitEditorPageProps = {
  /** Kit a editar; null = nuevo. */
  kitId: string | null
  /** Kit a duplicar (solo con kitId null). */
  duplicateFromId?: string | null
}

export function KitEditorPage({ kitId, duplicateFromId = null }: KitEditorPageProps) {
  const navigate = useNavigate()
  const canEdit = usePermission("kits", kitId ? "update" : "create")

  const products = useProductsStore((s) => s.products)
  const categories = useProductsStore((s) => s.categories)
  const productsReady = useProductsStore((s) => s.initialized)
  const fetchProducts = useProductsStore((s) => s.fetchAll)
  const fetchCategories = useProductsStore((s) => s.fetchCategories)

  const [loading, setLoading] = React.useState(Boolean(kitId || duplicateFromId))
  const [saving, setSaving] = React.useState(false)
  const [title, setTitle] = React.useState(kitId ? "Editar kit" : duplicateFromId ? "Duplicar kit" : "Nuevo kit")

  const form = useForm<KitFormValues>({
    resolver: zodResolver(KitFormSchema as never) as Resolver<KitFormValues>,
    defaultValues: emptyKitFormValues,
  })

  const catalog = React.useMemo(
    () => new Map(products.map((p) => [p.product_code, p])),
    [products],
  )

  React.useEffect(() => {
    void fetchProducts()
    void fetchCategories()
  }, [fetchProducts, fetchCategories])

  // Carga el kit cuando el catálogo está listo (para agrupar por tipo).
  React.useEffect(() => {
    const sourceId = kitId ?? duplicateFromId
    if (!sourceId) {
      form.reset(emptyKitFormValues)
      return
    }
    if (!productsReady) return
    let cancelled = false
    setLoading(true)
    kitsService
      .getDetail(sourceId)
      .then((detail) => {
        if (cancelled) return
        const base = kitDetailToFormValues(detail)
        const values = kitId ? base : duplicateKitFormValues(base)
        form.reset({ ...values, items: sortByGroup(values.items, catalog) })
        setTitle(kitId ? detail.kit.name : `Duplicar ${detail.kit.code}`)
      })
      .catch(() => appToast.error("No se pudo cargar el kit"))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
    // catalog cambia de identidad al refrescar productos; solo importa que esté listo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kitId, duplicateFromId, productsReady, form])

  // Aviso al salir con cambios sin guardar.
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      form.formState.isDirty && !saving && currentLocation.pathname !== nextLocation.pathname,
  )
  React.useEffect(() => {
    if (blocker.state !== "blocked") return
    if (window.confirm("Hay cambios sin guardar. ¿Salir igual?")) blocker.proceed()
    else blocker.reset()
  }, [blocker])

  const onSubmit = form.handleSubmit(
    async (values) => {
      setSaving(true)
      try {
        const ids = new Map(products.map((p) => [p.product_code, p.id]))
        const id = await kitsService.save(kitId, values, ids)
        form.reset(values)
        appToast.success(kitId ? "Kit guardado" : "Kit creado")
        if (!kitId) navigate(`/kits/${id}`, { replace: true })
        else setTitle(values.name)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        appToast.error("No se pudo guardar el kit", {
          description: message.includes("kits_code_key") ? "Ya existe un kit con ese código" : message,
        })
      } finally {
        setSaving(false)
      }
    },
    () => appToast.warning("Revisá los campos marcados"),
  )

  const isLoading = loading || !productsReady

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="flex min-w-0 flex-col gap-6">
        <div className="sticky -top-4 z-20 -mx-4 flex items-center gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur md:-top-6 md:-mx-6 md:px-6">
          <Button asChild variant="ghost" size="icon-sm" aria-label="Volver a kits">
            <Link to="/kits">
              <ArrowLeft />
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold tracking-tight">{title}</h1>
            <p className="truncate text-xs text-muted-foreground">
              Los precios salen siempre del catálogo vigente.
            </p>
          </div>
          {canEdit ? (
            <Button type="submit" size="sm" disabled={saving || isLoading || !form.formState.isDirty}>
              {saving ? <Spinner data-icon="inline-start" /> : <Save data-icon="inline-start" />}
              Guardar
            </Button>
          ) : null}
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-48" />
            <Skeleton className="h-96" />
          </div>
        ) : (
          <fieldset disabled={!canEdit} className="flex min-w-0 flex-col gap-6">
            <Card>
              <CardContent>
                <KitHeaderFields form={form} />
              </CardContent>
            </Card>
            <KitBomSection
              control={form.control}
              products={products}
              catalog={catalog}
              categories={categories}
              canEdit={canEdit}
            />
            <KitOptionsSection
              form={form}
              products={products}
              catalog={catalog}
              categories={categories}
              canEdit={canEdit}
            />
          </fieldset>
        )}
      </form>
    </Form>
  )
}

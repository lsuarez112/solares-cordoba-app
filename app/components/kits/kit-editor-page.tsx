"use client"

import * as React from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Save, Sparkles } from "lucide-react"
import { Link, useBlocker, useLocation, useNavigate } from "react-router"

import { KitBomSection } from "~/components/kits/kit-bom-section"
import { KitHeaderFields } from "~/components/kits/kit-header-fields"
import { KitOptionsSection } from "~/components/kits/kit-options-section"
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { Button } from "~/components/ui/button"
import { confirmDialog } from "~/components/ui/confirm-dialog"
import { Card, CardContent } from "~/components/ui/card"
import { Form } from "~/components/ui/form"
import { Skeleton } from "~/components/ui/skeleton"
import { Spinner } from "~/components/ui/spinner"
import type { AiKitDraft } from "~/domain/ai/ai.schemas"
import { KitFormSchema, type KitFormValues } from "~/domain/kits/kits.schemas"
import { usePermission } from "~/hooks/use-permission"
import {
  aiKitDraftToFormValues,
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
  const location = useLocation()
  /** Kit armado por la IA (Kits → Crear con IA), llega en el state de la navegación. */
  const aiDraft = kitId || duplicateFromId ? null : ((location.state as { aiKitDraft?: AiKitDraft } | null)?.aiKitDraft ?? null)
  const canEdit = usePermission("kits", kitId ? "update" : "create")

  const products = useProductsStore((s) => s.products)
  const categories = useProductsStore((s) => s.categories)
  const productsReady = useProductsStore((s) => s.initialized)
  const fetchProducts = useProductsStore((s) => s.fetchAll)
  const fetchCategories = useProductsStore((s) => s.fetchCategories)

  const [loading, setLoading] = React.useState(Boolean(kitId || duplicateFromId))
  const [saving, setSaving] = React.useState(false)
  const [title, setTitle] = React.useState(
    kitId ? "Editar kit" : duplicateFromId ? "Duplicar kit" : aiDraft ? "Kit armado con IA" : "Nuevo kit",
  )

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
      if (aiDraft && productsReady) {
        // keepDefaultValues: los valores por defecto siguen vacíos, así el kit de la
        // IA cuenta como cambios (dirty) y se puede guardar directamente.
        const values = aiKitDraftToFormValues(aiDraft)
        form.reset({ ...values, items: sortByGroup(values.items, catalog) }, { keepDefaultValues: true })
      }
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
  }, [kitId, duplicateFromId, productsReady, form, aiDraft])

  // Aviso al salir con cambios sin guardar.
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      form.formState.isDirty && !saving && currentLocation.pathname !== nextLocation.pathname,
  )
  React.useEffect(() => {
    if (blocker.state !== "blocked") return
    void confirmDialog({
      title: "Hay cambios sin guardar",
      description: "Si salís ahora se pierden.",
      confirmLabel: "Salir sin guardar",
      destructive: true,
    }).then((ok) => (ok ? blocker.proceed() : blocker.reset()))
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
          <h1 className="min-w-0 flex-1 truncate text-lg font-semibold tracking-tight">{title}</h1>
          {canEdit ? (
            <Button type="submit" size="sm" disabled={saving || isLoading || !form.formState.isDirty}>
              {saving ? <Spinner data-icon="inline-start" /> : <Save data-icon="inline-start" />}
              Guardar
            </Button>
          ) : null}
        </div>

        <p className="-mt-3 text-sm text-muted-foreground">
          Kit base del presupuestador: la IA lo considera al sugerir (por sistema, kWp y batería) y puede aplicar
          sus opcionales. Los precios salen del catálogo vigente.
        </p>

        {isLoading ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-48" />
            <Skeleton className="h-96" />
          </div>
        ) : (
          <fieldset disabled={!canEdit} className="flex min-w-0 flex-col gap-6">
            {aiDraft ? (
              <Alert className="border-violet-200 bg-violet-50/60 dark:border-violet-900 dark:bg-violet-950/30">
                <Sparkles className="text-violet-600 dark:text-violet-400" />
                <AlertTitle>Kit armado con IA: revisalo antes de guardarlo</AlertTitle>
                <AlertDescription>
                  <p>
                    Queda <strong className="font-medium text-foreground">inactivo</strong> hasta que lo actives: un kit
                    inactivo no se sugiere en los presupuestos.
                  </p>
                  {aiDraft.warnings.length ? (
                    <ul className="mt-1 list-disc pl-4">
                      {aiDraft.warnings.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  ) : null}
                </AlertDescription>
              </Alert>
            ) : null}
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

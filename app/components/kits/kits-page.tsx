"use client"

import * as React from "react"
import { Plus } from "lucide-react"

import { AssemblyRulesEditor } from "~/components/kits/assembly-rules-editor"
import { KitEditorDialog } from "~/components/kits/kit-editor-dialog"
import { KitsDataTable } from "~/components/kits/kits-data-table"
import { Button } from "~/components/ui/button"
import { Skeleton } from "~/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import type { Kit, KitFormValues } from "~/domain/kits/kits.schemas"
import { usePermission } from "~/hooks/use-permission"
import {
  duplicateKitFormValues,
  kitDetailToFormValues,
} from "~/lib/kits/kit-form.utils"
import { appToast } from "~/lib/toast"
import { kitsService } from "~/services/kits.service"
import { useProductsStore } from "~/stores/products.store"

export function KitsPage() {
  const canCreate = usePermission("kits", "create")
  const canUpdate = usePermission("kits", "update")
  const canDelete = usePermission("kits", "delete")

  const products = useProductsStore((s) => s.products)
  const fetchProducts = useProductsStore((s) => s.fetchAll)

  const [kits, setKits] = React.useState<Kit[] | null>(null)
  const [editor, setEditor] = React.useState<{
    open: boolean
    kitId: string | null
    initial: KitFormValues | null
  }>({ open: false, kitId: null, initial: null })

  const load = React.useCallback(async () => {
    try {
      setKits(await kitsService.list())
    } catch {
      setKits([])
      appToast.error("No se pudieron cargar los kits")
    }
  }, [])

  React.useEffect(() => {
    void load()
    void fetchProducts()
  }, [load, fetchProducts])

  const openNew = () => setEditor({ open: true, kitId: null, initial: null })
  const openKit = React.useCallback(
    (kit: Kit) => setEditor({ open: true, kitId: kit.id, initial: null }),
    [],
  )

  const duplicate = React.useCallback(async (kit: Kit) => {
    try {
      const detail = await kitsService.getDetail(kit.id)
      setEditor({
        open: true,
        kitId: null,
        initial: duplicateKitFormValues(kitDetailToFormValues(detail)),
      })
    } catch {
      appToast.error("No se pudo duplicar el kit")
    }
  }, [])

  const toggleActive = React.useCallback(async (kit: Kit, active: boolean) => {
    setKits((prev) => prev?.map((k) => (k.id === kit.id ? { ...k, active } : k)) ?? prev)
    try {
      await kitsService.setActive(kit.id, active)
    } catch {
      appToast.error("No se pudo cambiar el estado")
      void load()
    }
  }, [load])

  const remove = React.useCallback(async (kit: Kit) => {
    if (!window.confirm(`¿Borrar el kit ${kit.code}? Los presupuestos ya emitidos no cambian.`)) return
    try {
      await kitsService.remove(kit.id)
      appToast.success("Kit borrado")
      void load()
    } catch {
      appToast.error("No se pudo borrar el kit")
    }
  }, [load])

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">Kits</h1>
          <p className="text-sm text-muted-foreground">
            Kits predefinidos que la IA filtra y sugiere, o que se eligen a mano.
          </p>
        </div>
        {canCreate ? (
          <Button size="sm" onClick={openNew}>
            <Plus data-icon="inline-start" />
            Nuevo kit
          </Button>
        ) : null}
      </div>

      <Tabs defaultValue="kits" className="gap-4">
        <TabsList>
          <TabsTrigger value="kits">Kits</TabsTrigger>
          <TabsTrigger value="rules">Reglas de armado</TabsTrigger>
        </TabsList>

        <TabsContent value="kits">
          {kits === null ? (
            <Skeleton className="h-80" />
          ) : (
            <KitsDataTable
              data={kits}
              canCreate={canCreate}
              canUpdate={canUpdate}
              canDelete={canDelete}
              onOpen={openKit}
              onDuplicate={duplicate}
              onDelete={remove}
              onToggleActive={toggleActive}
            />
          )}
        </TabsContent>

        <TabsContent value="rules">
          <AssemblyRulesEditor canEdit={canUpdate} />
        </TabsContent>
      </Tabs>

      <KitEditorDialog
        open={editor.open}
        kitId={editor.kitId}
        initialValues={editor.initial}
        products={products}
        canEdit={editor.kitId ? canUpdate : canCreate}
        onOpenChange={(open) => setEditor((prev) => ({ ...prev, open }))}
        onSaved={() => void load()}
      />
    </div>
  )
}

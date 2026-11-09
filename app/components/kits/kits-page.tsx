"use client"

import * as React from "react"
import { useNavigate } from "react-router"
import { AlertTriangle, Boxes, CircleCheck, Plus, Sparkles } from "lucide-react"

import { AssemblyRulesEditor } from "~/components/kits/assembly-rules-editor"
import { KitAiDialog } from "~/components/kits/kit-ai-dialog"
import { KitsDataTable } from "~/components/kits/kits-data-table"
import { Badge } from "~/components/ui/badge"
import { BadgesSkeleton } from "~/components/ui/badges-skeleton"
import { Button } from "~/components/ui/button"
import { PageHeader } from "~/components/ui/page-header"
import { confirmDialog } from "~/components/ui/confirm-dialog"
import { Skeleton } from "~/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import type { Kit } from "~/domain/kits/kits.schemas"
import { usePermission } from "~/hooks/use-permission"
import { appToast } from "~/lib/toast"
import { kitsService } from "~/services/kits.service"
import { settingsService } from "~/services/settings.service"

export function KitsPage() {
  const canCreate = usePermission("kits", "create")
  const canUpdate = usePermission("kits", "update")
  const canDelete = usePermission("kits", "delete")

  const navigate = useNavigate()

  const [kits, setKits] = React.useState<Kit[] | null>(null)
  const [aiEnabled, setAiEnabled] = React.useState(false)
  const [aiOpen, setAiOpen] = React.useState(false)

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
    settingsService
      .get()
      .then((s) => setAiEnabled(s.ai_enabled))
      .catch(() => setAiEnabled(false))
  }, [load])

  const openNew = () => navigate("/kits/nuevo")
  const openKit = React.useCallback((kit: Kit) => navigate(`/kits/${kit.id}`), [navigate])

  const duplicate = React.useCallback(
    (kit: Kit) => navigate(`/kits/nuevo?desde=${kit.id}`),
    [navigate],
  )

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
    const ok = await confirmDialog({
      title: `¿Borrar el kit ${kit.code}?`,
      description: "Los presupuestos ya emitidos no cambian.",
      confirmLabel: "Borrar",
      destructive: true,
    })
    if (!ok) return
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
      <PageHeader
        title="Kits"
        description={
          <>
            Son los kits <strong className="font-medium text-foreground">base</strong> del presupuestador. La IA
            calcula la potencia del pedido y <strong className="font-medium text-foreground">solo elige entre estos
            kits activos</strong> (por tipo de sistema, kWp y batería), aplicando sus opcionales si hace falta. Un kit
            inactivo o con productos sin precio no se sugiere.
          </>
        }
        actions={
          canCreate ? (
            <>
              {aiEnabled ? (
                <Button size="sm" variant="outline" onClick={() => setAiOpen(true)}>
                  <Sparkles data-icon="inline-start" className="text-violet-600 dark:text-violet-400" />
                  <span className="sm:hidden">IA</span>
              <span className="hidden sm:inline">Crear con IA</span>
                </Button>
              ) : null}
              <Button size="sm" onClick={openNew}>
                <Plus data-icon="inline-start" />
                <span className="sm:hidden">Nuevo</span>
              <span className="hidden sm:inline">Nuevo kit</span>
              </Button>
            </>
          ) : null
        }
      />

      <Tabs defaultValue="kits" className="gap-4">
        <TabsList>
          <TabsTrigger value="kits">Kits</TabsTrigger>
          <TabsTrigger value="rules">Reglas de armado</TabsTrigger>
        </TabsList>

        <TabsContent value="kits" className="flex flex-col gap-4">
          {kits ? (
            <div className="stagger-x flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="h-6 gap-1.5 px-2.5">
                <Boxes data-icon="inline-start" />
                Total
                <span className="font-semibold text-foreground tabular-nums">{kits.length}</span>
              </Badge>
              <Badge variant="secondary" className="h-6 gap-1.5 px-2.5">
                <CircleCheck data-icon="inline-start" className="text-emerald-600" />
                Activos
                <span className="font-semibold text-foreground tabular-nums">
                  {kits.filter((k) => k.active).length}
                </span>
              </Badge>
              <Badge variant="secondary" className="h-6 gap-1.5 px-2.5">
                <AlertTriangle data-icon="inline-start" className="text-amber-600" />
                Con precios faltantes
                <span className="font-semibold text-foreground tabular-nums">
                  {kits.filter((k) => k.items_without_price > 0).length}
                </span>
              </Badge>
            </div>
          ) : (
            <BadgesSkeleton count={3} />
          )}
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

      <KitAiDialog
        open={aiOpen}
        onOpenChange={setAiOpen}
        onUse={(draft) => {
          setAiOpen(false)
          navigate("/kits/nuevo", { state: { aiKitDraft: draft } })
        }}
      />
    </div>
  )
}

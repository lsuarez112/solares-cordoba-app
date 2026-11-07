"use client"

import * as React from "react"
import { AlertTriangle, Copy, MoreHorizontal, Plus, Trash2 } from "lucide-react"

import { AssemblyRulesEditor } from "~/components/kits/assembly-rules-editor"
import { KitEditorDialog } from "~/components/kits/kit-editor-dialog"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { Skeleton } from "~/components/ui/skeleton"
import { Switch } from "~/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { TableScrollArea } from "~/components/ui/table-scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import type { Kit, KitFormValues } from "~/domain/kits/kits.schemas"
import { usePermission } from "~/hooks/use-permission"
import {
  duplicateKitFormValues,
  kitDetailToFormValues,
} from "~/lib/kits/kit-form.utils"
import { GRID_TYPE_COLORS, GRID_TYPE_LABELS } from "~/lib/products/grid-type.utils"
import { appToast } from "~/lib/toast"
import { cn } from "~/lib/utils"
import { kitsService } from "~/services/kits.service"
import { useProductsStore } from "~/stores/products.store"

const usd = (value: number) =>
  value.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const fmt = (value: number | null, suffix: string) =>
  value == null ? "—" : `${value.toLocaleString("es-AR")} ${suffix}`

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

  const openKit = (kitId: string | null) => setEditor({ open: true, kitId, initial: null })

  const duplicate = async (kit: Kit) => {
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
  }

  const toggleActive = async (kit: Kit, active: boolean) => {
    setKits((prev) => prev?.map((k) => (k.id === kit.id ? { ...k, active } : k)) ?? prev)
    try {
      await kitsService.setActive(kit.id, active)
    } catch {
      appToast.error("No se pudo cambiar el estado")
      void load()
    }
  }

  const remove = async (kit: Kit) => {
    if (!window.confirm(`¿Borrar el kit ${kit.code}? Los presupuestos ya emitidos no cambian.`)) return
    try {
      await kitsService.remove(kit.id)
      appToast.success("Kit borrado")
      void load()
    } catch {
      appToast.error("No se pudo borrar el kit")
    }
  }

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
          <Button size="sm" onClick={() => openKit(null)}>
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
            <div className="overflow-hidden rounded-lg border bg-card">
              <TableScrollArea>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kit</TableHead>
                      <TableHead>Sistema</TableHead>
                      <TableHead className="text-right">kWp</TableHead>
                      <TableHead className="text-right">Batería</TableHead>
                      <TableHead className="text-right">Generación</TableHead>
                      <TableHead className="text-right">Consumo ref.</TableHead>
                      <TableHead className="text-right">Total USD</TableHead>
                      <TableHead className="text-center">Activo</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kits.map((kit) => (
                      <TableRow key={kit.id} className={cn(!kit.active && "opacity-60")}>
                        <TableCell>
                          <button
                            type="button"
                            className="flex max-w-[22rem] min-w-0 items-baseline gap-2 text-left hover:underline"
                            onClick={() => openKit(kit.id)}
                          >
                            <span className="shrink-0 font-mono text-xs text-muted-foreground">
                              {kit.code}
                            </span>
                            <span className="truncate font-medium">{kit.name}</span>
                          </button>
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-xs font-medium",
                              GRID_TYPE_COLORS[kit.grid_type],
                            )}
                          >
                            {GRID_TYPE_LABELS[kit.grid_type]}
                          </span>
                          <span className="ml-1.5 text-xs text-muted-foreground">
                            {kit.phases === "tri" ? "Trifásico" : "Mono"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{kit.kwp.toFixed(2)}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {kit.battery_kwh > 0 ? `${kit.battery_kwh} kWh` : "—"}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {fmt(kit.est_kwh_month, "kWh/mes")}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground tabular-nums">
                          {kit.ref_kwh_month_min != null && kit.ref_kwh_month_max != null
                            ? `${kit.ref_kwh_month_min}–${kit.ref_kwh_month_max}`
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-mono tabular-nums">{usd(kit.total_usd)}</span>
                          {kit.items_without_price > 0 ? (
                            <Badge
                              variant="outline"
                              className="ml-1.5 text-amber-700"
                              title={`${kit.items_without_price} de ${kit.items_count} productos sin precio o inactivos`}
                            >
                              <AlertTriangle data-icon="inline-start" />
                              {kit.items_without_price}
                            </Badge>
                          ) : null}
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={kit.active}
                            onCheckedChange={(active) => void toggleActive(kit, active)}
                            disabled={!canUpdate}
                            aria-label="Activo"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" aria-label="Acciones">
                                <MoreHorizontal />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => openKit(kit.id)}>
                                {canUpdate ? "Editar" : "Ver"}
                              </DropdownMenuItem>
                              {canCreate ? (
                                <DropdownMenuItem onSelect={() => void duplicate(kit)}>
                                  <Copy />
                                  Duplicar
                                </DropdownMenuItem>
                              ) : null}
                              {canDelete ? (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    variant="destructive"
                                    onSelect={() => void remove(kit)}
                                  >
                                    <Trash2 />
                                    Borrar
                                  </DropdownMenuItem>
                                </>
                              ) : null}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableScrollArea>
            </div>
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

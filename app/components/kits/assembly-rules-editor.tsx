"use client"

import * as React from "react"
import { Plus, Save } from "lucide-react"

import { Button } from "~/components/ui/button"
import { DeleteIconButton } from "~/components/ui/icon-action-button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Skeleton } from "~/components/ui/skeleton"
import { Switch } from "~/components/ui/switch"
import { Textarea } from "~/components/ui/textarea"
import type { AssemblyRule } from "~/domain/kits/kits.schemas"
import type { GridType } from "~/domain/products/products.schemas"
import { GRID_TYPE_LABELS } from "~/lib/products/grid-type.utils"
import { appToast } from "~/lib/toast"
import { kitsService } from "~/services/kits.service"

type DraftRule = Omit<AssemblyRule, "id"> & { id?: string; key: string; dirty?: boolean }

const ALL = "all"

export function AssemblyRulesEditor({ canEdit }: { canEdit: boolean }) {
  const [rules, setRules] = React.useState<DraftRule[] | null>(null)
  const [savingKey, setSavingKey] = React.useState<string | null>(null)

  React.useEffect(() => {
    kitsService
      .listRules()
      .then((rows) => setRules(rows.map((r) => ({ ...r, key: r.id }))))
      .catch(() => {
        setRules([])
        appToast.error("No se pudieron cargar las reglas")
      })
  }, [])

  const patch = (key: string, changes: Partial<DraftRule>) =>
    setRules((prev) =>
      prev?.map((r) => (r.key === key ? { ...r, ...changes, dirty: true } : r)) ?? prev,
    )

  const save = async (rule: DraftRule) => {
    if (!rule.text.trim()) {
      appToast.warning("La regla no puede estar vacía")
      return
    }
    setSavingKey(rule.key)
    try {
      const saved = await kitsService.saveRule(rule)
      setRules((prev) => prev?.map((r) => (r.key === rule.key ? { ...saved, key: saved.id } : r)) ?? prev)
      appToast.success("Regla guardada")
    } catch {
      appToast.error("No se pudo guardar la regla")
    } finally {
      setSavingKey(null)
    }
  }

  const removeRule = async (rule: DraftRule) => {
    if (rule.id) {
      try {
        await kitsService.removeRule(rule.id)
      } catch {
        appToast.error("No se pudo borrar la regla")
        return
      }
    }
    setRules((prev) => prev?.filter((r) => r.key !== rule.key) ?? prev)
  }

  const addRule = () =>
    setRules((prev) => [
      ...(prev ?? []),
      {
        key: `new-${Date.now()}`,
        grid_type: null,
        text: "",
        active: true,
        sort_order: (prev?.length ?? 0) + 1,
        dirty: true,
      },
    ])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reglas de armado</CardTitle>
        <CardDescription>
          Frases cortas que la IA respeta al sugerir o ajustar un kit. Las reglas duras (nunca
          baterías en on-grid, ±15 % de potencia) también están en el código.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {rules === null ? (
          <Skeleton className="h-40" />
        ) : (
          rules.map((rule) => (
            <div key={rule.key} className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-start">
              <Select
                value={rule.grid_type ?? ALL}
                onValueChange={(v) => patch(rule.key, { grid_type: v === ALL ? null : (v as GridType) })}
                disabled={!canEdit}
              >
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todos</SelectItem>
                  {(["ON-GRID", "HYBRID", "OFF-GRID"] as const).map((g) => (
                    <SelectItem key={g} value={g}>
                      {GRID_TYPE_LABELS[g]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea
                rows={2}
                value={rule.text}
                onChange={(e) => patch(rule.key, { text: e.target.value })}
                disabled={!canEdit}
                className="min-h-9 flex-1"
                placeholder="Ej.: Incluir siempre protecciones DC y AC"
              />
              <div className="flex items-center gap-2">
                <Switch
                  checked={rule.active}
                  onCheckedChange={(active) => patch(rule.key, { active })}
                  disabled={!canEdit}
                  aria-label="Activa"
                />
                {canEdit ? (
                  <>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground"
                      aria-label="Guardar regla"
                      disabled={!rule.dirty || savingKey === rule.key}
                      onClick={() => void save(rule)}
                    >
                      <Save />
                    </Button>
                    <DeleteIconButton label="Borrar regla" onClick={() => void removeRule(rule)} />
                  </>
                ) : null}
              </div>
            </div>
          ))
        )}
        {canEdit ? (
          <Button variant="outline" size="sm" className="self-start" onClick={addRule}>
            <Plus data-icon="inline-start" />
            Agregar regla
          </Button>
        ) : null}
      </CardContent>
    </Card>
  )
}

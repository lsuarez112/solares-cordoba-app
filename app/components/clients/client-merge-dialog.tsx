"use client"

import * as React from "react"
import { Merge, Search } from "lucide-react"

import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { ScrollArea } from "~/components/ui/scroll-area"
import { Spinner } from "~/components/ui/spinner"
import type { Client, ClientListItem } from "~/domain/clients/clients.schemas"
import { normalizePhone } from "~/lib/clients/phone"
import { appToast } from "~/lib/toast"
import { clientsService } from "~/services/clients.service"

type ClientMergeDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Cliente desde el que se abre. */
  keep: ClientListItem
  /**
   * "into": los elegidos se unifican EN este cliente (se conserva este).
   * "from": este cliente es el duplicado y se unifica en el que se elija.
   */
  direction?: "into" | "from"
  onMerged: (client: Client) => void
}

const matches = (c: ClientListItem, q: string) =>
  [c.name, c.phone, c.email, c.city, c.cuit]
    .filter(Boolean)
    .some((v) => String(v).toLowerCase().includes(q))

/**
 * Unifica clientes duplicados en `keep`: le pasan sus presupuestos (también los
 * emitidos), se completan los datos que le falten y se borran los demás.
 */
export function ClientMergeDialog({
  open,
  onOpenChange,
  keep,
  direction = "into",
  onMerged,
}: ClientMergeDialogProps) {
  const single = direction === "from"
  const [clients, setClients] = React.useState<ClientListItem[] | null>(null)
  const [query, setQuery] = React.useState("")
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (!open) return
    setQuery("")
    setClients(null)
    clientsService
      .list()
      .then((rows) => {
        const others = rows.filter((c) => c.id !== keep.id)
        setClients(others)
        // Preselecciona los que comparten teléfono.
        const phone = normalizePhone(keep.phone)
        const samePhone = phone ? others.filter((c) => c.phone_normalized === phone) : []
        setSelected(new Set((single ? samePhone.slice(0, 1) : samePhone).map((c) => c.id)))
      })
      .catch(() => {
        setClients([])
        appToast.error("No se pudieron cargar los clientes")
      })
  }, [open, keep.id, keep.phone, single])

  const phone = normalizePhone(keep.phone)
  const visible = React.useMemo(() => {
    if (!clients) return []
    const q = query.trim().toLowerCase()
    const list = q ? clients.filter((c) => matches(c, q)) : clients
    // Primero los de igual teléfono y los ya seleccionados.
    return [...list]
      .sort((a, b) => {
        const score = (c: ClientListItem) =>
          (selected.has(c.id) ? 2 : 0) + (phone && c.phone_normalized === phone ? 1 : 0)
        return score(b) - score(a) || a.name.localeCompare(b.name)
      })
      .slice(0, 50)
  }, [clients, query, selected, phone])

  const toggle = (id: string) =>
    setSelected((prev) => {
      if (single) return new Set(prev.has(id) ? [] : [id])
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const chosen = clients?.filter((c) => selected.has(c.id)) ?? []
  const movedQuotes = single ? keep.quotes_count : chosen.reduce((sum, c) => sum + c.quotes_count, 0)

  const confirm = async () => {
    if (chosen.length === 0) return
    setSaving(true)
    try {
      const merged = single
        ? await clientsService.merge(chosen[0].id, [keep.id])
        : await clientsService.merge(keep.id, chosen.map((c) => c.id))
      appToast.success(
        single || chosen.length === 1 ? "Cliente unificado" : `${chosen.length} clientes unificados`,
      )
      onMerged(merged)
      onOpenChange(false)
    } catch (error) {
      appToast.error("No se pudo unificar", {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(92svh,720px)] max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 border-b px-4 py-3">
          <DialogTitle>
            {single ? `Unificar ${keep.name} en otro cliente` : `Unificar clientes en ${keep.name}`}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {single
              ? `Elegí el cliente correcto. Los presupuestos de ${keep.name} pasan a ese cliente, se completan los datos que falten y ${keep.name} se borra. No se puede deshacer.`
              : `Elegí los duplicados. Sus presupuestos pasan a ${keep.name}, se completan los datos que falten y los duplicados se borran. No se puede deshacer.`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-3 px-4 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, teléfono, email..."
              className="pl-8"
            />
          </div>

          <ScrollArea className="min-h-0 flex-1 rounded-md border" viewportClassName="max-h-[50svh]">
            {clients === null ? (
              <div className="flex justify-center p-6">
                <Spinner />
              </div>
            ) : visible.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">Sin resultados</p>
            ) : (
              <ul className="divide-y">
                {visible.map((c) => (
                  <li key={c.id}>
                    <label className="flex cursor-pointer items-start gap-3 px-3 py-2 hover:bg-muted/50">
                      <Checkbox
                        checked={selected.has(c.id)}
                        onCheckedChange={() => toggle(c.id)}
                        className="mt-0.5"
                      />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-sm font-medium">{c.name}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {[c.phone, c.city, c.email].filter(Boolean).join(" · ") || "Sin datos de contacto"}
                        </span>
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                        {c.quotes_count} presup.
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </div>

        <DialogFooter className="shrink-0 items-center border-t px-4 py-3 sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {chosen.length === 0
              ? "Ningún cliente elegido"
              : single
                ? `Se conserva ${chosen[0].name} · ${movedQuotes} presupuesto(s) a mover`
                : `${chosen.length} cliente(s) · ${movedQuotes} presupuesto(s) a mover`}
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="button" disabled={chosen.length === 0 || saving} onClick={() => void confirm()}>
              {saving ? <Spinner data-icon="inline-start" /> : <Merge data-icon="inline-start" />}
              Unificar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

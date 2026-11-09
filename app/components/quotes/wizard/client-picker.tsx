"use client"

import * as React from "react"
import { Check, Search, UserPlus } from "lucide-react"

import { ClientFormDialog } from "~/components/clients/client-form-dialog"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import type { ClientListItem } from "~/domain/clients/clients.schemas"
import { normalizePhone } from "~/lib/clients/phone"
import { cn } from "~/lib/utils"

type ClientPickerProps = {
  clients: ClientListItem[]
  selectedId: string | null
  canCreate: boolean
  onSelect: (client: ClientListItem) => void
  /** Cliente recién creado (para agregarlo a la lista). */
  onCreated: (client: ClientListItem) => void
}

const MAX_RESULTS = 8

/** Búsqueda de cliente + alta rápida (nombre y teléfono). Pensado para el celular. */
export function ClientPicker({ clients, selectedId, canCreate, onSelect, onCreated }: ClientPickerProps) {
  const [query, setQuery] = React.useState("")
  const [createOpen, setCreateOpen] = React.useState(false)

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const digits = q.replace(/\D/g, "")
    const phone = digits.length >= 6 ? normalizePhone(digits) : null
    const list = q
      ? clients.filter(
          (c) =>
            [c.name, c.city, c.email, c.cuit].some((v) => v?.toLowerCase().includes(q)) ||
            (digits.length >= 3 && (c.phone_normalized ?? "").includes(digits)) ||
            (phone != null && c.phone_normalized === phone),
        )
      : // Sin búsqueda: los de actividad más reciente.
        [...clients].sort((a, b) =>
          (b.last_quote_at ?? b.created_at).localeCompare(a.last_quote_at ?? a.created_at),
        )
    return list.slice(0, MAX_RESULTS)
  }, [clients, query])

  const selected = clients.find((c) => c.id === selectedId) ?? null
  const looksLikePhone = /^[\d\s+()-]{6,}$/.test(query.trim())

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre o teléfono..."
            className="h-10 pl-8"
            autoFocus
          />
        </div>
        {canCreate ? (
          <Button type="button" variant="outline" className="h-10" onClick={() => setCreateOpen(true)}>
            <UserPlus data-icon="inline-start" className="text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Nuevo cliente</span>
            <span className="sm:hidden">Nuevo</span>
          </Button>
        ) : null}
      </div>

      {!query && selected ? null : (
        <p className="text-xs text-muted-foreground">
          {query ? `${results.length === MAX_RESULTS ? "Primeros " : ""}${results.length} resultado(s)` : "Recientes"}
        </p>
      )}

      <ul className="flex flex-col divide-y rounded-lg border">
        {results.length === 0 ? (
          <li className="flex flex-col items-center gap-2 p-6 text-center text-sm text-muted-foreground">
            No hay clientes que coincidan.
            {canCreate ? (
              <Button type="button" size="sm" variant="outline" onClick={() => setCreateOpen(true)}>
                <UserPlus data-icon="inline-start" />
                Crear {looksLikePhone ? "cliente" : `"${query.trim()}"`}
              </Button>
            ) : null}
          </li>
        ) : (
          results.map((c) => {
            const active = c.id === selectedId
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onSelect(c)}
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/50",
                    active && "bg-primary/5",
                  )}
                >
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium">{c.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {[c.phone, c.city].filter(Boolean).join(" · ") || "Sin teléfono"}
                      {c.quotes_count > 0 ? ` · ${c.quotes_count} presup.` : ""}
                    </span>
                  </span>
                  {active ? <Check className="size-4 shrink-0 text-primary" /> : null}
                </button>
              </li>
            )
          })
        )}
      </ul>

      <ClientFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        defaultName={looksLikePhone ? "" : query.trim()}
        defaultPhone={looksLikePhone ? query.trim() : ""}
        onSaved={(client) => {
          const item: ClientListItem = { ...client, quotes_count: 0, issued_count: 0, last_quote_at: null }
          onCreated(item)
          onSelect(item)
          setQuery("")
        }}
      />
    </div>
  )
}

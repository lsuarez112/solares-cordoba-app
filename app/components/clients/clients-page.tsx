"use client"

import * as React from "react"
import { useNavigate } from "react-router"
import { FileText, Plus, Users, UsersRound } from "lucide-react"

import { ClientDeleteAlertDialog } from "~/components/clients/client-delete-alert-dialog"
import { ClientFormDialog } from "~/components/clients/client-form-dialog"
import { ClientMergeDialog } from "~/components/clients/client-merge-dialog"
import { ClientsDataTable } from "~/components/clients/clients-data-table"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Skeleton } from "~/components/ui/skeleton"
import type { ClientListItem } from "~/domain/clients/clients.schemas"
import { usePermission } from "~/hooks/use-permission"
import { appToast } from "~/lib/toast"
import { clientsService } from "~/services/clients.service"

export type MergeState = { client: ClientListItem; direction: "into" | "from" } | null

/** Teléfonos normalizados que aparecen en más de un cliente. */
export function duplicatedPhoneSet(clients: ClientListItem[]): Set<string> {
  const seen = new Map<string, number>()
  for (const c of clients) {
    if (c.phone_normalized) seen.set(c.phone_normalized, (seen.get(c.phone_normalized) ?? 0) + 1)
  }
  return new Set([...seen].filter(([, n]) => n > 1).map(([p]) => p))
}

export function ClientsPage() {
  const canCreate = usePermission("clients", "create")
  const canUpdate = usePermission("clients", "update")
  const canDelete = usePermission("clients", "delete")
  const canCreateQuote = usePermission("quotes", "create")
  const navigate = useNavigate()

  const [clients, setClients] = React.useState<ClientListItem[] | null>(null)
  const [formOpen, setFormOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<ClientListItem | null>(null)
  const [merge, setMerge] = React.useState<MergeState>(null)
  const [deleting, setDeleting] = React.useState<ClientListItem | null>(null)
  const [phoneFilter, setPhoneFilter] = React.useState<string | undefined>()

  const load = React.useCallback(async () => {
    try {
      setClients(await clientsService.list())
    } catch {
      setClients([])
      appToast.error("No se pudieron cargar los clientes")
    }
  }, [])

  React.useEffect(() => {
    void load()
  }, [load])

  const duplicatedPhones = React.useMemo(() => duplicatedPhoneSet(clients ?? []), [clients])
  const duplicatedCount = React.useMemo(
    () => (clients ?? []).filter((c) => c.phone_normalized && duplicatedPhones.has(c.phone_normalized)).length,
    [clients, duplicatedPhones],
  )

  const onOpen = React.useCallback((c: ClientListItem) => navigate(`/clientes/${c.id}`), [navigate])
  const onEdit = React.useCallback((c: ClientListItem) => {
    setEditing(c)
    setFormOpen(true)
  }, [])
  const onNewQuote = React.useCallback(
    (c: ClientListItem) => navigate(`/presupuestos/nuevo?cliente=${c.id}`),
    [navigate],
  )
  const onMerge = React.useCallback((c: ClientListItem) => setMerge({ client: c, direction: "into" }), [])
  const onDelete = React.useCallback((c: ClientListItem) => setDeleting(c), [])

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex max-w-3xl flex-col gap-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
          <p className="text-sm text-muted-foreground">
            Fichas con el historial de presupuestos. Un teléfono repetido solo se avisa; los
            duplicados se pueden unificar sin perder presupuestos.
          </p>
        </div>
        {canCreate ? (
          <Button
            size="sm"
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            <Plus data-icon="inline-start" />
            Nuevo cliente
          </Button>
        ) : null}
      </div>

      {clients ? (
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="h-6 gap-1.5 px-2.5">
            <Users data-icon="inline-start" />
            Total
            <span className="font-semibold text-foreground tabular-nums">{clients.length}</span>
          </Badge>
          <Badge variant="secondary" className="h-6 gap-1.5 px-2.5">
            <FileText data-icon="inline-start" className="text-sky-600" />
            Con presupuestos
            <span className="font-semibold text-foreground tabular-nums">
              {clients.filter((c) => c.quotes_count > 0).length}
            </span>
          </Badge>
          {duplicatedCount > 0 ? (
            <button type="button" onClick={() => setPhoneFilter(phoneFilter ? undefined : "duplicated")}>
              <Badge variant="secondary" className="h-6 gap-1.5 px-2.5 hover:bg-secondary/70">
                <UsersRound data-icon="inline-start" className="text-amber-600" />
                Teléfono duplicado
                <span className="font-semibold text-foreground tabular-nums">{duplicatedCount}</span>
              </Badge>
            </button>
          ) : null}
        </div>
      ) : null}

      {clients === null ? (
        <Skeleton className="h-80" />
      ) : (
        <ClientsDataTable
          data={clients}
          phoneFilter={phoneFilter}
          duplicatedPhones={duplicatedPhones}
          canCreateQuote={canCreateQuote}
          canUpdate={canUpdate}
          canDelete={canDelete}
          onOpen={onOpen}
          onEdit={onEdit}
          onNewQuote={onNewQuote}
          onMerge={onMerge}
          onDelete={onDelete}
        />
      )}

      <ClientFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        client={editing}
        onSaved={() => void load()}
      />
      {merge ? (
        <ClientMergeDialog
          open
          onOpenChange={(open) => !open && setMerge(null)}
          keep={merge.client}
          direction={merge.direction}
          onMerged={() => void load()}
        />
      ) : null}
      <ClientDeleteAlertDialog
        client={deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        onDeleted={() => void load()}
        onMerge={(c) => setMerge({ client: c, direction: "from" })}
      />
    </div>
  )
}

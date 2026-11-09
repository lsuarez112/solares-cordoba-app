"use client"

import * as React from "react"
import { Link, useNavigate } from "react-router"
import {
  AlertTriangle,
  ArrowLeft,
  FilePlus2,
  Mail,
  MapPin,
  Merge,
  MessageCircle,
  Pencil,
  Phone,
  Trash2,
} from "lucide-react"

import { ClientDeleteAlertDialog } from "~/components/clients/client-delete-alert-dialog"
import { ClientFormDialog } from "~/components/clients/client-form-dialog"
import { ClientMergeDialog } from "~/components/clients/client-merge-dialog"
import type { MergeState } from "~/components/clients/clients-page"
import { QuotesDataTable } from "~/components/quotes/quotes-data-table"
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Skeleton } from "~/components/ui/skeleton"
import type { Client, ClientListItem } from "~/domain/clients/clients.schemas"
import type { QuoteListItem } from "~/domain/quotes/quotes.schemas"
import { usePermission } from "~/hooks/use-permission"
import { useQuoteActions } from "~/hooks/use-quote-actions"
import { whatsappLink } from "~/lib/clients/phone"
import { formatDate } from "~/lib/dates"
import { formatUsd } from "~/lib/quotes/quote-totals"
import { clientsService } from "~/services/clients.service"
import { quotesService } from "~/services/quotes.service"

function Field({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 items-start gap-2 text-sm">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 break-words">{children}</div>
    </div>
  )
}

export function ClientDetailPage({ clientId }: { clientId: string }) {
  const navigate = useNavigate()
  const canUpdate = usePermission("clients", "update")
  const canDelete = usePermission("clients", "delete")
  const canCreateQuote = usePermission("quotes", "create")
  const canUpdateQuote = usePermission("quotes", "update")
  const canDeleteQuote = usePermission("quotes", "delete")

  const [client, setClient] = React.useState<ClientListItem | null>(null)
  const [quotes, setQuotes] = React.useState<QuoteListItem[] | null>(null)
  const [duplicates, setDuplicates] = React.useState<Client[]>([])
  const [editOpen, setEditOpen] = React.useState(false)
  const [merge, setMerge] = React.useState<MergeState>(null)
  const [deleting, setDeleting] = React.useState<ClientListItem | null>(null)
  const [notFound, setNotFound] = React.useState(false)

  const load = React.useCallback(async () => {
    try {
      const [c, q] = await Promise.all([
        clientsService.get(clientId),
        quotesService.listByClient(clientId),
      ])
      setClient(c)
      setQuotes(q)
      setDuplicates(c.phone ? await clientsService.findByPhone(c.phone, c.id) : [])
    } catch {
      setNotFound(true)
    }
  }, [clientId])

  React.useEffect(() => {
    setClient(null)
    setNotFound(false)
    void load()
  }, [load])

  const actions = useQuoteActions({ onDeleted: () => void load() })

  if (notFound) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-sm text-muted-foreground">El cliente no existe o fue unificado con otro.</p>
        <Button variant="outline" size="sm" asChild>
          <Link to="/clientes">
            <ArrowLeft data-icon="inline-start" />
            Volver a clientes
          </Link>
        </Button>
      </div>
    )
  }

  if (!client || !quotes) return <Skeleton className="h-96" />

  const wa = whatsappLink(client.phone)
  const issued = quotes.filter((q) => q.status === "issued" && q.is_current)
  const issuedTotal = issued.reduce((sum, q) => sum + (q.total_usd ?? 0), 0)

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <Link to="/clientes" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-3.5" />
            Clientes
          </Link>
          <h1 className="truncate text-2xl font-semibold tracking-tight">{client.name}</h1>
          <p className="text-xs text-muted-foreground">Alta {formatDate(client.created_at)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {wa ? (
            <Button variant="outline" size="sm" asChild>
              <a href={wa} target="_blank" rel="noopener noreferrer">
                <MessageCircle data-icon="inline-start" className="text-green-600 dark:text-green-400" />
                WhatsApp
              </a>
            </Button>
          ) : null}
          {canUpdate ? (
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil data-icon="inline-start" className="text-sky-600 dark:text-sky-400" />
              Editar
            </Button>
          ) : null}
          {canUpdate ? (
            <Button variant="outline" size="sm" onClick={() => setMerge({ client, direction: "into" })}>
              <Merge data-icon="inline-start" className="text-violet-600 dark:text-violet-400" />
              Unificar
            </Button>
          ) : null}
          {canDelete ? (
            <Button variant="outline" size="sm" onClick={() => setDeleting(client)}>
              <Trash2 data-icon="inline-start" className="text-destructive" />
              Eliminar
            </Button>
          ) : null}
          {canCreateQuote ? (
            <Button size="sm" asChild>
              <Link to={`/presupuestos/nuevo?cliente=${client.id}`}>
                <FilePlus2 data-icon="inline-start" />
                Nuevo presupuesto
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      {duplicates.length > 0 ? (
        <Alert className="border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          <AlertTriangle className="text-amber-600" />
          <AlertTitle>Otro{duplicates.length > 1 ? "s" : ""} cliente{duplicates.length > 1 ? "s" : ""} con el mismo teléfono</AlertTitle>
          <AlertDescription className="text-amber-900/90 dark:text-amber-200/90">
            <span>
              {duplicates.map((d, i) => (
                <React.Fragment key={d.id}>
                  {i > 0 ? ", " : ""}
                  <Link to={`/clientes/${d.id}`} className="font-medium underline-offset-2 hover:underline">
                    {d.name}
                  </Link>
                </React.Fragment>
              ))}
              . Si son la misma persona, unificalos para tener un único historial.
            </span>
            {canUpdate ? (
              <Button
                size="sm"
                variant="outline"
                className="mt-2 w-fit"
                onClick={() => setMerge({ client, direction: "into" })}
              >
                <Merge data-icon="inline-start" />
                Unificar en {client.name}
              </Button>
            ) : null}
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="stagger-y grid items-start gap-4 lg:grid-cols-[18rem_1fr]">
        <Card className="gap-3 py-4">
          <CardHeader className="px-4">
            <CardTitle className="text-sm">Datos</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5 px-4">
            <Field icon={Phone}>{client.phone ?? <span className="text-muted-foreground">Sin teléfono</span>}</Field>
            <Field icon={Mail}>{client.email ?? <span className="text-muted-foreground">Sin email</span>}</Field>
            <Field icon={MapPin}>
              {[client.address, client.city].filter(Boolean).join(", ") || (
                <span className="text-muted-foreground">Sin dirección</span>
              )}
            </Field>
            {client.cuit ? <p className="text-sm"><span className="text-muted-foreground">CUIT/DNI:</span> {client.cuit}</p> : null}
            {client.notes ? (
              <p className="rounded-md bg-muted/50 p-2 text-xs whitespace-pre-line text-muted-foreground">{client.notes}</p>
            ) : null}
            <div className="mt-1 grid grid-cols-2 gap-2 border-t pt-3 text-center">
              <div>
                <p className="text-lg font-semibold tabular-nums">{issued.length}</p>
                <p className="text-xs text-muted-foreground">emitidos</p>
              </div>
              <div>
                <p className="text-lg font-semibold tabular-nums">{formatUsd(issuedTotal)}</p>
                <p className="text-xs text-muted-foreground">USD emitidos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex min-w-0 flex-col gap-2">
          <h2 className="text-sm font-medium">Historial de presupuestos</h2>
          <QuotesDataTable
            data={quotes}
            hideClient
            pageSize={10}
            canCreate={canCreateQuote}
            canUpdate={canUpdateQuote}
            canDelete={canDeleteQuote}
            maxHeightClassName="max-h-[min(60svh,36rem)]"
            {...actions}
          />
        </div>
      </div>

      <ClientFormDialog open={editOpen} onOpenChange={setEditOpen} client={client} onSaved={() => void load()} />
      {merge ? (
        <ClientMergeDialog
          open
          onOpenChange={(open) => !open && setMerge(null)}
          keep={merge.client}
          direction={merge.direction}
          onMerged={(kept) => {
            if (kept.id !== clientId) navigate(`/clientes/${kept.id}`, { replace: true })
            else void load()
          }}
        />
      ) : null}
      <ClientDeleteAlertDialog
        client={deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        onDeleted={() => navigate("/clientes")}
        onMerge={(c) => setMerge({ client: c, direction: "from" })}
      />
    </div>
  )
}

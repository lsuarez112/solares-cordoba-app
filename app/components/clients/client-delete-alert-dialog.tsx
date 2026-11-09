"use client"

import * as React from "react"
import { Trash2 } from "lucide-react"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog"
import { Button } from "~/components/ui/button"
import { Spinner } from "~/components/ui/spinner"
import type { ClientListItem } from "~/domain/clients/clients.schemas"
import { appToast } from "~/lib/toast"
import { clientsService } from "~/services/clients.service"

/**
 * Un cliente con presupuestos no se borra (la base lo impide): se ofrece unificarlo
 * con otro, así su historial no se pierde.
 */
export function ClientDeleteAlertDialog({
  client,
  onOpenChange,
  onDeleted,
  onMerge,
}: {
  client: ClientListItem | null
  onOpenChange: (open: boolean) => void
  onDeleted: () => void
  onMerge: (client: ClientListItem) => void
}) {
  const [busy, setBusy] = React.useState(false)
  const blocked = (client?.quotes_count ?? 0) > 0

  const remove = async () => {
    if (!client) return
    setBusy(true)
    try {
      await clientsService.remove(client.id)
      appToast.success("Cliente eliminado")
      onDeleted()
      onOpenChange(false)
    } catch (error) {
      appToast.error("No se pudo eliminar", {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <AlertDialog open={client != null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {blocked ? "No se puede eliminar" : `¿Eliminar a ${client?.name}?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {blocked
              ? `${client?.name} tiene ${client?.quotes_count} presupuesto(s). Si es un duplicado, unificalo con el cliente correcto: los presupuestos pasan a ese cliente.`
              : "El cliente no tiene presupuestos. Esta acción no se puede deshacer."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{blocked ? "Cerrar" : "Cancelar"}</AlertDialogCancel>
          {blocked ? (
            <Button
              type="button"
              onClick={() => {
                const target = client
                onOpenChange(false)
                if (target) window.setTimeout(() => onMerge(target), 0)
              }}
            >
              Unificar…
            </Button>
          ) : (
            <Button type="button" variant="destructive" disabled={busy} onClick={() => void remove()}>
              {busy ? <Spinner data-icon="inline-start" /> : <Trash2 data-icon="inline-start" />}
              Eliminar
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

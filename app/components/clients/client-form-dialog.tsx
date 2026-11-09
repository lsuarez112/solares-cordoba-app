"use client"

import * as React from "react"
import { useForm, useWatch, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertTriangle, Save } from "lucide-react"
import { Link } from "react-router"

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogScrollableContent,
} from "~/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { Spinner } from "~/components/ui/spinner"
import { Textarea } from "~/components/ui/textarea"
import {
  ClientFormSchema,
  clientToFormValues,
  emptyClientFormValues,
  type Client,
  type ClientFormValues,
} from "~/domain/clients/clients.schemas"
import { normalizePhone } from "~/lib/clients/phone"
import { appToast } from "~/lib/toast"
import { clientsService } from "~/services/clients.service"

type ClientFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Cliente a editar; null = alta. */
  client?: Client | null
  /** Nombre precargado en el alta rápida (lo que se escribió en el buscador). */
  defaultName?: string
  defaultPhone?: string
  onSaved: (client: Client) => void
}

/** Busca clientes con el mismo teléfono mientras se escribe (aviso, no bloquea). */
function usePhoneDuplicates(phone: string, excludeId: string | null, enabled: boolean) {
  const [matches, setMatches] = React.useState<Client[]>([])
  const normalized = normalizePhone(phone)

  React.useEffect(() => {
    if (!enabled || !normalized || normalized.length < 12) {
      setMatches([])
      return
    }
    let cancelled = false
    const timer = window.setTimeout(() => {
      clientsService
        .findByPhone(phone, excludeId)
        .then((rows) => !cancelled && setMatches(rows))
        .catch(() => !cancelled && setMatches([]))
    }, 350)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
    // phone cambia con cada tecla; normalized alcanza para decidir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalized, excludeId, enabled])

  return matches
}

export function ClientFormDialog({
  open,
  onOpenChange,
  client = null,
  defaultName = "",
  defaultPhone = "",
  onSaved,
}: ClientFormDialogProps) {
  const [saving, setSaving] = React.useState(false)
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(ClientFormSchema as never) as Resolver<ClientFormValues>,
    defaultValues: emptyClientFormValues,
  })

  React.useEffect(() => {
    if (!open) return
    form.reset(
      client
        ? clientToFormValues(client)
        : { ...emptyClientFormValues, name: defaultName, phone: defaultPhone },
    )
  }, [open, client, defaultName, defaultPhone, form])

  const phone = useWatch({ control: form.control, name: "phone" }) ?? ""
  const duplicates = usePhoneDuplicates(phone, client?.id ?? null, open)

  const onSubmit = form.handleSubmit(async (values) => {
    setSaving(true)
    try {
      const saved = client
        ? await clientsService.update(client.id, values)
        : await clientsService.create(values)
      appToast.success(client ? "Cliente actualizado" : "Cliente creado")
      onSaved(saved)
      onOpenChange(false)
    } catch (error) {
      appToast.error("No se pudo guardar el cliente", {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setSaving(false)
    }
  })

  const text = (
    name: keyof ClientFormValues,
    label: string,
    props: React.ComponentProps<typeof Input> = {},
  ) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...props} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(92svh,760px)] max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 border-b px-4 py-3">
          <DialogTitle>{client ? "Editar cliente" : "Nuevo cliente"}</DialogTitle>
          <DialogDescription className="text-xs">
            Con nombre y teléfono alcanza; el resto se puede completar después.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <DialogScrollableContent fill className="flex flex-col gap-4">
              {text("name", "Nombre *", { placeholder: "Ej: Juan Pérez", autoFocus: true })}
              {text("phone", "Teléfono (WhatsApp)", {
                placeholder: "Ej: 351 123 4567",
                inputMode: "tel",
                autoComplete: "tel",
              })}

              {duplicates.length > 0 ? (
                <Alert className="border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                  <AlertTriangle className="text-amber-600" />
                  <AlertTitle>
                    Ya existe {duplicates.length === 1 ? "un cliente" : `${duplicates.length} clientes`} con
                    este teléfono
                  </AlertTitle>
                  <AlertDescription className="text-amber-900/90 dark:text-amber-200/90">
                    <ul className="list-disc pl-4">
                      {duplicates.slice(0, 3).map((d) => (
                        <li key={d.id}>
                          <Link
                            to={`/clientes/${d.id}`}
                            className="font-medium underline-offset-2 hover:underline"
                            onClick={() => onOpenChange(false)}
                          >
                            {d.name}
                          </Link>
                          {d.city ? ` · ${d.city}` : ""}
                        </li>
                      ))}
                    </ul>
                    Podés guardarlo igual y unificarlos después desde la ficha del cliente.
                  </AlertDescription>
                </Alert>
              ) : null}

              <div className="grid items-start gap-4 sm:grid-cols-2">
                {text("email", "Email", { type: "email", inputMode: "email" })}
                {text("city", "Localidad")}
              </div>
              <div className="grid items-start gap-4 sm:grid-cols-[1fr_10rem]">
                {text("address", "Dirección")}
                {text("cuit", "CUIT / DNI", { inputMode: "numeric" })}
              </div>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </DialogScrollableContent>

            <DialogFooter className="shrink-0 border-t px-4 py-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Spinner data-icon="inline-start" /> : <Save data-icon="inline-start" />}
                {client ? "Guardar" : "Crear cliente"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

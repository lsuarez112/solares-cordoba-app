"use client"

import * as React from "react"
import { create } from "zustand"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog"

type ConfirmOptions = {
  title: string
  description?: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  /** Botón rojo (borrados). */
  destructive?: boolean
}

type ConfirmState = {
  options: ConfirmOptions | null
  resolve: ((ok: boolean) => void) | null
}

const useConfirmStore = create<ConfirmState>(() => ({ options: null, resolve: null }))

/**
 * Confirmación con el diálogo de la app (reemplaza window.confirm, que algunos
 * navegadores integrados o la app instalada bloquean y devuelven "cancelar" sin mostrar nada).
 */
export function confirmDialog(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    useConfirmStore.getState().resolve?.(false)
    useConfirmStore.setState({ options, resolve })
  })
}

/** Se monta una vez en AppProviders. */
export function ConfirmDialogHost() {
  const { options, resolve } = useConfirmStore()
  const [last, setLast] = React.useState<ConfirmOptions | null>(null)
  if (options && options !== last) setLast(options)
  const shown = options ?? last

  const close = (ok: boolean) => {
    resolve?.(ok)
    useConfirmStore.setState({ options: null, resolve: null })
  }

  return (
    <AlertDialog open={options != null} onOpenChange={(open) => !open && close(false)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{shown?.title}</AlertDialogTitle>
          {shown?.description ? <AlertDialogDescription>{shown.description}</AlertDialogDescription> : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => close(false)}>{shown?.cancelLabel ?? "Cancelar"}</AlertDialogCancel>
          <AlertDialogAction
            variant={shown?.destructive ? "destructive" : "default"}
            onClick={() => close(true)}
          >
            {shown?.confirmLabel ?? "Aceptar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

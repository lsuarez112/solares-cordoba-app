"use client"

import { MoreHorizontal, type LucideIcon } from "lucide-react"

import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { cn } from "~/lib/utils"

/** Tono de cada acción → color del ícono (consistente en toda la app). */
export type ActionTone =
  | "edit"
  | "duplicate"
  | "activate"
  | "deactivate"
  | "delete"
  | "share"
  | "create"
  | "neutral"

export const ACTION_TONE_CLASS: Record<ActionTone, string> = {
  edit: "text-sky-600 dark:text-sky-400",
  duplicate: "text-violet-600 dark:text-violet-400",
  activate: "text-emerald-600 dark:text-emerald-400",
  deactivate: "text-amber-600 dark:text-amber-400",
  delete: "text-destructive",
  share: "text-green-600 dark:text-green-400",
  create: "text-emerald-600 dark:text-emerald-400",
  neutral: "text-muted-foreground",
}

export type RowAction = {
  key: string
  label: string
  icon: LucideIcon
  tone?: ActionTone
  onSelect: () => void
  hidden?: boolean
  disabled?: boolean
}

/**
 * Menú "⋯" de la columna de acciones. Las acciones de borrado van al final,
 * separadas y en rojo.
 */
export function RowActionsMenu({
  actions,
  label = "Acciones",
}: {
  actions: RowAction[]
  label?: string
}) {
  const visible = actions.filter((a) => !a.hidden)
  if (visible.length === 0) return null
  const regular = visible.filter((a) => a.tone !== "delete")
  const destructive = visible.filter((a) => a.tone === "delete")

  const renderItem = (action: RowAction) => {
    const Icon = action.icon
    const tone = action.tone ?? "neutral"
    return (
      <DropdownMenuItem
        key={action.key}
        variant={tone === "delete" ? "destructive" : "default"}
        disabled={action.disabled}
        // Se ejecuta cuando el menú terminó de cerrarse: así un diálogo abierto
        // desde acá no se cierra por el foco que devuelve el menú (Radix).
        onSelect={() => window.setTimeout(action.onSelect, 0)}
      >
        <Icon className={cn(ACTION_TONE_CLASS[tone])} />
        {action.label}
      </DropdownMenuItem>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground"
          aria-label={label}
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          {label}
        </DropdownMenuLabel>
        {regular.map(renderItem)}
        {destructive.length > 0 && regular.length > 0 ? <DropdownMenuSeparator /> : null}
        {destructive.map(renderItem)}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Definición estándar de la columna de acciones (angosta, alineada a la derecha). */
export const ACTIONS_COLUMN_META = {
  headerClassName: "w-10",
  cellClassName: "w-10 text-right",
} as const

export function ActionsHeader() {
  return <span className="sr-only">Acciones</span>
}


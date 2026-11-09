"use client"

import * as React from "react"
import { EllipsisVertical, RefreshCw } from "lucide-react"

import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { formatFetchedAt } from "~/lib/format-fetched-at"
import { cn } from "~/lib/utils"

type DataActionsMenuProps = {
  refreshing?: boolean
  lastFetchedAt?: string | null
  onRefresh?: () => void
  children?: React.ReactNode
  label?: string
  actionsLabel?: string
}

export function DataActionsMenu({
  refreshing = false,
  lastFetchedAt = null,
  onRefresh,
  children,
  label = "Data",
  actionsLabel = "Acciones",
}: DataActionsMenuProps) {
  const formatted = formatFetchedAt(lastFetchedAt)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label="Acciones"
          className="shrink-0"
        >
          <EllipsisVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56 w-56">
        {children ? (
          <>            
            <DropdownMenuGroup>
              <DropdownMenuLabel>{actionsLabel}</DropdownMenuLabel>
              {children}
            </DropdownMenuGroup>
          </>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>{label}</DropdownMenuLabel>
          <DropdownMenuItem
            disabled={refreshing}
            onSelect={() => onRefresh?.()}
            className="gap-2"
          >
            <RefreshCw className={cn("size-4 text-sky-600 dark:text-sky-400", refreshing && "animate-spin")} />
            Actualizar
          </DropdownMenuItem>
          {formatted ? (
            <DropdownMenuItem
              disabled
              className="min-h-0 items-start py-1 text-xs text-muted-foreground"
            >
              Última actualización:{" "}
              <span className="ml-1 tabular-nums">{formatted}</span>
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


"use client"

import { RefreshCw } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "~/components/ui/button"
import { formatFetchedAt } from "~/lib/format-fetched-at"
import { cn } from "~/lib/utils"

type DataRefreshActionsProps = {
  refreshing?: boolean
  lastFetchedAt?: string | null
  onRefresh?: () => void
  children?: ReactNode
}

export function DataRefreshActions({
  refreshing = false,
  lastFetchedAt = null,
  onRefresh,
  children,
}: DataRefreshActionsProps) {
  const formatted = formatFetchedAt(lastFetchedAt)

  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={refreshing}
          onClick={onRefresh}
        >
          <RefreshCw className={cn("size-4", refreshing && "animate-spin")} />
          Actualizar
        </Button>
        {children}
      </div>
      {formatted ? (
        <p className="text-xs text-muted-foreground tabular-nums">
          Última actualización: {formatted}
        </p>
      ) : null}
    </div>
  )
}

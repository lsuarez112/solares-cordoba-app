"use client"

import type * as React from "react"
import { EllipsisVertical } from "lucide-react"

import { Button } from "~/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "~/components/ui/dropdown-menu"
import { cn } from "~/lib/utils"

/** Botón "⋮" con las acciones secundarias de una página (DropdownMenuItem como hijos). */
export function OverflowMenu({
  children,
  label = "Más acciones",
  className,
}: {
  children: React.ReactNode
  label?: string
  className?: string
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon-sm" aria-label={label} className={cn("shrink-0", className)}>
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

import type * as React from "react"

import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip"

/**
 * Tooltip de shadcn para textos truncados, íconos y badges.
 * Sin contenido no renderiza tooltip (devuelve el hijo tal cual).
 */
export function HintTooltip({
  content,
  children,
  side = "top",
}: {
  content: React.ReactNode
  children: React.ReactElement
  side?: "top" | "right" | "bottom" | "left"
}) {
  if (content === null || content === undefined || content === "" || content === false) {
    return children
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} className="max-w-sm whitespace-pre-line">
        {content}
      </TooltipContent>
    </Tooltip>
  )
}

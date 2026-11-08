import type { ReactNode } from "react"

import { ScrollArea } from "~/components/ui/scroll-area"
import { cn } from "~/lib/utils"

type TableScrollAreaProps = {
  children: ReactNode
  className?: string
  /** Alto máximo antes de scrollear verticalmente (el encabezado queda fijo). */
  maxHeightClassName?: string
}

/** Scroll de tablas (shadcn ScrollArea): horizontal y vertical. */
export function TableScrollArea({
  children,
  className,
  maxHeightClassName = "max-h-[min(70svh,48rem)]",
}: TableScrollAreaProps) {
  return (
    <ScrollArea
      type="auto"
      orientation="both"
      className={cn("w-full min-w-0", className)}
      viewportClassName={maxHeightClassName}
    >
      {children}
    </ScrollArea>
  )
}

import type { ReactNode } from "react"

import { cn } from "~/lib/utils"

type TableScrollAreaProps = {
  children: ReactNode
  className?: string
}

/** Scroll horizontal contenido para tablas anchas. */
export function TableScrollArea({ children, className }: TableScrollAreaProps) {
  return (
    <div className={cn("w-full min-w-0 overflow-x-auto overscroll-x-contain", className)}>
      {children}
    </div>
  )
}

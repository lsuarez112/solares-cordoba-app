import type { LucideIcon } from "lucide-react"

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty"
import { cn } from "~/lib/utils"

type TableEmptyStateProps = {
  icon: LucideIcon
  title: string
  description: string
  muted?: boolean
  actions?: React.ReactNode
  className?: string
}

export function TableEmptyState({
  icon: Icon,
  title,
  description,
  muted = false,
  actions,
  className,
}: TableEmptyStateProps) {
  return (
    <Empty
      className={cn(
        "min-h-48 border-0 p-8",
        muted && "bg-muted/30",
        className,
      )}
    >
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription className="max-w-sm text-pretty">
          {description}
        </EmptyDescription>
      </EmptyHeader>
      {actions ? (
        <EmptyContent className="flex-row flex-wrap justify-center gap-2">
          {actions}
        </EmptyContent>
      ) : null}
    </Empty>
  )
}

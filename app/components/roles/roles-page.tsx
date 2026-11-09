import { CheckCircle2, CircleX, Shield } from "lucide-react"
import type { ReactNode } from "react"

import { Badge } from "~/components/ui/badge"
import { Skeleton } from "~/components/ui/skeleton"

type RolesPageRootProps = {
  children: ReactNode
}

function RolesPageRoot({ children }: RolesPageRootProps) {
  return <div className="flex min-w-0 flex-col gap-4">{children}</div>
}

type RolesPageHeaderProps = {
  title: string
  description?: ReactNode
}

function RolesPageHeader({ title, description }: RolesPageHeaderProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <h1 className="text-2xl font-semibold tracking-tight break-words">{title}</h1>
      {description}
    </div>
  )
}

export type RolesPageSummaryStats = {
  total: number
  active: number
  inactive: number
}

type RolesPageSummaryProps = {
  stats: RolesPageSummaryStats
}

function RolesPageSummary({ stats }: RolesPageSummaryProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="secondary" className="h-6 gap-1.5 px-2.5">
            <Shield data-icon="inline-start" />
            Total
            <span className="font-semibold text-foreground tabular-nums">{stats.total}</span>
          </Badge>
      <Badge variant="secondary" className="h-6 gap-1.5 px-2.5">
            <CheckCircle2 data-icon="inline-start" className="text-green-600" />
            Activos
            <span className="font-semibold text-foreground tabular-nums">{stats.active}</span>
          </Badge>
      <Badge variant="secondary" className="h-6 gap-1.5 px-2.5">
            <CircleX data-icon="inline-start" className="text-destructive" />
            Inactivos
            <span className="font-semibold text-foreground tabular-nums">{stats.inactive}</span>
          </Badge>
    </div>
  )
}

function RolesPageSummarySkeleton() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex items-center gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-6" />
        </div>
      ))}
    </div>
  )
}

type RolesPageSectionProps = {
  children: ReactNode
}

function RolesPageSection({ children }: RolesPageSectionProps) {
  return <div className="flex min-w-0 flex-col gap-4">{children}</div>
}

export const RolesPage = Object.assign(RolesPageRoot, {
  Header: RolesPageHeader,
  Summary: RolesPageSummary,
  SummarySkeleton: RolesPageSummarySkeleton,
  Section: RolesPageSection,
})

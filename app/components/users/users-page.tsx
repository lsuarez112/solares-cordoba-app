import { CheckCircle2, CircleX, Clock, Users } from "lucide-react"
import type { ReactNode } from "react"

import { Badge } from "~/components/ui/badge"
import { Skeleton } from "~/components/ui/skeleton"

type UsersPageRootProps = {
  children: ReactNode
}

function UsersPageRoot({ children }: UsersPageRootProps) {
  return <div className="flex min-w-0 flex-col gap-4">{children}</div>
}

type UsersPageHeaderProps = {
  title: string
  description?: ReactNode
}

function UsersPageHeader({ title, description }: UsersPageHeaderProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <h1 className="text-2xl font-semibold tracking-tight break-words">{title}</h1>
      {description}
    </div>
  )
}

export type UsersPageSummaryStats = {
  total: number
  active: number
  pending: number
  inactive: number
}

type UsersPageSummaryProps = {
  stats: UsersPageSummaryStats
}

function UsersPageSummary({ stats }: UsersPageSummaryProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      <div className="flex items-center gap-2">
        <Badge variant="secondary">
          <Users data-icon="inline-start" />
          Total
        </Badge>
        <span className="text-sm font-semibold tabular-nums">{stats.total}</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary">
          <CheckCircle2 data-icon="inline-start" className="text-green-600" />
          Activos
        </Badge>
        <span className="text-sm font-semibold tabular-nums">{stats.active}</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary">
          <Clock data-icon="inline-start" className="text-amber-600" />
          Pendientes
        </Badge>
        <span className="text-sm font-semibold tabular-nums">{stats.pending}</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary">
          <CircleX data-icon="inline-start" className="text-destructive" />
          Inactivos
        </Badge>
        <span className="text-sm font-semibold tabular-nums">{stats.inactive}</span>
      </div>
    </div>
  )
}

function UsersPageSummarySkeleton() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex items-center gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-6" />
        </div>
      ))}
    </div>
  )
}

type UsersPageSectionProps = {
  children: ReactNode
}

function UsersPageSection({ children }: UsersPageSectionProps) {
  return <div className="flex min-w-0 flex-col gap-4">{children}</div>
}

export const UsersPage = Object.assign(UsersPageRoot, {
  Header: UsersPageHeader,
  Summary: UsersPageSummary,
  SummarySkeleton: UsersPageSummarySkeleton,
  Section: UsersPageSection,
})

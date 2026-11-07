"use client"

import { Building2, Star } from "lucide-react"

import { Badge } from "~/components/ui/badge"
import type { UserCompanySummary } from "~/domain/user-companies/user-companies.types"
import { cn } from "~/lib/utils"

type UserCompaniesBadgesProps = {
  companies: UserCompanySummary[]
  className?: string
}

export function UserCompaniesBadges({
  companies,
  className,
}: UserCompaniesBadgesProps) {
  if (companies.length === 0) {
    return <span className="text-sm text-muted-foreground">—</span>
  }

  const defaultCompany =
    companies.find((company) => company.isDefault) ?? companies[0]
  const extraCount = companies.length - 1

  return (
    <div className={cn("flex min-w-0 max-w-xs flex-wrap items-center gap-1.5", className)}>
      <Badge
        variant="secondary"
        className="max-w-full gap-1 truncate"
        title={defaultCompany.companyName}
      >
        {defaultCompany.logoUrl ? (
          <img
            src={defaultCompany.logoUrl}
            alt=""
            className="size-3.5 shrink-0 rounded object-contain"
          />
        ) : (
          <Building2 className="size-3 shrink-0" />
        )}
        {defaultCompany.isDefault ? (
          <Star className="size-3 shrink-0 text-amber-500" />
        ) : null}
        <span className="truncate">{defaultCompany.companyName}</span>
      </Badge>
      {extraCount > 0 ? (
        <Badge variant="outline" className="tabular-nums">
          +{extraCount}
        </Badge>
      ) : null}
    </div>
  )
}

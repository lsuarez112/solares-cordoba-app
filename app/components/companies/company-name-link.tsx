"use client"

import { Building2 } from "lucide-react"

import { Button } from "~/components/ui/button"
import type { Company } from "~/domain/companies/companies.schemas"
import { cn } from "~/lib/utils"

const NAME_MAX_LENGTH = 40

function formatCompanyName(name: string) {
  if (name.length <= NAME_MAX_LENGTH) return name
  return `${name.slice(0, NAME_MAX_LENGTH)}…`
}

type CompanyNameLinkProps = {
  company: Company
  className?: string
  onOpenEdit?: (company: Company) => void
}

export function CompanyNameLink({
  company,
  className,
  onOpenEdit,
}: CompanyNameLinkProps) {
  const displayName = formatCompanyName(company.name)
  const isTruncated = company.name.length > NAME_MAX_LENGTH

  const content = (
    <>
      {company.logo_url ? (
        <img
          src={company.logo_url}
          alt=""
          className="size-5 shrink-0 rounded object-contain"
        />
      ) : (
        <Building2 className="size-4 shrink-0 text-muted-foreground" />
      )}
      {displayName}
    </>
  )

  if (!onOpenEdit) {
    return (
      <span
        className={cn(
          "inline-flex max-w-xs items-center gap-2 truncate text-sm font-medium",
          className,
        )}
        title={isTruncated ? company.name : undefined}
      >
        {content}
      </span>
    )
  }

  return (
    <Button
      type="button"
      variant="link"
      className={cn(
        "h-auto max-w-xs justify-start gap-2 truncate p-0 font-medium text-foreground",
        className,
      )}
      title={isTruncated ? company.name : undefined}
      onClick={() => onOpenEdit(company)}
    >
      {content}
    </Button>
  )
}

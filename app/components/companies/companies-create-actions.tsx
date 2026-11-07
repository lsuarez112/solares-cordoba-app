"use client"

import { Plus } from "lucide-react"

import { Button } from "~/components/ui/button"

type CompaniesCreateActionsProps = {
  onNewCompany?: () => void
}

export function CompaniesCreateActions({
  onNewCompany,
}: CompaniesCreateActionsProps) {
  return (
    <Button size="sm" onClick={onNewCompany}>
      <Plus data-icon="inline-start" />
      Nueva empresa
    </Button>
  )
}

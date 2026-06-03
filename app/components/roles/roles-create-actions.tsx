"use client"

import { Plus } from "lucide-react"

import { Button } from "~/components/ui/button"

type RolesCreateActionsProps = {
  onNewRole?: () => void
}

export function RolesCreateActions({ onNewRole }: RolesCreateActionsProps) {
  return (
    <Button size="sm" onClick={onNewRole}>
      <Plus data-icon="inline-start" />
      Nuevo rol
    </Button>
  )
}

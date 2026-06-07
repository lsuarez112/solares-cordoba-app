"use client"

import { Plus } from "lucide-react"

import { Button } from "~/components/ui/button"

type CategoriesCreateActionsProps = {
  onNewCategory?: () => void
}

export function CategoriesCreateActions({
  onNewCategory,
}: CategoriesCreateActionsProps) {
  return (
    <Button size="sm" onClick={onNewCategory}>
      <Plus data-icon="inline-start" />
      Nueva categoría
    </Button>
  )
}

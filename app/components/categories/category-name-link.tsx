"use client"

import * as React from "react"

import { CategoryDetailDialog } from "./category-detail-dialog"
import { Button } from "~/components/ui/button"
import type { Category } from "~/domain/categories/categories.schemas"
import { cn } from "~/lib/utils"

const NAME_MAX_LENGTH = 40

function formatCategoryName(name: string) {
  if (name.length <= NAME_MAX_LENGTH) return name
  return `${name.slice(0, NAME_MAX_LENGTH)}…`
}

type CategoryNameLinkProps = {
  category: Category
  className?: string
  onOpenEdit?: (category: Category) => void
}

export function CategoryNameLink({
  category,
  className,
  onOpenEdit,
}: CategoryNameLinkProps) {
  const [open, setOpen] = React.useState(false)
  const displayName = formatCategoryName(category.name)
  const isTruncated = category.name.length > NAME_MAX_LENGTH

  return (
    <>
      <Button
        type="button"
        variant="link"
        className={cn(
          "h-auto max-w-xs justify-start truncate p-0 font-medium text-foreground",
          className,
        )}
        title={isTruncated ? category.name : undefined}
        onClick={() => setOpen(true)}
      >
        {displayName}
      </Button>

      <CategoryDetailDialog
        category={category}
        open={open}
        onOpenChange={setOpen}
        onOpenEdit={
          onOpenEdit
            ? () => {
                setOpen(false)
                onOpenEdit(category)
              }
            : undefined
        }
      />
    </>
  )
}

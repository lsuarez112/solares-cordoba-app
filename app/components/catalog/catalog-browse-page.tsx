import type { ReactNode } from "react"

import { CatalogBrowseTable, type CatalogColumn } from "./catalog-browse-table"

type CatalogBrowsePageProps<T extends Record<string, unknown>> = {
  title: string
  description?: string
  columns: CatalogColumn<T>[]
  data: T[]
  loading?: boolean
  toolbar?: ReactNode
}

export function CatalogBrowsePage<T extends Record<string, unknown>>({
  title,
  description,
  columns,
  data,
  loading = false,
  toolbar,
}: CatalogBrowsePageProps<T>) {
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight break-words">{title}</h1>
        {description ? (
          <p className="text-sm text-muted-foreground break-words">{description}</p>
        ) : null}
      </div>
      {toolbar}
      <CatalogBrowseTable columns={columns} data={data} loading={loading} />
    </div>
  )
}

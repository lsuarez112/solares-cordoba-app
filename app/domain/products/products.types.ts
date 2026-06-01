import type { GridType } from "~/domain/products/products.schemas"

export type ProductStatusFilter = "all" | "active" | "inactive" | "stock_alert"

export type ProductStats = {
  total: number
  active: number
  composite: number
  stockAlert: number
}

export type ProductFilters = {
  search: string
  categoryId: string
  gridType: "all" | GridType
  status: ProductStatusFilter
}

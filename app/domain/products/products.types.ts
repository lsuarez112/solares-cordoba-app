import type { GridType } from "~/domain/products/products.schemas"

export type ProductStatusFilter = "all" | "active" | "inactive" | "no_price"

export type ProductStats = {
  total: number
  active: number
  noPrice: number
}

export type ProductFilters = {
  search: string
  categoryId: string
  gridType: "all" | GridType
  status: ProductStatusFilter
}

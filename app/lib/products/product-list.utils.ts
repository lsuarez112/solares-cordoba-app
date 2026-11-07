import type { Product } from "~/domain/products/products.schemas"
import type {
  ProductFilters,
  ProductStats,
  ProductStatusFilter,
} from "~/domain/products/products.types"

export function hasNoPrice(product: Product): boolean {
  return !(product.price_usd > 0)
}

export function getProductStats(products: Product[]): ProductStats {
  return {
    total: products.length,
    active: products.filter((product) => product.active).length,
    noPrice: products.filter(hasNoPrice).length,
  }
}

function matchProductStatus(
  product: Product,
  status: ProductStatusFilter,
): boolean {
  if (status === "all") return true
  if (status === "active") return product.active
  if (status === "inactive") return !product.active
  if (status === "no_price") return hasNoPrice(product)
  return true
}

export function filterProducts(
  products: Product[],
  filters: ProductFilters,
): Product[] {
  const search = filters.search.trim().toLowerCase()

  return products.filter((product) => {
    const matchSearch =
      !search ||
      product.name.toLowerCase().includes(search) ||
      product.product_code.toLowerCase().includes(search) ||
      product.short_desc?.toLowerCase().includes(search)

    const matchCategory =
      filters.categoryId === "all" ||
      product.category_id === filters.categoryId

    const matchGrid =
      filters.gridType === "all" || product.grid_type === filters.gridType

    const matchStatus = matchProductStatus(product, filters.status)

    return matchSearch && matchCategory && matchGrid && matchStatus
  })
}

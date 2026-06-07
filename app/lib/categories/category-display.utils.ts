import type { Category } from "~/domain/categories/categories.schemas"
import type { CategoryFilters } from "~/domain/categories/categories.types"
import { defaultCategoryFilters } from "~/domain/categories/categories.types"

export function displayTextField(
  value: string | null | undefined,
  label: string,
) {
  if (value?.trim()) return value.trim()
  return `Sin ${label}`
}

export function getCategoryStats(
  categories: Category[],
  productCounts: Record<string, number>,
) {
  const total = categories.length
  const withProducts = categories.filter(
    (category) => (productCounts[category.id] ?? 0) > 0,
  ).length

  return {
    total,
    withProducts,
    empty: total - withProducts,
  }
}

export function hasActiveCategoryFilters(
  filters: CategoryFilters,
  defaults: CategoryFilters = defaultCategoryFilters,
) {
  return filters.search.trim().length > 0
}

export function getCategoryProductCount(
  categoryId: string,
  productCounts: Record<string, number>,
) {
  return productCounts[categoryId] ?? 0
}

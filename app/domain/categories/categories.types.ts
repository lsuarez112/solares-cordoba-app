import type { Category } from "~/domain/categories/categories.schemas"

export type { Category } from "~/domain/categories/categories.schemas"

export type CategoryInsert = Omit<Category, "id">
export type CategoryUpdate = Partial<CategoryInsert>

export interface CategoryFilters {
  search: string
}

export const defaultCategoryFilters: CategoryFilters = {
  search: "",
}

import type { Category } from "~/domain/categories/categories.schemas"
import type { CategoryFormValues } from "~/domain/categories/categories.schemas"
import type { CategoryInsert } from "~/domain/categories/categories.types"

export const emptyCategoryFormValues: CategoryFormValues = {
  name: "",
  description: null,
  slug: null,
  icon: "package",
  prefix: null,
}

function cleanOptionalString(value: string | null | undefined) {
  if (value == null) return null
  const trimmed = value.trim()
  return trimmed === "" ? null : trimmed
}

export function slugifyCategoryName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function categoryToFormValues(category: Category): CategoryFormValues {
  return {
    name: category.name,
    description: category.description,
    slug: category.slug,
    icon: category.icon ?? "package",
    prefix: category.prefix,
  }
}

export function formValuesToCategoryInsert(
  values: CategoryFormValues,
): CategoryInsert {
  const name = values.name.trim()
  const slug =
    cleanOptionalString(values.slug ?? null) ?? slugifyCategoryName(name)

  const prefix = cleanOptionalString(values.prefix ?? null)

  return {
    name,
    description: cleanOptionalString(values.description ?? null),
    slug,
    icon: cleanOptionalString(values.icon ?? null),
    prefix: prefix ? prefix.toUpperCase() : null,
  }
}

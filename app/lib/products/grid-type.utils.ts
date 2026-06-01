import type { GridType } from "~/domain/products/products.schemas"

export const GRID_TYPE_LABELS: Record<GridType, string> = {
  "ON-GRID": "On Grid",
  "OFF-GRID": "Off Grid",
  HYBRID: "Híbrido",
}

export const GRID_TYPE_COLORS: Record<GridType, string> = {
  "ON-GRID": "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  "OFF-GRID": "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  HYBRID: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
}

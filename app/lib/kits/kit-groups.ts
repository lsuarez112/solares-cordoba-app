/**
 * Agrupación de la lista de materiales por tipo (categoría del producto).
 * El orden de grupos sigue el armado típico de un kit.
 */

export const KIT_GROUP_ORDER = ["PNL", "INV", "BAT", "REG", "MON", "CAB", "PRO", "EST", "OTR"]

export const OTHER_GROUP = { key: "OTR", label: "Otros" }

export type GroupedProduct = {
  category?: { name: string; prefix?: string | null } | null
}

export function groupKeyOf(product: GroupedProduct | undefined): string {
  return product?.category?.prefix?.trim() || OTHER_GROUP.key
}

export function groupLabelOf(product: GroupedProduct | undefined): string {
  return product?.category?.name?.trim() || OTHER_GROUP.label
}

export function groupRank(key: string): number {
  const i = KIT_GROUP_ORDER.indexOf(key)
  return i === -1 ? KIT_GROUP_ORDER.length : i
}

/**
 * Ordena los ítems para que cada grupo quede contiguo, respetando el orden
 * relativo dentro de cada grupo (orden estable).
 */
export function sortByGroup<T extends { product_code: string }>(
  items: T[],
  products: Map<string, GroupedProduct>,
): T[] {
  return items
    .map((item, index) => ({ item, index, rank: groupRank(groupKeyOf(products.get(item.product_code))) }))
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map(({ item }) => item)
}

/** Índice donde insertar un ítem nuevo: al final de su grupo. */
export function insertionIndex<T extends { product_code: string }>(
  items: T[],
  products: Map<string, GroupedProduct>,
  productCode: string,
): number {
  const rank = groupRank(groupKeyOf(products.get(productCode)))
  let index = 0
  items.forEach((item, i) => {
    if (groupRank(groupKeyOf(products.get(item.product_code))) <= rank) index = i + 1
  })
  return index
}

export type ItemGroup<T> = {
  key: string
  label: string
  /** Posiciones de los ítems del grupo dentro del array original. */
  indexes: number[]
  items: T[]
}

/** Agrupa (asumiendo grupos contiguos; usar sortByGroup antes). */
export function groupItems<T extends { product_code: string }>(
  items: T[],
  products: Map<string, GroupedProduct>,
): ItemGroup<T>[] {
  const groups = new Map<string, ItemGroup<T>>()
  items.forEach((item, index) => {
    const product = products.get(item.product_code)
    const key = groupKeyOf(product)
    if (!groups.has(key)) groups.set(key, { key, label: groupLabelOf(product), indexes: [], items: [] })
    const group = groups.get(key)!
    group.indexes.push(index)
    group.items.push(item)
  })
  return [...groups.values()].sort((a, b) => groupRank(a.key) - groupRank(b.key))
}

import { describe, expect, it } from "vitest"

import { groupItems, insertionIndex, sortByGroup, type GroupedProduct } from "./kit-groups"

const cat = (prefix: string, name: string) => ({ category: { prefix, name } })
const products = new Map<string, GroupedProduct>([
  ["PANEL", cat("PNL", "Paneles Solares")],
  ["INV", cat("INV", "Inversores")],
  ["CABLE1", cat("CAB", "Cableado")],
  ["CABLE2", cat("CAB", "Cableado")],
  ["SIN", { category: null }],
])

const items = [
  { product_code: "CABLE1", qty: 1 },
  { product_code: "PANEL", qty: 8 },
  { product_code: "SIN", qty: 1 },
  { product_code: "CABLE2", qty: 1 },
  { product_code: "INV", qty: 1 },
]

describe("sortByGroup", () => {
  it("deja los grupos contiguos y en orden de armado, estable dentro del grupo", () => {
    expect(sortByGroup(items, products).map((i) => i.product_code)).toEqual([
      "PANEL",
      "INV",
      "CABLE1",
      "CABLE2",
      "SIN",
    ])
  })
})

describe("insertionIndex", () => {
  it("inserta al final del grupo del producto", () => {
    const sorted = sortByGroup(items, products)
    expect(insertionIndex(sorted, products, "CABLE1")).toBe(4)
    expect(insertionIndex(sorted, products, "PANEL")).toBe(1)
    expect(insertionIndex([], products, "PANEL")).toBe(0)
  })
})

describe("groupItems", () => {
  it("agrupa con etiqueta y posiciones originales", () => {
    const groups = groupItems(sortByGroup(items, products), products)
    expect(groups.map((g) => [g.key, g.label, g.indexes])).toEqual([
      ["PNL", "Paneles Solares", [0]],
      ["INV", "Inversores", [1]],
      ["CAB", "Cableado", [2, 3]],
      ["OTR", "Otros", [4]],
    ])
  })
})

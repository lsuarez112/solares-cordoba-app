import { describe, expect, it } from "vitest"

import {
  applyKitOption,
  applyKitOptions,
  computeBomTotals,
  estimateMonthlyKwh,
  type BomLine,
} from "./kit-bom"

const base: BomLine[] = [
  { product_code: "549423", qty: 8 },
  { product_code: "038019", qty: 1 },
  { product_code: "575917", qty: 1 },
  { product_code: "575928", qty: 1 },
]

describe("applyKitOption", () => {
  it("add suma cantidad o agrega", () => {
    const out = applyKitOption(base, [
      { op: "add", product_code: "575917", qty: 1 },
      { op: "add", product_code: "576108", qty: 2 },
    ])
    expect(out.find((l) => l.product_code === "575917")?.qty).toBe(2)
    expect(out.at(-1)).toEqual({ product_code: "576108", qty: 2 })
  })

  it("set fija la cantidad y set 0 quita", () => {
    const out = applyKitOption(base, [
      { op: "set", product_code: "549423", qty: 10 },
      { op: "set", product_code: "575928", qty: 0 },
    ])
    expect(out.find((l) => l.product_code === "549423")?.qty).toBe(10)
    expect(out.some((l) => l.product_code === "575928")).toBe(false)
  })

  it("remove + add reemplaza un producto", () => {
    const out = applyKitOption(base, [
      { op: "remove", product_code: "575917" },
      { op: "remove", product_code: "575928" },
      { op: "add", product_code: "046040", qty: 1 },
    ])
    expect(out.map((l) => l.product_code)).toEqual(["549423", "038019", "046040"])
  })

  it("quitar y volver a agregar el mismo producto", () => {
    const out = applyKitOption(base, [
      { op: "remove", product_code: "038019" },
      { op: "add", product_code: "038019", qty: 2 },
    ])
    expect(out.find((l) => l.product_code === "038019")?.qty).toBe(2)
  })

  it("no muta el BOM base", () => {
    applyKitOption(base, [{ op: "set", product_code: "549423", qty: 1 }])
    expect(base[0].qty).toBe(8)
  })
})

describe("applyKitOptions", () => {
  it("aplica varios opcionales en orden", () => {
    const out = applyKitOptions(base, [
      { changes: [{ op: "add", product_code: "575917", qty: 1 }] },
      { changes: [{ op: "add", product_code: "575917", qty: 1 }] },
    ])
    expect(out.find((l) => l.product_code === "575917")?.qty).toBe(3)
  })
})

describe("computeBomTotals", () => {
  it("suma y avisa productos sin precio o inexistentes", () => {
    const products = new Map([
      ["549423", { name: "Panel", price_usd: 100 }],
      ["038019", { name: "SPH5000", price_usd: 0 }],
      ["575917", { name: "Hope", price_usd: 1500.555 }],
    ])
    const totals = computeBomTotals(
      [...base.slice(0, 3), { product_code: "XXX", qty: 1 }],
      products,
    )
    expect(totals.totalUsd).toBe(2300.56)
    expect(totals.missingPrice).toEqual(["038019"])
    expect(totals.unknownCodes).toEqual(["XXX"])
  })
})

describe("estimateMonthlyKwh", () => {
  it("usa la fórmula del armador (3.28 kWp, 4.4 h, 0.75)", () => {
    expect(estimateMonthlyKwh(3.28, 4.4, 0.75)).toBe(325)
  })
})

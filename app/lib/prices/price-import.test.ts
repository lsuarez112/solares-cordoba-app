import { describe, expect, it } from "vitest"

import {
  buildPriceImportRows,
  detectColumns,
  normalizeProductCode,
  parsePriceValue,
  summarizePriceImport,
  toPriceImportPayload,
} from "./price-import"

const catalog = new Map([
  ["037046", { name: "Panel 460Wp", price_usd: 0 }],
  ["575917", { name: "Hope 5.5", price_usd: 1500 }],
  ["MC4-CON2", { name: "Conector 1500V", price_usd: 3 }],
])

describe("normalizeProductCode", () => {
  it("completa con ceros los SKU numéricos cortos", () => {
    expect(normalizeProductCode("37046")).toBe("037046")
    expect(normalizeProductCode(" 037046 ")).toBe("037046")
    expect(normalizeProductCode("575917")).toBe("575917")
    expect(normalizeProductCode("mc4-con2")).toBe("MC4-CON2")
  })
})

describe("parsePriceValue", () => {
  it.each([
    [1234.5, 1234.5],
    ["1234.56", 1234.56],
    ["1.234,56", 1234.56],
    ["1,234.56", 1234.56],
    ["12,5", 12.5],
    ["1,234", 1234],
    ["USD 99", 99],
    ["$ 1.500,00", 1500],
    ["1.234.567", 1234567],
  ])("%s → %s", (input, expected) => {
    expect(parsePriceValue(input)).toBe(expected)
  })

  it("devuelve null si no es un número", () => {
    expect(parsePriceValue("")).toBeNull()
    expect(parsePriceValue("abc")).toBeNull()
    expect(parsePriceValue(null)).toBeNull()
  })
})

describe("detectColumns", () => {
  it("usa los encabezados aunque estén en otro orden", () => {
    expect(detectColumns(["Precio USD", "Código"])).toEqual({
      codeIndex: 1,
      priceIndex: 0,
      hasHeader: true,
    })
  })

  it("sin encabezado usa las dos primeras columnas", () => {
    expect(detectColumns(["37046", 120])).toEqual({
      codeIndex: 0,
      priceIndex: 1,
      hasHeader: false,
    })
  })

  it("encabezado desconocido se saltea", () => {
    expect(detectColumns(["SKU ERP", "Valor final"]).hasHeader).toBe(true)
  })
})

describe("buildPriceImportRows", () => {
  it("clasifica actualizar / sin cambios / no encontrado / inválido", () => {
    const rows = buildPriceImportRows(
      [
        ["Código", "Precio"],
        [37046, "150,50"],
        ["575917", 1500],
        ["999999", 10],
        ["MC4-CON2", "abc"],
        ["", ""],
      ],
      catalog,
    )
    expect(rows.map((r) => r.status)).toEqual([
      "update",
      "unchanged",
      "not_found",
      "invalid",
    ])
    expect(rows[0]).toMatchObject({ code: "037046", price: 150.5, line: 2 })

    expect(summarizePriceImport(rows)).toEqual({
      total: 4,
      update: 1,
      unchanged: 1,
      not_found: 1,
      invalid: 1,
    })
    expect(toPriceImportPayload(rows)).toEqual([
      { code: "037046", price_usd: 150.5 },
      { code: "575917", price_usd: 1500 },
      { code: "999999", price_usd: 10 },
    ])
  })

  it("con código repetido manda la última fila", () => {
    const rows = buildPriceImportRows(
      [
        ["37046", 10],
        ["037046", 20],
      ],
      catalog,
    )
    expect(rows[0].status).toBe("invalid")
    expect(rows[1]).toMatchObject({ status: "update", price: 20 })
  })
})

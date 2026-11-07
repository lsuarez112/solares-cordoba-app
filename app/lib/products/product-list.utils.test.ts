import { describe, expect, it } from "vitest"

import type { Product } from "~/domain/products/products.schemas"
import {
  filterProducts,
  getProductStats,
  hasNoPrice,
} from "~/lib/products/product-list.utils"

function product(overrides: Partial<Product>): Product {
  return {
    id: "00000000-0000-0000-0000-000000000000",
    product_code: "037046",
    name: "Panel Solar 460Wp",
    short_desc: null,
    description: null,
    category_id: null,
    category: null,
    grid_type: null,
    generic_properties: {},
    price_usd: 0,
    price_updated_at: null,
    active: true,
    created_at: null,
    updated_at: null,
    ...overrides,
  }
}

describe("product-list.utils", () => {
  it("detecta productos sin precio", () => {
    expect(hasNoPrice(product({ price_usd: 0 }))).toBe(true)
    expect(hasNoPrice(product({ price_usd: 120.5 }))).toBe(false)
  })

  it("calcula estadísticas", () => {
    const stats = getProductStats([
      product({ price_usd: 10 }),
      product({ active: false }),
    ])
    expect(stats).toEqual({ total: 2, active: 1, noPrice: 1 })
  })

  it("filtra por estado sin precio y búsqueda por código", () => {
    const items = [
      product({ product_code: "037046", price_usd: 0 }),
      product({ product_code: "549423", price_usd: 95 }),
    ]
    const result = filterProducts(items, {
      search: "549",
      categoryId: "all",
      gridType: "all",
      status: "all",
    })
    expect(result.map((p) => p.product_code)).toEqual(["549423"])
    expect(
      filterProducts(items, {
        search: "",
        categoryId: "all",
        gridType: "all",
        status: "no_price",
      }),
    ).toHaveLength(1)
  })
})

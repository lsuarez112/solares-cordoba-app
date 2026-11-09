import { describe, expect, it } from "vitest"

import { resolveQuoteLogoUrl } from "./quote-logo"

describe("resolveQuoteLogoUrl", () => {
  it("usa el logo de la empresa por defecto", () => {
    expect(resolveQuoteLogoUrl({ quote_logo_mode: "company", quote_logo_url: "q.png" }, "c.png")).toBe("c.png")
  })
  it("usa el logo propio y cae al de la empresa si no hay", () => {
    expect(resolveQuoteLogoUrl({ quote_logo_mode: "custom", quote_logo_url: "q.png" }, "c.png")).toBe("q.png")
    expect(resolveQuoteLogoUrl({ quote_logo_mode: "custom", quote_logo_url: null }, "c.png")).toBe("c.png")
  })
  it("sin logo", () => {
    expect(resolveQuoteLogoUrl({ quote_logo_mode: "none", quote_logo_url: "q.png" }, "c.png")).toBeNull()
  })
})

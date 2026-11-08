import { describe, expect, it } from "vitest"

import { authLinkErrorPath, safeInternalPath } from "./safe-redirect"

describe("safeInternalPath", () => {
  it("acepta rutas internas", () => {
    expect(safeInternalPath("/restablecer-clave")).toBe("/restablecer-clave")
    expect(safeInternalPath("/kits?x=1")).toBe("/kits?x=1")
  })

  it("rechaza dominios externos y vacíos", () => {
    expect(safeInternalPath("https://evil.com")).toBeNull()
    expect(safeInternalPath("//evil.com")).toBeNull()
    expect(safeInternalPath("/\\evil.com")).toBeNull()
    expect(safeInternalPath("")).toBeNull()
    expect(safeInternalPath(null)).toBeNull()
  })
})

describe("authLinkErrorPath", () => {
  it("si era recuperación vuelve a pedir el link", () => {
    expect(authLinkErrorPath("/restablecer-clave", "expired")).toBe("/recuperar-clave?error=expired")
    expect(authLinkErrorPath("/dashboard", "invalid")).toBe("/?error=auth")
  })
})

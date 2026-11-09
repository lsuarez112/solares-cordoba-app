import { describe, expect, it } from "vitest"

import type { UserProfile } from "~/domain/auth/auth.types"

import { resolvePostLoginPath } from "./post-login-redirect"

const profile = (home_page: string) => ({ home_page }) as UserProfile

describe("resolvePostLoginPath", () => {
  it("usa el redirect interno si viene", () => {
    expect(resolvePostLoginPath("/presupuestos/abc?x=1", profile("/kits"))).toBe("/presupuestos/abc?x=1")
  })

  it("ignora redirects externos y cae a la home del perfil", () => {
    expect(resolvePostLoginPath("https://evil.com", profile("/kits"))).toBe("/kits")
    expect(resolvePostLoginPath("//evil.com", profile("/kits"))).toBe("/kits")
    expect(resolvePostLoginPath("/\t/evil.com", null)).toBe("/dashboard")
  })

  it("sin redirect ni home válida va al dashboard", () => {
    expect(resolvePostLoginPath(null, null)).toBe("/dashboard")
    expect(resolvePostLoginPath(null, profile(" "))).toBe("/dashboard")
    expect(resolvePostLoginPath(null, profile("https://otra.com"))).toBe("/dashboard")
  })
})

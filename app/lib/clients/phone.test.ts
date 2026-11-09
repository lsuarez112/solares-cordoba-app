import { describe, expect, it } from "vitest"

import { isLikelyValidPhone, normalizePhone, whatsappLink } from "./phone"

describe("normalizePhone (igual que public.normalize_phone)", () => {
  it.each([
    ["351 15 123-4567", "5493511234567"],
    ["0351 1234567", "5493511234567"],
    ["+54 9 351 123 4567", "5493511234567"],
    ["+54 351 123 4567", "5493511234567"],
    ["0054 9 11 2345 6789", "5491123456789"],
    ["11 15 2345 6789", "5491123456789"],
  ])("%s → %s", (input, expected) => {
    expect(normalizePhone(input)).toBe(expected)
  })

  it("vacío → null", () => {
    expect(normalizePhone("")).toBeNull()
    expect(normalizePhone(null)).toBeNull()
    expect(normalizePhone("sin teléfono")).toBeNull()
  })

  it("valida largo y arma el link de WhatsApp", () => {
    expect(isLikelyValidPhone("351 1234567")).toBe(true)
    expect(isLikelyValidPhone("1234")).toBe(false)
    expect(whatsappLink("351 1234567", "Hola")).toBe("https://wa.me/5493511234567?text=Hola")
  })
})

import { describe, expect, it } from "vitest"

import { canRevise, isIssued, nextStatus, prevStatus } from "./quote-status"

describe("quote-status", () => {
  it("avanza un paso por vez y termina en facturado", () => {
    expect(nextStatus("draft")).toBeNull()
    expect(nextStatus("issued")).toBe("confirmed")
    expect(nextStatus("confirmed")).toBe("to_invoice")
    expect(nextStatus("to_invoice")).toBe("invoiced")
    expect(nextStatus("invoiced")).toBeNull()
  })

  it("vuelve un paso, nunca a borrador", () => {
    expect(prevStatus("issued")).toBeNull()
    expect(prevStatus("confirmed")).toBe("issued")
    expect(prevStatus("invoiced")).toBe("to_invoice")
    expect(prevStatus("draft")).toBeNull()
  })

  it("emitido = todo lo que no es borrador; se revisa hasta confirmado", () => {
    expect(isIssued("draft")).toBe(false)
    expect(isIssued("invoiced")).toBe(true)
    expect(canRevise("issued")).toBe(true)
    expect(canRevise("confirmed")).toBe(true)
    expect(canRevise("to_invoice")).toBe(false)
    expect(canRevise("draft")).toBe(false)
  })
})

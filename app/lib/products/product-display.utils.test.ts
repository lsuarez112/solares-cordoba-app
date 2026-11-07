import { describe, expect, it } from "vitest"

import {
  formatPropertyValue,
  parseProductGenericProperties,
} from "./product-display.utils"

describe("formatPropertyValue", () => {
  it("agrega la unidad según la clave", () => {
    expect(formatPropertyValue("potencia_wp", "460")).toBe("460 Wp")
    expect(formatPropertyValue("capacidad_kwh", "5.5")).toBe("5.5 kWh")
    expect(formatPropertyValue("potencia_w", "5000")).toBe("5000 W")
  })

  it("no toca claves sin unidad ni valores que ya la tienen", () => {
    expect(formatPropertyValue("quimica", "LiFePO4")).toBe("LiFePO4")
    expect(formatPropertyValue("potencia_wp", "460 Wp")).toBe("460 Wp")
  })
})

describe("parseProductGenericProperties", () => {
  it("convierte números a texto y respeta el orden", () => {
    expect(
      parseProductGenericProperties({ tipo: "panel", potencia_wp: 460 }),
    ).toEqual([
      { key: "tipo", value: "panel" },
      { key: "potencia_wp", value: "460" },
    ])
  })
})

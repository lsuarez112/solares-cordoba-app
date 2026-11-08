import { describe, expect, it } from "vitest"

import {
  formatPropertyValue,
  orderProductProperties,
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

describe("orderProductProperties", () => {
  const items = [
    { key: "notas", value: "ARK — siempre con 575978" },
    { key: "dod", value: "95%" },
    { key: "capacidad_kwh", value: "16" },
    { key: "tipo", value: "batería" },
    { key: "quimica", value: "LiFePO4" },
  ]

  it("ordena por importancia", () => {
    expect(orderProductProperties(items).map((i) => i.key)).toEqual([
      "tipo",
      "capacidad_kwh",
      "quimica",
      "notas",
      "dod",
    ])
  })

  it("en compacto oculta notas y datos de detalle", () => {
    expect(orderProductProperties(items, { compact: true }).map((i) => i.key)).toEqual([
      "tipo",
      "capacidad_kwh",
      "quimica",
    ])
  })
})

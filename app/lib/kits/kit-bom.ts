/**
 * BOM de kits con opcionales. Misma semántica que public.kit_bom en la DB:
 *   add    → suma qty (o agrega el ítem)
 *   set    → fija la cantidad (0 quita el ítem)
 *   remove → quita el ítem
 */

export type KitOptionOp = "add" | "set" | "remove"

export type KitOptionChange = {
  op: KitOptionOp
  product_code: string
  qty?: number
}

export type BomLine = {
  product_code: string
  qty: number
}

export type PricedProduct = {
  name: string
  price_usd: number
  active?: boolean
}

export function applyKitOption(
  base: BomLine[],
  changes: KitOptionChange[],
): BomLine[] {
  const lines = base.map((line) => ({ ...line }))
  const index = new Map(lines.map((line, i) => [line.product_code, i]))
  const removed = new Set<string>()

  for (const change of changes) {
    const code = change.product_code
    const qty = Number(change.qty ?? 0)
    const i = index.get(code)
    const exists = i !== undefined && !removed.has(code)

    if (change.op === "remove" || (change.op === "set" && qty <= 0)) {
      if (exists) removed.add(code)
      continue
    }

    if (exists) {
      lines[i].qty = change.op === "add" ? lines[i].qty + qty : qty
    } else {
      removed.delete(code)
      if (i !== undefined) {
        lines[i].qty = qty
      } else {
        index.set(code, lines.length)
        lines.push({ product_code: code, qty })
      }
    }
  }

  return lines.filter((line) => !removed.has(line.product_code) && line.qty > 0)
}

export function applyKitOptions(
  base: BomLine[],
  options: Array<{ changes: KitOptionChange[] }>,
): BomLine[] {
  return options.reduce((acc, option) => applyKitOption(acc, option.changes), base)
}

export type BomTotals = {
  totalUsd: number
  missingPrice: string[]
  unknownCodes: string[]
}

export function computeBomTotals(
  lines: BomLine[],
  products: Map<string, PricedProduct>,
): BomTotals {
  let total = 0
  const missingPrice: string[] = []
  const unknownCodes: string[] = []

  for (const line of lines) {
    const product = products.get(line.product_code)
    if (!product) {
      unknownCodes.push(line.product_code)
      continue
    }
    if (!(product.price_usd > 0)) missingPrice.push(line.product_code)
    total += line.qty * product.price_usd
  }
  return { totalUsd: Math.round(total * 100) / 100, missingPrice, unknownCodes }
}

/** Generación mensual estimada: kWp × HSP × η × 30. */
export function estimateMonthlyKwh(kwp: number, hsp: number, efficiency: number): number {
  return Math.round(kwp * hsp * efficiency * 30)
}

import type { KitFormValues } from "~/domain/kits/kits.schemas"
import type { KitDetail } from "~/services/kits.service"

export const emptyKitFormValues: KitFormValues = {
  code: "",
  name: "",
  grid_type: "ON-GRID",
  phases: "mono",
  battery_voltage: null,
  kwp: 0,
  battery_kwh: 0,
  inverter_kw: null,
  est_kwh_month: null,
  ref_kwh_month_min: null,
  ref_kwh_month_max: null,
  description: "",
  notes: "",
  active: true,
  items: [],
  options: [],
}

export function kitDetailToFormValues(detail: KitDetail): KitFormValues {
  const { kit, items, options } = detail
  return {
    code: kit.code,
    name: kit.name,
    grid_type: kit.grid_type,
    phases: kit.phases,
    battery_voltage: kit.battery_voltage,
    kwp: kit.kwp,
    battery_kwh: kit.battery_kwh,
    inverter_kw: kit.inverter_kw,
    est_kwh_month: kit.est_kwh_month,
    ref_kwh_month_min: kit.ref_kwh_month_min,
    ref_kwh_month_max: kit.ref_kwh_month_max,
    description: kit.description ?? "",
    notes: kit.notes ?? "",
    active: kit.active,
    items: items.map((item) => ({ product_code: item.product.product_code, qty: item.qty })),
    options: options.map((option) => ({
      code: option.code,
      kind: option.kind,
      name: option.name,
      kwp: option.kwp ?? null,
      battery_kwh: option.battery_kwh ?? null,
      est_kwh_month: option.est_kwh_month ?? null,
      notes: option.notes ?? "",
      changes: option.changes.map((change) => ({
        op: change.op,
        product_code: change.product_code,
        qty: change.qty ?? (change.op === "remove" ? undefined : 1),
      })),
    })),
  }
}

/** Copia para "Duplicar": mismo contenido con código nuevo. */
export function duplicateKitFormValues(values: KitFormValues): KitFormValues {
  return { ...values, code: `${values.code}_COPIA`.slice(0, 40), name: `${values.name} (copia)` }
}

/** Siguiente código libre de opcional para un tipo (A1, A2… / G1… / E1…). */
export function nextOptionCode(
  existing: string[],
  kind: KitFormValues["options"][number]["kind"],
): string {
  const prefix = kind === "autonomy" ? "A" : kind === "generation" ? "G" : "E"
  let n = 1
  const used = new Set(existing.map((c) => c.toUpperCase()))
  while (used.has(`${prefix}${n}`)) n += 1
  return `${prefix}${n}`
}

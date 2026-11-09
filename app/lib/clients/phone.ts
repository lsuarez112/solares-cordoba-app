/**
 * Misma regla que public.normalize_phone() en la base: deja solo dígitos y
 * lleva el número a formato internacional de celular argentino (549…).
 * Sirve para detectar duplicados y armar el link de WhatsApp.
 */
export function normalizePhone(phone: string | null | undefined): string | null {
  let d = String(phone ?? "").replace(/\D/g, "")
  if (!d) return null
  d = d.replace(/^00/, "")
  if (d.startsWith("549")) return d
  if (d.startsWith("54")) d = d.slice(2)
  d = d.replace(/^0/, "")
  // Quita el "15" de celulares escritos a la antigua (ej. 351 15 1234567).
  if (d.length === 12) d = d.replace(/^(\d{2,4})15/, "$1")
  return `549${d}`
}

/** Un teléfono normalizado "razonable" tiene 13 dígitos (549 + 10). */
export function isLikelyValidPhone(phone: string | null | undefined): boolean {
  const n = normalizePhone(phone)
  return n != null && n.length === 13
}

/** Link de WhatsApp (sin mensaje). */
export function whatsappLink(phone: string | null | undefined, text?: string): string | null {
  const n = normalizePhone(phone)
  if (!n) return null
  return `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ""}`
}

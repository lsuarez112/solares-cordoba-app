import type { Product } from "~/domain/products/products.schemas"
import { parseProductGenericProperties } from "~/lib/products/product-display.utils"
import { GRID_TYPE_LABELS } from "~/lib/products/grid-type.utils"

const COPY_SEPARATOR = "─".repeat(36)

function getProps(product: Product) {
  return parseProductGenericProperties(product.generic_properties).map(
    ({ key, value }) => [key, value] as const,
  )
}

export function buildWhatsAppUrl(text: string, phone?: string | null): string {
  const encoded = encodeURIComponent(text)
  const digits = phone?.replace(/\D/g, "") ?? ""
  return digits
    ? `https://wa.me/${digits}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`
}

export function buildWhatsAppText(product: Product): string {
  const props = getProps(product)
  const lines: string[] = []

  lines.push(`*${product.name}*`)

  const meta = [
    product.product_code,
    product.grid_type ? GRID_TYPE_LABELS[product.grid_type] : null,
    product.category?.name ?? null,
  ]
    .filter(Boolean)
    .join(" · ")

  if (meta) lines.push(`_${meta}_`)
  lines.push("")

  const description = product.short_desc?.trim() || product.description?.trim()
  if (description) {
    lines.push(description)
    lines.push("")
  }

  if (props.length > 0) {
    lines.push("*Especificaciones técnicas*")
    props.forEach(([key, value]) => {
      lines.push(`- ${key}: ${value}`)
    })
    lines.push("")
  }

  lines.push(`Precio: USD ${product.price_usd.toFixed(2)}`)

  return lines.join("\n")
}

export function buildCopyText(product: Product): string {
  const props = getProps(product)
  const lines: string[] = []

  lines.push(product.name.toUpperCase())
  lines.push(COPY_SEPARATOR)

  const meta: Array<[string, string]> = [["Código", product.product_code]]
  if (product.category?.name) meta.push(["Categoría", product.category.name])
  if (product.grid_type) {
    meta.push(["Tipo de red", GRID_TYPE_LABELS[product.grid_type]])
  }

  meta.forEach(([key, value]) => {
    lines.push(`${key.padEnd(14)}${value}`)
  })

  const description = product.short_desc?.trim() || product.description?.trim()
  if (description) {
    lines.push("")
    lines.push(description)
  }

  if (props.length > 0) {
    lines.push("")
    lines.push("ESPECIFICACIONES")
    const maxKey = Math.max(...props.map(([k]) => k.length))
    props.forEach(([key, value]) => {
      lines.push(`${key.padEnd(maxKey + 2)}${value}`)
    })
  }

  lines.push("")
  lines.push("PRECIO")
  lines.push(`Venta:  USD ${product.price_usd.toFixed(2)}`)

  return lines.join("\n")
}

import type { Product } from "~/domain/products/products.schemas"
import {
  parseProductGenericProperties,
  parseProductLinks,
} from "~/lib/products/product-display.utils"
import { GRID_TYPE_LABELS } from "~/lib/products/grid-type.utils"

const COPY_SEPARATOR = "─".repeat(36)

function getProps(product: Product) {
  return parseProductGenericProperties(product.generic_properties).map(
    ({ key, value }) => [key, value] as const,
  )
}

function getLinks(product: Product) {
  return parseProductLinks(product.links)
}

export function buildWhatsAppUrl(text: string): string {
  const encoded = encodeURIComponent(text)
  return `https://wa.me/?text=${encoded}`
}

export function buildWhatsAppText(product: Product): string {
  const props = getProps(product)
  const links = getLinks(product)
  const lines: string[] = []

  lines.push(`☀️ *${product.name}*`)

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
      lines.push(`• ${key}: ${value}`)
    })
    lines.push("")
  }

  lines.push("*Precio*")
  lines.push(`💵 USD ${product.price_usd.toFixed(2)}`)

  if (product.stock_alert_at != null) {
    lines.push(`📦 Stock: ${product.stock} (alerta en ${product.stock_alert_at})`)
  } else if (product.stock > 0) {
    lines.push(`📦 Stock: ${product.stock}`)
  }

  if (links.length > 0) {
    lines.push("")
    links.forEach(({ label, url }) => {
      lines.push(`📎 ${label}: ${url}`)
    })
  }

  return lines.join("\n")
}

export function buildCopyText(product: Product): string {
  const props = getProps(product)
  const links = getLinks(product)
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

  if (product.stock > 0 || product.stock_alert_at != null) {
    lines.push(`Stock: ${product.stock}`)
    if (product.stock_alert_at != null) {
      lines.push(`Alerta: ${product.stock_alert_at}`)
    }
  }

  if (links.length > 0) {
    lines.push("")
    lines.push("LINKS")
    const maxLabel = Math.max(...links.map((l) => l.label.length))
    links.forEach(({ label, url }) => {
      lines.push(`${label.padEnd(maxLabel + 2)}${url}`)
    })
  }

  return lines.join("\n")
}

/** @deprecated Usar buildCopyText */
export const buildProductSpecsClipboardText = buildCopyText

/** @deprecated Usar buildWhatsAppText */
export const buildProductWhatsAppText = buildWhatsAppText

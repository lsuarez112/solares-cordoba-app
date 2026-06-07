import { ProductSchema, type Product } from "~/domain/products/products.schemas"
import { SupplierCurrencySchema } from "~/domain/suppliers/suppliers.schemas"

type ProductViewRow = Record<string, unknown>

const VIEW_SUPPLIER_COLUMN = "supplier_name"
const VIEW_CATEGORY_COLUMN = "category_name"

function buildCategoryFromViewColumns(row: ProductViewRow) {
  const id = row.category_id
  const name = row.category_name

  if (typeof id !== "string" || typeof name !== "string" || !name.trim()) {
    return null
  }

  const prefix =
    typeof row.category_prefix === "string" ? row.category_prefix.trim() : null

  return {
    id,
    name: name.trim(),
    description: null,
    slug: null,
    icon: null,
    prefix: prefix || null,
  }
}

function buildSupplierFromViewColumns(row: ProductViewRow) {
  const supplierId = row.supplier_id
  const name = row.supplier_name

  if (typeof supplierId !== "string" || typeof name !== "string" || !name.trim()) {
    return null
  }

  const currencyParsed = SupplierCurrencySchema.safeParse(row.supplier_currency)
  if (!currencyParsed.success) return null

  const paymentDaysRaw = row.supplier_payment_days
  const ratingRaw = row.supplier_rating

  const prefix =
    typeof row.supplier_prefix === "string" ? row.supplier_prefix.trim() : null

  return {
    id: supplierId,
    name: name.trim(),
    prefix: prefix || null,
    tax_id: null,
    currency: currencyParsed.data,
    active: true,
    contact_name: null,
    email: typeof row.supplier_email === "string" ? row.supplier_email : null,
    whatsapp:
      typeof row.supplier_whatsapp === "string" ? row.supplier_whatsapp : null,
    phone: typeof row.supplier_phone === "string" ? row.supplier_phone : null,
    payment_days:
      typeof paymentDaysRaw === "number" ? Math.trunc(paymentDaysRaw) : null,
    rating: typeof ratingRaw === "number" ? ratingRaw : null,
  }
}

/** Convierte filas de v_products_with_ars a shape de Product (category + supplier anidados). */
export function normalizeProductViewRow(row: ProductViewRow): ProductViewRow {
  const {
    category_name: _categoryName,
    category_prefix: _categoryPrefix,
    supplier_name: _supplierName,
    supplier_prefix: _supplierPrefix,
    supplier_currency: _supplierCurrency,
    supplier_payment_days: _supplierPaymentDays,
    supplier_rating: _supplierRating,
    supplier_phone: _supplierPhone,
    supplier_whatsapp: _supplierWhatsapp,
    supplier_email: _supplierEmail,
    price_ars: _priceArs,
    cost_ars: _costArs,
    current_exchange_rate: _exchangeRate,
    exchange_rate_date: _exchangeRateDate,
    category: _categoryEmbed,
    supplier: _supplierEmbed,
    ...rest
  } = row

  return {
    ...rest,
    category: buildCategoryFromViewColumns(row),
    supplier: buildSupplierFromViewColumns(row),
  }
}

export function viewRowsIncludeSupplierColumns(rows: ProductViewRow[]): boolean {
  return rows.some((row) => VIEW_SUPPLIER_COLUMN in row)
}

export function viewRowsIncludeCategoryColumns(rows: ProductViewRow[]): boolean {
  return rows.some((row) => VIEW_CATEGORY_COLUMN in row)
}

export function parseProductsFromViewRows(rows: ProductViewRow[]): Product[] {
  const normalize =
    viewRowsIncludeSupplierColumns(rows) ||
    viewRowsIncludeCategoryColumns(rows)

  return rows
    .map((row) => {
      const shaped = normalize ? normalizeProductViewRow(row) : row
      return ProductSchema.safeParse(shaped)
    })
    .filter((result) => result.success)
    .map((result) => result.data)
}

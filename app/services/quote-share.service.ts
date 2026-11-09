import type { SizingResult } from "~/lib/sizing/sizing"
import { estimatedGeneration } from "~/lib/sizing/sizing"
import type { QuoteDocument } from "~/lib/quotes/quote-document"
import { computeQuoteTotals, lineSubtotal } from "~/lib/quotes/quote-totals"
import { resolveQuoteLogoUrl } from "~/lib/settings/quote-logo"
import { devLog } from "~/lib/dev-log"
import { createClient } from "~/lib/supabase/client"
import { clientsService } from "~/services/clients.service"
import { quotesService } from "~/services/quotes.service"
import { exchangeRatesService, settingsService } from "~/services/settings.service"
import { useCompanyStore } from "~/stores/company.store"

/** Logo → data URL PNG (el PDF no admite SVG ni WebP). null si no carga. */
async function logoAsPng(url: string | null): Promise<string | null> {
  if (!url || typeof document === "undefined") return null
  try {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = url
    await img.decode()
    const scale = Math.min(1, 480 / Math.max(img.naturalWidth || 480, img.naturalHeight || 480))
    const canvas = document.createElement("canvas")
    canvas.width = Math.max(1, Math.round((img.naturalWidth || 480) * scale))
    canvas.height = Math.max(1, Math.round((img.naturalHeight || 160) * scale))
    canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL("image/png")
  } catch (error) {
    devLog("[quote-share] logo", error)
    return null
  }
}

async function sellerName(sellerId: string | null): Promise<string | null> {
  if (!sellerId) return null
  const { data } = await createClient().from("user_profiles").select("full_name").eq("id", sellerId).maybeSingle()
  return data?.full_name?.trim() || null
}

async function kitInfo(kitId: string | null) {
  if (!kitId) return null
  const { data } = await createClient().from("kits").select("name, kwp, battery_kwh").eq("id", kitId).maybeSingle()
  return data ? { name: data.name, kwp: Number(data.kwp) || null, battery_kwh: Number(data.battery_kwh) || null } : null
}

/** Precio vigente de los productos (un borrador se comparte con precios del catálogo). */
async function currentPrices(productIds: string[]): Promise<Map<string, number>> {
  if (productIds.length === 0) return new Map()
  const { data } = await createClient().from("products").select("id, price_usd").in("id", productIds)
  return new Map((data ?? []).map((p) => [p.id, Number(p.price_usd) || 0]))
}

/**
 * Arma todo lo que necesitan el PDF y el mensaje. Emitido: la foto congelada.
 * Borrador: lo guardado con precios vigentes y la cotización del día.
 */
export async function buildQuoteDocument(quoteId: string): Promise<QuoteDocument> {
  const companyStore = useCompanyStore.getState()
  const [detail, settings] = await Promise.all([quotesService.getDetail(quoteId), settingsService.get(), companyStore.fetch()])
  const { quote, items, listItem } = detail
  const isDraft = quote.status === "draft"
  const company = useCompanyStore.getState().company

  const [client, seller, kit, draftRate, prices, logo] = await Promise.all([
    clientsService.get(quote.client_id),
    sellerName(quote.seller_id),
    kitInfo(quote.kit_id),
    isDraft ? exchangeRatesService.getCurrent().catch(() => null) : Promise.resolve(null),
    isDraft ? currentPrices(items.flatMap((i) => (i.product_id ? [i.product_id] : []))) : Promise.resolve(new Map<string, number>()),
    logoAsPng(resolveQuoteLogoUrl(settings, company?.logo_url)),
  ])

  const lines = items.map((i) => {
    const unit = isDraft && i.product_id && prices.has(i.product_id) ? prices.get(i.product_id)! : i.unit_price_usd
    return {
      code: i.code,
      description: i.description,
      qty: i.qty,
      unit_price_usd: unit,
      subtotal_usd: lineSubtotal({ qty: i.qty, unit_price_usd: unit }),
    }
  })

  const rate = isDraft
    ? draftRate
      ? { usd_ars: draftRate.usd_to_ars, source: draftRate.source, date: draftRate.rate_date }
      : null
    : quote.usd_ars
      ? { usd_ars: quote.usd_ars, source: quote.rate_source, date: quote.rate_date }
      : null

  const totals = isDraft
    ? computeQuoteTotals(lines, quote.iva_pct, rate?.usd_ars ?? null)
    : {
        subtotal_usd: quote.subtotal_usd ?? 0,
        iva_pct: quote.iva_pct,
        iva_usd: quote.iva_usd ?? 0,
        total_usd: quote.total_usd ?? 0,
        total_ars: quote.total_ars,
      }

  const sizing = quote.sizing as Partial<SizingResult> | null
  const kwp = kit?.kwp ?? null
  const hsp = sizing?.hsp ?? settings.default_hsp
  const battery = kit?.battery_kwh ?? null

  return {
    number: listItem.display_number ?? "Borrador",
    isDraft,
    date: quote.issued_at ?? quote.updated_at,
    validUntil: quote.valid_until,
    company: company
      ? {
          name: company.name,
          legal_name: company.legal_name,
          tax_id: company.tax_id,
          address: company.address,
          city: company.city,
          province: company.province,
          phone: company.phone,
          email: company.email,
          website: company.website,
        }
      : null,
    logo,
    client: {
      name: client.name,
      phone: client.phone,
      email: client.email,
      city: client.city,
      address: client.address,
      cuit: client.cuit,
    },
    seller,
    system: {
      grid_type: quote.grid_type,
      kit_name: kit?.name ?? null,
      kwp,
      generation_kwh_month: kwp ? estimatedGeneration(kwp, hsp, settings.system_efficiency) : null,
      battery_kwh: battery && quote.grid_type !== "ON-GRID" ? battery : null,
    },
    items: lines,
    totals,
    rate,
    clientNotes: quote.client_notes,
    footer: settings.quote_footer,
  }
}

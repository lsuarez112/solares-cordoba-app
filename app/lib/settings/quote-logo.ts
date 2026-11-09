import type { QuoteLogoMode } from "~/domain/settings/settings.schemas"

/** Logo que lleva el PDF del presupuesto según la configuración. */
export function resolveQuoteLogoUrl(
  settings: { quote_logo_mode: QuoteLogoMode; quote_logo_url: string | null },
  companyLogoUrl: string | null | undefined,
): string | null {
  if (settings.quote_logo_mode === "none") return null
  if (settings.quote_logo_mode === "custom") return settings.quote_logo_url ?? companyLogoUrl ?? null
  return companyLogoUrl ?? null
}

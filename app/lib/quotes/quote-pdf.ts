import { createElement, type ReactElement } from "react"
import type { DocumentProps } from "@react-pdf/renderer"

import type { QuoteDocument } from "~/lib/quotes/quote-document"

/** Genera el PDF A4 del presupuesto (carga @react-pdf/renderer recién al usarlo). */
export async function renderQuotePdf(doc: QuoteDocument): Promise<Blob> {
  const [{ pdf }, { QuotePdfDocument }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("~/components/quotes/pdf/quote-pdf-document"),
  ])
  // QuotePdfDocument devuelve un <Document>.
  const element = createElement(QuotePdfDocument, { doc }) as unknown as ReactElement<DocumentProps>
  return pdf(element).toBlob()
}

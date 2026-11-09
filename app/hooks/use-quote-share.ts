import * as React from "react"

import { whatsappLink } from "~/lib/clients/phone"
import { buildQuoteMessage, quotePdfFileName, type QuoteDocument } from "~/lib/quotes/quote-document"
import { renderQuotePdf } from "~/lib/quotes/quote-pdf"
import { appToast } from "~/lib/toast"
import { buildQuoteDocument } from "~/services/quote-share.service"

export type QuoteShareAction = "whatsapp" | "copy" | "share" | "download" | "preview"

const errorDescription = (error: unknown) => (error instanceof Error ? error.message : undefined)

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

/** Ventana abierta en el clic (antes del await) para que el navegador no la bloquee. */
function openPendingWindow(): Window | null {
  const win = window.open("", "_blank")
  if (win) win.document.title = "Generando…"
  return win
}

/**
 * Compartir un presupuesto: mensaje por WhatsApp al teléfono del cliente,
 * copiar el mensaje, compartir el PDF (Web Share → WhatsApp en el celular),
 * descargarlo o verlo.
 */
export function useQuoteShare() {
  const [busy, setBusy] = React.useState<QuoteShareAction | null>(null)
  const cache = React.useRef(new Map<string, Promise<QuoteDocument>>())

  /** El documento se arma una vez por apertura del menú (invalidate() lo descarta). */
  const getDocument = React.useCallback((quoteId: string) => {
    let doc = cache.current.get(quoteId)
    if (!doc) {
      doc = buildQuoteDocument(quoteId)
      doc.catch(() => cache.current.delete(quoteId))
      cache.current.set(quoteId, doc)
    }
    return doc
  }, [])

  const invalidate = React.useCallback((quoteId?: string) => {
    if (quoteId) cache.current.delete(quoteId)
    else cache.current.clear()
  }, [])

  /** Precarga fresca (al abrir el menú) para que compartir no pierda el gesto del usuario. */
  const prefetch = React.useCallback(
    (quoteId: string) => {
      cache.current.delete(quoteId)
      void getDocument(quoteId).catch(() => {})
    },
    [getDocument],
  )

  const run = React.useCallback(
    async (action: QuoteShareAction, fn: () => Promise<void>, onError?: () => void) => {
      setBusy(action)
      try {
        await fn()
      } catch (error) {
        onError?.()
        if (error instanceof DOMException && error.name === "AbortError") return
        appToast.error("No se pudo compartir el presupuesto", { description: errorDescription(error) })
      } finally {
        setBusy(null)
      }
    },
    [],
  )

  const whatsapp = React.useCallback(
    (quoteId: string) => {
      const win = openPendingWindow()
      return run(
        "whatsapp",
        async () => {
          const doc = await getDocument(quoteId)
          const text = buildQuoteMessage(doc)
          const url = whatsappLink(doc.client.phone, text) ?? `https://wa.me/?text=${encodeURIComponent(text)}`
          if (!doc.client.phone) appToast.info("El cliente no tiene teléfono: elegí el chat en WhatsApp")
          if (win) win.location.href = url
          else window.location.href = url
        },
        () => win?.close(),
      )
    },
    [getDocument, run],
  )

  const copyMessage = React.useCallback(
    (quoteId: string) =>
      run("copy", async () => {
        const doc = await getDocument(quoteId)
        await navigator.clipboard.writeText(buildQuoteMessage(doc))
        appToast.success("Mensaje copiado")
      }),
    [getDocument, run],
  )

  const pdfFile = React.useCallback(
    async (quoteId: string) => {
      const doc = await getDocument(quoteId)
      const blob = await renderQuotePdf(doc)
      return { doc, blob, file: new File([blob], quotePdfFileName(doc), { type: "application/pdf" }) }
    },
    [getDocument],
  )

  const sharePdf = React.useCallback(
    (quoteId: string) =>
      run("share", async () => {
        const { doc, blob, file } = await pdfFile(quoteId)
        const shareData: ShareData = { files: [file], title: file.name }
        if (!navigator.canShare?.(shareData)) {
          downloadBlob(blob, file.name)
          appToast.info("PDF descargado", { description: "Este navegador no comparte archivos: adjuntalo en WhatsApp." })
          return
        }
        try {
          await navigator.share(shareData)
        } catch (error) {
          // Si generar el PDF tardó, el navegador puede pedir un gesto nuevo.
          if (error instanceof DOMException && error.name === "NotAllowedError") {
            appToast.info(`PDF ${doc.number} listo`, {
              duration: 15_000,
              action: { label: "Compartir", onClick: () => void navigator.share(shareData).catch(() => {}) },
            })
            return
          }
          throw error
        }
      }),
    [pdfFile, run],
  )

  const downloadPdf = React.useCallback(
    (quoteId: string) =>
      run("download", async () => {
        const { blob, file } = await pdfFile(quoteId)
        downloadBlob(blob, file.name)
      }),
    [pdfFile, run],
  )

  const previewPdf = React.useCallback(
    (quoteId: string) => {
      const win = openPendingWindow()
      return run(
        "preview",
        async () => {
          const { blob, file } = await pdfFile(quoteId)
          const url = URL.createObjectURL(blob)
          if (win) win.location.href = url
          else downloadBlob(blob, file.name)
          setTimeout(() => URL.revokeObjectURL(url), 5 * 60_000)
        },
        () => win?.close(),
      )
    },
    [pdfFile, run],
  )

  return { busy, prefetch, invalidate, whatsapp, copyMessage, sharePdf, downloadPdf, previewPdf }
}

export type QuoteShare = ReturnType<typeof useQuoteShare>

"use client"

import { ChevronDown, Copy, Download, FileText, MessageCircle, Share2 } from "lucide-react"

import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { ACTION_TONE_CLASS } from "~/components/ui/row-actions-menu"
import { Spinner } from "~/components/ui/spinner"
import type { QuoteShare } from "~/hooks/use-quote-share"
import { appToast } from "~/lib/toast"

/** Botón "Compartir" del detalle: mensaje por WhatsApp o PDF (A4). */
export function QuoteShareMenu({
  quoteId,
  share,
  clientPhone,
  blockedReason,
}: {
  quoteId: string
  share: QuoteShare
  clientPhone: string | null
  /** Si hay cambios sin guardar, se avisa en lugar de compartir algo viejo. */
  blockedReason?: string | null
}) {
  const guard = (fn: (id: string) => unknown) => () => {
    if (blockedReason) {
      appToast.warning(blockedReason)
      return
    }
    void fn(quoteId)
  }

  return (
    <DropdownMenu onOpenChange={(open) => open && !blockedReason && share.prefetch(quoteId)}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={share.busy !== null} aria-label="Compartir">
          {share.busy ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <Share2 data-icon="inline-start" className={ACTION_TONE_CLASS.share} />
          )}
          <span className="hidden sm:inline">Compartir</span>
          <ChevronDown data-icon="inline-end" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Mensaje</DropdownMenuLabel>
        <DropdownMenuItem onSelect={guard(share.whatsapp)}>
          <MessageCircle className={ACTION_TONE_CLASS.share} />
          <span className="flex flex-col">
            Enviar por WhatsApp
            <span className="text-xs text-muted-foreground">
              {clientPhone ? `Al ${clientPhone}` : "El cliente no tiene teléfono"}
            </span>
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={guard(share.copyMessage)}>
          <Copy />
          Copiar mensaje
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">PDF (A4)</DropdownMenuLabel>
        <DropdownMenuItem onSelect={guard(share.sharePdf)}>
          <Share2 className={ACTION_TONE_CLASS.share} />
          <span className="flex flex-col">
            Compartir PDF
            <span className="text-xs text-muted-foreground">En el celular, elegí WhatsApp</span>
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={guard(share.downloadPdf)}>
          <Download />
          Descargar PDF
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={guard(share.previewPdf)}>
          <FileText />
          Ver PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

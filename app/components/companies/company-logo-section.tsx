"use client"

import * as React from "react"
import { Building2, ImagePlus, Loader2, Trash2 } from "lucide-react"

import { Button } from "~/components/ui/button"
import { validateCompanyLogoFile } from "~/lib/companies/company-logo.utils"
import { cn } from "~/lib/utils"

type CompanyLogoSectionProps = {
  logoUrl: string | null
  isEditing: boolean
  uploading?: boolean
  disabled?: boolean
  onFileSelect: (file: File) => void | Promise<void>
  onClearPending?: () => void
}

export function CompanyLogoSection({
  logoUrl,
  isEditing,
  uploading = false,
  disabled = false,
  onFileSelect,
  onClearPending,
}: CompanyLogoSectionProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [localError, setLocalError] = React.useState<string | null>(null)

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    const validationError = validateCompanyLogoFile(file)
    if (validationError) {
      setLocalError(validationError)
      return
    }

    setLocalError(null)
    await onFileSelect(file)
  }

  return (
    <section className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Logo
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div
          className={cn(
            "flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted/40",
            logoUrl && "border-border",
          )}
        >
          {uploading ? (
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          ) : logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo de la empresa"
              className="size-full object-contain p-1"
            />
          ) : (
            <Building2 className="size-8 text-muted-foreground/60" />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            {isEditing
              ? "El logo se sube al seleccionar un archivo."
              : "Seleccioná un logo ahora; se subirá al crear la empresa."}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || uploading}
              onClick={() => inputRef.current?.click()}
            >
              <ImagePlus data-icon="inline-start" />
              {logoUrl ? "Cambiar logo" : "Subir logo"}
            </Button>
            {!isEditing && logoUrl && onClearPending ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled || uploading}
                onClick={onClearPending}
              >
                <Trash2 data-icon="inline-start" />
                Quitar
              </Button>
            ) : null}
          </div>
          {localError ? (
            <p className="text-xs text-destructive">{localError}</p>
          ) : null}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={(event) => void handleFileChange(event)}
      />
    </section>
  )
}

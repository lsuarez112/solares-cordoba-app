"use client"

import * as React from "react"
import { AlertTriangle, Upload } from "lucide-react"

import { ImportProductsPreviewTable } from "~/components/products/products-import-preview-table"
import { createImportProductsTableColumns } from "~/components/products/products-import-table-columns"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Spinner } from "~/components/ui/spinner"
import type { ImportFileFormat } from "~/domain/products/products-import"
import { useProductImport } from "~/hooks/use-product-import"
import { cn } from "~/lib/utils"

type ImportProductsModalProps = {
  open: boolean
  format: ImportFileFormat
  onClose: () => void
}

const formatConfig: Record<
  ImportFileFormat,
  { title: string; accept: string; hint: string }
> = {
  excel: {
    title: "Importar Productos desde Excel",
    accept: ".xlsx,.xls",
    hint: "Excel (.xlsx, .xls) — columnas: código, descripción, precio",
  },
  csv: {
    title: "Importar Productos desde CSV",
    accept: ".csv",
    hint: "CSV — columnas: código, descripción, precio",
  },
}

export function ImportProductsModal({
  open,
  format,
  onClose,
}: ImportProductsModalProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const config = formatConfig[format]

  const {
    step,
    rows,
    progress,
    result,
    fileError,
    rowLimitMessage,
    stats,
    handleFile,
    removeRow,
    updateRow,
    handleImport,
    reset,
  } = useProductImport(format, open)

  const columns = React.useMemo(
    () =>
      createImportProductsTableColumns({
        onUpdateRow: updateRow,
        onRemoveRow: removeRow,
      }),
    [removeRow, updateRow],
  )

  React.useEffect(() => {
    if (!open) reset()
  }, [open, reset])

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose()
      }}
    >
      <DialogContent className="flex max-h-[92vh] w-full max-w-[calc(100%-2rem)] flex-col gap-4 sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
          <DialogDescription>{config.hint}</DialogDescription>
        </DialogHeader>

        {step === "idle" && (
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg border border-dashed p-10 text-center transition-colors hover:bg-muted/50"
            >
              <Upload className="mx-auto mb-2 size-8 text-muted-foreground" />
              <p className="text-sm font-medium">
                Seleccioná tu archivo {format === "excel" ? "Excel" : "CSV"}
              </p>
            </button>
            <input
              ref={inputRef}
              type="file"
              accept={config.accept}
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) void handleFile(file)
                event.target.value = ""
              }}
            />
            {fileError ? (
              <p className="text-sm text-destructive">{fileError}</p>
            ) : null}
          </div>
        )}

        {step === "preview" && (
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            {rowLimitMessage ? (
              <p className="flex items-start gap-2 text-xs text-amber-600">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                {rowLimitMessage}
              </p>
            ) : null}
            <ImportProductsPreviewTable data={rows} columns={columns} />
          </div>
        )}

        {step === "importing" && (
          <div className="flex flex-col items-center gap-3 py-8">
            <Spinner className="size-6" />
            <p className="text-sm font-medium">Importando productos…</p>
            <p className="text-xs text-muted-foreground">
              {progress.done} de {progress.total}
            </p>
            <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full bg-primary transition-all",
                  progress.total === 0 && "w-0",
                )}
                style={{
                  width:
                    progress.total > 0
                      ? `${(progress.done / progress.total) * 100}%`
                      : "0%",
                }}
              />
            </div>
          </div>
        )}

        {step === "done" && result ? (
          <div className="space-y-2 py-4 text-center text-sm">
            <p className="font-medium">Importación completada</p>
            <p className="text-muted-foreground">
              {result.inserted} nuevos · {result.updated} actualizados
              {result.errors > 0 ? ` · ${result.errors} con error` : ""}
            </p>
          </div>
        ) : null}

        <DialogFooter>
          {step === "idle" ? (
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          ) : null}
          {step === "preview" ? (
            <>
              <Button variant="outline" onClick={reset}>
                Volver
              </Button>
              <Button
                onClick={() => void handleImport()}
                disabled={stats.total === 0}
              >
                Importar {stats.total} productos
              </Button>
            </>
          ) : null}
          {step === "done" ? (
            <Button onClick={onClose}>Cerrar</Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

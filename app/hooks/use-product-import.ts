import { useCallback, useMemo, useRef, useState } from "react"

import type {
  ImportFileFormat,
  ImportResult,
  ImportRow,
  RawImportRow,
} from "~/domain/products/products-import"
import {
  applyImportRowLimit,
  buildImportRows,
  isImportRowImportable,
  parseImportFile,
  validateImportRowData,
} from "~/lib/products/products-import.parser"
import { importProducts } from "~/services/products-import.service"
import { useProductsStore } from "~/stores/products.store"

type ImportStep = "idle" | "preview" | "importing" | "done"

export function useProductImport(format: ImportFileFormat, enabled: boolean) {
  const products = useProductsStore((s) => s.products)
  const refresh = useProductsStore((s) => s.refresh)
  const enabledRef = useRef(enabled)
  enabledRef.current = enabled

  const [step, setStep] = useState<ImportStep>("idle")
  const [rows, setRows] = useState<ImportRow[]>([])
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [result, setResult] = useState<ImportResult | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [rowLimitMessage, setRowLimitMessage] = useState<string | null>(null)

  const existingCodes = useMemo(
    () => new Set(products.map((product) => product.product_code)),
    [products],
  )

  const handleFile = useCallback(
    async (file: File) => {
      if (!enabledRef.current) return

      setFileError(null)
      setRowLimitMessage(null)

      try {
        const parsedRows = await parseImportFile(file, format)
        if (!enabledRef.current) return

        if (parsedRows.length === 0) {
          setFileError("El archivo está vacío o no tiene filas válidas")
          return
        }

        const { rows: limitedRows, limit } = applyImportRowLimit(parsedRows)

        if (!enabledRef.current) return

        if (limit.truncated && limit.message) {
          setRowLimitMessage(limit.message)
        }

        const importRows = buildImportRows(limitedRows, existingCodes)
        setRows(importRows)
        setStep("preview")
      } catch {
        if (!enabledRef.current) return
        setFileError("No se pudo leer el archivo. Verificá el formato.")
      }
    },
    [existingCodes, format],
  )

  const removeRow = useCallback((index: number) => {
    setRows((prev) => prev.filter((row) => row.index !== index))
  }, [])

  const updateRow = useCallback(
    (index: number, field: keyof RawImportRow, value: string | number) => {
      setRows((prev) =>
        prev.map((row) => {
          if (row.index !== index) return row

          const draft: Record<string, unknown> = {
            ...row.parsed,
            [field]: value,
          }

          const validation = validateImportRowData(draft, existingCodes)

          return {
            ...row,
            raw: draft,
            parsed: validation.parsed,
            status: validation.status,
            issue: validation.issue,
          }
        }),
      )
    },
    [existingCodes],
  )

  const handleImport = useCallback(async () => {
    if (!enabledRef.current) return

    setStep("importing")
    setProgress({ done: 0, total: 0 })

    const importResult = await importProducts(rows, (done, total) => {
      if (!enabledRef.current) return
      setProgress({ done, total })
    })

    if (!enabledRef.current) return

    setResult(importResult)
    setStep("done")
    await refresh()
  }, [rows, refresh])

  const reset = useCallback(() => {
    setStep("idle")
    setRows([])
    setProgress({ done: 0, total: 0 })
    setResult(null)
    setFileError(null)
    setRowLimitMessage(null)
  }, [])

  const importableRows = rows.filter(isImportRowImportable)

  const stats = {
    total: importableRows.length,
    new: importableRows.filter((row) => row.status === "new").length,
    duplicates: importableRows.filter((row) => row.status === "duplicate").length,
  }

  return {
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
  }
}

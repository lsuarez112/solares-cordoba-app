import Papa from "papaparse"
import * as XLSX from "xlsx"

export const PRICE_IMPORT_ACCEPT = ".xlsx,.xls,.csv,.txt"
export const PRICE_IMPORT_MAX_ROWS = 10000

/** Lee la primera hoja de un Excel o un CSV (con `,` o `;`) como matriz de celdas. */
export async function readPriceMatrix(file: File): Promise<unknown[][]> {
  const name = file.name.toLowerCase()
  const matrix =
    name.endsWith(".xlsx") || name.endsWith(".xls")
      ? await readExcel(file)
      : await readCsv(file)

  if (matrix.length > PRICE_IMPORT_MAX_ROWS + 1) {
    throw new Error(
      `El archivo tiene más de ${PRICE_IMPORT_MAX_ROWS.toLocaleString("es-AR")} filas`,
    )
  }
  return matrix
}

async function readExcel(file: File): Promise<unknown[][]> {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(new Uint8Array(buffer), { type: "array" })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  if (!sheet) return []
  return XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    raw: true,
    blankrows: false,
    defval: "",
  })
}

function readCsv(file: File): Promise<unknown[][]> {
  return new Promise((resolve, reject) => {
    Papa.parse<unknown[]>(file, {
      header: false,
      skipEmptyLines: true,
      delimitersToGuess: [";", ",", "\t", "|"],
      complete: (result) => resolve(result.data),
      error: reject,
    })
  })
}

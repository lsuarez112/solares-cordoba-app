const dateFormatter = new Intl.DateTimeFormat("es-AR", { dateStyle: "short" })
const dateTimeFormatter = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "short",
  timeStyle: "short",
})

/** dd/mm/aa. Acepta ISO con hora o fecha sola (yyyy-mm-dd, sin corrimiento de zona). */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "—"
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00`) : new Date(value)
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date)
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "—" : dateTimeFormatter.format(date)
}

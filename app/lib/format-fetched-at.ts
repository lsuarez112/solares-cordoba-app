const fetchedAtFormatter = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "short",
  timeStyle: "medium",
})

export function formatFetchedAt(iso: string | null | undefined): string | null {
  if (!iso) return null
  return fetchedAtFormatter.format(new Date(iso))
}

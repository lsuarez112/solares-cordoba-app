export const APP_TITLE = "JRJ Gestión"

export function pageTitle(page?: string): string {
  if (!page) return APP_TITLE
  return `${page} · ${APP_TITLE}`
}

export function routeMeta(page?: string) {
  return [{ title: pageTitle(page) }]
}

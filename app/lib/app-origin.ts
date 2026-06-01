/** Origen actual de la app (localhost o IP LAN en dev). */
export function getAppOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin
  }

  return (
    import.meta.env.VITE_APP_URL?.replace(/\/$/, "") ?? "http://localhost:5173"
  )
}

export function getAuthCallbackUrl(): string {
  return `${getAppOrigin()}/auth/callback`
}

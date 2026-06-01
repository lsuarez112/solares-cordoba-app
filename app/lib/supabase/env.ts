function trimTrailingSlash(url: string) {
  return url.replace(/\/$/, "")
}

export function getSupabaseUrl() {
  const url =
    import.meta.env.VITE_SUPABASE_URL ??
    process.env.VITE_SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.SUPABASE_URL

  if (!url) {
    throw new Error(
      "Falta VITE_SUPABASE_URL. Copiá las credenciales desde gestion-app/.env.local",
    )
  }

  return trimTrailingSlash(url)
}

export function getSupabaseAnonKey() {
  const key =
    import.meta.env.VITE_SUPABASE_ANON_KEY ??
    process.env.VITE_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_ANON_KEY

  if (!key) {
    throw new Error(
      "Falta VITE_SUPABASE_ANON_KEY. Copiá las credenciales desde gestion-app/.env.local",
    )
  }

  return key
}

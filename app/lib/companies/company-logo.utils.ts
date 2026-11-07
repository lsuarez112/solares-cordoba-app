const ACCEPTED_LOGO_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
])

const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024

export function getLogoFileExtension(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase()
  if (fromName && ["png", "jpg", "jpeg", "webp", "svg"].includes(fromName)) {
    return fromName === "jpeg" ? "jpg" : fromName
  }

  switch (file.type) {
    case "image/png":
      return "png"
    case "image/jpeg":
      return "jpg"
    case "image/webp":
      return "webp"
    case "image/svg+xml":
      return "svg"
    default:
      return "png"
  }
}

export function validateCompanyLogoFile(file: File): string | null {
  if (!ACCEPTED_LOGO_MIME_TYPES.has(file.type)) {
    return "Formato no soportado. Usá PNG, JPG, WebP o SVG."
  }

  if (file.size > MAX_LOGO_SIZE_BYTES) {
    return "El archivo supera el límite de 2 MB."
  }

  return null
}

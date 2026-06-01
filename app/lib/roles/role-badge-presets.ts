export type RoleBadgeColorPreset = {
  id: string
  label: string
  badge_color: string
  badge_text_color: string
}

export const ROLE_BADGE_COLOR_PRESETS: RoleBadgeColorPreset[] = [
  {
    id: "red",
    label: "Rojo",
    badge_color: "#dc2626",
    badge_text_color: "#ffffff",
  },
  {
    id: "orange",
    label: "Naranja",
    badge_color: "#ea580c",
    badge_text_color: "#ffffff",
  },
  {
    id: "amber",
    label: "Ámbar",
    badge_color: "#d97706",
    badge_text_color: "#ffffff",
  },
  {
    id: "green",
    label: "Verde",
    badge_color: "#16a34a",
    badge_text_color: "#ffffff",
  },
  {
    id: "teal",
    label: "Teal",
    badge_color: "#0d9488",
    badge_text_color: "#ffffff",
  },
  {
    id: "blue",
    label: "Azul",
    badge_color: "#2563eb",
    badge_text_color: "#ffffff",
  },
  {
    id: "indigo",
    label: "Índigo",
    badge_color: "#4f46e5",
    badge_text_color: "#ffffff",
  },
  {
    id: "purple",
    label: "Violeta",
    badge_color: "#7c3aed",
    badge_text_color: "#ffffff",
  },
  {
    id: "slate",
    label: "Gris",
    badge_color: "#475569",
    badge_text_color: "#ffffff",
  },
  {
    id: "neutral",
    label: "Neutro",
    badge_color: "#e4e4e7",
    badge_text_color: "#18181b",
  },
]

export function findBadgeColorPreset(
  badgeColor?: string,
  badgeTextColor?: string,
): RoleBadgeColorPreset | undefined {
  return ROLE_BADGE_COLOR_PRESETS.find(
    (preset) =>
      preset.badge_color === badgeColor &&
      preset.badge_text_color === badgeTextColor,
  )
}

export function getBadgeColorPresetOrDefault(
  badgeColor?: string,
  badgeTextColor?: string,
): RoleBadgeColorPreset {
  return (
    findBadgeColorPreset(badgeColor, badgeTextColor) ??
    ROLE_BADGE_COLOR_PRESETS[0]
  )
}

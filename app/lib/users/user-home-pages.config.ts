import { SIDEBAR_NAV } from "~/components/sidebar/sidebar-nav.config"

export type UserHomePageOption = {
  value: string
  label: string
}

function collectHomePageOptions(): UserHomePageOption[] {
  const options: UserHomePageOption[] = []
  const seen = new Set<string>()

  for (const section of SIDEBAR_NAV.sections) {
    for (const entry of section.entries) {
      if (entry.type === "link") {
        if (seen.has(entry.to)) continue
        seen.add(entry.to)
        options.push({ value: entry.to, label: entry.title })
        continue
      }

      if (entry.type === "submenu") {
        if (entry.to && !seen.has(entry.to)) {
          seen.add(entry.to)
          options.push({ value: entry.to, label: entry.title })
        }

        for (const item of entry.items) {
          if (item.type !== "link" || seen.has(item.to)) continue
          seen.add(item.to)
          options.push({ value: item.to, label: item.title })
        }
      }
    }
  }

  return options
}

export const USER_HOME_PAGE_OPTIONS = collectHomePageOptions()

export function getHomePageLabel(path: string): string {
  return (
    USER_HOME_PAGE_OPTIONS.find((option) => option.value === path)?.label ??
    path
  )
}

"use client"

import { Monitor, Moon, Sun } from "lucide-react"
import { HintTooltip } from "~/components/ui/hint-tooltip"

import { Button } from "~/components/ui/button"
import {
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "~/components/ui/dropdown-menu"
import { THEME_LABELS, THEMES, type Theme } from "~/lib/theme"
import { useTheme } from "~/providers/theme-provider"

const THEME_ICONS: Record<Theme, typeof Sun> = { light: Sun, dark: Moon, system: Monitor }

/** Botón del header: alterna claro ↔ oscuro. */
export function ThemeToggleButton() {
  const { resolvedTheme, setTheme } = useTheme()
  const next = resolvedTheme === "dark" ? "light" : "dark"
  const label = next === "dark" ? "Activar modo oscuro" : "Activar modo claro"

  return (
    <HintTooltip content={label}>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground"
        aria-label={label}
        onClick={() => setTheme(next)}
      >
        {resolvedTheme === "dark" ? <Sun /> : <Moon />}
      </Button>
    </HintTooltip>
  )
}

/** Opciones de tema para un DropdownMenu (menú de usuario). */
export function ThemeMenuRadioGroup() {
  const { theme, setTheme } = useTheme()
  return (
    <DropdownMenuRadioGroup value={theme} onValueChange={(v) => setTheme(v as Theme)}>
      {THEMES.map((t) => {
        const Icon = THEME_ICONS[t]
        return (
          <DropdownMenuRadioItem key={t} value={t}>
            <Icon />
            {THEME_LABELS[t]}
          </DropdownMenuRadioItem>
        )
      })}
    </DropdownMenuRadioGroup>
  )
}

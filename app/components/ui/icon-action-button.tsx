import * as React from "react"
import { Trash2 } from "lucide-react"
import { HintTooltip } from "~/components/ui/hint-tooltip"

import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"

type IconActionButtonProps = Omit<React.ComponentProps<typeof Button>, "variant" | "size"> & {
  label: string
}

/**
 * Botón de ícono secundario (mismo estilo que "Limpiar filtros"): ghost, gris y
 * sin peso visual. Para borrar filas, quitar ítems, etc.
 */
export function IconActionButton({ label, className, children, ...props }: IconActionButtonProps) {
  return (
    <HintTooltip content={label}>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={label}
        className={cn("shrink-0 text-muted-foreground", className)}
        {...props}
      >
        {children}
      </Button>
    </HintTooltip>
  )
}

/** Variante de borrado: gris en reposo, rojo al pasar el mouse. */
export function DeleteIconButton({ label = "Quitar", className, ...props }: Omit<IconActionButtonProps, "label" | "children"> & { label?: string }) {
  return (
    <IconActionButton label={label} className={cn("hover:text-destructive", className)} {...props}>
      <Trash2 />
    </IconActionButton>
  )
}

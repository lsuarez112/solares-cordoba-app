import type { ReactNode } from "react"
import { InfoIcon } from "lucide-react"

import { Button } from "~/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip"

type AuthFormFieldProps = {
  label: string
  htmlFor?: string
  hint?: string
  tooltip?: string
  fieldError?: string | null
  children: ReactNode
}

export function AuthFormField({
  label,
  htmlFor,
  hint,
  tooltip,
  fieldError,
  children,
}: AuthFormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5 text-sm">
      <div className="flex items-center gap-1">
        <label htmlFor={htmlFor} className="font-medium">
          {label}
        </label>
        {tooltip ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="size-6 shrink-0 text-muted-foreground"
                aria-label={`Más información: ${label}`}
              >
                <InfoIcon className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={6} className="max-w-xs">
              {tooltip}
            </TooltipContent>
          </Tooltip>
        ) : null}
      </div>
      {hint ? (
        <p id={htmlFor ? `${htmlFor}-hint` : undefined} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {children}
      {fieldError ? (
        <p className="text-xs text-destructive" role="alert">
          {fieldError}
        </p>
      ) : null}
    </div>
  )
}

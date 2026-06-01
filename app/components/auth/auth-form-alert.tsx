import type { ReactNode } from "react"
import { AlertCircleIcon, InfoIcon } from "lucide-react"

import { cn } from "~/lib/utils"

type AuthFormAlertProps = {
  variant?: "error" | "info"
  title?: string
  children: ReactNode
  className?: string
}

export function AuthFormAlert({
  variant = "error",
  title,
  children,
  className,
}: AuthFormAlertProps) {
  const Icon = variant === "error" ? AlertCircleIcon : InfoIcon

  return (
    <div
      role="alert"
      className={cn(
        "flex gap-2.5 rounded-2xl border px-3 py-2.5 text-sm",
        variant === "error"
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : "border-border bg-muted/50 text-muted-foreground",
        className,
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="min-w-0 space-y-0.5">
        {title ? <p className="font-medium">{title}</p> : null}
        <p className={title ? "text-destructive/90" : undefined}>{children}</p>
      </div>
    </div>
  )
}

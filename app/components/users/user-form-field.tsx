import type { ReactNode } from "react"

type UserFormFieldProps = {
  label: string
  htmlFor?: string
  children: ReactNode
  className?: string
}

export function UserFormField({
  label,
  htmlFor,
  children,
  className,
}: UserFormFieldProps) {
  return (
    <div className={className ?? "flex flex-col gap-1"}>
      <label htmlFor={htmlFor} className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  )
}

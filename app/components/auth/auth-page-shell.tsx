import type { ReactNode } from "react"

/** Misma imagen de fondo para login y registro (`public/images/`). */
export const AUTH_BACKGROUND_IMAGE = "/images/login-background.jfif"

type AuthPageShellProps = {
  children: ReactNode
}

export function AuthPageShell({ children }: AuthPageShellProps) {
  return (
    <div
      className="relative flex min-h-svh w-full items-center justify-center bg-black/40 bg-cover bg-center bg-no-repeat p-6"
      style={{ backgroundImage: `url(${AUTH_BACKGROUND_IMAGE})` }}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-card/95 p-6 shadow-xl backdrop-blur-sm">
        {children}
      </div>
    </div>
  )
}

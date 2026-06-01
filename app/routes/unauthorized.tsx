import { useEffect, useRef, useState } from "react"
import { ShieldAlertIcon } from "lucide-react"
import { useNavigate } from "react-router"

import { AuthFormAlert } from "~/components/auth/auth-form-alert"
import { AuthPageShell } from "~/components/auth/auth-page-shell"
import { Button } from "~/components/ui/button"
import { Spinner } from "~/components/ui/spinner"
import { useAuth } from "~/hooks/use-auth"

export default function UnauthorizedPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const mountedRef = useRef(true)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  async function handleReturnToLogin() {
    setPending(true)
    try {
      await logout()
      navigate("/", { replace: true })
    } finally {
      if (mountedRef.current) {
        setPending(false)
      }
    }
  }

  return (
    <AuthPageShell>
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <ShieldAlertIcon className="size-6" aria-hidden />
        </div>
        <h1 className="text-xl font-semibold">Sin permiso</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tu cuenta no tiene los permisos necesarios para acceder a esa página.
        </p>
      </div>

      <AuthFormAlert variant="info" className="mt-4">
        Si creés que deberías tener acceso, contactá a un administrador o iniciá
        sesión con otra cuenta.
      </AuthFormAlert>

      <Button
        type="button"
        className="mt-6 w-full"
        disabled={pending}
        onClick={() => void handleReturnToLogin()}
      >
        {pending && <Spinner data-icon="inline-start" />}
        {pending ? "Cerrando sesión…" : "Volver al login"}
      </Button>
    </AuthPageShell>
  )
}

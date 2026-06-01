import { useEffect, useRef, useState, type FormEvent } from "react"
import { UserIcon } from "lucide-react"
import { Link, useNavigate, useSearchParams } from "react-router"

import { AuthFormAlert } from "~/components/auth/auth-form-alert"
import { AuthFormField } from "~/components/auth/auth-form-field"
import { AuthPageShell } from "~/components/auth/auth-page-shell"
import { PasswordInput } from "~/components/auth/password-input"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Spinner } from "~/components/ui/spinner"
import { useAuth } from "~/hooks/use-auth"
import { AUTH_FIELD_HINTS } from "~/lib/auth/auth-messages"
import { resolvePostLoginPath } from "~/lib/auth/post-login-redirect"

export default function LoginPage() {
  const { login, isAuthenticated, loading, profile } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const mountedRef = useRef(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "auth"
      ? "No se pudo completar la autenticación."
      : null,
  )
  const [pending, setPending] = useState(false)

  const redirectParam = searchParams.get("redirect")

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (loading || !isAuthenticated) return

    if (redirectParam) {
      navigate(redirectParam, { replace: true })
      return
    }

    if (profile) {
      navigate(resolvePostLoginPath(null, profile), { replace: true })
      return
    }

    navigate("/dashboard", { replace: true })
  }, [isAuthenticated, loading, navigate, profile, redirectParam])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setPending(true)
    const result = await login(email, password)
    if (!mountedRef.current) return
    setPending(false)
    if (!result.ok) {
      setError(result.error)
      return
    }

    navigate(
      resolvePostLoginPath(redirectParam, result.profile ?? profile),
      { replace: true },
    )
  }

  return (
    <AuthPageShell>
        <h1 className="text-xl font-semibold">Iniciar sesión</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ingresá con tu email y contraseña. Si tu cuenta es nueva, puede que
          un administrador deba habilitarla primero.
        </p>

        <AuthFormAlert variant="info" className="mt-4">
          ¿Primera vez? Registrate y esperá la activación antes de poder entrar.
        </AuthFormAlert>

        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
          <AuthFormField
            label="Email"
            htmlFor="login-email"
            hint={AUTH_FIELD_HINTS.login.email}
            tooltip={AUTH_FIELD_HINTS.loginTooltips.email}
          >
            <div className="relative">
              <UserIcon
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="login-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="tu@email.com"
                className="pl-9"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-describedby="login-email-hint"
                required
              />
            </div>
          </AuthFormField>

          <AuthFormField
            label="Contraseña"
            htmlFor="login-password"
            hint={AUTH_FIELD_HINTS.login.password}
            tooltip={AUTH_FIELD_HINTS.loginTooltips.password}
          >
            <PasswordInput
              id="login-password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-describedby="login-password-hint"
              required
            />
          </AuthFormField>

          {error ? (
            <AuthFormAlert title="No pudimos iniciar sesión">{error}</AuthFormAlert>
          ) : null}

          <Button type="submit" disabled={pending || loading}>
            {(pending || loading) && <Spinner data-icon="inline-start" />}
            {pending || loading ? "Entrando…" : "Entrar"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          ¿No tenés cuenta?{" "}
          <Link
            to="/register"
            className="font-medium text-foreground hover:underline"
          >
            Creá una cuenta
          </Link>
        </p>
    </AuthPageShell>
  )
}

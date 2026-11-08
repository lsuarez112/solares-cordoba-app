import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router"

import { AuthFormAlert } from "~/components/auth/auth-form-alert"
import { AuthFormField } from "~/components/auth/auth-form-field"
import { AuthPageShell } from "~/components/auth/auth-page-shell"
import { PasswordInput } from "~/components/auth/password-input"
import { Button } from "~/components/ui/button"
import { Spinner } from "~/components/ui/spinner"
import { useAuth } from "~/hooks/use-auth"
import { AUTH_FIELD_HINTS, translateAuthError } from "~/lib/auth/auth-messages"
import { resolvePostLoginPath } from "~/lib/auth/post-login-redirect"
import { appToast } from "~/lib/toast"
import { updatePassword } from "~/services/auth.service"

const MIN_PASSWORD_LENGTH = 6

export function meta() {
  return [{ title: "Nueva contraseña" }]
}

/** Llega desde el link del mail: /auth/callback o /auth/confirm ya abrieron la sesión. */
export default function ResetPasswordPage() {
  const { isAuthenticated, loading, profile, supabaseUser } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const tooShort = password.length > 0 && password.length < MIN_PASSWORD_LENGTH
  const mismatch = confirm.length > 0 && confirm !== password
  const valid = password.length >= MIN_PASSWORD_LENGTH && password === confirm

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!valid) return
    setError(null)
    setPending(true)
    const { error: updateError } = await updatePassword(password)
    setPending(false)

    if (updateError) {
      setError(translateAuthError(updateError))
      return
    }

    appToast.success("Contraseña actualizada")
    navigate(profile?.active ? resolvePostLoginPath(null, profile) : "/", { replace: true })
  }

  if (loading) {
    return (
      <AuthPageShell>
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      </AuthPageShell>
    )
  }

  if (!isAuthenticated) {
    return (
      <AuthPageShell>
        <div className="flex flex-col gap-3 text-center">
          <h1 className="text-xl font-semibold">Link inválido o vencido</h1>
          <p className="text-sm text-muted-foreground">
            Para crear una contraseña nueva abrí el link del último mail de recuperación, o pedí
            uno nuevo.
          </p>
          <Button asChild className="mt-2 w-full">
            <Link to="/recuperar-clave">Pedir un link nuevo</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link to="/">Volver a iniciar sesión</Link>
          </Button>
        </div>
      </AuthPageShell>
    )
  }

  return (
    <AuthPageShell>
      <h1 className="text-xl font-semibold">Nueva contraseña</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Elegí una contraseña nueva para{" "}
        <strong className="text-foreground">{supabaseUser?.email}</strong>.
      </p>

      <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
        <AuthFormField
          label="Contraseña nueva"
          htmlFor="reset-password"
          hint={AUTH_FIELD_HINTS.register.password}
          fieldError={tooShort ? `Usá al menos ${MIN_PASSWORD_LENGTH} caracteres.` : null}
        >
          <PasswordInput
            id="reset-password"
            name="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
          />
        </AuthFormField>

        <AuthFormField
          label="Repetir contraseña"
          htmlFor="reset-confirm"
          fieldError={mismatch ? "Las contraseñas no coinciden." : null}
        >
          <PasswordInput
            id="reset-confirm"
            name="confirm"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </AuthFormField>

        {error ? (
          <AuthFormAlert title="No se pudo cambiar la contraseña">{error}</AuthFormAlert>
        ) : null}

        {profile && !profile.active ? (
          <AuthFormAlert variant="info">
            Tu cuenta todavía no está habilitada: después de cambiar la contraseña, un
            administrador debe activarla para que puedas ingresar.
          </AuthFormAlert>
        ) : null}

        <Button type="submit" disabled={pending || !valid}>
          {pending ? <Spinner data-icon="inline-start" /> : null}
          {pending ? "Guardando…" : "Guardar contraseña"}
        </Button>
      </form>
    </AuthPageShell>
  )
}

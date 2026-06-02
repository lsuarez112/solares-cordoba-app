import { useEffect, useRef, useState, type FormEvent } from "react"
import { CircleUserIcon, UserIcon } from "lucide-react"
import { Link } from "react-router"

import { AuthFormAlert } from "~/components/auth/auth-form-alert"
import { AuthFormField } from "~/components/auth/auth-form-field"
import { AuthPageShell } from "~/components/auth/auth-page-shell"
import { PasswordInput } from "~/components/auth/password-input"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Spinner } from "~/components/ui/spinner"
import {
  AUTH_FIELD_HINTS,
  translateAuthError,
} from "~/lib/auth/auth-messages"
import { signUp } from "~/services/auth.service"

export default function RegisterPage() {
  const mountedRef = useRef(true)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const passwordsMismatch =
    confirmPassword.length > 0 && password !== confirmPassword
  const passwordTooShort = password.length > 0 && password.length < 6

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.")
      return
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.")
      return
    }

    setPending(true)
    const { error: signUpError } = await signUp({
      email,
      password,
      fullName,
    })
    if (!mountedRef.current) return
    setPending(false)

    if (signUpError) {
      setError(translateAuthError(signUpError))
      return
    }

    setDone(true)
  }

  if (done) {
    return (
      <AuthPageShell>
        <div className="space-y-3 text-center">
          <h1 className="text-xl font-semibold">Registro enviado</h1>
          <p className="text-sm text-muted-foreground">
            Tu cuenta fue creada correctamente.
          </p>
          <AuthFormAlert variant="info">
            Un administrador debe activarla antes de que puedas iniciar sesión.
            Cuando esté lista, volvé a esta pantalla e ingresá con tu email y
            contraseña.
          </AuthFormAlert>
          <Button asChild className="mt-2 w-full">
            <Link to="/">Ir a iniciar sesión</Link>
          </Button>
        </div>
      </AuthPageShell>
    )
  }

  return (
    <AuthPageShell>
      <h1 className="text-xl font-semibold">Crear cuenta</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Completá el formulario. Después del registro, tu cuenta quedará pendiente
        de activación.
      </p>

      <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
        <AuthFormField
          label="Nombre completo"
          htmlFor="register-fullName"
          hint={AUTH_FIELD_HINTS.register.fullName}
          tooltip={AUTH_FIELD_HINTS.registerTooltips.fullName}
        >
          <div className="relative">
            <CircleUserIcon
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              id="register-fullName"
              name="fullName"
              autoComplete="name"
              placeholder="Juan Pérez"
              className="pl-9"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              aria-describedby="register-fullName-hint"
              required
            />
          </div>
        </AuthFormField>

        <AuthFormField
          label="Email"
          htmlFor="register-email"
          hint={AUTH_FIELD_HINTS.register.email}
          tooltip={AUTH_FIELD_HINTS.registerTooltips.email}
        >
          <div className="relative">
            <UserIcon
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              id="register-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="tu@email.com"
              className="pl-9"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-describedby="register-email-hint"
              required
            />
          </div>
        </AuthFormField>

        <AuthFormField
          label="Contraseña"
          htmlFor="register-password"
          hint={AUTH_FIELD_HINTS.register.password}
          tooltip={AUTH_FIELD_HINTS.registerTooltips.password}
          fieldError={
            passwordTooShort ? "Usá al menos 6 caracteres." : null
          }
        >
          <PasswordInput
            id="register-password"
            name="password"
            autoComplete="new-password"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-describedby="register-password-hint"
            aria-invalid={passwordTooShort}
            required
            minLength={6}
          />
        </AuthFormField>

        <AuthFormField
          label="Confirmar contraseña"
          htmlFor="register-confirmPassword"
          hint={AUTH_FIELD_HINTS.register.confirmPassword}
          tooltip={AUTH_FIELD_HINTS.registerTooltips.confirmPassword}
          fieldError={
            passwordsMismatch ? "Las contraseñas no coinciden." : null
          }
        >
          <PasswordInput
            id="register-confirmPassword"
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="Repetí la contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            aria-describedby="register-confirmPassword-hint"
            aria-invalid={passwordsMismatch}
            required
            minLength={6}
          />
        </AuthFormField>

        {error ? (
          <AuthFormAlert title="No pudimos crear la cuenta">{error}</AuthFormAlert>
        ) : null}

        <Button
          type="submit"
          disabled={pending || passwordsMismatch || passwordTooShort}
          className="w-full"
        >
          {pending && <Spinner data-icon="inline-start" />}
          {pending ? "Registrando…" : "Registrarse"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        ¿Ya tenés cuenta?{" "}
        <Link
          to="/"
          className="font-medium text-foreground hover:underline"
        >
          Iniciá sesión
        </Link>
      </p>
    </AuthPageShell>
  )
}

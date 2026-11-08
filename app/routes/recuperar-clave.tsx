import { useState, type FormEvent } from "react"
import { MailCheckIcon, UserIcon } from "lucide-react"
import { Link, useSearchParams } from "react-router"

import { AuthFormAlert } from "~/components/auth/auth-form-alert"
import { AuthFormField } from "~/components/auth/auth-form-field"
import { AuthPageShell } from "~/components/auth/auth-page-shell"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Spinner } from "~/components/ui/spinner"
import { translateAuthError } from "~/lib/auth/auth-messages"
import { requestPasswordReset } from "~/services/auth.service"

const LINK_ERRORS: Record<string, string> = {
  expired: "El link de recuperación venció o ya fue usado. Pedí uno nuevo.",
  invalid: "El link de recuperación no es válido. Pedí uno nuevo.",
}

export function meta() {
  return [{ title: "Recuperar contraseña" }]
}

export default function RecoverPasswordPage() {
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState("")
  const [pending, setPending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(
    LINK_ERRORS[searchParams.get("error") ?? ""] ?? null,
  )

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setPending(true)
    const { error: resetError } = await requestPasswordReset(email)
    setPending(false)

    // Por seguridad no se revela si el email existe: solo se informan límites y errores de envío.
    if (resetError && (resetError.status === 429 || (resetError.status ?? 500) >= 500)) {
      setError(translateAuthError(resetError))
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <AuthPageShell>
        <div className="flex flex-col items-center gap-3 text-center">
          <MailCheckIcon className="size-10 text-primary" aria-hidden />
          <h1 className="text-xl font-semibold">Revisá tu correo</h1>
          <p className="text-sm text-muted-foreground">
            Si <strong className="text-foreground">{email.trim()}</strong> tiene una cuenta, te
            enviamos un link para crear una contraseña nueva. Puede tardar unos minutos; revisá
            también la carpeta de spam.
          </p>
          <Button asChild variant="outline" className="mt-2 w-full">
            <Link to="/">Volver a iniciar sesión</Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSent(false)}>
            Enviar de nuevo
          </Button>
        </div>
      </AuthPageShell>
    )
  }

  return (
    <AuthPageShell>
      <h1 className="text-xl font-semibold">Recuperar contraseña</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Ingresá el email de tu cuenta y te enviamos un link para crear una contraseña nueva.
      </p>

      <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
        <AuthFormField label="Email" htmlFor="recover-email">
          <div className="relative">
            <UserIcon
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              id="recover-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="tu@email.com"
              className="pl-9"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
        </AuthFormField>

        {error ? <AuthFormAlert title="No se pudo continuar">{error}</AuthFormAlert> : null}

        <Button type="submit" disabled={pending || !email.trim()}>
          {pending ? <Spinner data-icon="inline-start" /> : null}
          {pending ? "Enviando…" : "Enviar link"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        ¿La recordaste?{" "}
        <Link to="/" className="font-medium text-foreground hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </AuthPageShell>
  )
}

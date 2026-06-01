/** Textos de ayuda para formularios de autenticación. */
export const AUTH_FIELD_HINTS = {
  login: {
    email: "Usá el correo con el que te registraste.",
    password: "Ingresá la contraseña de tu cuenta.",
  },
  loginTooltips: {
    email:
      "Si tu cuenta fue creada por un administrador, usá el mismo email que te asignaron.",
    password:
      "Si no podés entrar, puede que tu cuenta aún no esté habilitada o confirmada.",
  },
  register: {
    fullName: "Nombre y apellido como figuran en tu documentación.",
    email: "Te enviaremos notificaciones importantes a esta dirección.",
    password: "Mínimo 6 caracteres. Evitá datos obvios como tu nombre o email.",
    confirmPassword: "Repetí la misma contraseña del campo anterior.",
  },
  registerTooltips: {
    fullName:
      "Este dato se guarda en tu perfil y puede usarlo un administrador para identificarte.",
    email: "Debe ser un correo válido y único en el sistema.",
    password:
      "Combiná letras y números para una contraseña más segura.",
    confirmPassword:
      "Ambos campos deben coincidir exactamente para continuar.",
  },
} as const

const AUTH_ERROR_BY_CODE: Record<string, string> = {
  email_not_confirmed:
    "Tu cuenta no está habilitada. Un administrador debe activarla o debés confirmar tu email antes de ingresar.",
  invalid_credentials: "Email o contraseña incorrectos. Revisá los datos e intentá de nuevo.",
  user_already_registered:
    "Ya existe una cuenta con este email. Iniciá sesión o usá otro correo.",
  email_exists:
    "Ya existe una cuenta con este email. Iniciá sesión o usá otro correo.",
  weak_password:
    "La contraseña es demasiado débil. Usá al menos 6 caracteres.",
  signup_disabled:
    "El registro no está habilitado en este momento. Contactá al administrador.",
  over_email_send_rate_limit:
    "Demasiados intentos con este email. Esperá unos minutos e intentá de nuevo.",
  over_request_rate_limit:
    "Demasiados intentos seguidos. Esperá un momento e intentá de nuevo.",
  same_password:
    "La nueva contraseña debe ser distinta a la anterior.",
  session_not_found: "Tu sesión expiró. Volvé a iniciar sesión.",
  user_not_found: "No encontramos una cuenta con esos datos.",
}

const AUTH_ERROR_BY_MESSAGE: Record<string, string> = {
  "email not confirmed":
    "Tu cuenta no está habilitada. Un administrador debe activarla o debés confirmar tu email antes de ingresar.",
  "invalid login credentials":
    "Email o contraseña incorrectos. Revisá los datos e intentá de nuevo.",
  "user already registered":
    "Ya existe una cuenta con este email. Iniciá sesión o usá otro correo.",
  "password should be at least 6 characters":
    "La contraseña debe tener al menos 6 caracteres.",
  "unable to validate email address: invalid format":
    "El formato del email no es válido.",
  "email rate limit exceeded":
    "Demasiados intentos con este email. Esperá unos minutos e intentá de nuevo.",
  "signup requires a valid password":
    "Ingresá una contraseña válida (mínimo 6 caracteres).",
  "new password should be different from the old password":
    "La nueva contraseña debe ser distinta a la anterior.",
}

const AUTH_ERROR_FALLBACK =
  "No se pudo completar la operación. Intentá de nuevo o contactá al administrador."

function normalizeAuthMessage(message: string): string {
  return message.trim().toLowerCase().replace(/\.$/, "")
}

type AuthErrorLike = {
  message: string
  code?: string
}

/** Traduce mensajes de error de Supabase Auth al español. */
export function translateAuthError(error: AuthErrorLike): string {
  if (error.code && AUTH_ERROR_BY_CODE[error.code]) {
    return AUTH_ERROR_BY_CODE[error.code]
  }

  const normalized = normalizeAuthMessage(error.message)
  if (AUTH_ERROR_BY_MESSAGE[normalized]) {
    return AUTH_ERROR_BY_MESSAGE[normalized]
  }

  if (normalized.includes("email not confirmed")) {
    return AUTH_ERROR_BY_MESSAGE["email not confirmed"]
  }
  if (normalized.includes("invalid login credentials")) {
    return AUTH_ERROR_BY_MESSAGE["invalid login credentials"]
  }
  if (normalized.includes("already registered") || normalized.includes("already exists")) {
    return AUTH_ERROR_BY_MESSAGE["user already registered"]
  }

  return AUTH_ERROR_FALLBACK
}

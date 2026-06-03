import { useEffect, useState } from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  RoleFormSchema,
  type RoleFormValues,
} from "~/domain/roles/roles.schemas"
import type { RoleListItem } from "~/domain/roles/roles.types"
import {
  emptyRoleFormValues,
  formValuesToRolePayload,
  roleToFormValues,
} from "~/lib/roles/role-form.utils"
import { appToast } from "~/lib/toast"
import { useRolesStore } from "~/stores/roles.store"

interface UseRoleFormOptions {
  role?: RoleListItem | null
  open: boolean
  onSuccess?: () => void
}

export function useRoleForm({ role, open, onSuccess }: UseRoleFormOptions) {
  const createRole = useRolesStore((s) => s.createRole)
  const updateRole = useRolesStore((s) => s.updateRole)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(
      RoleFormSchema as never,
    ) as Resolver<RoleFormValues>,
    defaultValues: role ? roleToFormValues(role) : emptyRoleFormValues,
  })

  useEffect(() => {
    if (!open) return
    form.reset(role ? roleToFormValues(role) : emptyRoleFormValues)
    setSubmitError(null)
  }, [open, role, form])

  const onSubmit = async (values: RoleFormValues) => {
    setIsSubmitting(true)
    setSubmitError(null)

    let payload
    try {
      payload = formValuesToRolePayload(values)
    } catch {
      setIsSubmitting(false)
      setSubmitError("Revisá la configuración visual del rol.")
      return
    }

    const ok = role
      ? await updateRole(role.id, payload)
      : await createRole(payload)

    setIsSubmitting(false)

    if (!ok) {
      setSubmitError(
        role
          ? "Ocurrió un error al guardar el rol. Intentá de nuevo."
          : "Ocurrió un error al crear el rol. Intentá de nuevo.",
      )
      appToast.error(
        role ? "No se pudo actualizar el rol" : "No se pudo crear el rol",
        {
          description: role
            ? "La base de datos no aplicó cambios. Suele deberse a permisos (RLS) en la tabla roles."
            : "Revisá los datos e intentá de nuevo.",
        },
      )
      return
    }

    if (role) {
      appToast.success("Rol actualizado", {
        description: `Los cambios en "${values.name.trim()}" se guardaron correctamente.`,
      })
    } else {
      appToast.success("Rol creado", {
        description: `"${values.name.trim()}" se agregó al sistema.`,
      })
    }

    onSuccess?.()
  }

  return {
    form,
    isSubmitting,
    submitError,
    isEditing: !!role,
    onSubmit: form.handleSubmit(onSubmit),
  }
}

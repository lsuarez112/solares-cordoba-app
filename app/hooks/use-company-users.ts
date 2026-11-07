import { useCallback, useEffect, useState } from "react"

import type { UserCompanyMember } from "~/domain/user-companies/user-companies.schemas"
import { appToast } from "~/lib/toast"
import { userCompaniesService } from "~/services/user-companies.service"

export function useCompanyUsers(companyId: string | null, open: boolean) {
  const [members, setMembers] = useState<UserCompanyMember[]>([])
  const [loading, setLoading] = useState(false)
  const [pending, setPending] = useState(false)

  const refresh = useCallback(async () => {
    if (!companyId) {
      setMembers([])
      return
    }

    setLoading(true)
    try {
      const data = await userCompaniesService.getMembersByCompanyId(companyId)
      setMembers(data)
    } catch {
      appToast.error("No se pudieron cargar los usuarios", {
        description: "Intentá de nuevo en unos momentos.",
      })
      setMembers([])
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    if (!open || !companyId) return
    void refresh()
  }, [open, companyId, refresh])

  const addUser = useCallback(
    async (userId: string, isDefault: boolean) => {
      if (!companyId) return false

      setPending(true)
      try {
        await userCompaniesService.addUserToCompany({
          userId,
          companyId,
          isDefault,
        })
        await refresh()
        appToast.success("Usuario asignado", {
          description: "El usuario quedó vinculado a la empresa.",
        })
        return true
      } catch {
        appToast.error("No se pudo asignar el usuario", {
          description: "Revisá los permisos e intentá de nuevo.",
        })
        return false
      } finally {
        setPending(false)
      }
    },
    [companyId, refresh],
  )

  const removeUser = useCallback(
    async (userId: string) => {
      if (!companyId) return false

      setPending(true)
      try {
        await userCompaniesService.removeUserFromCompany(userId, companyId)
        await refresh()
        appToast.success("Usuario desvinculado", {
          description: "El usuario ya no pertenece a esta empresa.",
        })
        return true
      } catch {
        appToast.error("No se pudo desvincular el usuario", {
          description: "Intentá de nuevo en unos momentos.",
        })
        return false
      } finally {
        setPending(false)
      }
    },
    [companyId, refresh],
  )

  const setDefault = useCallback(
    async (userId: string) => {
      if (!companyId) return false

      setPending(true)
      try {
        await userCompaniesService.setDefaultCompany(userId, companyId)
        await refresh()
        appToast.success("Empresa predeterminada actualizada")
        return true
      } catch {
        appToast.error("No se pudo actualizar la empresa predeterminada", {
          description: "Intentá de nuevo en unos momentos.",
        })
        return false
      } finally {
        setPending(false)
      }
    },
    [companyId, refresh],
  )

  return {
    members,
    loading,
    pending,
    refresh,
    addUser,
    removeUser,
    setDefault,
  }
}

import { useCallback, useEffect, useState } from "react"

import type { UserCompanySummary } from "~/domain/user-companies/user-companies.types"
import { userCompaniesService } from "~/services/user-companies.service"

export function useUserCompaniesSummary(enabled = true) {
  const [byUserId, setByUserId] = useState<Record<string, UserCompanySummary[]>>(
    {},
  )
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)

  const refresh = useCallback(async () => {
    if (!enabled) return

    setLoading(true)
    try {
      const data = await userCompaniesService.getLinksGroupedByUser()
      setByUserId(data)
    } catch {
      setByUserId({})
    } finally {
      setLoading(false)
      setInitialized(true)
    }
  }, [enabled])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { byUserId, loading, initialized, refresh }
}

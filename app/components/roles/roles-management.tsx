"use client"

import * as React from "react"

import { RolesDataTable } from "~/components/roles/roles-data-table"
import { RolesPage } from "~/components/roles/roles-page"
import { DataActionsMenu } from "~/components/ui/data-actions-menu"
import { DataRefreshActions } from "~/components/ui/data-refresh-actions"
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs"
import type { RoleStatusFilter } from "~/domain/roles/roles.types"
import { useRolesStoreAdminSync } from "~/hooks/use-roles-store-sync"
import {
  filterRolesByStatus,
  getRoleStats,
  sortRolesByDisplayOrder,
} from "~/lib/roles/role-list.utils"
import { mapAdminRoleToListItem } from "~/lib/roles/map-store-role"
import { useRolesStore } from "~/stores/roles.store"

const statusTabs: { value: RoleStatusFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Activos" },
  { value: "inactive", label: "Inactivos" },
]

export function RolesManagement() {
  useRolesStoreAdminSync()

  const roles = useRolesStore((s) => s.roles)
  const loading = useRolesStore((s) => s.loading)
  const initialized = useRolesStore((s) => s.initialized)
  const fetchedAt = useRolesStore((s) => s.fetchedAt)
  const refreshRoles = useRolesStore((s) => s.refreshRoles)

  const [statusFilter, setStatusFilter] =
    React.useState<RoleStatusFilter>("all")

  const roleItems = React.useMemo(
    () => sortRolesByDisplayOrder(roles.map(mapAdminRoleToListItem)),
    [roles],
  )

  const stats = React.useMemo(() => getRoleStats(roleItems), [roleItems])
  const filteredRoles = React.useMemo(() => {
    const byStatus = filterRolesByStatus(roleItems, statusFilter)
    return byStatus
  }, [roleItems, statusFilter])

  const isInitialLoading = loading && !initialized
  const isRefreshing = loading && initialized

  return (
    <RolesPage>
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3">
          <h1 className="min-w-0 text-2xl font-semibold tracking-tight break-words">
            Permisos y roles
          </h1>
          <div className="flex shrink-0 items-start gap-2">
            <div className="sm:hidden">
              <DataActionsMenu
                refreshing={isRefreshing}
                lastFetchedAt={fetchedAt}
                onRefresh={() => void refreshRoles()}
                label="Data"
              />
            </div>
            <div className="hidden sm:block">
              <DataRefreshActions
                refreshing={isRefreshing}
                lastFetchedAt={fetchedAt}
                onRefresh={() => void refreshRoles()}
              />
            </div>
          </div>
        </div>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
          Administrá los{" "}
          <strong className="font-medium text-foreground">roles</strong> y{" "}
          <strong className="font-medium text-foreground">permisos</strong> por
          módulo del sistema. Cada rol define qué acciones pueden realizar los
          usuarios asignados.
        </p>
      </div>

      {isInitialLoading ? (
        <RolesPage.SummarySkeleton />
      ) : (
        <RolesPage.Summary stats={stats} />
      )}

      <RolesPage.Section>
        <Tabs
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as RoleStatusFilter)}
        >
          <TabsList>
            {statusTabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <RolesDataTable
          data={filteredRoles}
          statusFilter={statusFilter}
          loading={isInitialLoading}
          onRefresh={() => void refreshRoles()}
        />
      </RolesPage.Section>
    </RolesPage>
  )
}

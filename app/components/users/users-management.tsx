"use client"

import * as React from "react"

import { UsersDataTable } from "~/components/users/users-data-table"
import { UsersPage } from "~/components/users/users-page"
import { DataActionsMenu } from "~/components/ui/data-actions-menu"
import { DataRefreshActions } from "~/components/ui/data-refresh-actions"
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs"
import {
  filterUsersByStatus,
  getUserStats,
} from "~/lib/users/user-list.utils"
import {
  mapFullUserToUser,
  mapStoreRolesToAvailable,
} from "~/lib/users/map-store-user"
import type { UserStatusFilter } from "~/domain/users/users.types"
import { usePermissionsStoreAdminSync } from "~/hooks/use-permissions-store-sync"
import { useUsersStoreAdminSync } from "~/hooks/use-users-store-sync"
import { usePermissionsStore } from "~/stores/permissions.store"
import { useUsersStore } from "~/stores/users.store"

const statusTabs: { value: UserStatusFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "Pendientes" },
  { value: "active", label: "Activos" },
  { value: "inactive", label: "Inactivos" },
]

export function UsersManagement() {
  useUsersStoreAdminSync()
  usePermissionsStoreAdminSync()

  const full = useUsersStore((s) => s.full)
  const roles = useUsersStore((s) => s.roles)
  const loadingFull = useUsersStore((s) => s.loadingFull)
  const fullInitialized = useUsersStore((s) => s.fullInitialized)
  const fullFetchedAt = useUsersStore((s) => s.fullFetchedAt)
  const refreshFull = useUsersStore((s) => s.refreshFull)
  const refreshPermissionRoles = usePermissionsStore((s) => s.refreshRoles)

  const [statusFilter, setStatusFilter] =
    React.useState<UserStatusFilter>("all")

  const users = React.useMemo(() => full.map(mapFullUserToUser), [full])
  const availableRoles = React.useMemo(
    () => mapStoreRolesToAvailable(roles),
    [roles],
  )

  const stats = React.useMemo(() => getUserStats(users), [users])
  const filteredUsers = React.useMemo(
    () => filterUsersByStatus(users, statusFilter),
    [users, statusFilter],
  )

  const isInitialLoading = loadingFull && !fullInitialized
  const isRefreshing = loadingFull && fullInitialized

  const handleRefresh = React.useCallback(() => {
    void refreshFull()
    void refreshPermissionRoles()
  }, [refreshFull, refreshPermissionRoles])

  return (
    <UsersPage>
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3">
          <h1 className="min-w-0 text-2xl font-semibold tracking-tight break-words">
            Gestión de Usuarios
          </h1>
          <div className="flex shrink-0 items-start gap-2">
            <div className="sm:hidden">
              <DataActionsMenu
                refreshing={isRefreshing}
                lastFetchedAt={fullFetchedAt}
                onRefresh={handleRefresh}
                label="Data"
              />
            </div>
            <div className="hidden sm:block">
              <DataRefreshActions
                refreshing={isRefreshing}
                lastFetchedAt={fullFetchedAt}
                onRefresh={handleRefresh}
              />
            </div>
          </div>
        </div>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground break-words">
          Administrá los{" "}
          <strong className="font-medium text-foreground">accesos</strong>,{" "}
          <strong className="font-medium text-foreground">roles</strong> y{" "}
          <strong className="font-medium text-foreground">estados</strong> de las
          cuentas del sistema. Revisá usuarios{" "}
          <strong className="font-medium text-foreground">pendientes</strong> de
          activación y asigná el permiso adecuado a cada perfil.
        </p>
      </div>

      {isInitialLoading ? (
        <UsersPage.SummarySkeleton />
      ) : (
        <UsersPage.Summary stats={stats} />
      )}

      <UsersPage.Section>
        <Tabs
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as UserStatusFilter)}
        >
          <TabsList>
            {statusTabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <UsersDataTable
          data={filteredUsers}
          availableRoles={availableRoles}
          loading={isInitialLoading}
        />
      </UsersPage.Section>
    </UsersPage>
  )
}

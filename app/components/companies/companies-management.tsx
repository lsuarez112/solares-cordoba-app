"use client"

import * as React from "react"
import { Building2, Plus } from "lucide-react"

import { CompaniesCreateActions } from "./companies-create-actions"
import { CompaniesDataTable } from "./companies-data-table"
import { CompanyModal } from "./company-modal"
import { CompanyUsersModal } from "./company-users-modal"
import { DataActionsMenu } from "~/components/ui/data-actions-menu"
import { DataRefreshActions } from "~/components/ui/data-refresh-actions"
import { Badge } from "~/components/ui/badge"
import { DropdownMenuItem } from "~/components/ui/dropdown-menu"
import { Skeleton } from "~/components/ui/skeleton"
import { usePermission } from "~/hooks/use-permission"
import { useCompanies } from "~/hooks/use-companies"
import { getCompanyStats } from "~/lib/companies/company-display.utils"
import type { Company } from "~/domain/companies/companies.schemas"

function CompaniesMetricsSkeleton() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="flex items-center gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-8" />
        </div>
      ))}
    </div>
  )
}

export function CompaniesManagement() {
  const {
    companies,
    isLoading,
    hasFetched,
    fetchedAt,
    filters,
    setFilters,
    resetFilters,
    fetch,
    openModal,
    memberCounts,
    fetchMemberCounts,
    usersModalOpen,
    usersModalCompany,
    openUsersModal,
    closeUsersModal,
  } = useCompanies()

  const canCreate = usePermission("companies", "create")
  const canUpdate = usePermission("companies", "update")
  const canManageUsers = usePermission("companies", "update")
  const canOpenForm = canCreate || canUpdate

  const handleNewCompany = () => openModal()
  const handleEditCompany = (company: Company) => openModal(company)
  const handleOpenUsers = (company: Company) => openUsersModal(company)
  const handleMembersChanged = React.useCallback(() => {
    void fetchMemberCounts()
  }, [fetchMemberCounts])

  const stats = React.useMemo(() => getCompanyStats(companies), [companies])

  const isInitialLoading = isLoading && !hasFetched
  const isRefreshing = isLoading && hasFetched

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-col gap-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">Empresas</h1>
          <p className="text-sm text-muted-foreground">
            Directorio de empresas para vincular con usuarios y operaciones
          </p>
        </div>
        <div className="flex shrink-0 items-start gap-2">
          <div className="sm:hidden">
            <DataActionsMenu
              refreshing={isRefreshing}
              lastFetchedAt={fetchedAt}
              onRefresh={() => void fetch()}
              label="Datos"
            >
              {canCreate ? (
                <DropdownMenuItem onSelect={handleNewCompany}>
                  <Plus data-icon="inline-start" />
                  Nueva empresa
                </DropdownMenuItem>
              ) : null}
            </DataActionsMenu>
          </div>
          <div className="hidden sm:block">
            <DataRefreshActions
              refreshing={isRefreshing}
              lastFetchedAt={fetchedAt}
              onRefresh={() => void fetch()}
            >
              {canCreate ? (
                <CompaniesCreateActions onNewCompany={handleNewCompany} />
              ) : null}
            </DataRefreshActions>
          </div>
        </div>
      </div>

      {isInitialLoading ? (
        <CompaniesMetricsSkeleton />
      ) : (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              <Building2 data-icon="inline-start" />
              Total
            </Badge>
            <span className="text-sm font-semibold tabular-nums">
              {stats.total}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              <Building2 data-icon="inline-start" className="text-green-600" />
              Activas
            </Badge>
            <span className="text-sm font-semibold tabular-nums">
              {stats.active}
            </span>
          </div>
        </div>
      )}

      <CompaniesDataTable
        data={companies}
        filters={filters}
        loading={isInitialLoading}
        canCreate={canCreate}
        canUpdate={canUpdate}
        memberCounts={memberCounts}
        onFiltersChange={setFilters}
        onResetFilters={resetFilters}
        onOpenEdit={canOpenForm ? handleEditCompany : undefined}
        onOpenUsers={canManageUsers ? handleOpenUsers : undefined}
        onNewCompany={canCreate ? handleNewCompany : undefined}
        onRefresh={() => void fetch()}
      />

      {canOpenForm ? (
        <CompanyModal
          canManageUsers={canManageUsers}
          onOpenUsers={handleOpenUsers}
        />
      ) : null}

      {canManageUsers ? (
        <CompanyUsersModal
          company={usersModalCompany}
          open={usersModalOpen}
          onOpenChange={(next) => {
            if (!next) closeUsersModal()
          }}
          onMembersChanged={handleMembersChanged}
        />
      ) : null}
    </div>
  )
}

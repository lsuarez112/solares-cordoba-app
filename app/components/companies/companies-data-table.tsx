"use client"

import * as React from "react"
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { FilterX, Search } from "lucide-react"

import { CompaniesDataTableSkeleton } from "./companies-data-table-skeleton"
import { CompaniesTableEmpty } from "./companies-table-empty"
import { companiesTableColumns } from "./companies-table-columns"
import { DataTableView } from "~/components/ui/data-table"
import { Button } from "~/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "~/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import type { Company } from "~/domain/companies/companies.schemas"
import type { CompanyFilters } from "~/domain/companies/companies.types"

type CompaniesDataTableProps = {
  data: Company[]
  filters: CompanyFilters
  loading?: boolean
  canCreate?: boolean
  canUpdate?: boolean
  memberCounts?: Record<string, number>
  onFiltersChange: (filters: Partial<CompanyFilters>) => void
  onResetFilters: () => void
  onOpenEdit?: (company: Company) => void
  onOpenUsers?: (company: Company) => void
  onNewCompany?: () => void
  onRefresh?: () => void
}

export function CompaniesDataTable({
  data,
  filters,
  loading = false,
  canCreate = false,
  canUpdate = false,
  memberCounts = {},
  onFiltersChange,
  onResetFilters,
  onOpenEdit,
  onOpenUsers,
  onNewCompany,
  onRefresh,
}: CompaniesDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const columns = React.useMemo(
    () =>
      companiesTableColumns({
        onOpenEdit,
        onOpenUsers,
        memberCounts,
        canUpdate,
      }),
    [onOpenEdit, onOpenUsers, memberCounts, canUpdate],
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    state: {
      sorting,
      pagination,
    },
  })

  const activeFilterValue =
    filters.active === null
      ? "all"
      : filters.active
        ? "true"
        : "false"

  const emptyState = (
    <CompaniesTableEmpty
      totalCount={data.length}
      filters={filters}
      canCreate={canCreate}
      onNewCompany={onNewCompany}
      onRefresh={onRefresh ?? (() => {})}
      onClearFilters={onResetFilters}
    />
  )

  if (loading) {
    return <CompaniesDataTableSkeleton />
  }

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
        <InputGroup className="w-full lg:max-w-sm">
          <InputGroupAddon align="inline-start">
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Buscar por nombre, razón social, CUIT..."
            value={filters.search}
            onChange={(event) =>
              onFiltersChange({ search: event.target.value })
            }
          />
        </InputGroup>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap lg:ml-auto lg:w-auto lg:justify-end">
          <Select
            value={activeFilterValue}
            onValueChange={(value) =>
              onFiltersChange({
                active: value === "all" ? null : value === "true",
              })
            }
          >
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="true">Activas</SelectItem>
                <SelectItem value="false">Inactivas</SelectItem>
                <SelectItem value="all">Todas</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground"
            onClick={onResetFilters}
          >
            <FilterX data-icon="inline-start" />
            Limpiar filtros
          </Button>
        </div>
      </div>

      <DataTableView
        table={table}
        columnCount={columns.length}
        emptyState={emptyState}
        showPagination
        showRowCount
        totalCount={data.length}
        rowCountLabel="empresas"
      />
    </div>
  )
}

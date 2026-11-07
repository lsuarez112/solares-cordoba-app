"use client"

import { FilterIcon, FilterX, Search, XIcon } from "lucide-react"

import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
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
import { cn } from "~/lib/utils"

/** Valor que representa "sin filtro" en cada select. */
export const FILTER_ALL = "all"

export type DataTableFilter = {
  id: string
  /** Nombre corto del filtro (badge y encabezado del menú mobile). */
  label: string
  value: string
  /** Texto de la opción "todos" (ej. "Todas las categorías"). */
  allLabel: string
  options: Array<{ value: string; label: string }>
  onChange: (value: string) => void
  /** Ancho fijo del select en desktop (clase Tailwind). */
  widthClassName?: string
}

/**
 * Breakpoint desde el que los filtros se muestran en línea. Por debajo se
 * agrupan en un menú detrás del ícono de filtro, con badges de los activos.
 */
type InlineBreakpoint = "md" | "lg" | "xl"

const INLINE_CLASSES: Record<InlineBreakpoint, { inline: string; compact: string }> = {
  md: { inline: "hidden md:flex", compact: "md:hidden" },
  lg: { inline: "hidden lg:flex", compact: "lg:hidden" },
  xl: { inline: "hidden xl:flex", compact: "xl:hidden" },
}

type DataTableToolbarProps = {
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  filters?: DataTableFilter[]
  onClearFilters?: () => void
  inlineFrom?: InlineBreakpoint
}

function optionLabel(filter: DataTableFilter) {
  return (
    filter.options.find((option) => option.value === filter.value)?.label ??
    filter.value
  )
}

export function DataTableToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  filters = [],
  onClearFilters,
  inlineFrom,
}: DataTableToolbarProps) {
  const activeFilters = filters.filter((filter) => filter.value !== FILTER_ALL)
  const hasActive = activeFilters.length > 0 || search.trim().length > 0
  const breakpoint = inlineFrom ?? (filters.length >= 3 ? "xl" : "lg")
  const classes = INLINE_CLASSES[breakpoint]

  const searchInput = (
    <InputGroup className="min-w-0 flex-1">
      <InputGroupAddon align="inline-start">
        <Search />
      </InputGroupAddon>
      <InputGroupInput
        placeholder={searchPlaceholder}
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />
      {search ? (
        <InputGroupAddon align="inline-end">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Borrar búsqueda"
            onClick={() => onSearchChange("")}
          >
            <XIcon />
          </Button>
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  )

  if (filters.length === 0) {
    return (
      <div className="flex items-center gap-2">
        {searchInput}
        {onClearFilters && hasActive ? (
          <ClearButton onClick={onClearFilters} />
        ) : null}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Desktop: buscador ocupa el resto de la fila, filtros de ancho fijo. */}
      <div className={cn("flex-nowrap items-center gap-2", classes.inline)}>
        {searchInput}
        {filters.map((filter) => (
          <Select
            key={filter.id}
            value={filter.value}
            onValueChange={filter.onChange}
          >
            <SelectTrigger
              className={cn("shrink-0", filter.widthClassName ?? "w-40")}
              aria-label={filter.label}
            >
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={FILTER_ALL}>{filter.allLabel}</SelectItem>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        ))}
        {onClearFilters ? (
          <ClearButton onClick={onClearFilters} disabled={!hasActive} />
        ) : null}
      </div>

      {/* Mobile / pantallas angostas: menú de filtros + badges removibles. */}
      <div className={cn("flex flex-col gap-2", classes.compact)}>
        <div className="flex items-center gap-2">
          {searchInput}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="relative shrink-0"
                aria-label="Filtros"
              >
                <FilterIcon />
                {activeFilters.length > 0 ? (
                  <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                    {activeFilters.length}
                  </span>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="max-h-[70svh] w-64 overflow-y-auto"
            >
              {filters.map((filter, index) => (
                <div key={filter.id}>
                  {index > 0 ? <DropdownMenuSeparator /> : null}
                  <DropdownMenuLabel>{filter.label}</DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={filter.value}
                    onValueChange={filter.onChange}
                  >
                    <DropdownMenuRadioItem value={FILTER_ALL}>
                      {filter.allLabel}
                    </DropdownMenuRadioItem>
                    {filter.options.map((option) => (
                      <DropdownMenuRadioItem
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </div>
              ))}
              {onClearFilters && activeFilters.length > 0 ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={onClearFilters}>
                    <FilterX />
                    Limpiar filtros
                  </DropdownMenuItem>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {activeFilters.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {activeFilters.map((filter) => (
              <Badge
                key={filter.id}
                variant="secondary"
                className="h-6 gap-1 pr-0.5"
              >
                <span className="text-muted-foreground">{filter.label}:</span>
                {optionLabel(filter)}
                <button
                  type="button"
                  className="ml-0.5 flex size-5 items-center justify-center rounded-full hover:bg-foreground/10"
                  aria-label={`Quitar filtro ${filter.label}`}
                  onClick={() => filter.onChange(FILTER_ALL)}
                >
                  <XIcon className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function ClearButton({
  onClick,
  disabled,
}: {
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="shrink-0 text-muted-foreground"
      onClick={onClick}
      disabled={disabled}
      aria-label="Limpiar filtros"
      title="Limpiar filtros"
    >
      <FilterX />
    </Button>
  )
}

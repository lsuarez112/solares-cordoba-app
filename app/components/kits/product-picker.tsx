"use client"

import * as React from "react"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "~/components/ui/combobox"
import type { Product } from "~/domain/products/products.schemas"
import { cn } from "~/lib/utils"

const MAX_RESULTS = 40

function label(product: Product) {
  return `${product.product_code} · ${product.name}`
}

function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
}

type ProductPickerProps = {
  products: Product[]
  value: string | null
  onChange: (productCode: string) => void
  placeholder?: string
  className?: string
  invalid?: boolean
}

/** Selector de producto por código o nombre (filtra en memoria, máx. 40 resultados). */
export function ProductPicker({
  products,
  value,
  onChange,
  placeholder = "Buscar código o nombre…",
  className,
  invalid,
}: ProductPickerProps) {
  const selected = React.useMemo(
    () => products.find((p) => p.product_code === value) ?? null,
    [products, value],
  )
  const [query, setQuery] = React.useState(selected ? label(selected) : "")

  React.useEffect(() => {
    setQuery(selected ? label(selected) : "")
  }, [selected])

  const items = React.useMemo(() => {
    const q = normalize(query.trim())
    if (!q || (selected && query === label(selected))) {
      return products.slice(0, MAX_RESULTS)
    }
    const terms = q.split(/\s+/)
    return products
      .filter((p) => {
        const haystack = normalize(`${p.product_code} ${p.name} ${p.category?.name ?? ""}`)
        return terms.every((t) => haystack.includes(t))
      })
      .slice(0, MAX_RESULTS)
  }, [products, query, selected])

  return (
    <Combobox<Product>
      items={items}
      value={selected}
      onValueChange={(item) => {
        if (item) onChange(item.product_code)
      }}
      inputValue={query}
      onInputValueChange={setQuery}
      itemToStringLabel={label}
      isItemEqualToValue={(a, b) => a.product_code === b.product_code}
      filter={null}
    >
      <ComboboxInput
        placeholder={placeholder}
        className={cn("w-full min-w-0", className)}
        aria-invalid={invalid || undefined}
      />
      <ComboboxContent>
        <ComboboxEmpty>Sin resultados</ComboboxEmpty>
        <ComboboxList>
          {(product: Product) => (
            <ComboboxItem key={product.id} value={product}>
              <span className="font-mono text-xs text-muted-foreground">
                {product.product_code}
              </span>
              <span className="min-w-0 truncate">{product.name}</span>
              {product.price_usd > 0 ? (
                <span className="ml-auto shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                  {product.price_usd.toFixed(2)}
                </span>
              ) : null}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

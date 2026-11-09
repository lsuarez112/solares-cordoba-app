"use client"

import * as React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import {
  STANDARD_IVA_PCT,
  formatArs,
  formatUsd,
  type IvaChoice,
  type QuoteTotals,
} from "~/lib/quotes/quote-totals"

function Row({ label, value, strong = false }: { label: React.ReactNode; value: React.ReactNode; strong?: boolean }) {
  return (
    <div className={strong ? "flex items-baseline justify-between gap-3 font-semibold" : "flex items-baseline justify-between gap-3 text-sm"}>
      <span className={strong ? "" : "text-muted-foreground"}>{label}</span>
      <span className="font-mono tabular-nums">{value}</span>
    </div>
  )
}

/** IVA (D7): 21 %, un % específico o sin IVA. */
export function IvaChoiceField({
  value,
  onChange,
  disabled,
}: {
  value: IvaChoice
  onChange: (next: IvaChoice) => void
  disabled?: boolean
}) {
  const [customText, setCustomText] = React.useState(value.custom_pct != null ? String(value.custom_pct) : "")
  React.useEffect(() => {
    if (value.custom_pct != null) setCustomText(String(value.custom_pct).replace(".", ","))
  }, [value.custom_pct])

  const setMode = (mode: string) => {
    if (mode === "custom") {
      onChange({ mode: "custom", custom_pct: value.custom_pct ?? 10.5 })
    } else {
      onChange({ mode: mode as IvaChoice["mode"], custom_pct: value.custom_pct })
    }
  }

  return (
    <fieldset className="flex flex-col gap-2 rounded-md border p-2.5" disabled={disabled}>
      <legend className="sr-only">IVA</legend>
      <RadioGroup value={value.mode} onValueChange={setMode} disabled={disabled} className="gap-1">
        <label className="flex h-7 items-center gap-2 text-sm">
          <RadioGroupItem value="standard" />
          IVA {STANDARD_IVA_PCT} %
        </label>
        <div className="flex h-7 items-center gap-2 text-sm">
          <label className="flex items-center gap-2">
            <RadioGroupItem value="custom" />
            IVA específico
          </label>
          <div className="ml-auto flex items-center gap-1">
            <Input
              className="h-7 w-16 text-right tabular-nums"
              inputMode="decimal"
              disabled={disabled}
              value={value.mode === "custom" ? customText : ""}
              placeholder="10,5"
              aria-label="Porcentaje de IVA específico"
              onFocus={() => value.mode !== "custom" && setMode("custom")}
              onChange={(e) => {
                setCustomText(e.target.value)
                const n = Number(e.target.value.replace(",", "."))
                if (e.target.value.trim() !== "" && Number.isFinite(n) && n >= 0 && n <= 100) {
                  onChange({ mode: "custom", custom_pct: n })
                }
              }}
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        </div>
        <label className="flex h-7 items-center gap-2 text-sm">
          <RadioGroupItem value="none" />
          Sin IVA
        </label>
      </RadioGroup>
    </fieldset>
  )
}

/** Totales: en borrador son estimados con la cotización vigente; emitido, la foto. */
export function QuoteTotalsCard({
  totals,
  usdArs,
  rateLabel,
  frozen,
  children,
}: {
  totals: QuoteTotals
  usdArs: number | null
  rateLabel?: string
  frozen: boolean
  children?: React.ReactNode
}) {
  return (
    <Card className="gap-3 py-4">
      <CardHeader className="px-4">
        <CardTitle className="text-sm">{frozen ? "Totales (congelados al emitir)" : "Totales"}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 px-4">
        {children}
        <Row label="Subtotal" value={`USD ${formatUsd(totals.subtotal_usd)}`} />
        <Row
          label={totals.iva_pct > 0 ? `IVA ${totals.iva_pct.toLocaleString("es-AR")} %` : "Sin IVA"}
          value={`USD ${formatUsd(totals.iva_usd)}`}
        />
        <div className="border-t pt-2">
          <Row strong label="Total USD" value={formatUsd(totals.total_usd)} />
        </div>
        <Row
          label={
            <>
              Total ARS{" "}
              {usdArs ? (
                <span className="text-xs">
                  ({frozen ? "" : "aprox. "}× {usdArs.toLocaleString("es-AR")})
                </span>
              ) : null}
            </>
          }
          value={formatArs(totals.total_ars)}
        />
        {rateLabel ? <p className="text-xs text-muted-foreground">{rateLabel}</p> : null}
      </CardContent>
    </Card>
  )
}

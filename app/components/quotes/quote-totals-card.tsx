"use client"

import * as React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Checkbox } from "~/components/ui/checkbox"
import { Input } from "~/components/ui/input"
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

/** IVA (D7): checkbox "Incluir IVA 21 %" o "IVA específico". */
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
    setCustomText(value.custom_pct != null ? String(value.custom_pct) : "")
  }, [value.custom_pct])

  return (
    <div className="flex flex-col gap-2 rounded-md border p-2.5">
      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={value.include}
          disabled={disabled}
          onCheckedChange={(checked) => onChange({ include: checked === true, custom_pct: value.custom_pct })}
        />
        Incluir IVA {value.custom_pct == null ? `${STANDARD_IVA_PCT} %` : ""}
      </label>
      {value.include ? (
        <div className="flex items-center gap-2 pl-6">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox
              checked={value.custom_pct != null}
              disabled={disabled}
              onCheckedChange={(checked) =>
                onChange({ include: true, custom_pct: checked === true ? 10.5 : null })
              }
            />
            IVA específico
          </label>
          {value.custom_pct != null ? (
            <div className="flex items-center gap-1">
              <Input
                className="h-7 w-20 text-right tabular-nums"
                inputMode="decimal"
                disabled={disabled}
                value={customText}
                aria-label="Porcentaje de IVA"
                onChange={(e) => {
                  setCustomText(e.target.value)
                  const n = Number(e.target.value.replace(",", "."))
                  if (Number.isFinite(n) && n >= 0 && n <= 100) onChange({ include: true, custom_pct: n })
                }}
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
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
        <Row label={`IVA ${totals.iva_pct.toLocaleString("es-AR")} %`} value={`USD ${formatUsd(totals.iva_usd)}`} />
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

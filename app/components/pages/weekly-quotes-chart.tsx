"use client"

import * as React from "react"

import type { WeekBucket } from "~/lib/quotes/home-stats"

/**
 * Columnas apiladas por semana: emitidos (abajo) + borradores (arriba).
 * SVG propio (sin Recharts): 8 columnas no justifican ~100 KB de librería.
 * Specs (dataviz): columnas ≤ 24px, punta redondeada 4px y base recta, 2px de
 * separación entre segmentos, ejes recesivos, tooltip por columna (hover o tap),
 * leyenda + tabla accesible. Colores: --chart-issued / --chart-draft (validados).
 */
const H = 140
const PAD_TOP = 18
const PAD_BOTTOM = 22
const BAR_MAX = 24
const GAP = 2
const R = 4

const dm = (iso: string) => {
  const [, m, d] = iso.split("-")
  return `${Number(d)}/${Number(m)}`
}

/** Rectángulo con las esquinas de arriba redondeadas (la base queda recta). */
function topRounded(x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, h, w / 2)
  return `M${x},${y + h}V${y + rr}Q${x},${y} ${x + rr},${y}H${x + w - rr}Q${x + w},${y} ${x + w},${y + rr}V${y + h}Z`
}

export function WeeklyQuotesChart({ weeks }: { weeks: WeekBucket[] }) {
  const [width, setWidth] = React.useState(320)
  const [active, setActive] = React.useState<number | null>(null)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(200, entry.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const max = Math.max(1, ...weeks.map((w) => w.issued + w.draft))
  const plotH = H - PAD_TOP - PAD_BOTTOM
  const slot = width / weeks.length
  const barW = Math.min(BAR_MAX, slot * 0.55)
  const scale = (n: number) => (n / max) * plotH
  const baseY = PAD_TOP + plotH
  const lastIndex = weeks.length - 1
  const maxIndex = weeks.findIndex((w) => w.issued + w.draft === max)
  const total = weeks.reduce((s, w) => s + w.issued + w.draft, 0)

  const activeWeek = active != null ? weeks[active] : null

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-[3px]" style={{ background: "var(--chart-issued)" }} />
          Emitidos
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-[3px]" style={{ background: "var(--chart-draft)" }} />
          Borradores
        </span>
      </div>

      <div ref={ref} className="relative" onMouseLeave={() => setActive(null)}>
        <svg
          width={width}
          height={H}
          role="img"
          aria-label={`Presupuestos por semana, últimas ${weeks.length} semanas: ${total} en total`}
          className="block overflow-visible"
        >
          {/* Línea base (recesiva) */}
          <line x1={0} x2={width} y1={baseY + 0.5} y2={baseY + 0.5} stroke="var(--border)" />

          {weeks.map((w, i) => {
            const cx = slot * i + slot / 2
            const x = cx - barW / 2
            const issuedH = scale(w.issued)
            const draftH = scale(w.draft)
            const both = w.issued > 0 && w.draft > 0
            const count = w.issued + w.draft
            const topY = baseY - issuedH - draftH - (both ? GAP : 0)
            const showValue = count > 0 && (i === lastIndex || i === maxIndex)
            const dim = active != null && active !== i
            return (
              <g
                key={w.start}
                className="row-in"
                style={{ "--i": i, opacity: dim ? 0.45 : 1, transition: "opacity 150ms" } as React.CSSProperties}
              >
                {w.issued > 0 ? (
                  <path
                    d={w.draft > 0 ? `M${x},${baseY}h${barW}v${-issuedH}h${-barW}Z` : topRounded(x, baseY - issuedH, barW, issuedH, R)}
                    fill="var(--chart-issued)"
                  />
                ) : null}
                {w.draft > 0 ? (
                  <path
                    d={topRounded(x, baseY - issuedH - (both ? GAP : 0) - draftH, barW, draftH, R)}
                    fill="var(--chart-draft)"
                  />
                ) : null}
                {showValue ? (
                  <text x={cx} y={topY - 5} textAnchor="middle" className="fill-muted-foreground text-[11px] tabular-nums">
                    {count}
                  </text>
                ) : null}
                <text
                  x={cx}
                  y={H - 6}
                  textAnchor="middle"
                  className={i === lastIndex ? "fill-foreground text-[10px] font-medium" : "fill-muted-foreground text-[10px]"}
                >
                  {i === lastIndex ? "Esta" : dm(w.start)}
                </text>
                {/* Zona de toque más grande que la columna */}
                <rect
                  x={slot * i}
                  y={0}
                  width={slot}
                  height={H}
                  fill="transparent"
                  onMouseEnter={() => setActive(i)}
                  onClick={() => setActive((a) => (a === i ? null : i))}
                />
              </g>
            )
          })}
        </svg>

        {activeWeek && active != null ? (
          <div
            className="pointer-events-none absolute top-0 z-10 w-max -translate-x-1/2 rounded-md border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-md"
            style={{ left: Math.min(Math.max(slot * active + slot / 2, 70), width - 70) }}
          >
            <p className="font-medium">
              {active === lastIndex ? "Esta semana" : `Semana del ${dm(activeWeek.start)}`}
            </p>
            <p className="flex items-center gap-1.5 tabular-nums">
              <span className="size-2 rounded-[2px]" style={{ background: "var(--chart-issued)" }} />
              {activeWeek.issued} emitido{activeWeek.issued === 1 ? "" : "s"}
            </p>
            <p className="flex items-center gap-1.5 tabular-nums">
              <span className="size-2 rounded-[2px]" style={{ background: "var(--chart-draft)" }} />
              {activeWeek.draft} borrador{activeWeek.draft === 1 ? "" : "es"}
            </p>
          </div>
        ) : null}
      </div>

      {/* Vista de tabla para lectores de pantalla */}
      <table className="sr-only">
        <caption>Presupuestos por semana</caption>
        <thead>
          <tr>
            <th>Semana</th>
            <th>Emitidos</th>
            <th>Borradores</th>
          </tr>
        </thead>
        <tbody>
          {weeks.map((w) => (
            <tr key={w.start}>
              <td>{dm(w.start)}</td>
              <td>{w.issued}</td>
              <td>{w.draft}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

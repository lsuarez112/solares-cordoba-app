/**
 * Estadísticas de Inicio (puras). Cada número de presupuesto cuenta una vez:
 * nace con su original (revisión 0) y cuenta como emitido si alguna revisión
 * se emitió.
 */
import type { QuoteListItem } from "~/domain/quotes/quotes.schemas"

export type WeekBucket = {
  /** Lunes de la semana (aaaa-mm-dd, hora local). */
  start: string
  issued: number
  draft: number
}

export type HomeStats = {
  weeks: WeekBucket[]
  month: {
    created: number
    issued: number
    /** USD emitidos en el mes (vigente de cada número emitido en el mes). */
    issuedUsd: number
    /** % de los creados en el mes que ya se emitieron. */
    issueRate: number | null
  }
}

const pad = (n: number) => String(n).padStart(2, "0")
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

/** Lunes 00:00 (local) de la semana de una fecha. */
export function weekStart(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const day = (d.getDay() + 6) % 7 // lunes = 0
  d.setDate(d.getDate() - day)
  return d
}

type NumberGroup = { createdAt: Date; issued: boolean; issuedAt: Date | null; issuedUsd: number }

function groupByNumber(quotes: QuoteListItem[]): NumberGroup[] {
  const groups = new Map<string, NumberGroup>()
  for (const q of quotes) {
    const key = q.number != null ? `n${q.number}` : q.id
    const created = new Date(q.created_at)
    const g = groups.get(key) ?? { createdAt: created, issued: false, issuedAt: null, issuedUsd: 0 }
    if (created < g.createdAt) g.createdAt = created
    if (q.status === "issued") {
      g.issued = true
      const at = q.issued_at ? new Date(q.issued_at) : created
      // El importe que vale es el de la revisión vigente (o la última emitida).
      if (q.is_current || !g.issuedAt || at > g.issuedAt) {
        g.issuedAt = at
        g.issuedUsd = q.total_usd ?? 0
      }
    }
    groups.set(key, g)
  }
  return [...groups.values()]
}

export function computeHomeStats(quotes: QuoteListItem[], now = new Date(), weeksBack = 8): HomeStats {
  const groups = groupByNumber(quotes)

  const firstWeek = weekStart(now)
  firstWeek.setDate(firstWeek.getDate() - 7 * (weeksBack - 1))
  const weeks: WeekBucket[] = Array.from({ length: weeksBack }, (_, i) => {
    const d = new Date(firstWeek)
    d.setDate(d.getDate() + 7 * i)
    return { start: ymd(d), issued: 0, draft: 0 }
  })
  const index = new Map(weeks.map((w, i) => [w.start, i]))
  for (const g of groups) {
    const i = index.get(ymd(weekStart(g.createdAt)))
    if (i == null) continue
    if (g.issued) weeks[i].issued++
    else weeks[i].draft++
  }

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const createdThisMonth = groups.filter((g) => g.createdAt >= monthStart)
  const issuedThisMonth = groups.filter((g) => g.issuedAt && g.issuedAt >= monthStart)
  const created = createdThisMonth.length
  return {
    weeks,
    month: {
      created,
      issued: issuedThisMonth.length,
      issuedUsd: Math.round(issuedThisMonth.reduce((s, g) => s + g.issuedUsd, 0) * 100) / 100,
      issueRate: created > 0 ? Math.round((createdThisMonth.filter((g) => g.issued).length / created) * 100) : null,
    },
  }
}

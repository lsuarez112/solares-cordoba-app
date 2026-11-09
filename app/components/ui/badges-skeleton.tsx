import { Skeleton } from "~/components/ui/skeleton"

/** Lugar de los badges de totales mientras carga la página (evita el salto). */
export function BadgesSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-wrap items-center gap-2" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-6 w-28 rounded-full" />
      ))}
    </div>
  )
}

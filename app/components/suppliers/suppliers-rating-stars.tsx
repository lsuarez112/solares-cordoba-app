export function SuppliersRatingStars({ rating }: { rating: number | null }) {
  if (!rating) {
    return <span className="text-xs text-muted-foreground">—</span>
  }

  return (
    <span className="text-sm tracking-tighter text-amber-500">
      {"★".repeat(rating)}
      <span className="text-muted-foreground/40">{"★".repeat(5 - rating)}</span>
    </span>
  )
}

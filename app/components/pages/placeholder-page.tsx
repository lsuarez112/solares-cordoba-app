type PlaceholderPageProps = {
  title: string
  description?: string
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight break-words">{title}</h1>
      <p className="mt-2 text-muted-foreground break-words">
        {description ?? "Esta sección está en construcción."}
      </p>
    </div>
  )
}

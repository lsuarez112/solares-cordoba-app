// Precios por millón de tokens (USD), API de Anthropic. Actualizar si cambian.
// Caché: lectura 0,1× y escritura (5 min) 1,25× del precio de entrada.
const PRICES: Record<string, { input: number; output: number }> = {
  "claude-haiku-5-5": { input: 0.1, output: 0.5 },
  "claude-sonnet-5-5": { input: 2, output: 10 },
  "claude-sonnet-5": { input: 2, output: 10 },
  "claude-opus-5-5": { input: 4, output: 20 },
}

export type Usage = {
  input_tokens: number
  output_tokens: number
  cache_read_input_tokens?: number | null
  cache_creation_input_tokens?: number | null
}

/** Costo en USD de una llamada; null si el modelo no está en la tabla. */
export function costUsd(model: string, usage: Usage): number | null {
  const p = PRICES[model]
  if (!p) return null
  const read = usage.cache_read_input_tokens ?? 0
  const write = usage.cache_creation_input_tokens ?? 0
  const total =
    usage.input_tokens * p.input +
    read * p.input * 0.1 +
    write * p.input * 1.25 +
    usage.output_tokens * p.output
  return Math.round((total / 1_000_000) * 1e6) / 1e6
}

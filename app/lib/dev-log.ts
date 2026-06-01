/** Logs only in development (Vite: import.meta.env.DEV). */
export function devLog(...args: unknown[]) {
  if (import.meta.env.DEV) {
    console.log(...args)
  }
}

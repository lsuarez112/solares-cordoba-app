# Presupuestador Solar — Solares Córdoba

App mobile-first para que los vendedores armen presupuestos de sistemas fotovoltaicos: cliente → pedido → sugerencia de kit (IA) → ajuste → PDF y mensaje de WhatsApp.

- Especificación: [SPEC-V0.md](SPEC-V0.md)
- Análisis y plan por fases: [docs/GAP-V0.md](docs/GAP-V0.md)

## Stack

React Router 7 (SSR) · TypeScript · shadcn/ui · Tailwind 4 · Zustand · Zod · react-hook-form · Supabase (Auth, Postgres, Storage, Edge Functions) · Vitest · Deploy en Vercel.

## Setup local

```bash
pnpm install
cp .env.example .env.local   # completar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
pnpm dev                     # http://localhost:5173
```

## Scripts

| Script | Qué hace |
|---|---|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm typecheck` | Genera tipos de rutas y corre `tsc` |
| `pnpm test` | Tests unitarios (Vitest, `app/**/*.test.ts`) |
| `pnpm build` | Build de producción (preset de Vercel) |
| `pnpm db:push` | Aplica las migraciones de `supabase/migrations` al proyecto vinculado |
| `pnpm db:types` | Genera los tipos de la DB en `app/lib/supabase/database.types.ts` |

## Supabase

```bash
pnpm exec supabase login
pnpm exec supabase link --project-ref <project-ref>
```

Las migraciones viven en `supabase/migrations/` y las Edge Functions en `supabase/functions/`. Los secrets (por ejemplo `ANTHROPIC_API_KEY`) se cargan con `supabase secrets set` y nunca van al front.

## Deploy

Vercel con el repo vinculado a Git. Variables de entorno en Vercel: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

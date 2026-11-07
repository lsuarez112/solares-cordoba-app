// Ensayo de las migraciones contra la DB vinculada SIN dejar cambios:
// corre todas las migraciones + supabase/tests/f1_smoke.sql en una transacción
// que termina con una excepción forzada (rollback). El resultado viene en el
// mensaje de error: "DRY_RUN_OK ..." si todo pasó, o el error real si algo falló.
//
// Uso: node scripts/db/dry-run.mjs   (pide confirmación de la CLI: es la DB remota)

import { readdirSync, readFileSync, writeFileSync, mkdtempSync } from "node:fs"
import { join, dirname } from "node:path"
import { tmpdir } from "node:os"
import { fileURLToPath } from "node:url"
import { spawnSync } from "node:child_process"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..")
const MIG = join(ROOT, "supabase", "migrations")

const parts = ["begin;"]
for (const file of readdirSync(MIG).filter((f) => f.endsWith(".sql")).sort()) {
  parts.push(`-- >>> ${file}\n${readFileSync(join(MIG, file), "utf8")}`)
}
parts.push(readFileSync(join(ROOT, "supabase", "tests", "f1_smoke.sql"), "utf8"))
parts.push(`do $$ begin raise exception 'DRY_RUN_OK %', current_setting('test.log', true); end $$;`)

const out = join(mkdtempSync(join(tmpdir(), "dry-run-")), "dry-run.sql")
writeFileSync(out, parts.join("\n\n"))
console.log(`SQL del ensayo: ${out}`)

const args = ["supabase", "db", "query", "--remote", "-f", out, ...process.argv.slice(2)]
const res = spawnSync("npx", args, { stdio: "inherit", shell: true, cwd: ROOT })
process.exit(res.status ?? 1)

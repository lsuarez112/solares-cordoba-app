# GAP V0 — Presupuestador Solar vs. repo actual

Fecha: 2026-11-06 · Base: `SPEC-V0.md` · Estado: **v2, con decisiones del 2026-11-06 incorporadas. Pendiente de aprobación final**

> Regla aplicada: ante conflicto entre la spec y el repo, se priorizan las convenciones del repo.

## Decisiones tomadas

| # | Decisión |
|---|---|
| D1 | El repo pasa a ser **solo** el presupuestador V0. Se borra lo que no se use y se reutiliza lo que sirva. |
| D2 | Se **mantiene la gestión de roles**, con un rol `vendedor`. |
| D3 | **Una sola empresa**: sin multi-empresa ni `user_companies`. |
| D4 | Productos: se mantienen `product_code` y `generic_properties` con sus claves actuales. |
| D5 | Kits predefinidos en tablas nuevas `kits` + `kit_items`. |
| D6 | Flujo: cliente → parámetros mínimos → la IA **sugiere un kit** del sistema. El vendedor también puede **elegir un kit a mano** sin IA. Los ítems del kit se copian al presupuesto y se pueden ajustar. |
| D7 | IVA en la confirmación: checkbox "Incluir IVA 21 %" **o** "IVA específico" con campo numérico. Sin IVA = 0 %. |
| D8 | Teléfono duplicado: **solo aviso** ("ya existe un cliente con este teléfono"). Se puede cargar igual. Se agrega la opción de unificar clientes. |
| D9 | Deploy en **Vercel** con el repo vinculado a Git. Se elimina el `Dockerfile`. |
| D10 | Editar un presupuesto emitido crea una **revisión** (mismo número, R1, R2…). |
| D11 | Se usa el **Supabase CLI** (`supabase` como devDependency, vía `pnpm supabase …`) para migraciones y el dump del esquema. |

---

## 0. Contexto técnico

- **React Router 7 framework mode (SSR)**, shadcn/ui, Zustand, Zod, react-hook-form, `@supabase/ssr`. Se mantiene.
- Convenciones: `domain/*` (schemas Zod + types), `services/*`, `stores/*`, `hooks/use-*`, `components/<feature>/*`, `appToast`, `devLog`, `handle.access` por ruta.
- **No hay migraciones versionadas**: el esquema vive en Supabase. [.env.example](../.env.example) dice que usa las credenciales de `gestion-app` → ver la pregunta **P1** al final.

---

## 1. Qué se reutiliza

| Spec | Lo cubre | Notas |
|---|---|---|
| Login Supabase Auth | `auth.service.ts`, `auth-provider.tsx`, rutas `login`, `register`, `auth/callback` y `unauthorized`, `user_profiles` | Sin cambios |
| Roles | `roles`, `user_profiles.role_id`, `PrivateRoute`, `components/roles/*`, `config/permisos` | Se reduce `ModuleSchema` a los módulos de V0 |
| Usuarios | `components/users/*`, `config/permisos/usuarios` | Se quitan las columnas de empresas |
| Categorías (`name`, `prefix`) | `product_categories` + ABM completo | Sin cambios |
| Productos | `products` + ABM (`components/products/*`, `products.store.ts`) | Se agrega `price_updated_at` |
| Tipo de sistema | `GridTypeSchema` `ON-GRID / OFF-GRID / HYBRID` | Se reutiliza en kits y presupuestos |
| Cotización | `exchange_rates` (`date`, `usd_to_ars`) + vista `v_products_with_ars` | Se agregan columnas y se define la cotización vigente |
| Import CSV/XLSX | `products-import.parser.ts`, `use-product-import.ts`, modal de preview | Base para "Actualizar precios" |
| Empresa + logo | `companies` + bucket `company-logos` + `company-logo-section.tsx` / `company-modal.tsx` | Se usa **una sola fila** y se edita desde Configuración |
| WhatsApp / copiar | `buildWhatsAppUrl`, `useCopyToClipboard` | Reutilizable |
| UI base | `components/ui/*`, `data-table`, sidebar, header, layouts | Sin cambios |

## 2. Qué se borra (F0)

| Se borra | Motivo |
|---|---|
| Rutas y placeholders `reports`, `movimientos-stock`, `perfiles-consumo`, `pedidos`, `ventas`, `config/usuario` (si no aporta) | Fuera de V0 |
| **Proveedores**: `components/suppliers/*`, `suppliers.service/store`, `domain/suppliers`, ruta `proveedores`, columnas de proveedor en productos | No está en la spec. **Impacto**: el código sugerido de producto pasa de `PROV-CAT-n` a `CAT-n`. Ver **P2** |
| Multi-empresa: `user_companies` (service, domain, hooks, `user-companies-badges`, `company-users-modal`), listado de empresas, ruta `config/empresas` | D3 |
| Catálogo mock (`data/catalog-mocks.ts`, `components/catalog/*`), `data/users-mocks.ts` | Se reemplazan por datos reales |
| Módulos de permisos sin uso (`notifications`, `orders`, `financing`, `installations`, `technical_visits`, `warranties`, `stock_movements`, `consumption_profiles`, `suppliers`, `companies`) | Se reduce `ModuleSchema` |
| `Dockerfile`, `.dockerignore`, `build/`, `lib/supabase.ts` (deprecado), alias deprecados en `product-share.utils.ts` y `roles.service.ts` | D9 y limpieza |
| Campos de producto que no usa V0 (`stock`, `stock_alert_at`, `cost_usd`, `is_composite`, `links`, `supplier_*`) | Se quitan **de la UI y los schemas**. En la DB solo se borran si el proyecto es exclusivo (P1) |

## 3. Qué se crea

- **DB**: `app_settings`, `kits`, `kit_items`, `assembly_rules`, `clients`, `budgets`, `budget_revisions`, `budget_items`, `ai_requests`, `price_imports`, la secuencia de numeración, los helpers, RLS, las RPCs, el bucket `budget-pdfs` y la vista `v_kits_with_totals`.
- **Edge Functions**: `suggest-quote` (IA) y `fetch-exchange-rate` (dolarapi).
- **Front**: configuración (empresa, presupuesto y cotización), ABM de kits y reglas, actualización masiva de precios, clientes (ficha, aviso de duplicado y unificación), wizard mobile de presupuesto, listado y detalle con revisiones, PDF, mensaje WhatsApp, Web Share y PWA.
- **Tests**: Vitest para la lógica pura (totales, parser de precios, dimensionamiento, mensaje, teléfono).

---

## 4. Conflictos resueltos

| # | Tema | Resolución |
|---|---|---|
| 4.1 | Roles | RBAC del repo + rol `vendedor` (D2). RLS de tablas nuevas según la spec: usuario autenticado y activo (`is_active_user()`). El acceso fino queda en el front |
| 4.2 | Empresa | Tabla `companies` con **una fila**. `app_settings` guarda solo parámetros de presupuesto. El PDF toma razón social, CUIT, contacto y logo de `companies` |
| 4.3 | `settings` → **`app_settings`** | Fila única (`check (id = 1)`): `default_validity_days`, `budget_footer`, `number_prefix`, `rate_mode (api/manual)`. El IVA por defecto es fijo (21 %) por D7 |
| 4.4 | `quotes` → **`budgets`** | Coincide con el módulo de permisos `budgets` y la ruta `/presupuestos`. La Edge Function conserva el nombre `suggest-quote` |
| 4.5 | `code` / `attributes` → **`product_code` / `generic_properties`** | D4. En el contrato con la IA el campo se llama `kit_id` (ver §5), así que el modelo no maneja códigos de producto en el flujo principal |
| 4.6 | Cotización | Se mantiene `usd_to_ars`. Se agregan `source`, `fetched_at` y `created_by`. La cotización vigente sale de `current_exchange_rate()` según `app_settings.rate_mode` |
| 4.7 | Kits | `kits` (`name`, `grid_type`, `kwp`, `battery_kwh`, `inverter_kw`, `notes`, `active`, `sort_order`) + `kit_items` (`kit_id`, `product_id`, `qty`). La vista `v_kits_with_totals` calcula el precio del kit desde los productos |
| 4.8 | Numeración | Secuencia asignada **al emitir**. Display `P-000042` y `P-000042-R1` (prefijo configurable) |
| 4.9 | PWA | Manifest + íconos + service worker mínimo, sin `vite-plugin-pwa` (no encaja con RR7 SSR y V0 no pide modo offline) |
| 4.10 | Deploy | Vercel con el preset `@vercel/react-router`. Variables `VITE_SUPABASE_*` en Vercel. Las claves de IA quedan **solo** en los secrets de Supabase |
| 4.11 | Importes | Los calcula siempre la DB al emitir (RPC `issue_budget`). El cliente calcula solo para la vista previa, con la misma fórmula testeada |
| 4.12 | Import de precios | Parseo y preview en el cliente. Se aplica con la RPC `apply_price_import`, que actualiza y registra en `price_imports` en una transacción, en lotes de 500 |
| 4.13 | IA + structured output | En Sonnet 5.5 y Haiku 5.5 el `tool_choice` forzado (`any`/`tool`) da error 400. Se usa `output_config.format` (JSON schema) para la respuesta y `strict: true` en las tools |

Supuestos vigentes:
- `price_usd` es neto de IVA.
- USD con 2 decimales; ARS se muestra redondeado a pesos enteros.
- El teléfono se normaliza a dígitos AR (`549…`) en una columna generada, con índice **no único**.

---

## 5. IA con consumo mínimo de tokens

### El problema

Mandar el catálogo completo en cada llamada (o exponerlo por MCP) escala con el tamaño del catálogo. Con unos 500 productos a ~30 tokens cada uno, son **~15.000 tokens de entrada por llamada**, más cada re-pregunta. Un MCP no ahorra tokens: todo lo que devuelve la tool entra igual al contexto, y además suma un servidor y más idas y vueltas.

### La idea: la IA elige entre pocos kits, no entre todo el catálogo

Como el flujo (D6) es "sugerir un kit", el modelo **nunca ve el catálogo**. Solo ve unos pocos kits candidatos que la DB ya filtró.

```
[1] Pedido del cliente ─┬─ formulario guiado ──────────────────────────────┐
                        └─ texto libre/dictado → EXTRAER (Haiku, sin catálogo) ┤
                                                                           ▼
[2] Validar mínimos (código, 0 tokens): tipo de sistema + consumo (kWh o equipos)
                                                                           ▼
[3] Dimensionar (código, 0 tokens): kWp necesario = kWh_mes / (HSP × 30 × PR)
    batería = consumo diario × días de autonomía / DoD
                                                                           ▼
[4] Filtrar kits en SQL (0 tokens): mismo grid_type, kWp en rango,
    batería si corresponde, total ≤ tope de presupuesto → top 5 por cercanía
                                                                           ▼
[5] ¿Hay 1 candidato claro? → se sugiere directo, SIN IA
    ¿Hay varios o ninguno? → ELEGIR (Sonnet) con params + ≤5 resúmenes de kit
                                                                           ▼
[6] El vendedor confirma o elige otro kit a mano → los ítems se copian al presupuesto
```

| Paso | Modelo | Qué se envía | Tokens aprox. (entrada / salida) |
|---|---|---|---|
| Extraer parámetros del texto | Haiku 5.5 | Instrucción breve + texto del cliente. **Sin catálogo** | ~500 / ~200 |
| Elegir kit | Sonnet 5.5 | Parámetros + dimensionamiento + ≤5 kits (nombre, kWp, batería, inversor, total USD, notas) + reglas del `grid_type` | ~1.200 / ~300 |
| Re-pregunta ("cambiá a litio de 5 kWh") | Sonnet 5.5 | Ítems actuales (código, cantidad, nombre corto) + instrucción + **tool `search_products`** que la Edge Function resuelve contra la DB y devuelve ≤10 filas filtradas por categoría y propiedades | ~1.500–2.500 / ~400 |

**Costo estimado por presupuesto** con precios actuales (Haiku 5.5: $0,10/$0,50; Sonnet 5.5: $2/$10 por millón de tokens):

- Extraer + elegir: **≈ USD 0,006**.
- Mandando el catálogo completo: ≈ USD 0,035.
- Ejemplo: 10 vendedores × 20 presupuestos/día ≈ **USD 1,2/día** contra ~7/día.

Reglas adicionales:
- **Los precios nunca salen de la IA.** El modelo devuelve `kit_id` y, opcionalmente, ajustes de cantidad sobre ítems del kit. El backend valida que existan y estén activos y calcula los importes desde la DB.
- **Prompt caching** sobre el bloque estático (instrucciones + fórmula + reglas). Cachea desde 512 tokens en ambos modelos; la lectura cuesta ~0,1×. Con poco tráfico la caché de 5 minutos se enfría seguido, así que suma poco. Se activa igual porque no tiene costo de implementación, y se mide con `cache_read_input_tokens`.
- **Salida estructurada** con `output_config.format`:
  - Extraer: `{system_type, consumption:{kwh, period}|null, appliances[], battery:{wanted, autonomy_days}|null, city, roof, budget_cap_usd, missing_info[]}`
  - Elegir: `{kit_id|null, qty_adjustments[{product_code, qty, reason}], summary:{system_type, kwp, est_monthly_kwh, battery_kwh}, warnings[], missing_info[]}`
- Si el texto no alcanza para los mínimos, la extracción devuelve `missing_info` y **no** se llama al paso de elección. Así se cumple "no se llama a Claude sin mínimos".
- Cada llamada se registra en `ai_requests` (paso, modelo, tokens in/out/caché, costo, duración, error).
- Los modelos se configuran por secret (`AI_MODEL_EXTRACT`, `AI_MODEL_SELECT`) para probar Haiku en el paso de elección con casos reales y bajar el costo otro ~95 % si rinde igual.

**Requisito de datos:** para filtrar kits sin IA, cada kit necesita `grid_type`, `kwp` y `battery_kwh` cargados. Y para que `search_products` sirva en las re-preguntas, las claves de `generic_properties` que se usen para filtrar (por ejemplo potencia del panel, kWh y química de la batería) tienen que ser consistentes. Se documentan las claves que ya existen; no se renombran.

---

## 6. Plan por fases

Cada fase cierra con un resumen, `pnpm typecheck` en verde, tests donde aplique y pasos para probarla.

### F0 — Limpieza y base

- Borrar todo lo de §2. Reducir `ModuleSchema` y la sidebar a: Inicio, Nuevo presupuesto, Presupuestos, Clientes, Productos, Categorías, Kits, Configuración, Usuarios y Roles.
- Agregar `supabase` (CLI) y `vitest` como devDependencies. Crear `supabase/config.toml` y `supabase/migrations/`.
- Quitar el `Dockerfile` y configurar Vercel. `README` con setup local.

**Cómo probar:** `pnpm typecheck` y `pnpm build` en verde; la app levanta, el login funciona y los productos y categorías siguen operando; el preview de Vercel abre.

### F1 — Esquema DB + RLS + RPC

Prerrequisito: `supabase login` + `supabase link` (lo hacés vos, es interactivo) → yo corro `supabase db dump --schema-only` y armo el baseline.

Migraciones (todas en `supabase/migrations/`):
1. Baseline del esquema actual.
2. Helpers: `is_active_user()`, `normalize_phone()`, trigger `set_updated_at`.
3. `products.price_updated_at` + trigger; columnas nuevas de `exchange_rates`; `current_exchange_rate()`; vista de productos recreada.
4. `app_settings`, `kits`, `kit_items`, `assembly_rules`, `v_kits_with_totals`.
5. `clients` con `phone_normalized`.
6. `budgets`, `budget_revisions`, `budget_items` y la secuencia de numeración.
7. `ai_requests`, `price_imports`.
8. RLS + trigger que impide modificar revisiones emitidas.
9. RPCs: `issue_budget(revision_id, iva_pct)`, `create_budget_revision(budget_id)`, `duplicate_budget(budget_id)`, `create_budget_from_kit(client_id, kit_id, input)`, `apply_price_import(rows, file_name)`, `find_clients_by_phone(phone)`, `merge_clients(keep_id, merge_ids)`, `suggest_kit_candidates(params)` (el filtro del paso [4]).
10. Bucket `budget-pdfs`; seed del rol `vendedor` y de `app_settings`.

**Cómo probar:** `supabase db reset` en local (Docker) o en un branch, y correr los scripts de `supabase/tests/`:
- emitir un presupuesto, cambiar el precio y comprobar que el emitido no cambia;
- R1 conserva el número y R0 queda intacta;
- `update` sobre una revisión emitida da error;
- un usuario inactivo no tiene acceso;
- `suggest_kit_candidates` devuelve kits coherentes con el kWp pedido.

### F2 — Productos, categorías, import código+precio, configuración y cotización

- `price_updated_at` visible; vista mobile de productos (solo consulta y búsqueda).
- Modal "Actualizar precios" (actualiza / sin cambio / no encontrado) e historial de `price_imports`.
- `config/general`: datos y logo de la empresa (reutiliza `company-modal` y `company-logo-section`), validez, prefijo y pie del PDF, modo de cotización.
- Edge Function `fetch-exchange-rate` (dolarapi oficial venta; botón manual + `pg_cron` diario) y override manual con historial.
- ABM de kits (con total calculado) y de reglas de armado.

**Cómo probar:** import con códigos mixtos; cotización manual que se refleja en el ARS; kit nuevo con el total correcto. Vitest para el parser.

### F3 — Clientes y ABM de presupuestos

- Clientes: listado, alta rápida, aviso de teléfono duplicado (D8), ficha con historial, unificación.
- Wizard: cliente → parámetros (formulario guiado + texto libre; en esta fase sin IA) → validación de mínimos → dimensionamiento → **candidatos de kit** (`suggest_kit_candidates`) o elección manual → ajuste de ítems → confirmación con IVA (D7) → emitir.
- Listado con búsqueda, detalle con revisiones, editar emitido (crea revisión), duplicar, borrar borradores. Inicio con el último presupuesto.

**Cómo probar:** flujo completo en el celular sin IA; revisiones; unificar clientes. Vitest para totales, IVA, mínimos, dimensionamiento y teléfono.

### F4 — Edge Function `suggest-quote`

- Acciones `extract`, `select` y `refine` según §5, con JWT, structured outputs, tool `search_products`, caché y log en `ai_requests`.
- Integración en el wizard: botón "Interpretar texto" (extract) y "Sugerir kit" (select, solo si hay más de un candidato), y un chat de ajuste (refine).

**Cómo probar:** `supabase functions serve` + 8–10 fixtures reales (factura bimestral, lista de equipos, híbrido con batería, consulta vaga → `missing_info` sin llamar a select). Medir los tokens en `ai_requests` contra la estimación de §5.

### F5 — PDF + WhatsApp + Web Share

- `@react-pdf/renderer` con lazy import, subida a `budget-pdfs/<budget>/<revision>.pdf` y URL firmada.
- Mensaje compacto (§8 de la spec) con formato `es-AR`; copiar, `wa.me` con el teléfono del cliente, `navigator.share({ files })` con descarga como fallback.

**Cómo probar:** snapshot del mensaje del ejemplo de la spec; en el celular, compartir el PDF a WhatsApp.

### F6 — PWA y ajustes mobile

- Manifest, íconos, `theme-color`, SW mínimo, meta tags de iOS.
- Navegación inferior / botón flotante, tablas → cards, `inputmode` numérico, áreas táctiles.

**Cómo probar:** Lighthouse (installable); instalar en Android/iOS; recorrer el flujo completo.

---

## 7. Conocimiento del armador → datos + código (no prompt)

Fuente: `armador-kit-solares/` (14 `.md`, ~113 KB ≈ **30.000 tokens** si se mandaran enteros).

Casi todo lo que hace el armador es **determinístico**. Se pasa a tablas y funciones, así la IA recibe solo lo que necesita para decidir.

| Archivo | Destino en la app | Tokens por llamada |
|---|---|---|
| `05_sizing rules` (fórmulas, η, DoD, cobertura, casos especiales) | `lib/sizing/*.ts` (puro, testeado con Vitest) + constantes en `app_settings` (η=0.75, HSP por defecto, DoD por química) | 0 |
| `04_solar zones` (HSP por ciudad/región) | Tabla `solar_zones` (`city`, `province`, `hsp_horizontal`, `hsp_optimal`) + select de localidad en el wizard | 0 |
| `02_consumption profiles` | Constante `PROFILES` (etiqueta y rangos), solo informativa | 0 |
| Tabla de equipos típicos (05 §3.2) | Tabla `appliance_presets` (equipo, W, horas/día) para el formulario guiado | 0 |
| `01_questionnaire` | Campos del wizard (mínimos + opcionales) | 0 |
| `03_kit templates` (9 kits, BOM base + opcionales) | `kits` + `kit_items` (BOM base) + **`kit_options`** (ampliaciones de autonomía, alternativas de inversor y extras, como cambios `add/replace/remove` sobre el BOM) | Solo los ≤5 candidatos, en formato compacto |
| `products *.md` (~300 SKUs con Wp, kWh, V, tipo, compatibilidades) | `products.generic_properties` con claves canónicas + asignación de **categoría** | 0 (solo vía la tool `search_products`, ≤10 filas) |
| `00_system prompt` (reglas) | Las reglas duras pasan a código o SQL (nunca baterías en on-grid, nunca inversor on-grid en off/híbrido, ±15 % de Wp, PV_max). Lo blando queda en un system prompt de **~400 tokens** + `assembly_rules` | ~400 (cacheable) |
| `06_query examples` | **Fixtures de evaluación** para F4 (no van en el prompt) | 0 |

**Formato hacia la IA:** ni HTML ni Markdown (las etiquetas y las tablas gastan tokens). Una línea compacta por kit candidato, ~50–70 tokens:

```
KIT_HYB_MEDIO|HYBRID|mono|3280Wp|gen~325kWh/m|bat 5.5kWh LFP|inv SPH5000 5kW|ref 300-500|USD 4850
  opts: A1 2xHope 11kWh +USD 2100; A2 3xHope 16.5kWh +USD 4200; G1 SPH3000 1640Wp -USD 900
```

Llamada de elección: ≈ 400 (sistema, cacheado) + 150 (pedido + dimensionamiento) + 5 × 70 (kits) ≈ **900 tokens de entrada**. La respuesta es `kit_id` + `option_ids[]` + advertencias.

**Reducción de productos por tipo:** los 9 kits usan ~45 SKUs distintos. La IA nunca ve el catálogo. En las re-preguntas, `search_products` filtra por categoría y propiedades y devuelve como máximo 10 filas de las categorías solares.

**Inconsistencias a corregir en los `.md`:**
- `02_consumption profiles` referencia kits `KIT_ON_01…KIT_ON_10` y `KIT_HYB_05`, que no existen. Los kits reales son 9: `KIT_{ON,HYB,OFF}_{BAJO,MEDIO,ALTO}`.
- HSP: el system prompt usa 5,0 h y los kits 4,4 h. Regla: si se desconoce el ángulo, 4,4 h. Queda en código.
- El SKU `575768` (soporte Wega techo plano) no existe en la base.

## 8. Estado actual de la DB y migración de datos

Respaldo lógico completo (esquema, políticas, funciones y datos de las 14 tablas) en `backups/2026-11-06-pre-v0/` (en `.gitignore`).

| Tabla | Filas | Acción |
|---|---:|---|
| `products` | 483 | **Se conserva.** Se normaliza `product_code` (ver abajo); se asignan categoría y propiedades desde los `.md`; se quitan columnas sin uso (`stock`, `stock_alert_at`, `cost_usd`, `is_composite`, `links`, `supplier_*`) |
| `product_categories` | 7 | Se reemplaza por el set solar (Paneles, Inversores on-grid, Inversores híbridos/off-grid, Baterías, Reguladores, Cables y conectores, Protecciones, Limitadores y monitoreo, Estructura, Otros). Se borra "Colchones" |
| `companies` | 2 | Queda **Solares Córdoba S.A.** (con logo). Se borra "Colchones y Hogar" |
| `roles` | 4 | Se conservan; ya existe `Vendedor`. Se actualizan los permisos a los módulos de V0 |
| `user_profiles` | 6 | Se conservan |
| `clients` | 0 | Se recrea con el esquema nuevo (agrega `city`, `phone_normalized`; conserva `cuit`) |
| `quotes`, `quote_items` | 0 | **Se recrean** con el esquema de revisiones. La DB y la spec ya usan `quotes`, así que **se abandona `budgets`** y el módulo de permisos pasa a llamarse `quotes` |
| `exchange_rates` | 0 | Se le agregan columnas |
| `suppliers` (2), `user_companies` (6), `sales`, `sale_documents`, `product_components` (0), vista `products_with_supplier` | — | **Se borran.** También las funciones `user_company_ids` y `link_company_to_creator` |
| Funciones `has_permission`, `get_my_role`, `handle_new_user`, `activate/deactivate_user`, `set_updated_at` | — | Se conservan y se versionan en el baseline |

**Hallazgos en los productos:**
- **Los 483 tienen `price_usd = 0`.** Antes de emitir presupuestos hay que cargar precios con el import código+precio (F2).
- 482 no tienen categoría y casi ninguno tiene propiedades. Los `.md` cubren **298** (todos encontrados en la base salvo `575768`).
- Los otros **185** son productos ajenos o servicios (toalleros, fan coils, "COMISION VENTA", "FINANCIACION…"). Van a la categoría "Otros" y quedan fuera de la IA.
- **Códigos sin cero inicial:** 179 códigos de 5 dígitos perdieron el `0` (`037029` se guardó como `37029`). Se normalizan a 6 dígitos (`lpad`) para los códigos numéricos de menos de 6 dígitos. El import de precios aplica la misma normalización.

## 9. Preguntas abiertas

- ~~P1~~ **Resuelta:** la DB es exclusiva de esta app; se limpia directamente.
- ~~P2~~ Sin proveedores. Los códigos reales son SKUs numéricos del ERP, así que **se elimina la generación automática de códigos**: el código se carga a mano o llega por import.
- **P3:** ¿de dónde salen los precios (exportación del ERP con código+precio)? ¿Los códigos del archivo vienen con el cero inicial?
- **P4:** los 185 productos que no están en los `.md`, ¿quedan en "Otros" (se pueden agregar a mano en un presupuesto) o se desactivan?
- **Pendientes de la spec §11:**
  - Kits y reglas iniciales, HSP/PR para Córdoba → F2–F3.
  - Fuente exacta del dólar → F2.
  - Datos de empresa, logo y días de validez → F5.

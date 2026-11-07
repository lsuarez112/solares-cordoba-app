# Presupuestador Solar Mobile — Especificación V0

Fecha: 2026-11-06 · Estado: definido en entrevista, listo para arrancar

## 1. Objetivo

App específica para la empresa, para usar desde el teléfono, en la que un vendedor carga lo que pide el cliente. Claude propone un listado de productos o un kit, el vendedor lo ajusta y confirma, y la app genera un **PDF de presupuesto** (logo, ARS + USD, cotización del día) y un **mensaje compacto para WhatsApp**.

## 2. Alcance V0

**Incluye**
- Usuarios: hasta ~10 vendedores (incluido Agustín), login con Supabase Auth, **sin permisos ni roles**. Todos pueden hacer todo.
- Base de productos y categorías, con un único precio en USD y fecha de actualización del precio.
- Kits predefinidos y reglas de armado que Claude debe respetar.
- Ficha de cliente con su historial de presupuestos.
- Listado de comprobantes generados, con opciones para copiar el mensaje, abrir WhatsApp o descargar el PDF.
- Cotización del dólar traída de una API, con override manual en configuración y fecha de actualización.
- Actualización masiva de precios desde desktop con un archivo de **código + precio**.

**Fuera de V0**
- Sincronización con la API de la otra app (todavía no la comparten).
- Roles y permisos, multi-empresa, envío por email, estados avanzados del presupuesto y modo offline.

## 3. Flujo principal (mobile)

1. **Nuevo presupuesto.** Se elige un cliente existente o se crea uno rápido (nombre y teléfono).
2. **Pedido del cliente.** Hay tres entradas que se pueden combinar:
   - Texto libre (lo que mandó el cliente por WhatsApp, pegado tal cual).
   - Dictado por voz, con el micrófono del teclado del celular (sin costo extra).
   - Formulario guiado opcional.
3. **Validación de mínimos.** Sin estos datos no se llama a Claude:
   - **Tipo de sistema:** On-grid / Off-grid / Híbrido.
   - **Consumo:** kWh (mensual o bimestral) de la factura, **o** un listado de equipos con potencia (W) y horas de uso por día.

   Una consulta vaga como "¿qué presupuesto armo para mi casa?" se rechaza y la app indica qué falta.

   Campos opcionales: batería y autonomía, localidad, tipo de techo o superficie, tope de presupuesto.
4. **Sugerencia de Claude.** Devuelve los ítems (código + cantidad + motivo), un resumen técnico y advertencias.
5. **Ajuste.** El vendedor puede editar libremente (cantidades, quitar o agregar productos del catálogo) **y** re-preguntar en lenguaje natural ("cambiá a batería de litio de 5 kWh").
6. **Confirmación.** Se elige el IVA (21 % por defecto o un % específico) y se congelan los precios y la cotización del momento. Se genera el número correlativo y el PDF.
7. **Compartir.** El PDF se comparte con la Web Share API (en el celular lo manda como archivo a WhatsApp) o se descarga. El mensaje de texto se copia o se abre en `wa.me`.

## 4. Integración con Claude

- **Nunca desde el front.** Se llama desde una **Supabase Edge Function** (`suggest-quote`) que guarda la API key como secret.
- **Contexto que se envía:** los datos del formulario y el texto, el catálogo compacto (código, nombre, categoría, atributos clave, precio USD, activo), los kits predefinidos y las reglas de armado.
- **Salida estructurada** con tool use / JSON schema:
  ```json
  {
    "items": [{ "code": "PAN550", "qty": 10, "reason": "..." }],
    "summary": { "system_type": "ON-GRID", "kwp": 5.5, "est_monthly_kwh": 690, "battery_kwh": null },
    "warnings": ["Consumo informado bimestral, se dividió por 2"],
    "missing_info": []
  }
  ```
- **Precios:** Claude **no** pone precios. El backend valida que cada código exista y esté activo, y calcula los importes desde la DB.
- **Re-pregunta:** se reenvía la propuesta actual junto con la instrucción del vendedor y se recibe el listado completo actualizado.
- **Log:** se guarda en `ai_requests` cada request y su respuesta (tokens y costo) para auditar y mejorar el prompt.
- **Modelo:** Sonnet para el balance entre costo y razonamiento. Hay que evaluarlo con casos reales.

## 5. Precios, IVA y cotización

- El producto tiene un **único precio en USD** (`price_usd`) y la fecha `price_updated_at`.
- Cotización: una fuente automática (API pública del dólar oficial venta, por ejemplo dolarapi) que se guarda en `exchange_rates`. En configuración se puede **pisar manualmente**, y queda registrada la fuente y la fecha y hora.
- Al confirmar, el presupuesto **guarda una foto** de:
  - el precio unitario de cada ítem en USD,
  - la cotización, su fuente y su fecha,
  - el % de IVA, el subtotal, el IVA y el total en USD y en ARS.

  Si mañana cambian los precios o el dólar, el presupuesto emitido no cambia.

## 6. Modelo de datos (Supabase) — borrador

| Tabla | Campos clave |
|---|---|
| `settings` (fila única) | razón social, CUIT, teléfono, email, dirección, `logo_path`, `default_validity_days`, `default_iva_pct`, `rate_source`, `rate_manual_override`, `quote_footer` |
| `exchange_rates` | `date`, `source` (api/manual), `usd_ars`, `fetched_at`, `created_by` |
| `product_categories` | `name`, `prefix` |
| `products` | `code` (unique), `name`, `description`, `category_id`, `price_usd`, `price_updated_at`, `attributes jsonb` (W, tipo de inversor, kWh, etc.), `active` |
| `kits` / `kit_items` | `name`, `system_type`, `kwp`, `notes` / `kit_id`, `product_id`, `qty` |
| `assembly_rules` | `text` (por ejemplo "siempre incluir protecciones DC/AC"), `system_type` (nullable), `active` |
| `clients` | `name`, `phone`, `email`, `city`, `address`, `notes` |
| `quotes` | `number` (sequence), `client_id`, `seller_id`, `status` (draft/issued), `input jsonb`, `ai_summary jsonb`, `usd_ars`, `rate_source`, `rate_date`, `iva_pct`, `subtotal_usd`, `iva_usd`, `total_usd`, `total_ars`, `valid_until`, `pdf_path`, `created_at` |
| `quote_items` | `quote_id`, `product_id`, `code`, `description` (snapshot), `qty`, `unit_price_usd`, `subtotal_usd` |
| `ai_requests` | `quote_id`, `request jsonb`, `response jsonb`, `model`, `tokens_in`, `tokens_out` |
| `price_imports` | `file_name`, `rows_total`, `rows_updated`, `codes_not_found jsonb`, `created_by` |

RLS: cualquier usuario autenticado y activo puede leer y escribir todo.

## 7. PDF del presupuesto

- Encabezado: logo, datos de la empresa, **N.º de presupuesto**, fecha y **validez** ("válido hasta dd/mm/aaaa").
- Datos del cliente y del vendedor.
- **Resumen técnico:** tipo de sistema, potencia kWp, generación estimada mensual y batería kWh si corresponde.
- Tabla de ítems: código, descripción, cantidad, precio unitario USD, subtotal USD y subtotal ARS.
- Totales: subtotal, IVA (x %) y total, en USD y en ARS.
- Línea con la cotización: "Cotización USD: $X (fuente, fecha)".
- Pie con el texto configurable de `quote_footer`.

## 8. Mensaje de WhatsApp (sin emojis, compacto)

```
Presupuesto N 0042 - Juan Perez
Sistema ON-GRID 5,5 kWp (~690 kWh/mes)

10x Panel 550W
1x Inversor 5kW on-grid
1x Estructura techo chapa 10p
1x Kit protecciones DC/AC

Total: USD 4.850 + IVA 21% = USD 5.868
ARS $ 7.335.000 (USD 1.250, 06/11/2026)
Valido hasta 21/11/2026
```

## 9. Pantallas

**Mobile (PWA instalable)**
- Inicio con el último presupuesto y el botón "Nuevo presupuesto".
- Wizard de nuevo presupuesto: cliente, pedido, sugerencia y edición, confirmación.
- Presupuestos: listado con búsqueda y acciones (PDF, copiar, WhatsApp, duplicar).
- Clientes: listado y ficha con historial.
- Productos: solo consulta y búsqueda.

**Desktop (la misma app, responsive)**
- ABM de productos y categorías.
- Kits y reglas de armado.
- **Actualización masiva de precios:** se sube un CSV/XLSX con `codigo;precio_usd`, se ve una vista previa (actualiza / sin cambio / código no encontrado) y se aplica. Se actualizan `price_usd` y `price_updated_at` y se guarda el log en `price_imports`. Reutiliza el patrón de importación del SRM (papaparse + xlsx + Zod + batches de 100).
- Configuración: datos de la empresa, logo, IVA por defecto, validez, cotización (API/manual) y pie del PDF.

## 10. Stack propuesto

React + Vite + TypeScript + shadcn/ui + Zustand + Zod + react-hook-form (las mismas convenciones del SRM). PWA con `vite-plugin-pwa`. Supabase (Auth, DB, Storage para logo y PDFs, Edge Functions para Claude y la cotización). PDF con `@react-pdf/renderer`. Deploy en Vercel.

## 11. Pendientes por confirmar

- Datos de la empresa y logo para el PDF.
- Días de validez por defecto.
- Qué dólar exacto usar como referencia (oficial BNA venta, o alguno de un banco de Córdoba si existe una fuente).
- Lista inicial de kits y reglas de armado: protecciones, mano de obra, estructura por cantidad de paneles, sobredimensionamiento.
- Fórmula de dimensionamiento que se pasa como contexto a Claude (HSP de Córdoba, pérdidas, factor de seguridad).
- Formato del número de presupuesto (por ejemplo `P-000042`).
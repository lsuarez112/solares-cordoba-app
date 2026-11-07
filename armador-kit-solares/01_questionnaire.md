---
file: 01_questionnaire.md
purpose: Guía de preguntas para completar información insuficiente
usage: Consultar cuando la consulta del usuario no permite iniciar el flujo de dimensionamiento
rule: Nunca más de 3 preguntas por turno — priorizar por bloque en orden
---

# CUESTIONARIO DE PERFILADO

Este archivo no es un formulario secuencial. Es una biblioteca de preguntas organizadas por bloque de información. La IA debe identificar qué bloque está incompleto y hacer **solo las preguntas necesarias** para desbloquearlo, en el orden de prioridad indicado.

**Regla operativa:** si con la información disponible se puede hacer una suposición razonable, hacerla, declararla explícitamente, y continuar. Solo preguntar cuando el supuesto cambiaría significativamente la recomendación.

---

## Bloque A — Consumo (CRÍTICO)

Sin consumo no hay dimensionamiento. Es la primera información a resolver.

**A1 — Consumo conocido en kWh**
> "¿Cuántos kWh por mes consume aproximadamente? Podés verlo en la factura de luz."

**A2 — Consumo desconocido, usuario tiene factura en pesos**
> "¿Cuánto paga de luz por mes? ¿Tiene la factura a mano para ver los kWh consumidos?"

**A3 — Consumo desconocido, usuario describe equipos**
> "¿Qué equipos eléctricos tiene que cubrir? Para cada uno, ¿cuántas horas por día los usa aproximadamente?"
> *(Si lista equipos sin horas, asumir perfil de uso estándar según `02_consumption_profiles.md` y aclararlo)*

**A4 — Consumo parcial o total**
> "¿Querés cubrir todo el consumo de la propiedad o solo algunos equipos específicos (por ejemplo, solo aires acondicionados o solo iluminación)?"

---

## Bloque B — Tipo de sistema (CRÍTICO)

Define qué productos usar. Si no se menciona, inferir según las siguientes reglas antes de preguntar:

| Contexto detectado | Supuesto a declarar |
| :--- | :--- |
| Menciona "red", "EPEC", "inyección", "factura" | ON_GRID |
| Menciona "cortes", "autonomía", "respaldo", "batería" | HÍBRIDO |
| Menciona "campo", "sin red", "alejado", "off" | OFF_GRID |
| Sin contexto claro | Preguntar B1 |

**B1 — Tipo de sistema**
> "¿El lugar donde se instala tiene conexión a la red eléctrica?"
> - Sí, tiene red → preguntar B2
> - No tiene red → OFF_GRID (ir a Bloque D)

**B2 — Necesidad de respaldo**
> "¿Necesita que el sistema funcione durante cortes de luz, o alcanza con reducir la factura?"
> - Solo reducir factura → ON_GRID
> - Necesita funcionar en cortes → HÍBRIDO

---

## Bloque C — Ubicación (IMPORTANTE)

Afecta el HSP y por lo tanto el dimensionamiento. Si no se menciona, asumir Córdoba capital (HSP 5.0h) y declararlo.

**C1 — Ciudad o zona**
> "¿En qué ciudad o zona de Argentina se instala el sistema?"

*(Solo preguntar si la ubicación cambiaría el HSP más de 0.5h respecto a Córdoba, o si el usuario mencionó una provincia diferente)*

---

## Bloque D — Autonomía / Baterías (si sistema HÍBRIDO u OFF_GRID)

**D1 — Horas de autonomía**
> "¿Cuántas horas necesita que el sistema funcione sin sol o sin red? ¿Es para toda la noche o solo para emergencias cortas?"

**D2 — Cargas críticas**
> "Durante un corte, ¿qué equipos son imprescindibles? (Ej: heladera, luces, router, bomba de agua)"

*(Esto define la potencia mínima del inversor y la capacidad de batería)*

---

## Bloque E — Instalación (ÚTIL para selección de componentes)

**E1 — Tipo de techo**
> "¿El techo es de chapa, tejas, losa o membrana? ¿Tiene sombra parcial en algún horario?"

**E2 — Espacio disponible**
> "¿Tiene idea de cuántos metros cuadrados de techo disponible hay para los paneles?"
> *(Referencia: panel de 550Wp ocupa aprox. 2.2 m²)*

**E3 — Conexión eléctrica**
> "¿El tablero eléctrico es monofásico o trifásico?"
> *(Solo preguntar si el consumo supera 1000 kWh/mes o si se mencionó una instalación industrial/comercial grande)*

---

## Bloque F — Contexto comercial (OPCIONAL)

Solo preguntar si el técnico/vendedor necesita afinar la recomendación por restricciones del cliente.

**F1 — Presupuesto**
> "¿Tiene algún rango de presupuesto en mente para el sistema?"

**F2 — Preferencia de marca**
> "¿El cliente tiene preferencia por alguna marca de inversor o panel?"

**F3 — Horizonte de expansión**
> "¿Planea ampliar el sistema en el futuro? ¿En cuánto tiempo aproximadamente?"

---

## Árbol de decisión rápido

```
Consulta recibida
│
├── ¿Tiene consumo (kWh/mes o descripción de equipos)?
│   ├── NO → Preguntar A1 (o A3 si describió equipos sin cantidades)
│   └── SÍ → continuar
│
├── ¿Tiene tipo de sistema (on-grid / híbrido / off-grid)?
│   ├── NO → Inferir por contexto (tabla Bloque B) o preguntar B1
│   └── SÍ → continuar
│
├── ¿Tiene ubicación?
│   ├── NO → Asumir Córdoba capital, declararlo, continuar
│   └── SÍ → verificar HSP en 04_solar_zones.md
│
├── Sistema HÍBRIDO u OFF_GRID?
│   ├── SÍ → preguntar D1 y D2 si no se mencionaron
│   └── NO → continuar
│
└── Información suficiente → ejecutar flujo de 00_system_prompt.md
```

---

## Reglas de uso

- **Máximo 3 preguntas por turno.** Si faltan datos de múltiples bloques, priorizar A → B → D.
- **Nunca preguntar lo que se puede suponer.** Si el supuesto es razonable, declararlo y seguir.
- **No repetir preguntas** que el usuario ya respondió parcialmente — reformular sobre lo que falta.
- **Bloque F es siempre opcional.** No preguntar presupuesto ni marca si ya hay suficiente para dimensionar.
- Si el usuario es claramente un técnico con contexto completo, omitir el cuestionario y dimensionar directamente.
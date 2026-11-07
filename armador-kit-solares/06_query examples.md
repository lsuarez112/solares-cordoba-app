---
file: 06_query_examples.md
purpose: Ejemplos de consulta → respuesta y template para nuevos casos
usage: Consultar en Paso 6 del flujo para calibrar formato y tono de respuesta
---

# EJEMPLOS DE CONSULTA Y RESPUESTA

Este archivo tiene dos secciones:
1. **Ejemplos resueltos** — casos reales o representativos con respuesta completa. El motor los usa para calibrar formato, nivel de detalle y tono.
2. **Template vacío** — estructura para agregar nuevos ejemplos a medida que el sistema se usa en producción.

**Principio de tono:** responder como un ingeniero que conoce el catálogo, no como un chatbot. Sin frases de relleno. Si hay un supuesto, declararlo. Si hay una advertencia técnica, ponerla.

---

## Ejemplos resueltos

---

### Ejemplo 1 — Consulta limpia con consumo y tipo explícito

**Consulta del usuario:**
> "Necesito un sistema on-grid para una casa en Córdoba que consume 320 kWh por mes. Sin batería."

---

**Respuesta:**

## Consulta interpretada
Sistema on-grid sin batería para vivienda en Córdoba capital. Consumo declarado: 320 kWh/mes. Sin necesidad de respaldo ante cortes.

## Perfil asignado
**PERFIL_02** — Familia media con 1 AC — 320 kWh/mes

## Dimensionamiento
- Consumo normalizado: **320 kWh/mes**
- HSP (Córdoba capital, ángulo desconocido): **4.4 h** (valor conservador)
- η sistema: 0.75

```
Wp_objetivo = (320 × 1000) / (4.4 × 0.75 × 30) = 320.000 / 99 = 3.232 Wp
```

- Wp objetivo: **3.232 Wp**
- Kit más cercano: **KIT_ON_MEDIO** (3.280 Wp) — sobredimensionamiento +1.5%

Verificación de generación:
```
kWh_mes = (3.280 / 1000) × 4.4 × 0.75 × 30 = 3.28 × 99 = ~325 kWh/mes
```

## Recomendación

### Kit: KIT_ON_MEDIO — ON GRID monofásico Growatt 3 kW

| SKU | Descripción | Cant. |
| :--- | :--- | :---: |
| 549423 | Panel Solar 410Wp Jinko Tiger HalfCells PERC | 8 |
| 576044 | Inversor OnGrid Mono Growatt MIC-3000TL-X2 | 1 |
| 037030 | Módulo Dongle WiFi-F Growatt OnGrid | 1 |
| 037026 | Limitador de inyección Growatt Mono Eastron RS485 | 1 |
| 037002 | Juego de conectores MC4 | 10 |
| 036025 | Cable solar 6mm rojo | 30 |
| 036026 | Cable solar 6mm negro | 30 |
| 576045 | Soporte Mibet coplanar p/2 módulos 30mm | 4 |
| 040014 | Protector descargas ATM CC Tipo II 1000Vcc Suntree | 1 |
| 576056 | Interruptor térmico CC 550V-63A-2P | 1 |
| 040020 | Fusible ANL 150A | 1 |
| 575859 | Portafusible ANL cristal | 1 |
| 576085 | Disyuntor tetrapolar AC 40A-300mA | 1 |

## Cobertura estimada
~325 kWh/mes generados vs 320 kWh/mes consumidos = **~102% de cobertura anual promedio**

En la práctica: la FV cubre el consumo diurno; de noche la red (EPEC) sigue activa. El excedente diurno se inyecta a red o se limita según configuración del limitador.

## Advertencias
- Sistema on-grid: **sin respaldo ante corte de red**. Si hay apagones frecuentes en la zona, evaluar KIT_HYB_MEDIO.
- Cobertura del 102% es promedio anual. En invierno la generación puede bajar 30–40%; en verano puede haber excedente.
- Si el techo tiene inclinación ~30°, usar HSP 5.0h: Wp_objetivo baja a 2.844 Wp y el mismo kit queda con mayor margen de generación (~14% extra).
- Cantidades de cable y soportes son de referencia; el instalador ajusta según distancia techo–tablero.

---

### Ejemplo 2 — Consulta por lista de equipos sin consumo declarado

**Consulta del usuario:**
> "Quiero solar para un departamento. Tengo: heladera, televisor, dos notebooks, iluminación LED y un split de 3000 frigorías que uso en verano unas 5 horas por día. No sé cuánto consumo."

---

**Respuesta:**

## Consulta interpretada
Sistema fotovoltaico para departamento en Córdoba (supuesto — no se indicó ubicación). Consumo a calcular por suma de cargas. Tipo de sistema no declarado — supuesto: **on-grid** (es departamento con red disponible). Si necesita respaldo ante cortes, aclarar para evaluar kit híbrido.

## Perfil asignado
Cálculo por equipos → asignación a **PERFIL_02** — Familia media con 1 AC

### Cálculo de consumo por equipos

| Equipo | Potencia (W) | Horas/día | kWh/mes |
| :--- | :---: | :---: | :---: |
| Heladera familiar | 150 | 24 | 108.0 |
| Televisor LED 42" | 80 | 5 | 12.0 |
| Notebook × 2 | 130 | 7 | 27.3 |
| Iluminación LED hogar | 100 | 5 | 15.0 |
| Split 3.000 frig (verano) | 1.050 | 5 | 157.5 |
| Router + varios | 40 | 16 | 19.2 |
| **TOTAL** | | | **~339 kWh/mes** |

> Potencias tomadas de tabla estándar (`05_sizing_rules.md`). El split se calculó con uso declarado (5h/día); en meses sin AC el consumo baja a ~181 kWh/mes.

## Dimensionamiento
- Consumo normalizado: **339 kWh/mes** (con AC en uso)
- HSP (Córdoba capital, conservador): **4.4 h** | η: 0.75

```
Wp_objetivo = (339 × 1000) / (4.4 × 0.75 × 30) = 339.000 / 99 = 3.424 Wp
```

- Kit más cercano hacia arriba: **KIT_ON_MEDIO** (3.280 Wp) — subdimensionamiento leve (-4.2%)

Verificación:
```
kWh_mes = (3.280 / 1000) × 99 = ~325 kWh/mes generados
```

## Recomendación

### Kit: KIT_ON_MEDIO — ON GRID monofásico Growatt 3 kW
*(BOM idéntico al Ejemplo 1 — ver tabla KIT_ON_MEDIO en `03_kit_templates.md`)*

### Alternativa ajustada (si se quiere cubrir el 100% con AC)
Opción Growatt 4.2 kW del KIT_ON_MEDIO: 10× panel 549423 + inversor 037005 → 4.100 Wp → ~406 kWh/mes generados → cobertura ~120% con AC.

## Cobertura estimada
- Con AC activo (verano): ~96% — leve déficit cubierto por red
- Sin AC (invierno): ~179% — excedente inyectado o limitado

## Advertencias
- Potencias de equipos son valores típicos de tabla. Si el cliente tiene facturas disponibles, usar kWh reales de factura para mayor precisión.
- El split es la carga dominante (~46% del consumo total con uso). Orientar el uso al horario solar (10:00–16:00) maximiza el ahorro sin batería.
- Sistema on-grid sin respaldo. Departamento con red: si hay cortes frecuentes, evaluar KIT_HYB_BAJO o KIT_HYB_MEDIO.
- Consumo de invierno ~181 kWh/mes: el mismo kit genera ~325 kWh/mes → excedente del 79%. En on-grid con limitador el excedente no se inyecta; en on-grid con inyección el excedente se vuelca a red (ver regulación EPEC Córdoba).

---

### Ejemplo 3 — Consulta ambigua con supuestos declarados

**Consulta del usuario:**
> "Che, necesito un kit solar para el campo. Tenemos heladera, algunas luces, cargadores y un televisor. No hay luz de red."

---

**Respuesta:**

## Consulta interpretada
Sistema **off-grid** — sin red eléctrica, instalación en campo (zona rural, Córdoba supuesto). Consumo a estimar por equipos descritos. No se indicó si hay lavarropas, bomba de agua u otras cargas — se dimensiona con lo declarado y se advierte.

## Perfil asignado
Consumo estimado → **AISLADO_MIN** — cabaña/refugio sin red

### Cálculo de consumo por equipos declarados

| Equipo | Potencia (W) | Horas/día | kWh/mes |
| :--- | :---: | :---: | :---: |
| Heladera familiar | 150 | 24 | 108.0 |
| Iluminación LED (5 puntos) | 50 | 5 | 7.5 |
| Cargadores (celulares, tablets) | 30 | 4 | 3.6 |
| Televisor LED 32" | 60 | 4 | 7.2 |
| **TOTAL** | | | **~126 kWh/mes** |

> Si hay bomba de agua, lavarropas u otras cargas no mencionadas, el consumo real puede ser significativamente mayor. Confirmar con el cliente antes de cerrar el pedido.

## Dimensionamiento
- Consumo estimado: **126 kWh/mes** — **4.2 kWh/día**
- HSP (Córdoba, conservador): **4.4 h** | η: 0.75

```
Wp_objetivo = (126 × 1000) / (4.4 × 0.75 × 30) = 126.000 / 99 = 1.273 Wp
```

- Perfil cae en límite superior de AISLADO_MIN / inferior de PERFIL_01 aislado
- Kit más cercano: **KIT_OFF_MEDIO** (1.640 Wp) con margen de crecimiento del +29%

El margen extra es bienvenido en off-grid: compensa días nublados, invierno y cargas no declaradas.

## Recomendación

### Kit: KIT_OFF_MEDIO — OFF GRID Growatt SPF3000HVM-24

| SKU | Descripción | Cant. |
| :--- | :--- | :---: |
| 549423 | Panel Solar 410Wp Jinko Tiger HalfCells PERC | 4 |
| 038010 | Inversor OffGrid Growatt SPF3000HVM-24 MPPT 24V | 1 |
| 037042 | Módulo OffGrid Dongle WiFi Growatt | 1 |
| 046014 | Batería GEL Ultracell Wega 12V-75Ah | 4 |
| 037002 | Juego de conectores MC4 | 6 |
| 036025 | Cable solar 6mm rojo | 25 |
| 036026 | Cable solar 6mm negro | 25 |
| 576045 | Soporte Mibet coplanar p/2 módulos 30mm | 2 |
| 040014 | Protector descargas ATM CC Tipo II 1000Vcc Suntree | 1 |
| 575956 | Interruptor térmico CC Suntree 550V-40A-2P | 1 |
| 576022 | Seccionador para batería Suntree 12/24V | 1 |
| 040021 | Fusible ANL 100A | 1 |
| 575859 | Portafusible ANL cristal | 1 |
| 575804 | Regulador carga 20A PWM apto litio c/USB | 1 |

**Banco de baterías:** 4× GEL 75Ah @ 12V en configuración 2S2P → banco 24V ~150Ah → ~4.5 kWh útiles (~70% DoD)

**Autonomía estimada:** ~10–12 h @ ~200W nocturnos (heladera + LED + TV)

## Cobertura estimada
~162 kWh/mes generados vs ~126 kWh/mes estimados = **~129% promedio anual**

El margen cubre invierno y días nublados sin red de respaldo.

## Advertencias
- **Consumo sin confirmar:** si hay bomba de agua (750W típico), lavarropas u otras cargas, el consumo real puede superar los 200 kWh/mes y requerir KIT_OFF_ALTO.
- Ubicación asumida como Córdoba. Si el campo está en zona más nublada o latitud más alta, verificar HSP en `04_solar_zones.md`.
- Off-grid: la heladera es la carga más crítica — asegurarse de que el banco de baterías la sostenga toda la noche. Con el banco base (4.5 kWh útiles) hay margen suficiente.
- GEL requiere mantenimiento periódico y tiene menor vida útil que litio. Si el cliente usa el sistema de forma diaria intensiva, evaluar migrar a Growatt Hope (opcional en KIT_OFF_MEDIO).

---

## Template para nuevos ejemplos

Copiar esta estructura al agregar un caso nuevo en producción:

```markdown
### Ejemplo N — [descripción breve del caso]

**Consulta del usuario:**
> "[texto exacto o representativo de la consulta]"

---

**Respuesta:**

## Consulta interpretada
[2–3 líneas resumiendo lo que se entendió y los supuestos aplicados]

## Perfil asignado
**PERFIL_XX** — [nombre] — [kWh/mes]

## Dimensionamiento
- Consumo normalizado: XX kWh/mes
- HSP (ubicación): X.X h
- η sistema: 0.75

[fórmula con valores]

- Wp objetivo: X.XXX Wp
- Kit seleccionado: KIT_XXX — [motivo de selección o % de ajuste]

## Recomendación

### Kit: [ID] — [nombre]
| SKU | Descripción | Cant. |
...

### Alternativa (si aplica)
...

## Cobertura estimada
XX kWh/mes generados vs XX kWh/mes consumidos = XX%

## Advertencias
- [supuestos usados]
- [restricciones técnicas]
- [recomendaciones comerciales al vendedor]
```

---

## Casos prioritarios para agregar en producción

A medida que el sistema se use, agregar ejemplos de estos casos que aparecerán frecuentemente:

| Caso | Por qué es importante |
| :--- | :--- |
| Cliente con factura > 500 kWh/mes quiere híbrido | Muestra cómo manejar batería + selección trifásico |
| Campo off-grid con bomba de agua | Carga inductiva — muestra cálculo de arranque y selección de inversor |
| Cliente quiere cubrir solo el AC | Muestra dimensionamiento parcial al 40–60% |
| Consulta con ubicación fuera de Córdoba | Muestra uso de `04_solar_zones.md` con HSP distinto |
| Cliente con presupuesto limitado | Muestra cómo priorizar kit más pequeño con nota de subdimensionamiento |
| Consumo > 1000 kWh/mes | Muestra el escalado a trifásico y la alerta de análisis detallado |
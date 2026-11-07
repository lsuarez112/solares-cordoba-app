---
file: 05_sizing_rules.md
purpose: Fórmulas, constantes y reglas de cálculo para dimensionamiento fotovoltaico
usage: Consultar en Paso 1 (normalización) y Paso 4 (dimensionamiento) del flujo de 00_system_prompt.md
---

# REGLAS DE DIMENSIONAMIENTO

---

## 1. Constantes del sistema

| Parámetro | Símbolo | Valor por defecto | Notas |
| :--- | :---: | :---: | :--- |
| Eficiencia global del sistema | η | 0.75 | Incluye pérdidas por cableado, inversor, temperatura y suciedad |
| Factor de pérdidas de temperatura | k_temp | 0.90 | Aplicar en zonas con veranos > 35°C sostenidos |
| Factor de sombreado parcial | k_sombra | 0.95 | Aplicar si hay sombra < 2h/día. Sombra > 2h requiere análisis específico |
| Días del mes (estándar) | d | 30 | Usar 30 para todos los cálculos mensuales |
| Tensión de batería estándar | V_bat | 48 V | Sistemas residenciales. Sistemas pequeños off-grid: 24V |
| Profundidad de descarga máxima LiFePO4 | DoD | 0.90 | |
| Profundidad de descarga máxima AGM/GEL | DoD | 0.50 | |
| Eficiencia de carga/descarga batería | η_bat | 0.95 | LiFePO4. AGM/GEL: 0.85 |

> **Nota:** η = 0.75 es el valor conservador estándar para instalaciones residenciales en Argentina. Para instalaciones nuevas con cableado corto y sin sombra se puede usar η = 0.80, declarándolo en la respuesta.

---

## 2. Horas Sol Pico (HSP)

El valor de HSP a usar depende de la ubicación y el ángulo de instalación del panel. Ver valores completos en `04_solar_zones.md`.

| Condición | HSP Córdoba capital | Cuándo usar |
| :--- | :---: | :--- |
| Panel inclinado ~30° (óptimo) | 5.0 h | Instalación en techo inclinado o estructura con ángulo |
| Panel horizontal (0°) | 4.4 h | Losa plana sin estructura inclinada |
| Valor conservador (cualquier caso) | 4.4 h | Cuando no se conoce el ángulo de instalación |

**Regla:** si no se indica el tipo de techo ni el ángulo, usar **4.4 h** y aclararlo como supuesto conservador.

---

## 3. Normalización de consumo

### 3.1 Conversiones básicas

```
kWh/día  → kWh/mes : valor × 30
kWh/mes  → kWh/día : valor / 30
Wh/día   → kWh/mes : valor × 30 / 1000
```

### 3.2 Consumo a partir de lista de equipos

Para cada equipo:
```
Consumo_equipo (Wh/día) = Potencia_W × Horas_uso_día × Factor_uso
Consumo_total (kWh/mes) = Σ(Consumo_equipo) × 30 / 1000
```

**Factor de uso estándar por tipo de equipo:**

| Equipo | Potencia típica (W) | Horas/día estándar | Factor uso |
| :--- | :---: | :---: | :---: |
| Heladera familiar | 150 (promedio ciclo) | 24 | 1.0 |
| Aire acondicionado 3000 frig | 1.050 | 6 | 1.0 |
| Aire acondicionado 5000 frig | 1.750 | 6 | 1.0 |
| Televisor LED 42" | 80 | 5 | 1.0 |
| Computadora de escritorio | 200 | 8 | 1.0 |
| Notebook | 65 | 8 | 1.0 |
| Iluminación LED (hogar completo) | 100 | 6 | 1.0 |
| Lavarropas | 500 | 1 | 1.0 |
| Microondas | 1.200 | 0.25 | 1.0 |
| Bomba de agua 1HP | 750 | 2 | 1.0 |
| Router WiFi | 10 | 24 | 1.0 |

> Si el usuario lista equipos sin potencia, usar los valores típicos de esta tabla y declararlo.

### 3.3 Consumo a partir de factura en pesos

No es posible convertir directamente sin conocer la tarifa vigente. Procedimiento:
1. Solicitar los kWh que figura en la factura (siempre están impresos).
2. Si el usuario solo tiene el importe en pesos, indicar: *"El importe en pesos varía con la tarifa — para dimensionar necesito los kWh consumidos que figuran en la factura."*

---

## 4. Dimensionamiento de paneles

### 4.1 Potencia pico objetivo

```
Wp_objetivo = consumo_kWh_mes / (HSP × η × d / 1000)
```

Forma equivalente (despejada):
```
Wp_objetivo = (consumo_kWh_mes × 1000) / (HSP × η × 30)
```

**Ejemplo:** 400 kWh/mes, HSP 5.0h, η 0.75
```
Wp_objetivo = (400 × 1000) / (5.0 × 0.75 × 30) = 400.000 / 112.5 = 3.556 Wp
```

### 4.2 Generación estimada (verificación)

```
kWh_mes_generados = (Wp_total / 1000) × HSP × η × 30
```

**Ejemplo:** sistema de 3.600 Wp, HSP 5.0h, η 0.75
```
kWh_mes = (3.600 / 1000) × 5.0 × 0.75 × 30 = 3.6 × 112.5 = 405 kWh/mes
```

### 4.3 Número de paneles

```
N_paneles = CEIL(Wp_objetivo / Wp_panel)
```

Siempre redondear hacia arriba (CEIL). Verificar que:
```
N_paneles × Wp_panel ≤ PV_max_inversor
```

Si se supera el PV_max, reducir N_paneles o cambiar a inversor de mayor capacidad.

### 4.4 Cobertura del sistema

```
Cobertura (%) = (kWh_mes_generados / consumo_kWh_mes) × 100
```

Rangos orientativos:
- < 80% → subdimensionado, aclarar en advertencias
- 80–110% → rango óptimo
- > 120% → sobredimensionado, mencionar como margen de crecimiento o ajustar

---

## 5. Dimensionamiento de baterías (HÍBRIDO y OFF_GRID)

### 5.1 Capacidad necesaria

```
C_bat_kWh = (consumo_kWh_día × horas_autonomía / 24) / DoD / η_bat
```

**Ejemplo:** 15 kWh/día, autonomía 8h (noche), LiFePO4 (DoD 0.90, η_bat 0.95)
```
C_bat_kWh = (15 × 8/24) / 0.90 / 0.95 = 5.0 / 0.855 = 5.85 kWh
```

### 5.2 Capacidad en Ah (para selección de batería)

```
C_bat_Ah = (C_bat_kWh × 1000) / V_sistema
```

**Ejemplo:** 5.85 kWh a 48V
```
C_bat_Ah = (5.85 × 1000) / 48 = 121.9 Ah → elegir batería ≥ 150 Ah
```

### 5.3 Número de baterías en paralelo

```
N_baterias = CEIL(C_bat_Ah / C_bateria_unitaria_Ah)
```

> Para sistemas off-grid: calcular autonomía para **cargas críticas** (D2 del cuestionario), no para el consumo total.

---

## 6. Dimensionamiento del inversor

### 6.1 Potencia mínima del inversor

```
P_inversor_min (W) = Potencia_simultanea_cargas × 1.25
```

El factor 1.25 cubre picos de arranque de cargas inductivas (motores, compresores).

**Potencia simultánea:** suma de cargas que pueden estar encendidas al mismo tiempo. En uso residencial estándar, tomar el 60–70% de la potencia total instalada.

### 6.2 Verificación de compatibilidad

Para inversores on-grid e híbridos, verificar siempre:

| Parámetro | Condición |
| :--- | :--- |
| PV_max (Wp) | ≥ Wp_total_paneles |
| P_AC_salida (W) | ≥ P_inversor_min calculada |
| Tensión MPPT mínima | ≤ Voc_panel × N_paneles_serie |
| Tensión MPPT máxima | ≥ Voc_panel × N_paneles_serie |
| Fases | Monofásico / trifásico según instalación |

> Los rangos MPPT de cada inversor están en `products_inverters_ongrid.md` y `products_inverters_hybrid.md`.

---

## 7. Cableado — secciones mínimas orientativas

> Para BOM completo usar los productos de `products_cables.md`. Esta tabla es referencia para verificación rápida.

| Tramo | Corriente típica | Sección mínima |
| :--- | :---: | :---: |
| String DC (panel → inversor, hasta 10m) | ≤ 15A | 4 mm² |
| String DC (panel → inversor, 10–25m) | ≤ 15A | 6 mm² |
| Salida AC inversor → tablero (monofásico) | ≤ 32A | 6 mm² |
| Salida AC inversor → tablero (trifásico) | ≤ 32A | 4 mm² por fase |
| Batería → inversor (48V, ≤ 5kWh) | ≤ 100A | 35 mm² |
| Batería → inversor (48V, > 5kWh) | > 100A | 50 mm² |

---

## 8. Casos especiales

### 8.1 Dimensionamiento parcial (reducción de factura)

Cuando el usuario pide cubrir solo el consumo diurno o mitigar parcialmente:

```
consumo_a_cubrir = consumo_kWh_mes × factor_cobertura
factor_cobertura ∈ [0.40, 0.60]  (40% a 60%)
```

Aplicar luego la fórmula estándar de Wp_objetivo sobre `consumo_a_cubrir`.

### 8.2 Consumo > 1000 kWh/mes

- Marcar **"Análisis detallado requerido"** en la respuesta.
- Verificar si la instalación es trifásica.
- Considerar múltiples inversores en paralelo o inversor trifásico.
- Escalar desde el kit de mayor potencia disponible en `03_kit_templates.md`.

### 8.3 Corrección por temperatura (veranos extremos)

En zonas con temperatura ambiente > 35°C sostenida en verano (norte de Córdoba, Santiago del Estero, Chaco, etc.):

```
Wp_objetivo_corregido = Wp_objetivo / k_temp = Wp_objetivo / 0.90
```

Esto implica aprox. +10% más de paneles para compensar la pérdida de rendimiento por temperatura.

### 8.4 Techo con sombra parcial

- Sombra < 2h/día: aplicar k_sombra = 0.95 sobre η (η_efectivo = 0.75 × 0.95 = 0.71).
- Sombra > 2h/día: **no dimensionar sin análisis de sombreado específico**. Indicar en advertencias.
- Si hay sombra parcial significativa, evaluar estas alternativas:
  - **Optimizadores de módulo** (SolarEdge, Tigo u otros): no están en catálogo activo — consultar disponibilidad con el proveedor antes de cotizar.
  - **Microinversores** disponibles en catálogo (ver `products_inverters_hybrid.md`, sección off-grid): 575968 (1000W/12V), 575969 (2000W/24V), 576170 (500W). Son soluciones off-grid — evaluar si aplican al tipo de sistema.
  - **Alternativa práctica más común:** rediseñar el string para que los paneles sombreados queden en un MPPT separado del inversor, minimizando el impacto sobre el resto del array.

---

## 9. Tabla de referencia rápida — kits típicos por consumo

> Esta tabla es orientativa. Para selección real usar `03_kit_templates.md`.

| Consumo mensual | Wp sistema aproximado | Tipo de kit orientativo |
| :--- | :---: | :--- |
| 150 – 250 kWh/mes | 1.500 – 2.500 Wp | ON_GRID pequeño / HÍBRIDO básico |
| 250 – 400 kWh/mes | 2.500 – 4.000 Wp | ON_GRID estándar / HÍBRIDO residencial |
| 400 – 600 kWh/mes | 4.000 – 6.000 Wp | ON_GRID mediano / HÍBRIDO residencial |
| 600 – 800 kWh/mes | 6.000 – 8.000 Wp | ON_GRID grande / HÍBRIDO ampliado |
| 800 – 1000 kWh/mes | 8.000 – 10.000 Wp | ON_GRID industrial chico / HÍBRIDO grande |
| > 1000 kWh/mes | > 10.000 Wp | Análisis detallado requerido |
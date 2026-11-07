---
file: 02_consumption_profiles.md
type: Perfiles de consumo de referencia
location: Córdoba, Argentina (extrapolable al resto del país)
metrics: kWh/mes, kWh/día, potencia simultánea estimada
usage: Consultar en Paso 3 del flujo. Mapear consulta a id_perfil antes de dimensionar.
---

# PERFILES DE CONSUMO DE REFERENCIA

Cada perfil representa un arquetipo de demanda. El motor debe asignar el perfil más cercano al caso del usuario — o interpolar entre dos perfiles si el consumo cae en el rango intermedio.

---

## Tabla resumen de perfiles

| id_perfil | Nombre | kWh/mes (rango) | kWh/día (ref.) | Potencia simultánea | Conexión | Kits de referencia |
| :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| PERFIL_00 | Mono-ambiente / Oficina chica | 80 – 150 | 3.5 | 800 W | Monofásico | KIT_ON_01, KIT_OFF_01 |
| PERFIL_01 | Depto / Pareja sin AC | 150 – 250 | 6.5 | 1.500 W | Monofásico | KIT_ON_02, KIT_HYB_01 |
| PERFIL_02 | Familia media con 1 AC | 300 – 450 | 12.5 | 3.000 W | Monofásico | KIT_ON_05, KIT_ON_06, KIT_HYB_03 |
| PERFIL_03 | Familia alta demanda | 600 – 800 | 23.0 | 6.000 W | Mono/Trifásico | KIT_ON_07, KIT_ON_08, KIT_HYB_04 |
| PERFIL_04 | Rural / PyME / Industrial | 1.000 – 1.500+ | 40.0+ | 10.000 W+ | Trifásico | KIT_ON_09, KIT_ON_10, KIT_HYB_05 |

---

## Detalle por perfil

### PERFIL_00 — Mono-ambiente / Oficina chica
**Consumo:** 80–150 kWh/mes | **Referencia:** 3.5 kWh/día | **Potencia simultánea:** ~800 W

Equipamiento típico:
| Equipo | Potencia (W) | Horas/día | kWh/mes |
| :--- | :---: | :---: | :---: |
| Heladera pequeña o bar | 80 | 24 | 57.6 |
| Iluminación LED | 60 | 5 | 9.0 |
| Notebook × 1 | 65 | 6 | 11.7 |
| TV LED 32" | 60 | 4 | 7.2 |
| Router WiFi | 10 | 24 | 7.2 |
| Varios (cargadores, stand-by) | 30 | 8 | 7.2 |
| **TOTAL** | | | **~100 kWh/mes** |

**Notas:**
- Sin aire acondicionado. Sin lavarropas.
- Perfil típico de mono-ambiente alquilado en Córdoba o pequeña oficina.
- En verano puede subir a 150 kWh/mes si se agrega ventilador o split pequeño (uso moderado).
- Advertir bajo retorno económico en sistema on-grid para este perfil — evaluar payback con el cliente.

---

### PERFIL_01 — Depto / Pareja sin AC
**Consumo:** 150–250 kWh/mes | **Referencia:** 6.5 kWh/día | **Potencia simultánea:** ~1.500 W

Equipamiento típico:
| Equipo | Potencia (W) | Horas/día | kWh/mes |
| :--- | :---: | :---: | :---: |
| Heladera familiar (clase A+) | 130 | 24 | 93.6 |
| Iluminación LED hogar | 100 | 5 | 15.0 |
| Notebook × 2 | 65 | 7 | 27.3 |
| TV LED 42" | 80 | 4 | 9.6 |
| Lavarropas | 500 | 1 | 15.0 |
| Microondas | 1.200 | 0.25 | 9.0 |
| Router WiFi | 10 | 24 | 7.2 |
| Varios (cargadores, stand-by) | 50 | 6 | 9.0 |
| **TOTAL** | | | **~186 kWh/mes** |

**Notas:**
- Sin aire acondicionado. Consumo relativamente estable durante el año.
- Picos eventuales en verano por uso de ventiladores: +20–30 kWh/mes.
- Conexión monofásica estándar.
- Perfil compatible con sistema on-grid pequeño (2–3 kWp) con buen retorno económico.

---

### PERFIL_02 — Familia media con 1 AC
**Consumo:** 300–450 kWh/mes | **Referencia:** 12.5 kWh/día | **Potencia simultánea:** ~3.000 W

Equipamiento típico:
| Equipo | Potencia (W) | Horas/día | kWh/mes |
| :--- | :---: | :---: | :---: |
| Heladera familiar | 150 | 24 | 108.0 |
| Aire acondicionado 3.000 frig (1 unidad) | 1.050 | 6 | 189.0 |
| Iluminación LED hogar | 100 | 5 | 15.0 |
| TV LED 50" | 100 | 5 | 15.0 |
| Lavarropas | 500 | 1.5 | 22.5 |
| Microondas | 1.200 | 0.25 | 9.0 |
| Computadora de escritorio | 200 | 4 | 24.0 |
| Router WiFi | 10 | 24 | 7.2 |
| Varios | 80 | 4 | 9.6 |
| **TOTAL** | | | **~399 kWh/mes** |

**Notas:**
- Consumo con fuerte estacionalidad: verano (con AC) puede superar 450 kWh/mes; invierno puede bajar a 200–250 kWh/mes.
- El AC representa ~47% del consumo total en meses de uso.
- Si el cliente quiere dimensionar para cubrir el AC, dimensionar solo esa carga con cobertura parcial.
- Perfil más frecuente en Córdoba capital. Buen candidato para KIT_ON_05 o KIT_ON_06.

---

### PERFIL_03 — Familia alta demanda
**Consumo:** 600–800 kWh/mes | **Referencia:** 23.0 kWh/día | **Potencia simultánea:** ~6.000 W

Equipamiento típico:
| Equipo | Potencia (W) | Horas/día | kWh/mes |
| :--- | :---: | :---: | :---: |
| Heladera familiar + freezer | 280 | 24 | 201.6 |
| Aire acondicionado 5.000 frig × 2 | 3.500 | 7 | 735.0 |
| Iluminación LED hogar amplio | 150 | 5 | 22.5 |
| TV LED × 2 | 180 | 5 | 27.0 |
| Lavarropas + secarropas | 2.000 | 1 | 60.0 |
| Termotanque eléctrico | 1.500 | 2 | 90.0 |
| Bomba de pileta | 750 | 3 | 67.5 |
| Computadoras × 2 | 400 | 6 | 72.0 |
| Varios | 200 | 4 | 24.0 |
| **TOTAL** | | | **~770 kWh/mes** |

**Notas:**
- Consumo estacional muy marcado. En invierno sin uso de AC puede bajar a 300–350 kWh/mes.
- El termotanque eléctrico es reemplazable por termotanque solar — si el cliente lo tiene o lo considera, recalcular sin esa carga.
- Pileta y termotanque son cargas diferibles — buen candidato para gestión de carga diurna.
- Evaluar trifásico si la potencia simultánea supera los 6.000 W de forma sostenida.
- Para cobertura total anual considerar sistema 6–8 kWp; para cobertura solo verano, 8–10 kWp.

---

### PERFIL_04 — Rural / PyME / Industrial
**Consumo:** 1.000–1.500+ kWh/mes | **Referencia:** 40+ kWh/día | **Potencia simultánea:** 10.000+ W

Equipamiento típico (referencial — varía mucho por actividad):
| Equipo | Potencia (W) | Horas/día | kWh/mes |
| :--- | :---: | :---: | :---: |
| Cámara de frío / frío industrial | 3.000 | 12 | 1.080 |
| Motores / herramientas trifásicas | 5.000 | 4 | 600 |
| Bomba de agua / riego | 1.500 | 4 | 180 |
| Iluminación industrial LED | 500 | 8 | 120 |
| Oficina + varios | 500 | 8 | 120 |
| **TOTAL** | | | **~2.100 kWh/mes (caso alto)** |

**Notas:**
- **Marcar siempre como "Análisis detallado requerido".**
- Conexión trifásica casi siempre necesaria.
- Evaluar si hay cargas con arranque suave o variadores de frecuencia — impactan en la selección del inversor.
- Para campo sin red: off-grid con generador de respaldo es frecuente en esta categoría.
- Los kits de referencia son puntos de partida; el dimensionamiento final requiere relevamiento presencial o datos de factura de varios meses.

---

## Palabras clave en consultas → perfil

| Frases detectadas | Perfil asignado |
| :--- | :--- |
| "mono-ambiente", "monoambiente", "oficina chica", "local pequeño", "poco consumo", "bajo consumo" | PERFIL_00 |
| "depto", "departamento", "pareja", "sin AC", "sin aire", "2 ambientes", "familia chica" | PERFIL_01 |
| "familia", "casa", "un aire", "1 AC", "hogar estándar", "3 ambientes", "4 ambientes" | PERFIL_02 |
| "varios aires", "pileta", "termotanque eléctrico", "alto consumo", "casa grande", "5 ambientes" | PERFIL_03 |
| "taller", "campo", "finca", "PyME", "comercio", "trifásico", "industrial", "bomba grande", "frío industrial" | PERFIL_04 |

---

## Reglas de interpolación

Si el consumo cae entre dos perfiles:

```
peso_perfil_inferior = (consumo_max_inferior - consumo_usuario) / (consumo_max_inferior - consumo_min_superior)
peso_perfil_superior = 1 - peso_perfil_inferior
```

**Ejemplo:** consumo 270 kWh/mes → entre PERFIL_01 (150–250) y PERFIL_02 (300–450)
- Declarar: "consumo interpolado entre PERFIL_01 y PERFIL_02"
- Usar kits de referencia de PERFIL_02 con nota de sobredimensionamiento moderado
- Wp_objetivo calculado directamente con la fórmula de `05_sizing_rules.md` — la interpolación es solo para contexto, el cálculo preciso se hace con el consumo real

---

## Casos borde

| Situación | Acción |
| :--- | :--- |
| Consumo < 80 kWh/mes | Confirmar si es consumo parcial (solo iluminación, solo oficina). Advertir bajo retorno económico en on-grid. |
| Consumo > 1.000 kWh/mes | PERFIL_04 — marcar "Análisis detallado requerido". Escalar desde KIT_ON_09. |
| Sin red eléctrica (cualquier perfil) | Solo kits `KIT_OFF_*`. Dimensionar por autonomía requerida según `05_sizing_rules.md`. |
| Consumo muy estacional (solo verano) | Dimensionar para consumo de verano. Indicar excedente estimado en invierno. |
| Solo quiere cubrir AC | Calcular consumo del AC por separado. Dimensionar al 40–60% del total. |
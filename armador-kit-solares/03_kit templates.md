---
file: 03_kit_templates.md
version: 1.0
purpose: Kits modelo para matching y extrapolación de dimensionamiento fotovoltaico
marca_prioritaria: GROWATT (inversores, baterías Hope, dongles, limitadores)
hsp_referencia: 4.4 h/día (valor conservador — panel horizontal o ángulo desconocido; ver 04_solar_zones.md para valores óptimos)
eficiencia_sistema: 0.75
formula_generacion: gen_kWh_mes = (Wp_total / 1000) × 4.4 × 0.75 × 30 ≈ Wp_total × 0.099
---

# CATÁLOGO DE KITS FOTOVOLTAICOS

## Índice rápido

| Necesidad | Bajo consumo | Medio consumo | Alto consumo |
| :--- | :--- | :--- | :--- |
| Red eléctrica, sin batería | [KIT_ON_BAJO](#kit_on_bajo) — 150–200 kWh/mes | [KIT_ON_MEDIO](#kit_on_medio) — 250–350 kWh/mes | [KIT_ON_ALTO](#kit_on_alto) — 450–600 kWh/mes |
| Red + respaldo ante cortes | [KIT_HYB_BAJO](#kit_hyb_bajo) — 150–250 kWh/mes | [KIT_HYB_MEDIO](#kit_hyb_medio) — 300–500 kWh/mes | [KIT_HYB_ALTO](#kit_hyb_alto) — 700–1000 kWh/mes |
| Sin red eléctrica | [KIT_OFF_BAJO](#kit_off_bajo) — 30–80 kWh/mes | [KIT_OFF_MEDIO](#kit_off_medio) — 120–200 kWh/mes | [KIT_OFF_ALTO](#kit_off_alto) — 250–400 kWh/mes |

---

## Tabla de compatibilidad baterías ↔ inversores

| Batería | SKU | Capacidad | Tensión | Compatible con |
| :--- | :--- | :---: | :---: | :--- |
| Pylontech UP5000 | 046040 | 4.8 kWh | 48V | SPH3000, SPH5000 (Growatt híbrido mono) |
| Growatt Hope 5.5 | 575917 | 5.5 kWh | 51.2V | SPH3000, SPH5000, SPH10000, SPF3000HVM, SPF6000ES |
| GEL Ultracell 75Ah | 046014 | ~0.9 kWh | 12V | SPF3000HVM-24 (banco 24V en serie) |
| GEL Ritar 55Ah | 037029 | ~0.66 kWh | 12V | SPF3000HVM-24 (banco 24V en serie) |

> Máx. baterías Hope en paralelo: 12 unidades. Siempre verificar firmware de inversor antes de ampliar banco.

---

## Notas generales del catálogo

- **BOM (Lista de Materiales) base** = instalación completa típica lista para instalar.
- **Opcionales** = ampliaciones o alternativas que el instalador puede proponer al cliente.
- Cantidades de cable, MC4 y soportes son de referencia; el instalador ajusta según distancia techo–inversor y diseño de strings.
- Los kits ON_GRID no tienen respaldo ante corte de red por diseño — aclararlo siempre al cliente.
- Para consumo > 1.000 kWh/mes: marcar "Análisis detallado requerido" y escalar desde KIT_HYB_ALTO o diseño trifásico a medida.

---

## ON GRID — Sin batería, red eléctrica disponible

---

### KIT_ON_BAJO

**Nombre:** Entrada residencial monofásico Growatt
**Perfil:** PERFIL_01 — Depto / pareja sin AC
**Sistema:** ON_GRID | Sin batería | Monofásico | Con red

| Parámetro | Valor |
| :--- | :--- |
| Wp total | 1.380 Wp (3 × 460 Wp) |
| Generación estimada | ~137 kWh/mes — ~4.6 kWh/día |
| Consumo de referencia | 150–200 kWh/mes |
| Cobertura orientativa | ~50–65% del consumo diurno |

Ideal cuando la factura ronda 150–180 kWh/mes. Por encima de 200 kWh/mes estables, evaluar KIT_ON_MEDIO. El AC no está incluido en el perfil — si el cliente lo agrega en verano, el kit queda subdimensionado.

#### BOM (Lista de Materiales) base

| Cant. | SKU | Descripción | Categoría |
| :---: | :--- | :--- | :--- |
| 3 | 037046 | Panel Solar Fotovoltaico Jinko Mono N Type Tiger Neo Monofacial 460Wp | PANEL |
| 1 | 036076 | Inversor OnGrid Growatt 1500 TL-X MIC | INVERSOR |
| 1 | 037030 | Módulo Dongle WiFi-F Growatt OnGrid | INVERSOR |
| 1 | 037026 | Limitador de inyección Growatt Mono Eastron Modbus RS485 | LIMITADOR |
| 4 | 037002 | Juego de conectores MC4 | CONECTOR |
| 15 | 036025 | Cable solar 6mm rojo | CABLE SOLAR |
| 15 | 036026 | Cable solar 6mm negro | CABLE SOLAR |
| 2 | 576045 | Soporte Mibet coplanar p/2 módulos fotov. 30mm | SOPORTE |
| 1 | 040014 | Protector descargas ATM CC Tipo II 1000Vcc Suntree Imax 40kA | PROTECCION |
| 1 | 575956 | Interruptor térmico CC Suntree 550V-40A-2P | INTERRUPTOR |
| 1 | 040021 | Fusible ANL 100A | FUSIBLE |
| 1 | 575859 | Portafusible ANL cristal | FUSIBLE |
| 1 | 576085 | Disyuntor tetrapolar AC 40A-300mA p/inversores OnGrid | DISYUNTOR |

#### Opcionales — Ampliación de generación

| Opción | Cambio en BOM (Lista de Materiales) | Wp total | Gen. estimada |
| :--- | :--- | :---: | :--- |
| Growatt 2000W ampliado | Reemplazar 036076 → 576009 + agregar 1× 037046 | 1.840 Wp | ~182 kWh/mes |
| Alternativa Deye 2kW | 6× 575901 + inversor 576178 (WiFi+CT incluidos, sin 037030) | 2.460 Wp | ~244 kWh/mes |

#### Opcionales — Extras

| Cant. | SKU | Descripción |
| :---: | :--- | :--- |
| 1 | 039016 | Módulo Dongle WiFi Nueva Línea X (si reemplaza línea X) |
| 1 | 576047 | Kit acople riel Mibet 100mm |
| 1 | 037010 | Juego conector MC4 1A2 M/H (ramas adicionales) |

---

### KIT_ON_MEDIO

**Nombre:** Residencial 3.3 kW monofásico Growatt
**Perfil:** PERFIL_02 — Familia media con 1 AC
**Sistema:** ON_GRID | Sin batería | Monofásico | Con red

| Parámetro | Valor |
| :--- | :--- |
| Wp total | 3.280 Wp (8 × 410 Wp) |
| Generación estimada | ~325 kWh/mes — ~10.8 kWh/día |
| Consumo de referencia | 250–350 kWh/mes |
| Cobertura orientativa | ~60–80% anual según hábitos diurnos |

Hogar con lavarropas y 1 AC en verano. El AC en horario solar es el mejor caso de uso para este kit. Si la factura supera 350 kWh/mes de forma estable, evaluar KIT_ON_ALTO.

#### BOM (Lista de Materiales) base

| Cant. | SKU | Descripción | Categoría |
| :---: | :--- | :--- | :--- |
| 8 | 549423 | Panel Solar 410Wp Jinko Tiger HalfCells PERC | PANEL |
| 1 | 576044 | Inversor OnGrid Mono Growatt MIC-3000TL-X2 3000W, 1MPPT, PVMax 4500W/550V | INVERSOR |
| 1 | 037030 | Módulo Dongle WiFi-F Growatt OnGrid | INVERSOR |
| 1 | 037026 | Limitador de inyección Growatt Mono Eastron Modbus RS485 | LIMITADOR |
| 10 | 037002 | Juego de conectores MC4 | CONECTOR |
| 30 | 036025 | Cable solar 6mm rojo | CABLE SOLAR |
| 30 | 036026 | Cable solar 6mm negro | CABLE SOLAR |
| 4 | 576045 | Soporte Mibet coplanar p/2 módulos fotov. 30mm | SOPORTE |
| 1 | 040014 | Protector descargas ATM CC Tipo II 1000Vcc Suntree Imax 40kA | PROTECCION |
| 1 | 576056 | Interruptor térmico CC 550V-63A-2P | INTERRUPTOR |
| 1 | 040020 | Fusible ANL 150A | FUSIBLE |
| 1 | 575859 | Portafusible ANL cristal | FUSIBLE |
| 1 | 576085 | Disyuntor tetrapolar AC 40A-300mA p/inversores OnGrid | DISYUNTOR |

#### Opcionales — Ampliación de generación

| Opción | Cambio en BOM (Lista de Materiales) | Wp total | Gen. estimada |
| :--- | :--- | :---: | :--- |
| Growatt 4.2 kW | 10× 549423 + inversor 037005 | 4.100 Wp | ~406 kWh/mes |
| Alternativa Deye 2kW | 6× 575837 + inversor 576178 | 2.760 Wp | ~273 kWh/mes |

#### Opcionales — Extras

| Cant. | SKU | Descripción |
| :---: | :--- | :--- |
| 2 | 037023 | Juego conector MC4 Branch 4A1 |
| 1 | 576047 | Kit acople riel Mibet 100mm |
| 1 | 575768 | Soporte Wega triangular techo plano p/2 módulos 30mm (si techo plano) |

---

### KIT_ON_ALTO

**Nombre:** Hogar alta demanda 6 kW monofásico Growatt
**Perfil:** PERFIL_03 — Familia alta demanda
**Sistema:** ON_GRID | Sin batería | Monofásico | Con red

| Parámetro | Valor |
| :--- | :--- |
| Wp total | 5.740 Wp (14 × 410 Wp) |
| Generación estimada | ~568 kWh/mes — ~18.9 kWh/día |
| Consumo de referencia | 450–600 kWh/mes (hasta 800 en verano extremo) |
| Cobertura orientativa | ~70–80% en verano con uso diurno |

Múltiples AC y termotanque elevan la potencia simultánea. Orientar el termotanque y AC a horario solar maximiza el ahorro. Sin batería no hay respaldo ante corte de red — aclararlo al cliente. Por encima de 700 kWh/mes sostenidos evaluar trifásico.

#### BOM (Lista de Materiales) base

| Cant. | SKU | Descripción | Categoría |
| :---: | :--- | :--- | :--- |
| 14 | 549423 | Panel Solar 410Wp Jinko Tiger HalfCells PERC | PANEL |
| 1 | 039014 | Inversor OnGrid Mono Growatt MIN-6000TL-X2 6000W, 2MPPT, PVMax 9000W/550V | INVERSOR |
| 1 | 039016 | Módulo Dongle WiFi Nueva Línea X | INVERSOR |
| 1 | 037026 | Limitador de inyección Growatt Mono Eastron Modbus RS485 | LIMITADOR |
| 16 | 037002 | Juego de conectores MC4 | CONECTOR |
| 2 | 037023 | Juego conector MC4 Branch 4A1 | CONECTOR |
| 50 | 036025 | Cable solar 6mm rojo | CABLE SOLAR |
| 50 | 036026 | Cable solar 6mm negro | CABLE SOLAR |
| 7 | 576045 | Soporte Mibet coplanar p/2 módulos fotov. 30mm | SOPORTE |
| 2 | 040014 | Protector descargas ATM CC Tipo II 1000Vcc Suntree Imax 40kA | PROTECCION |
| 1 | 576159 | Interruptor térmico CC 1000V-20A-4P (dos bajadas) | INTERRUPTOR |
| 1 | 040020 | Fusible ANL 150A | FUSIBLE |
| 1 | 575859 | Portafusible ANL cristal | FUSIBLE |
| 1 | 576131 | Disyuntor tetrapolar Chint 63A-CA-30mA | DISYUNTOR |

#### Opcionales — Ampliación de generación

| Opción | Cambio en BOM (Lista de Materiales) | Wp total | Gen. estimada |
| :--- | :--- | :---: | :--- |
| +2 paneles Growatt | 16× 046005 595Wp + mismo inversor | 7.140 Wp | ~707 kWh/mes |
| Trifásico Growatt | 18× 576043 + inversor 575973 | 10.530 Wp | ~1.042 kWh/mes — PERFIL_04 |

#### Opcionales — Extras

| Cant. | SKU | Descripción |
| :---: | :--- | :--- |
| 1 | 576068 | Soporte triangular patas telescópicas regulables 40°–20° Mibet p/2 módulos 30mm |
| 1 | 576047 | Kit acople riel Mibet 100mm |

---

## HÍBRIDO — Red eléctrica + batería, respaldo ante cortes

---

### KIT_HYB_BAJO

**Nombre:** Respaldo Growatt SPH 3kW + Pylontech
**Perfil:** PERFIL_01 — Depto / pareja con respaldo ante cortes
**Sistema:** HÍBRIDO | Con batería | Monofásico | Con red

| Parámetro | Valor |
| :--- | :--- |
| Wp total | 1.640 Wp (4 × 410 Wp) |
| Generación estimada | ~162 kWh/mes — ~5.4 kWh/día |
| Consumo de referencia | 150–250 kWh/mes |
| Batería base | 1× Pylontech UP5000 — 4.8 kWh |
| Autonomía orientativa | 4–5 h @ ~500 W críticos (heladera + LED + router) |

Mismo hogar que KIT_ON_BAJO pero con respaldo para cortes. La FV mitiga consumo diurno e inyecta excedente si hay limitador. En corte de red la batería alimenta cargas priorizadas. No usar AC ni termotanque en modo corte con este banco base.

#### BOM (Lista de Materiales) base

| Cant. | SKU | Descripción | Categoría |
| :---: | :--- | :--- | :--- |
| 4 | 549423 | Panel Solar 410Wp Jinko Tiger HalfCells PERC | PANEL |
| 1 | 038017 | Inversor Híbrido Mono Growatt SPH3000 | INVERSOR |
| 1 | 037030 | Módulo Dongle WiFi-F Growatt OnGrid | INVERSOR |
| 1 | 037026 | Limitador de inyección Growatt Mono Eastron Modbus RS485 | LIMITADOR |
| 1 | 046040 | Batería litio Pylontech UP5000 48V-4.8kWh — compatible SPH Growatt | BATERIA |
| 1 | 046038 | Kit bracket batería Pylontech US2000 | BATERIA |
| 6 | 037002 | Juego de conectores MC4 | CONECTOR |
| 20 | 036025 | Cable solar 6mm rojo | CABLE SOLAR |
| 20 | 036026 | Cable solar 6mm negro | CABLE SOLAR |
| 2 | 576045 | Soporte Mibet coplanar p/2 módulos fotov. 30mm | SOPORTE |
| 1 | 040014 | Protector descargas ATM CC Tipo II 1000Vcc Suntree Imax 40kA | PROTECCION |
| 1 | 575821 | Protector descargas ATM AC Suntree SUP2-30kVA-275V | PROTECCION |
| 1 | 575956 | Interruptor térmico CC Suntree 550V-40A-2P | INTERRUPTOR |
| 1 | 576023 | Seccionador para batería Suntree 48V | INTERRUPTOR |
| 1 | 040021 | Fusible ANL 100A | FUSIBLE |
| 1 | 575859 | Portafusible ANL cristal | FUSIBLE |
| 1 | 576085 | Disyuntor tetrapolar AC 40A-300mA p/inversores OnGrid | DISYUNTOR |

#### Opcionales — Autonomía ampliada

| Configuración | BOM (Lista de Materiales) adicional | Energía total | Autonomía @ 500W |
| :--- | :--- | :---: | :--- |
| Base (1× Pylontech) | incluido | 4.8 kWh | 4–5 h |
| 2× Pylontech | +1× 046040 + 1× 046038 | 9.6 kWh | 8–10 h |
| 3× Pylontech | +2× 046040 + 2× 046038 | 14.4 kWh | 12–14 h |
| 1× Hope (alternativa) | 575917 + 575928 (reemplaza Pylontech) | 5.5 kWh | 5–6 h |
| 2× Hope | 2× 575917 + 2× 575928 | 11 kWh | 10–12 h |

#### Opcionales — Inversor / Generación

| Opción | Cambio en BOM (Lista de Materiales) | Wp total | Gen. estimada |
| :--- | :--- | :---: | :--- |
| Growatt SPH 3.6kW | 6× 549423 + inversor 038018 | 2.460 Wp | ~244 kWh/mes |
| Alternativa Deye 3.6kW | 6× 549423 + inversor 575849 + batería 575988 5.12kWh | 2.460 Wp | ~244 kWh/mes |

#### Opcionales — Extras

| Cant. | SKU | Descripción |
| :---: | :--- | :--- |
| 1 | 040038 | Victron conector baterías litio Pylontech VE.Can to CAN-bus BMS type A 1.8m |
| 1 | 576108 | Conector puente baterías 25mm c/terminal ojal armado |

---

### KIT_HYB_MEDIO

**Nombre:** Hogar estándar Growatt SPH 5kW + Hope 5.5
**Perfil:** PERFIL_02 — Familia media con respaldo
**Sistema:** HÍBRIDO | Con batería | Monofásico | Con red

| Parámetro | Valor |
| :--- | :--- |
| Wp total | 3.280 Wp (8 × 410 Wp) |
| Generación estimada | ~325 kWh/mes — ~10.8 kWh/día |
| Consumo de referencia | 300–500 kWh/mes |
| Batería base | 1× Growatt Hope 5.5 — 5.5 kWh |
| Autonomía orientativa | 5–6 h @ ~800 W | 10–12 h @ ~500 W críticos |

Equivalente en paneles al KIT_ON_MEDIO más batería Hope para cortes y autoconsumo nocturno parcial. En corte: heladera + luces + presurizadora. El AC solo en corte con banco ampliado (2× Hope mínimo).

#### BOM (Lista de Materiales) base

| Cant. | SKU | Descripción | Categoría |
| :---: | :--- | :--- | :--- |
| 8 | 549423 | Panel Solar 410Wp Jinko Tiger HalfCells PERC | PANEL |
| 1 | 038019 | Inversor Híbrido Mono Growatt SPH5000 | INVERSOR |
| 1 | 037030 | Módulo Dongle WiFi-F Growatt OnGrid | INVERSOR |
| 1 | 037026 | Limitador de inyección Growatt Mono Eastron Modbus RS485 | LIMITADOR |
| 1 | 575917 | Batería litio Growatt Hope 5.5kW 51.2V 106Ah 6000 ciclos | BATERIA |
| 1 | 575928 | Kit accesorios Growatt Hope 5.5 | BATERIA |
| 10 | 037002 | Juego de conectores MC4 | CONECTOR |
| 30 | 036025 | Cable solar 6mm rojo | CABLE SOLAR |
| 30 | 036026 | Cable solar 6mm negro | CABLE SOLAR |
| 4 | 576045 | Soporte Mibet coplanar p/2 módulos fotov. 30mm | SOPORTE |
| 1 | 040014 | Protector descargas ATM CC Tipo II 1000Vcc Suntree Imax 40kA | PROTECCION |
| 1 | 575821 | Protector descargas ATM AC Suntree SUP2-30kVA-275V | PROTECCION |
| 1 | 576056 | Interruptor térmico CC 550V-63A-2P | INTERRUPTOR |
| 1 | 576023 | Seccionador para batería Suntree 48V | INTERRUPTOR |
| 1 | 040020 | Fusible ANL 150A | FUSIBLE |
| 1 | 575859 | Portafusible ANL cristal | FUSIBLE |
| 1 | 576085 | Disyuntor tetrapolar AC 40A-300mA p/inversores OnGrid | DISYUNTOR |

#### Opcionales — Autonomía ampliada

| Configuración | BOM (Lista de Materiales) adicional | Energía total | Autonomía @ 800W |
| :--- | :--- | :---: | :--- |
| Base (1× Hope) | incluido | 5.5 kWh | 5–6 h |
| 2× Hope | +1× 575917 + 1× 575928 | 11 kWh | 10–12 h |
| 3× Hope | +2× 575917 + 2× 575928 | 16.5 kWh | 15–18 h |
| 1× Pylontech (alternativa) | 046040 + 046038 (reemplaza Hope) | 4.8 kWh | 4–5 h |
| 2× Pylontech | 2× 046040 + 2× 046038 | 9.6 kWh | 8–10 h |

#### Opcionales — Inversor / Generación

| Opción | Cambio en BOM (Lista de Materiales) | Wp total | Gen. estimada |
| :--- | :--- | :---: | :--- |
| SPH 3kW más económico | 4× 549423 + inversor 038017 | 1.640 Wp | ~162 kWh/mes |
| Alternativa Deye 5kW | 10× 549423 + inversor 575842 + batería 576094 5.12kWh | 4.100 Wp | ~406 kWh/mes |

#### Opcionales — Extras

| Cant. | SKU | Descripción |
| :---: | :--- | :--- |
| 1 | 575845 | Kit set cables batería litio Growatt AXE 5.12L |
| 1 | 575846 | Kit base batería litio Growatt AXE |
| 1 | 576108 | Conector puente baterías 25mm c/terminal ojal armado |

---

### KIT_HYB_ALTO

**Nombre:** Trifásico Growatt SPH 10kW + 2× Hope 5.5
**Perfil:** PERFIL_03 / PERFIL_04 — Alta demanda / comercio trifásico
**Sistema:** HÍBRIDO | Con batería | Trifásico | Con red

| Parámetro | Valor |
| :--- | :--- |
| Wp total | 9.520 Wp (16 × 595 Wp) |
| Generación estimada | ~943 kWh/mes — ~31.4 kWh/día |
| Consumo de referencia | 700–1.000 kWh/mes |
| Batería base | 2× Growatt Hope 5.5 — 11 kWh |
| Autonomía orientativa | 6–7 h @ ~1.5 kW | 12 h @ ~900 W críticos |

Gran planta FV para autoconsumo e inyección en instalación trifásica. La batería cubre un subconjunto de circuitos críticos en corte — no esperar 3 AC simultáneos en modo off-grid. Para consumo > 1.000 kWh/mes marcar "Análisis detallado requerido".

#### BOM (Lista de Materiales) base

| Cant. | SKU | Descripción | Categoría |
| :---: | :--- | :--- | :--- |
| 16 | 046005 | Panel Solar Jinko Mono HalfCells TopCon Anti-PID 595Wp | PANEL |
| 1 | 038020 | Inversor Híbrido Trifásico Growatt SPH10000 | INVERSOR |
| 1 | 039016 | Módulo Dongle WiFi Nueva Línea X | INVERSOR |
| 1 | 038006 | Limitador de inyección Growatt Trifásico TPM | LIMITADOR |
| 1 | 576086 | Limitador inyección Growatt TPM-CT-E 600A trifásico | LIMITADOR |
| 2 | 575917 | Batería litio Growatt Hope 5.5kW 51.2V 106Ah 6000 ciclos | BATERIA |
| 2 | 575928 | Kit accesorios Growatt Hope 5.5 | BATERIA |
| 18 | 037002 | Juego de conectores MC4 | CONECTOR |
| 2 | 037023 | Juego conector MC4 Branch 4A1 | CONECTOR |
| 60 | 036025 | Cable solar 6mm rojo | CABLE SOLAR |
| 60 | 036026 | Cable solar 6mm negro | CABLE SOLAR |
| 8 | 576045 | Soporte Mibet coplanar p/2 módulos fotov. 30mm | SOPORTE |
| 2 | 040014 | Protector descargas ATM CC Tipo II 1000Vcc Suntree Imax 40kA | PROTECCION |
| 1 | 575800 | Protector descargas ATM AC 420V 3P+N 40kA tetrapolar | PROTECCION |
| 1 | 576159 | Interruptor térmico CC 1000V-20A-4P (dos bajadas) | INTERRUPTOR |
| 1 | 576023 | Seccionador para batería Suntree 48V | INTERRUPTOR |
| 1 | 040020 | Fusible ANL 150A | FUSIBLE |
| 1 | 575859 | Portafusible ANL cristal | FUSIBLE |
| 1 | 576131 | Disyuntor tetrapolar Chint 63A-CA-30mA | DISYUNTOR |

#### Opcionales — Autonomía ampliada

| Configuración | BOM (Lista de Materiales) adicional | Energía total | Autonomía @ 1.5kW |
| :--- | :--- | :---: | :--- |
| Base (2× Hope) | incluido | 11 kWh | 6–7 h |
| 3× Hope | +1× 575917 + 1× 575928 | 16.5 kWh | 10–12 h |
| 4× Hope | +2× 575917 + 2× 575928 | 22 kWh | 18–20 h |
| Torre Growatt ARK | 575978 ARK 2.5H-A1 + 575979 BMS + 575982 Base | consultar | Verificar compat. SPH10 trifásico |

#### Opcionales — Inversor / Generación

| Opción | Cambio en BOM (Lista de Materiales) | Wp total | Gen. estimada |
| :--- | :--- | :---: | :--- |
| Monofásico Growatt SPH5kW | 10× 549423 + inversor 038019 | 4.100 Wp | ~406 kWh/mes — PERFIL_02–03 |
| Alternativa Deye trifásico | 16× 046005 + inversor 575989 Deye 20kW híbrido tri. + banco a medida | 9.520 Wp | ~943 kWh/mes |

#### Opcionales — Extras

| Cant. | SKU | Descripción |
| :---: | :--- | :--- |
| 2 | 576108 | Conector puente baterías 25mm c/terminal ojal armado |
| 1 | 576068 | Soporte triangular patas telescópicas regulables 40°–20° Mibet p/2 módulos 30mm |

---

## OFF GRID — Sin conexión a red eléctrica

---

### KIT_OFF_BAJO

**Nombre:** Cabaña / refugio aislado Growatt SPF 24V
**Perfil:** AISLADO_MIN — Cabaña / refugio sin red
**Sistema:** OFF_GRID | Con batería | 24V | Sin red

| Parámetro | Valor |
| :--- | :--- |
| Wp total | 450 Wp (3 × 150 Wp) |
| Generación estimada | ~45 kWh/mes — ~1.5 kWh/día |
| Consumo de referencia | 30–80 kWh/mes — 1.0–2.7 kWh/día |
| Batería base | 4× Ritar 55Ah @ 24V (2S2P) — ~2.6 kWh útiles (~50% DoD) |
| Autonomía orientativa | 4–6 h @ ~200W | 2–3 h @ ~400W |

Sin red, todo el consumo sale de FV + batería. Días nublados: reducir uso o aceptar déficit. Equipamiento típico: heladera chica o conservadora, LED, cargadores. Sin lavarropas, sin AC. Uso intensivo de fin de semana puede vaciar el banco en una noche — ampliar con opcionales.

> **Nota banco 24V:** conectar 2 baterías en serie para obtener 24V y luego 2 ramas en paralelo. Verificar configuración con el instalador.

#### BOM (Lista de Materiales) base

| Cant. | SKU | Descripción | Categoría |
| :---: | :--- | :--- | :--- |
| 3 | 519961 | Panel Solar 150Wp | PANEL |
| 1 | 038010 | Inversor OffGrid Growatt SPF3000HVM-24 MPPT 24V | INVERSOR |
| 1 | 037042 | Módulo OffGrid Dongle WiFi Growatt | INVERSOR |
| 4 | 037029 | Batería Ritar DC Wega 12V-55Ah | BATERIA |
| 4 | 037002 | Juego de conectores MC4 | CONECTOR |
| 10 | 037036 | Cable solar 4mm rojo EN50618 | CABLE SOLAR |
| 10 | 037037 | Cable solar 4mm negro EN50618 | CABLE SOLAR |
| 2 | 575839 | Soporte coplanar Wega p/2 módulos 30mm | SOPORTE |
| 1 | 575741 | Protector descargas CC Tipo II 500Vcc Suntree | PROTECCION |
| 1 | 575957 | Interruptor térmico CC Suntree 500V-20A | INTERRUPTOR |
| 1 | 576022 | Seccionador para batería Suntree 12/24V | INTERRUPTOR |
| 1 | 040045 | Fusible ANL 70A | FUSIBLE |
| 1 | 575859 | Portafusible ANL cristal | FUSIBLE |

#### Opcionales — Autonomía ampliada

| Configuración | BOM (Lista de Materiales) | Energía útil | Autonomía @ 200W |
| :--- | :--- | :---: | :--- |
| Base (4× Ritar 55Ah @ 24V) | incluido | ~2.6 kWh | 4–6 h |
| 8× Ritar 55Ah (banco doble) | +4× 037029 | ~5.3 kWh | 8–12 h |
| 4× GEL 100Ah 12V (mejor ciclado) | 4× 046024 (reemplaza Ritar) | ~4.8 kWh | 10–14 h |
| 4× GEL 75Ah 24V | 4× 046014 (2S2P) | ~3.6 kWh | 8–10 h |

#### Opcionales — Ampliación de sistema

| Opción | Cambio en BOM (Lista de Materiales) | Wp total | Gen. estimada |
| :--- | :--- | :---: | :--- |
| Más FV misma base | +1× 519961 → 4 paneles | 600 Wp | ~59 kWh/mes |
| Migrar a KIT_OFF_MEDIO | Ver KIT_OFF_MEDIO | 1.640 Wp | ~162 kWh/mes |

#### Opcionales — Extras

| Cant. | SKU | Descripción |
| :---: | :--- | :--- |
| 1 | 038023 | Módulo WiFi p/inversor Aexpert |
| 1 | 576021 | Seccionador CC ON-OFF 600V-16A completo |
| 1 | 575804 | Regulador carga 20A PWM con visor CPLS apto litio c/USB 260W-12V/520W-24V |

---

### KIT_OFF_MEDIO

**Nombre:** Vivienda rural básica 1.6 kW Growatt
**Perfil:** PERFIL_01 aislado — Vivienda rural sin red
**Sistema:** OFF_GRID | Con batería | 24V | Sin red

| Parámetro | Valor |
| :--- | :--- |
| Wp total | 1.640 Wp (4 × 410 Wp) |
| Generación estimada | ~162 kWh/mes — ~5.4 kWh/día |
| Consumo de referencia | 120–200 kWh/mes — 4.0–6.7 kWh/día |
| Batería base | 4× GEL 75Ah @ 24V (2S2P) — ~4.5 kWh útiles (~70% DoD) |
| Autonomía orientativa | 6–8 h @ ~400W | 12–14 h @ ~200W |

Equivalente en generación a familia depto pero 100% solar. Lavarropas y microondas solo con sol fuerte o batería cargada. Priorizar cargas grandes en horario 10:00–17:00. Por encima de 200 kWh/mes evaluar KIT_OFF_ALTO.

#### BOM (Lista de Materiales) base

| Cant. | SKU | Descripción | Categoría |
| :---: | :--- | :--- | :--- |
| 4 | 549423 | Panel Solar 410Wp Jinko Tiger HalfCells PERC | PANEL |
| 1 | 038010 | Inversor OffGrid Growatt SPF3000HVM-24 MPPT 24V | INVERSOR |
| 1 | 037042 | Módulo OffGrid Dongle WiFi Growatt | INVERSOR |
| 4 | 046014 | Batería GEL Ultracell Wega 12V-75Ah | BATERIA |
| 6 | 037002 | Juego de conectores MC4 | CONECTOR |
| 25 | 036025 | Cable solar 6mm rojo | CABLE SOLAR |
| 25 | 036026 | Cable solar 6mm negro | CABLE SOLAR |
| 2 | 576045 | Soporte Mibet coplanar p/2 módulos fotov. 30mm | SOPORTE |
| 1 | 040014 | Protector descargas ATM CC Tipo II 1000Vcc Suntree Imax 40kA | PROTECCION |
| 1 | 575956 | Interruptor térmico CC Suntree 550V-40A-2P | INTERRUPTOR |
| 1 | 576022 | Seccionador para batería Suntree 12/24V | INTERRUPTOR |
| 1 | 040021 | Fusible ANL 100A | FUSIBLE |
| 1 | 575859 | Portafusible ANL cristal | FUSIBLE |
| 1 | 575804 | Regulador carga 20A PWM con visor CPLS apto litio c/USB | REGULADOR |

#### Opcionales — Autonomía ampliada

| Configuración | BOM (Lista de Materiales) | Energía útil | Autonomía @ 400W |
| :--- | :--- | :---: | :--- |
| Base (4× GEL 75Ah @ 24V) | incluido | ~4.5 kWh | 6–8 h |
| 8× GEL 75Ah (banco doble) | +4× 046014 | ~9.0 kWh | 12–14 h |
| 1× Hope litio (mejor ciclado) | 575917 + 575928 (reemplaza GEL, verificar compat. SPF3000) | 5.5 kWh | 8–10 h |
| 2× Hope litio | 2× 575917 + 2× 575928 | 11 kWh | 12–15 h |

#### Opcionales — Inversor / Generación

| Opción | Cambio en BOM (Lista de Materiales) | Wp total | Gen. estimada |
| :--- | :--- | :---: | :--- |
| Growatt SPF 5kW | 6× 549423 + inversor 038008 | 2.460 Wp | ~244 kWh/mes |
| Growatt SPF 6000 ES Plus | 6× 549423 + inversor 575927 | 2.460 Wp | ~244 kWh/mes |

#### Opcionales — Extras

| Cant. | SKU | Descripción |
| :---: | :--- | :--- |
| 1 | 576147 | Regulador carga solar Growatt SC4880 12/24/48VDC automático 80A |
| 1 | 576108 | Conector puente baterías 25mm c/terminal ojal armado |

---

### KIT_OFF_ALTO

**Nombre:** Rural alto 3.3 kW Growatt SPF 6000 ES Plus
**Perfil:** PERFIL_02 aislado — Vivienda rural media sin red
**Sistema:** OFF_GRID | Con batería | 48V | Sin red

| Parámetro | Valor |
| :--- | :--- |
| Wp total | 3.280 Wp (8 × 410 Wp) |
| Generación estimada | ~325 kWh/mes — ~10.8 kWh/día |
| Consumo de referencia | 250–400 kWh/mes — 8.3–13.3 kWh/día |
| Batería base | 2× Growatt Hope 5.5 — 11 kWh litio |
| Autonomía orientativa | 8–10 h @ ~600–800W | 14–16 h @ ~400W |

Techo práctico ~400 kWh/mes sin ampliar paneles. AC y lavarropas solo en horario solar salvo banco muy grande. Herramientas hasta 1 kW: usar con sol directo. No prometer AC nocturno sin 3× Hope o generador auxiliar.

#### BOM (Lista de Materiales) base

| Cant. | SKU | Descripción | Categoría |
| :---: | :--- | :--- | :--- |
| 8 | 549423 | Panel Solar 410Wp Jinko Tiger HalfCells PERC | PANEL |
| 1 | 575927 | Inversor Growatt SPF 6000 ES Plus OffGrid 6000W 48V, 2MPPT-8000W/450V, entrada aux 220VAC | INVERSOR |
| 1 | 037042 | Módulo OffGrid Dongle WiFi Growatt | INVERSOR |
| 2 | 575917 | Batería litio Growatt Hope 5.5kW 51.2V 106Ah 6000 ciclos | BATERIA |
| 2 | 575928 | Kit accesorios Growatt Hope 5.5 | BATERIA |
| 10 | 037002 | Juego de conectores MC4 | CONECTOR |
| 2 | 037023 | Juego conector MC4 Branch 4A1 | CONECTOR |
| 40 | 036025 | Cable solar 6mm rojo | CABLE SOLAR |
| 40 | 036026 | Cable solar 6mm negro | CABLE SOLAR |
| 4 | 576045 | Soporte Mibet coplanar p/2 módulos fotov. 30mm | SOPORTE |
| 1 | 040014 | Protector descargas ATM CC Tipo II 1000Vcc Suntree Imax 40kA | PROTECCION |
| 1 | 576056 | Interruptor térmico CC 550V-63A-2P | INTERRUPTOR |
| 1 | 576023 | Seccionador para batería Suntree 48V | INTERRUPTOR |
| 1 | 040020 | Fusible ANL 150A | FUSIBLE |
| 1 | 575859 | Portafusible ANL cristal | FUSIBLE |

#### Opcionales — Autonomía ampliada

| Configuración | BOM (Lista de Materiales) adicional | Energía total | Autonomía @ 700W |
| :--- | :--- | :---: | :--- |
| Base (2× Hope) | incluido | 11 kWh | 8–10 h |
| 3× Hope | +1× 575917 + 1× 575928 | 16.5 kWh | 14–16 h |
| 4× Hope | +2× 575917 + 2× 575928 | 22 kWh | 20–24 h |
| GEL económico (reemplaza Hope) | 8× 046014 banco 48V (4S2P) | ~7.2 kWh | 6–8 h |

#### Opcionales — Inversor / Generación

| Opción | Cambio en BOM (Lista de Materiales) | Wp total | Gen. estimada |
| :--- | :--- | :---: | :--- |
| Menos paneles | 6× 549423 | 2.460 Wp | ~244 kWh/mes — consumo máx ~220 kWh/mes |
| Más FV | 10× 549423 (validar MPPT 575927) | 4.100 Wp | ~406 kWh/mes |

#### Opcionales — Extras

| Cant. | SKU | Descripción |
| :---: | :--- | :--- |
| 2 | 576108 | Conector puente baterías 25mm c/terminal ojal armado |
| 1 | 575845 | Kit set cables batería litio Growatt AXE 5.12L |
| 1 | 576068 | Soporte triangular patas telescópicas regulables 40°–20° Mibet p/2 módulos 30mm |
| 1 | 576010 | Bloque de hormigón 42kg con varilla p/fijación |
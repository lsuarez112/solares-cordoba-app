-- =============================================================================
-- Carga de catálogo (GENERADO por scripts/catalog/build-seed.mjs — no editar a mano).
-- Fuente: armador-kit-solares/products *.md y scripts/catalog/kits.data.mjs
-- Productos del armador: 299 · Kits: 9
-- =============================================================================

-- Categorías solares
insert into public.product_categories (name, prefix, slug, icon, description) values
  ('Paneles Solares', 'PNL', 'paneles-solares', 'solar-panel', 'Módulos fotovoltaicos'),
  ('Inversores', 'INV', 'inversores', 'ev-charger', 'Inversores on-grid, híbridos, off-grid y de bombeo'),
  ('Baterías', 'BAT', 'baterias', 'battery-full', 'Baterías LiFePO4, GEL/AGM y accesorios'),
  ('Reguladores', 'REG', 'reguladores', 'battery-charging', 'Reguladores de carga MPPT y PWM'),
  ('Cableado', 'CAB', 'cableado', 'cable', 'Cable solar y conectores MC4'),
  ('Protecciones', 'PRO', 'protecciones', 'utility-pole', 'Descargadores, fusibles, interruptores y disyuntores'),
  ('Estructura', 'EST', 'estructura', 'toy-brick', 'Soportes y estructuras de montaje'),
  ('Monitoreo', 'MON', 'monitoreo', 'monitor', 'Dongles WiFi, limitadores de inyección y medidores'),
  ('Otros', 'OTR', 'otros', 'boxes', 'Productos y servicios fuera del catálogo solar (no los usa la IA)')
on conflict (prefix) do update set
  name = excluded.name, slug = excluded.slug, icon = excluded.icon, description = excluded.description;

-- Categoría, tipo de red y propiedades de los productos del armador
with src (code, prefix, grid, props) as (values
  ('519961', 'PNL', null::public.grid_type_enum, '{"tipo":"panel","potencia_wp":150,"notas":"Kit off-grid pequeño"}'::jsonb),
  ('037046', 'PNL', null::public.grid_type_enum, '{"tipo":"panel","potencia_wp":460,"tecnologia":"Mono N-Type","marco":"30mm","notas":"37 u/pallet"}'::jsonb),
  ('044002', 'PNL', null::public.grid_type_enum, '{"tipo":"panel","potencia_wp":240,"tecnologia":"Mono"}'::jsonb),
  ('044016', 'PNL', null::public.grid_type_enum, '{"tipo":"panel","potencia_wp":340,"tecnologia":"Poli"}'::jsonb),
  ('044017', 'PNL', null::public.grid_type_enum, '{"tipo":"panel","potencia_wp":545,"tecnologia":"Mono HalfCell"}'::jsonb),
  ('044019', 'PNL', null::public.grid_type_enum, '{"tipo":"panel","potencia_wp":375,"tecnologia":"Mono"}'::jsonb),
  ('045006', 'PNL', null::public.grid_type_enum, '{"tipo":"panel","potencia_wp":585,"tecnologia":"Mono TopCon Bifacial","notas":"37 u/pallet"}'::jsonb),
  ('046005', 'PNL', null::public.grid_type_enum, '{"tipo":"panel","potencia_wp":595,"tecnologia":"Mono TopCon","notas":"Kit híbrido alto"}'::jsonb),
  ('549423', 'PNL', null::public.grid_type_enum, '{"tipo":"panel","potencia_wp":410,"tecnologia":"Mono PERC","notas":"Panel principal de kits"}'::jsonb),
  ('563958', 'PNL', null::public.grid_type_enum, '{"tipo":"panel","potencia_wp":305,"tecnologia":"Mono"}'::jsonb),
  ('568176', 'PNL', null::public.grid_type_enum, '{"tipo":"panel","potencia_wp":275,"tecnologia":"Poli"}'::jsonb),
  ('575733', 'PNL', null::public.grid_type_enum, '{"tipo":"panel","potencia_wp":585,"tecnologia":"Mono","notas":"36 u/pallet"}'::jsonb),
  ('575806', 'PNL', null::public.grid_type_enum, '{"tipo":"panel","potencia_wp":580,"tecnologia":"Mono TopCon","notas":"36 u/pallet"}'::jsonb),
  ('575810', 'PNL', null::public.grid_type_enum, '{"tipo":"panel","potencia_wp":585,"tecnologia":"Mono TopCon Bifacial"}'::jsonb),
  ('575834', 'PNL', null::public.grid_type_enum, '{"tipo":"panel","potencia_wp":555,"tecnologia":"Mono HalfCell"}'::jsonb),
  ('575837', 'PNL', null::public.grid_type_enum, '{"tipo":"panel","potencia_wp":460,"tecnologia":"Mono HalfCell","marco":"30mm"}'::jsonb),
  ('575901', 'PNL', null::public.grid_type_enum, '{"tipo":"panel","potencia_wp":410,"tecnologia":"Mono HalfCell","notas":"Alternativa a 549423"}'::jsonb),
  ('576008', 'PNL', null::public.grid_type_enum, '{"tipo":"panel","potencia_wp":565}'::jsonb),
  ('576011', 'PNL', null::public.grid_type_enum, '{"tipo":"panel","potencia_wp":585,"tecnologia":"Mono TopCon"}'::jsonb),
  ('576013', 'PNL', null::public.grid_type_enum, '{"tipo":"panel","potencia_wp":620,"tecnologia":"Mono TopCon Bifacial","notas":"33 u/pallet"}'::jsonb),
  ('576043', 'PNL', null::public.grid_type_enum, '{"tipo":"panel","potencia_wp":585,"tecnologia":"Mono TopCon"}'::jsonb),
  ('576084', 'PNL', null::public.grid_type_enum, '{"tipo":"panel","potencia_wp":550,"tecnologia":"Mono PERC"}'::jsonb),
  ('576099', 'PNL', null::public.grid_type_enum, '{"tipo":"panel","potencia_wp":640,"tecnologia":"Mono N-Type Bifacial","notas":"36 u/pallet"}'::jsonb),
  ('576105', 'PNL', null::public.grid_type_enum, '{"tipo":"panel","potencia_wp":440,"tecnologia":"Mono TopCon","notas":"Voc 38.8V / Isc 14.18A"}'::jsonb),
  ('576112', 'PNL', null::public.grid_type_enum, '{"tipo":"panel","potencia_wp":160,"marco":"30mm"}'::jsonb),
  ('576115', 'PNL', null::public.grid_type_enum, '{"tipo":"panel","potencia_wp":620,"tecnologia":"Mono N-Type Bifacial","marco":"30mm","notas":"36 u/pallet"}'::jsonb),
  ('576132', 'PNL', null::public.grid_type_enum, '{"tipo":"panel","potencia_wp":620,"tecnologia":"Mono N-Type Bifacial"}'::jsonb),
  ('576133', 'PNL', null::public.grid_type_enum, '{"tipo":"panel","potencia_wp":620,"tecnologia":"Mono TopCon Bifacial"}'::jsonb),
  ('576154', 'PNL', null::public.grid_type_enum, '{"tipo":"panel","potencia_wp":710,"tecnologia":"Mono N-Type Bifacial","marco":"33mm","notas":"33 u/pallet"}'::jsonb),
  ('036076', 'INV', 'ON-GRID'::public.grid_type_enum, '{"tipo":"on-grid","potencia_w":1500,"fases":"mono","mppt":1,"dongle":"037030"}'::jsonb),
  ('576009', 'INV', 'ON-GRID'::public.grid_type_enum, '{"tipo":"on-grid","potencia_w":2000,"fases":"mono","mppt":1,"dongle":"037030"}'::jsonb),
  ('576020', 'INV', 'ON-GRID'::public.grid_type_enum, '{"tipo":"on-grid","potencia_w":2500,"fases":"mono","mppt":1,"dongle":"037030"}'::jsonb),
  ('037005', 'INV', 'ON-GRID'::public.grid_type_enum, '{"tipo":"on-grid","potencia_w":4200,"fases":"mono","mppt":2,"dongle":"037030"}'::jsonb),
  ('576044', 'INV', 'ON-GRID'::public.grid_type_enum, '{"tipo":"on-grid","potencia_w":3000,"fases":"mono","mppt":1,"pv_max_w":4500,"v_max":"550","i_max":"16","dongle":"037030"}'::jsonb),
  ('039014', 'INV', 'ON-GRID'::public.grid_type_enum, '{"tipo":"on-grid","potencia_w":6000,"fases":"mono","mppt":2,"pv_max_w":9000,"v_max":"550","i_max":"16","dongle":"039016"}'::jsonb),
  ('575991', 'INV', 'ON-GRID'::public.grid_type_enum, '{"tipo":"on-grid","potencia_w":10000,"fases":"mono","mppt":3,"pv_max_w":15000,"v_max":"600","i_max":"18","dongle":"039016"}'::jsonb),
  ('038007', 'INV', 'ON-GRID'::public.grid_type_enum, '{"tipo":"on-grid","potencia_w":5000,"fases":"mono","dongle":"037030"}'::jsonb),
  ('575970', 'INV', 'ON-GRID'::public.grid_type_enum, '{"tipo":"on-grid","potencia_w":6000,"fases":"mono","mppt":2,"pv_max_w":9000,"v_max":"550","i_max":"16","dongle":"039016"}'::jsonb),
  ('575972', 'INV', 'ON-GRID'::public.grid_type_enum, '{"tipo":"on-grid","potencia_w":6000,"fases":"tri","mppt":2,"pv_max_w":9000,"v_max":"1100","i_max":"13","dongle":"039016"}'::jsonb),
  ('575973', 'INV', 'ON-GRID'::public.grid_type_enum, '{"tipo":"on-grid","potencia_w":10000,"fases":"tri","mppt":2,"pv_max_w":15000,"v_max":"1100","i_max":"13","dongle":"039016"}'::jsonb),
  ('039017', 'INV', 'ON-GRID'::public.grid_type_enum, '{"tipo":"on-grid","potencia_w":10000,"fases":"tri","mppt":2,"pv_max_w":15000,"v_max":"1100","i_max":"13","dongle":"039016"}'::jsonb),
  ('038016', 'INV', 'ON-GRID'::public.grid_type_enum, '{"tipo":"on-grid","potencia_w":15000,"fases":"tri","mppt":2,"pv_max_w":22500,"v_max":"1100","i_max":"13/26","dongle":"039016"}'::jsonb),
  ('043008', 'INV', 'ON-GRID'::public.grid_type_enum, '{"tipo":"on-grid","potencia_w":20000,"fases":"tri","mppt":2,"pv_max_w":30000,"v_max":"1100","i_max":"25","dongle":"039016"}'::jsonb),
  ('043009', 'INV', 'ON-GRID'::public.grid_type_enum, '{"tipo":"on-grid","potencia_w":25000,"fases":"tri","mppt":2,"pv_max_w":37500,"v_max":"1100","i_max":"25","dongle":"039016"}'::jsonb),
  ('043007', 'INV', 'ON-GRID'::public.grid_type_enum, '{"tipo":"on-grid","potencia_w":30000,"fases":"tri","mppt":2,"pv_max_w":45000,"v_max":"1100","i_max":"32/48","dongle":"039016"}'::jsonb),
  ('043010', 'INV', 'ON-GRID'::public.grid_type_enum, '{"tipo":"on-grid","potencia_w":40000,"fases":"tri","mppt":4,"pv_max_w":60000,"v_max":"1100","i_max":"26","dongle":"039016"}'::jsonb),
  ('575745', 'INV', 'ON-GRID'::public.grid_type_enum, '{"tipo":"on-grid","potencia_w":60000,"fases":"tri","mppt":3,"pv_max_w":90000,"v_max":"600","i_max":"55","dongle":"039016"}'::jsonb),
  ('576025', 'INV', 'ON-GRID'::public.grid_type_enum, '{"tipo":"on-grid","potencia_w":60000,"fases":"tri","mppt":6,"pv_max_w":90000,"v_max":"1100","i_max":"26","dongle":"039016"}'::jsonb),
  ('575746', 'INV', 'ON-GRID'::public.grid_type_enum, '{"tipo":"on-grid","potencia_w":50000,"fases":"tri","mppt":6,"pv_max_w":75000,"v_max":"1100","i_max":"26","dongle":"039016"}'::jsonb),
  ('039018', 'INV', 'ON-GRID'::public.grid_type_enum, '{"tipo":"on-grid","potencia_w":80000,"fases":"tri","mppt":7,"pv_max_w":120000,"v_max":"600","i_max":"26","dongle":"039016"}'::jsonb),
  ('575974', 'INV', 'ON-GRID'::public.grid_type_enum, '{"tipo":"on-grid","potencia_w":110000,"fases":"tri","mppt":8,"pv_max_w":165000,"v_max":"1100","i_max":"45","dongle":"039016"}'::jsonb),
  ('575975', 'INV', 'ON-GRID'::public.grid_type_enum, '{"tipo":"on-grid","potencia_w":125000,"fases":"tri","mppt":8,"pv_max_w":187500,"v_max":"1100","i_max":"45","dongle":"039016"}'::jsonb),
  ('576178', 'INV', 'ON-GRID'::public.grid_type_enum, '{"tipo":"on-grid","potencia_w":2000,"fases":"mono","notas":"Sin dongle externo"}'::jsonb),
  ('575994', 'INV', 'ON-GRID'::public.grid_type_enum, '{"tipo":"on-grid","potencia_w":6000,"fases":"mono"}'::jsonb),
  ('576193', 'INV', 'ON-GRID'::public.grid_type_enum, '{"tipo":"on-grid","potencia_w":6000,"fases":"mono"}'::jsonb),
  ('576126', 'INV', 'ON-GRID'::public.grid_type_enum, '{"tipo":"on-grid","potencia_w":6000,"fases":"tri"}'::jsonb),
  ('576146', 'INV', 'ON-GRID'::public.grid_type_enum, '{"tipo":"on-grid","potencia_w":10000,"fases":"tri"}'::jsonb),
  ('576155', 'INV', 'ON-GRID'::public.grid_type_enum, '{"tipo":"on-grid","potencia_w":15000,"fases":"tri","notas":"SUN-15K-G06P3-EU-A"}'::jsonb),
  ('576127', 'INV', 'ON-GRID'::public.grid_type_enum, '{"tipo":"on-grid","potencia_w":25000,"fases":"tri"}'::jsonb),
  ('575995', 'INV', 'ON-GRID'::public.grid_type_enum, '{"tipo":"on-grid","potencia_w":6000,"fases":"tri"}'::jsonb),
  ('575996', 'INV', 'ON-GRID'::public.grid_type_enum, '{"tipo":"on-grid","potencia_w":15000,"fases":"tri"}'::jsonb),
  ('575997', 'INV', 'ON-GRID'::public.grid_type_enum, '{"tipo":"on-grid","potencia_w":20000,"fases":"tri"}'::jsonb),
  ('575998', 'INV', 'ON-GRID'::public.grid_type_enum, '{"tipo":"on-grid","potencia_w":75000,"fases":"tri"}'::jsonb),
  ('576100', 'INV', 'ON-GRID'::public.grid_type_enum, '{"tipo":"on-grid","potencia_w":10000,"fases":"tri"}'::jsonb),
  ('576153', 'INV', 'ON-GRID'::public.grid_type_enum, '{"tipo":"on-grid","potencia_w":15000,"fases":"tri"}'::jsonb),
  ('576181', 'INV', 'ON-GRID'::public.grid_type_enum, '{"tipo":"on-grid","potencia_w":60000,"fases":"tri"}'::jsonb),
  ('576194', 'INV', 'ON-GRID'::public.grid_type_enum, '{"tipo":"on-grid","potencia_w":6000,"fases":"tri"}'::jsonb),
  ('576195', 'INV', 'ON-GRID'::public.grid_type_enum, '{"tipo":"on-grid","potencia_w":10000,"fases":"tri"}'::jsonb),
  ('576197', 'INV', 'ON-GRID'::public.grid_type_enum, '{"tipo":"on-grid","potencia_w":20000,"fases":"tri"}'::jsonb),
  ('576152', 'INV', 'ON-GRID'::public.grid_type_enum, '{"tipo":"on-grid","potencia_w":5000,"fases":"tri","notas":"5 años garantía extensible"}'::jsonb),
  ('576158', 'INV', 'ON-GRID'::public.grid_type_enum, '{"tipo":"on-grid","potencia_w":50000,"fases":"tri"}'::jsonb),
  ('576120', 'INV', 'ON-GRID'::public.grid_type_enum, '{"tipo":"on-grid","potencia_w":150000,"fases":"tri"}'::jsonb),
  ('037030', 'MON', null::public.grid_type_enum, '{"tipo":"dongle wifi","compatible_con":"Línea MIC/MIN Growatt"}'::jsonb),
  ('039016', 'MON', null::public.grid_type_enum, '{"tipo":"dongle wifi","compatible_con":"Línea X Growatt"}'::jsonb),
  ('575738', 'MON', null::public.grid_type_enum, '{"tipo":"dongle wifi","compatible_con":"Growatt general"}'::jsonb),
  ('575976', 'MON', null::public.grid_type_enum, '{"tipo":"dongle wifi","compatible_con":"Growatt general"}'::jsonb),
  ('575977', 'MON', null::public.grid_type_enum, '{"tipo":"dongle wifi","compatible_con":"Growatt general"}'::jsonb),
  ('038017', 'INV', 'HYBRID'::public.grid_type_enum, '{"tipo":"híbrido","potencia_w":3000,"fases":"mono","tension_bateria":"48V","dongle":"037030","baterias_compatibles":"Pylontech UP5000, Hope 5.5"}'::jsonb),
  ('038018', 'INV', 'HYBRID'::public.grid_type_enum, '{"tipo":"híbrido","potencia_w":3600,"fases":"mono","tension_bateria":"48V","dongle":"037030","baterias_compatibles":"Pylontech UP5000, Hope 5.5"}'::jsonb),
  ('038019', 'INV', 'HYBRID'::public.grid_type_enum, '{"tipo":"híbrido","potencia_w":5000,"fases":"mono","tension_bateria":"48V","dongle":"037030","baterias_compatibles":"Pylontech UP5000, Hope 5.5"}'::jsonb),
  ('038020', 'INV', 'HYBRID'::public.grid_type_enum, '{"tipo":"híbrido","potencia_w":10000,"fases":"tri","tension_bateria":"48V","dongle":"039016","baterias_compatibles":"Hope 5.5, ARK 2.5H-A1"}'::jsonb),
  ('575842', 'INV', 'HYBRID'::public.grid_type_enum, '{"tipo":"híbrido","potencia_w":5000,"fases":"mono","tension_bateria":"48V","notas":"WiFi incluido, picos 12kW/10s"}'::jsonb),
  ('575849', 'INV', 'HYBRID'::public.grid_type_enum, '{"tipo":"híbrido","potencia_w":3600,"fases":"mono","tension_bateria":"48V","notas":"WiFi incluido, picos 12kW/10s"}'::jsonb),
  ('575841', 'INV', 'HYBRID'::public.grid_type_enum, '{"tipo":"híbrido","potencia_w":8000,"fases":"mono","tension_bateria":"48V","notas":"WiFi incluido, picos 16kW/10s"}'::jsonb),
  ('575999', 'INV', 'HYBRID'::public.grid_type_enum, '{"tipo":"híbrido","potencia_w":6000,"fases":"mono","tension_bateria":"48V","notas":"5 años garantía"}'::jsonb),
  ('576000', 'INV', 'HYBRID'::public.grid_type_enum, '{"tipo":"híbrido","potencia_w":10000,"fases":"mono","tension_bateria":"48V","notas":"5 años garantía"}'::jsonb),
  ('576161', 'INV', 'HYBRID'::public.grid_type_enum, '{"tipo":"híbrido","potencia_w":3000,"fases":"mono"}'::jsonb),
  ('576162', 'INV', 'HYBRID'::public.grid_type_enum, '{"tipo":"híbrido","potencia_w":6000,"fases":"mono"}'::jsonb),
  ('576179', 'INV', 'HYBRID'::public.grid_type_enum, '{"tipo":"híbrido","potencia_w":8000,"fases":"mono"}'::jsonb),
  ('576092', 'INV', 'HYBRID'::public.grid_type_enum, '{"tipo":"híbrido","potencia_w":3000,"fases":"mono","tension_bateria":"48V","notas":"Paralelizable"}'::jsonb),
  ('575773', 'INV', 'HYBRID'::public.grid_type_enum, '{"tipo":"híbrido","potencia_w":5000,"fases":"mono","tension_bateria":"48V","notas":"Paralelizable"}'::jsonb),
  ('576117', 'INV', 'HYBRID'::public.grid_type_enum, '{"tipo":"híbrido","potencia_w":5000,"fases":"mono","tension_bateria":"48V","notas":"Hasta 6 en paralelo"}'::jsonb),
  ('575958', 'INV', 'HYBRID'::public.grid_type_enum, '{"tipo":"híbrido","potencia_w":15000,"fases":"tri","tension_bateria":"48V","notas":"Picos 30kW/10s"}'::jsonb),
  ('575960', 'INV', 'HYBRID'::public.grid_type_enum, '{"tipo":"híbrido","potencia_w":8000,"fases":"tri","tension_bateria":"48V","notas":"Picos 16kW/10s"}'::jsonb),
  ('575989', 'INV', 'HYBRID'::public.grid_type_enum, '{"tipo":"híbrido","potencia_w":20000,"fases":"tri","tension_bateria":"48V","notas":"Picos 40kW/10s"}'::jsonb),
  ('575987', 'INV', 'HYBRID'::public.grid_type_enum, '{"tipo":"híbrido","potencia_w":12000,"fases":"tri","tension_bateria":"48V","notas":"WiFi incluido"}'::jsonb),
  ('576001', 'INV', 'HYBRID'::public.grid_type_enum, '{"tipo":"híbrido","potencia_w":14000,"fases":"tri","tension_bateria":"48V"}'::jsonb),
  ('576052', 'INV', 'HYBRID'::public.grid_type_enum, '{"tipo":"híbrido","potencia_w":10000,"fases":"tri","tension_bateria":"48V"}'::jsonb),
  ('576102', 'INV', 'HYBRID'::public.grid_type_enum, '{"tipo":"híbrido","potencia_w":12000,"fases":"tri"}'::jsonb),
  ('576113', 'INV', 'HYBRID'::public.grid_type_enum, '{"tipo":"híbrido","potencia_w":20000,"fases":"tri"}'::jsonb),
  ('576135', 'INV', 'HYBRID'::public.grid_type_enum, '{"tipo":"híbrido","potencia_w":6000,"fases":"tri"}'::jsonb),
  ('576136', 'INV', 'HYBRID'::public.grid_type_enum, '{"tipo":"híbrido","potencia_w":8000,"fases":"tri"}'::jsonb),
  ('576163', 'INV', 'HYBRID'::public.grid_type_enum, '{"tipo":"híbrido","potencia_w":30000,"fases":"tri"}'::jsonb),
  ('576192', 'INV', 'HYBRID'::public.grid_type_enum, '{"tipo":"híbrido","potencia_w":50000,"fases":"tri","notas":"Hasta 20 en paralelo"}'::jsonb),
  ('038010', 'INV', 'OFF-GRID'::public.grid_type_enum, '{"tipo":"off-grid","potencia_w":3000,"tension_bateria":"24V","notas":"Kit off-grid medio"}'::jsonb),
  ('039012', 'INV', 'OFF-GRID'::public.grid_type_enum, '{"tipo":"off-grid","potencia_w":3000,"tension_bateria":"48V"}'::jsonb),
  ('038008', 'INV', 'OFF-GRID'::public.grid_type_enum, '{"tipo":"off-grid","potencia_w":5000,"tension_bateria":"48V"}'::jsonb),
  ('038011', 'INV', 'OFF-GRID'::public.grid_type_enum, '{"tipo":"off-grid","potencia_w":3500,"tension_bateria":"48V"}'::jsonb),
  ('575927', 'INV', 'OFF-GRID'::public.grid_type_enum, '{"tipo":"off-grid","potencia_w":6000,"tension_bateria":"48V","mppt_pv":"2MPPT 8000W/450V","notas":"Kit off-grid alto"}'::jsonb),
  ('575799', 'INV', 'OFF-GRID'::public.grid_type_enum, '{"tipo":"off-grid","potencia_w":1200,"notas":"Uso básico"}'::jsonb),
  ('038012', 'INV', 'OFF-GRID'::public.grid_type_enum, '{"tipo":"off-grid","potencia_w":1000,"tension_bateria":"12V","notas":"Catálogo activo — uso legacy"}'::jsonb),
  ('038022', 'INV', 'OFF-GRID'::public.grid_type_enum, '{"tipo":"off-grid","potencia_w":2000}'::jsonb),
  ('041005', 'INV', 'OFF-GRID'::public.grid_type_enum, '{"tipo":"off-grid","potencia_w":5000}'::jsonb),
  ('576012', 'INV', 'OFF-GRID'::public.grid_type_enum, '{"tipo":"off-grid","potencia_w":3000,"tension_bateria":"24V"}'::jsonb),
  ('576082', 'INV', 'OFF-GRID'::public.grid_type_enum, '{"tipo":"off-grid","potencia_w":5500,"tension_bateria":"48V"}'::jsonb),
  ('576156', 'INV', 'OFF-GRID'::public.grid_type_enum, '{"tipo":"off-grid","potencia_w":6000,"notas":"Compat. Pylontech/Deye/Leoch"}'::jsonb),
  ('575770', 'INV', 'OFF-GRID'::public.grid_type_enum, '{"tipo":"off-grid","potencia_w":1000}'::jsonb),
  ('575771', 'INV', 'OFF-GRID'::public.grid_type_enum, '{"tipo":"off-grid","potencia_w":3000}'::jsonb),
  ('575985', 'INV', 'OFF-GRID'::public.grid_type_enum, '{"tipo":"off-grid","potencia_w":3000}'::jsonb),
  ('052006', 'INV', 'OFF-GRID'::public.grid_type_enum, '{"tipo":"bombeo solar","fases":"tri","hp":"4 HP"}'::jsonb),
  ('037016', 'INV', 'OFF-GRID'::public.grid_type_enum, '{"tipo":"bombeo solar","fases":"tri","hp":"10 HP"}'::jsonb),
  ('041009', 'INV', 'OFF-GRID'::public.grid_type_enum, '{"tipo":"bombeo solar","fases":"tri","hp":"12.5 HP"}'::jsonb),
  ('037001', 'INV', 'OFF-GRID'::public.grid_type_enum, '{"tipo":"bombeo solar","fases":"tri","hp":"17.5 HP"}'::jsonb),
  ('575778', 'INV', 'OFF-GRID'::public.grid_type_enum, '{"tipo":"bombeo solar","fases":"tri","hp":"20 HP"}'::jsonb),
  ('048004', 'INV', 'OFF-GRID'::public.grid_type_enum, '{"tipo":"bombeo solar","fases":"tri","hp":"25 HP"}'::jsonb),
  ('575867', 'INV', 'OFF-GRID'::public.grid_type_enum, '{"tipo":"bombeo solar","fases":"tri"}'::jsonb),
  ('576116', 'INV', 'OFF-GRID'::public.grid_type_enum, '{"tipo":"bombeo solar","fases":"tri"}'::jsonb),
  ('576191', 'INV', 'OFF-GRID'::public.grid_type_enum, '{"tipo":"bombeo solar","fases":"tri","hp":"4 HP"}'::jsonb),
  ('576070', 'INV', 'OFF-GRID'::public.grid_type_enum, '{"tipo":"bombeo solar","fases":"tri"}'::jsonb),
  ('576089', 'INV', 'OFF-GRID'::public.grid_type_enum, '{"tipo":"bombeo solar","fases":"tri","hp":"4 HP"}'::jsonb),
  ('037042', 'MON', null::public.grid_type_enum, '{"tipo":"dongle wifi","compatible_con":"SPF Growatt off-grid"}'::jsonb),
  ('038023', 'MON', null::public.grid_type_enum, '{"tipo":"dongle wifi","compatible_con":"Voltronic Aexpert"}'::jsonb),
  ('575917', 'BAT', null::public.grid_type_enum, '{"tipo":"batería","capacidad_kwh":5.5,"quimica":"LiFePO4","tension":"51.2V","ciclos":"6000","paralelo_max":"12","notas":"Compat. SPH3000-5000, SPF3000-6000ES"}'::jsonb),
  ('575978', 'BAT', null::public.grid_type_enum, '{"tipo":"batería","capacidad_kwh":2.56,"quimica":"LiFePO4","tension":"153.6–512V","ciclos":"6000","dod":"90%","paralelo_max":"10/torre","notas":"Compat. SPH10000TL3BH-UP. Comunic. CAN"}'::jsonb),
  ('046040', 'BAT', null::public.grid_type_enum, '{"tipo":"batería","capacidad_kwh":4.8,"quimica":"LiFePO4","tension":"48V","notas":"Compatible SPH Growatt"}'::jsonb),
  ('054006', 'BAT', null::public.grid_type_enum, '{"tipo":"batería","capacidad_kwh":5.12,"quimica":"LiFePO4","tension":"51.2V","paralelo_max":"20","notas":"Sin LV Hub. No paralelo con otros modelos"}'::jsonb),
  ('576176', 'BAT', null::public.grid_type_enum, '{"tipo":"batería","capacidad_kwh":5.12,"quimica":"LiFePO4","tension":"51.2V","paralelo_max":"20","notas":"IP65. Compat. SMA, Growatt"}'::jsonb),
  ('576198', 'BAT', null::public.grid_type_enum, '{"tipo":"batería","capacidad_kwh":16,"quimica":"LiFePO4","tension":"51.2V","ciclos":"6000","dod":"95%","paralelo_max":"96 (c/LV HUB V2)","notas":"IP65"}'::jsonb),
  ('046013', 'BAT', null::public.grid_type_enum, '{"tipo":"batería","capacidad_kwh":4.4,"quimica":"LiFePO4","tension":"51.2V","ciclos":"5.000+"}'::jsonb),
  ('575844', 'BAT', null::public.grid_type_enum, '{"tipo":"batería","capacidad_kwh":5,"quimica":"LiFePO4","tension":"51.2V","ciclos":"6000","dod":"92%"}'::jsonb),
  ('576003', 'BAT', null::public.grid_type_enum, '{"tipo":"batería","capacidad_kwh":5.12,"quimica":"LiFePO4","tension":"51.2V","notas":"Incluye cables. 5 años garantía"}'::jsonb),
  ('576054', 'BAT', null::public.grid_type_enum, '{"tipo":"batería","capacidad_kwh":5.12,"quimica":"LiFePO4","tension":"51.2V","notas":"Con interruptor termomagnético"}'::jsonb),
  ('576094', 'BAT', null::public.grid_type_enum, '{"tipo":"batería","capacidad_kwh":5.12,"quimica":"LiFePO4","tension":"51.2V","notas":"Incluye cables y paralelización. 5 años"}'::jsonb),
  ('576002', 'BAT', null::public.grid_type_enum, '{"tipo":"batería","capacidad_kwh":10.24,"quimica":"LiFePO4","tension":"51.2V","notas":"Incluye cables. 5 años garantía"}'::jsonb),
  ('576095', 'BAT', null::public.grid_type_enum, '{"tipo":"batería","capacidad_kwh":10.24,"quimica":"LiFePO4","tension":"51.2V"}'::jsonb),
  ('576088', 'BAT', null::public.grid_type_enum, '{"tipo":"batería","capacidad_kwh":5.12,"quimica":"LiFePO4","tension":"51.2V","ciclos":"3.500+","dod":"100%","paralelo_max":"15","notas":"Display + App Bluetooth"}'::jsonb),
  ('576177', 'BAT', null::public.grid_type_enum, '{"tipo":"batería","capacidad_kwh":5.12,"quimica":"LiFePO4","tension":"25.6V","ciclos":"3.500+","dod":"100%","paralelo_max":"15","notas":"Display + Bluetooth. Rackeable"}'::jsonb),
  ('576184', 'BAT', null::public.grid_type_enum, '{"tipo":"batería","capacidad_kwh":1.28,"quimica":"LiFePO4","tension":"12V","paralelo_max":"2","notas":"Sin comunicación externa. ~10kg"}'::jsonb),
  ('576185', 'BAT', null::public.grid_type_enum, '{"tipo":"batería","capacidad_kwh":2.56,"quimica":"LiFePO4","tension":"24V","paralelo_max":"2","notas":"Sin comunicación externa. ~21kg"}'::jsonb),
  ('576015', 'BAT', null::public.grid_type_enum, '{"tipo":"batería","capacidad_kwh":2.56,"quimica":"LiFePO4","tension":"25.6V","notas":"Ecológica"}'::jsonb),
  ('576172', 'BAT', null::public.grid_type_enum, '{"tipo":"batería","capacidad_kwh":5.12,"quimica":"LiFePO4","tension":"51.2V"}'::jsonb),
  ('576103', 'BAT', null::public.grid_type_enum, '{"tipo":"batería","capacidad_kwh":5.12,"quimica":"LiFePO4"}'::jsonb),
  ('576137', 'BAT', null::public.grid_type_enum, '{"tipo":"batería","capacidad_kwh":2.56,"quimica":"LiFePO4","tension":"Alto V","notas":"Híbridos trifásicos: mín. 3 unidades"}'::jsonb),
  ('575988', 'BAT', null::public.grid_type_enum, '{"tipo":"batería","capacidad_kwh":5.12,"quimica":"LiFePO4","tension":"51.2V","ciclos":"6.000+","notas":"Compatible inversores Deye. 5 años"}'::jsonb),
  ('046014', 'BAT', null::public.grid_type_enum, '{"tipo":"batería","capacidad_kwh":0.9,"quimica":"GEL/AGM","tension":"12V","dod":"50–70%","notas":"Kit off-grid medio"}'::jsonb),
  ('046024', 'BAT', null::public.grid_type_enum, '{"tipo":"batería","capacidad_kwh":1.2,"quimica":"GEL/AGM","tension":"12V","ciclos":"3500","dod":"50%","notas":"Mayor vida útil que GEL estándar"}'::jsonb),
  ('037027', 'BAT', null::public.grid_type_enum, '{"tipo":"batería","capacidad_kwh":1.2,"quimica":"GEL/AGM","tension":"12V","ciclos":"1800","dod":"50%","notas":"Alta performance"}'::jsonb),
  ('037029', 'BAT', null::public.grid_type_enum, '{"tipo":"batería","capacidad_kwh":0.66,"quimica":"GEL/AGM","tension":"12V","dod":"50%","notas":"Kit off-grid bajo"}'::jsonb),
  ('046006', 'BAT', null::public.grid_type_enum, '{"tipo":"batería","capacidad_kwh":0.78,"quimica":"GEL/AGM","tension":"12V","dod":"50%"}'::jsonb),
  ('046007', 'BAT', null::public.grid_type_enum, '{"tipo":"batería","capacidad_kwh":0.29,"quimica":"GEL/AGM","tension":"12V","dod":"50%","notas":"Sistemas muy pequeños"}'::jsonb),
  ('046011', 'BAT', null::public.grid_type_enum, '{"tipo":"batería","capacidad_kwh":1.8,"quimica":"GEL/AGM","tension":"12V","dod":"50%"}'::jsonb),
  ('046017', 'BAT', null::public.grid_type_enum, '{"tipo":"batería","capacidad_kwh":3.3,"quimica":"GEL/AGM","tension":"12V","dod":"50%"}'::jsonb),
  ('046021', 'BAT', null::public.grid_type_enum, '{"tipo":"batería","capacidad_kwh":2.4,"quimica":"GEL/AGM","tension":"12V","dod":"50%"}'::jsonb),
  ('046025', 'BAT', null::public.grid_type_enum, '{"tipo":"batería","capacidad_kwh":1.8,"quimica":"GEL/AGM","tension":"12V","dod":"50%"}'::jsonb),
  ('046026', 'BAT', null::public.grid_type_enum, '{"tipo":"batería","capacidad_kwh":0.54,"quimica":"GEL/AGM","tension":"12V","dod":"50%"}'::jsonb),
  ('046027', 'BAT', null::public.grid_type_enum, '{"tipo":"batería","capacidad_kwh":1.8,"quimica":"GEL/AGM","tension":"12V","dod":"50%"}'::jsonb),
  ('046028', 'BAT', null::public.grid_type_enum, '{"tipo":"batería","capacidad_kwh":2.4,"quimica":"GEL/AGM","tension":"12V","dod":"50%"}'::jsonb),
  ('046029', 'BAT', null::public.grid_type_enum, '{"tipo":"batería","capacidad_kwh":1.8,"quimica":"GEL/AGM","tension":"12V","dod":"50%"}'::jsonb),
  ('046030', 'BAT', null::public.grid_type_enum, '{"tipo":"batería","capacidad_kwh":1.2,"quimica":"GEL/AGM","tension":"12V","dod":"50%"}'::jsonb),
  ('575866', 'BAT', null::public.grid_type_enum, '{"tipo":"batería","capacidad_kwh":1.2,"quimica":"GEL/AGM","tension":"12V","dod":"50%"}'::jsonb),
  ('575929', 'BAT', null::public.grid_type_enum, '{"tipo":"batería","capacidad_kwh":3,"quimica":"GEL/AGM","tension":"12V","dod":"50%"}'::jsonb),
  ('575776', 'BAT', null::public.grid_type_enum, '{"tipo":"batería","capacidad_kwh":1.32,"quimica":"plomo-ácido","tension":"12V"}'::jsonb),
  ('575777', 'BAT', null::public.grid_type_enum, '{"tipo":"batería","capacidad_kwh":2.64,"quimica":"plomo-ácido","tension":"12V"}'::jsonb),
  ('046035', 'BAT', null::public.grid_type_enum, '{"tipo":"batería","capacidad_kwh":1.28,"quimica":"LiFePO4","tension":"12V"}'::jsonb),
  ('046022', 'BAT', null::public.grid_type_enum, '{"tipo":"accesorio batería","uso":"Hope 4.8"}'::jsonb),
  ('046023', 'BAT', null::public.grid_type_enum, '{"tipo":"accesorio batería","uso":"Hope 3.3"}'::jsonb),
  ('575928', 'BAT', null::public.grid_type_enum, '{"tipo":"accesorio batería","uso":"Hope 5.5 — siempre con 575917"}'::jsonb),
  ('575845', 'BAT', null::public.grid_type_enum, '{"tipo":"accesorio batería","uso":"AXE series"}'::jsonb),
  ('575846', 'BAT', null::public.grid_type_enum, '{"tipo":"accesorio batería","uso":"AXE series"}'::jsonb),
  ('575979', 'BAT', null::public.grid_type_enum, '{"tipo":"accesorio batería","uso":"ARK — siempre con 575978"}'::jsonb),
  ('575982', 'BAT', null::public.grid_type_enum, '{"tipo":"accesorio batería","uso":"ARK — siempre con 575978"}'::jsonb),
  ('575984', 'BAT', null::public.grid_type_enum, '{"tipo":"accesorio batería","uso":"Growatt litio"}'::jsonb),
  ('575980', 'BAT', null::public.grid_type_enum, '{"tipo":"accesorio batería","uso":"ARK"}'::jsonb),
  ('575981', 'BAT', null::public.grid_type_enum, '{"tipo":"accesorio batería","uso":"ARK"}'::jsonb),
  ('046038', 'BAT', null::public.grid_type_enum, '{"tipo":"accesorio batería","uso":"Pylontech UP5000"}'::jsonb),
  ('046039', 'BAT', null::public.grid_type_enum, '{"tipo":"accesorio batería","uso":"Pylontech US3000"}'::jsonb),
  ('040038', 'BAT', null::public.grid_type_enum, '{"tipo":"accesorio batería","uso":"Pylontech + Victron"}'::jsonb),
  ('576104', 'BAT', null::public.grid_type_enum, '{"tipo":"accesorio batería","uso":"Solplanet BV"}'::jsonb),
  ('576108', 'BAT', null::public.grid_type_enum, '{"tipo":"accesorio batería","uso":"Conexión inter-baterías"}'::jsonb),
  ('576022', 'BAT', null::public.grid_type_enum, '{"tipo":"accesorio batería","uso":"Bancos 12V o 24V"}'::jsonb),
  ('576023', 'BAT', null::public.grid_type_enum, '{"tipo":"accesorio batería","uso":"Bancos 48V"}'::jsonb),
  ('576173', 'BAT', null::public.grid_type_enum, '{"tipo":"accesorio batería","uso":"QMAX litio"}'::jsonb),
  ('576138', 'BAT', null::public.grid_type_enum, '{"tipo":"accesorio batería","uso":"Solplanet alto voltaje"}'::jsonb),
  ('576149', 'BAT', null::public.grid_type_enum, '{"tipo":"accesorio batería","uso":"Chisage rack"}'::jsonb),
  ('575779', 'REG', null::public.grid_type_enum, '{"tipo":"regulador MPPT","tension_bateria":"12/24/48V","corriente":"20A","pv_max":"12V-290W / 24V-580W / 48V-1160W","notas":"Alta calidad"}'::jsonb),
  ('575781', 'REG', null::public.grid_type_enum, '{"tipo":"regulador MPPT","tension_bateria":"12/24/36/48V","corriente":"35A","pv_max":"12V-500W / 48V-2000W"}'::jsonb),
  ('576118', 'REG', null::public.grid_type_enum, '{"tipo":"regulador MPPT","tension_bateria":"12/24/36/48V","corriente":"100A","pv_max":"Voc máx 250V","notas":"5 años garantía"}'::jsonb),
  ('576147', 'REG', null::public.grid_type_enum, '{"tipo":"regulador MPPT","tension_bateria":"12/24/48V","corriente":"80A","pv_max":"1250W-50V (1MPPT)","notas":"Apto litio/AGM/GEL"}'::jsonb),
  ('576055', 'REG', null::public.grid_type_enum, '{"tipo":"regulador MPPT","tension_bateria":"12/24/48V","corriente":"80A","pv_max":"1250W-50V","notas":"Apto litio/AGM/GEL/ácido"}'::jsonb),
  ('575863', 'REG', null::public.grid_type_enum, '{"tipo":"regulador MPPT","corriente":"60A"}'::jsonb),
  ('575896', 'REG', null::public.grid_type_enum, '{"tipo":"regulador MPPT","corriente":"75A"}'::jsonb),
  ('575897', 'REG', null::public.grid_type_enum, '{"tipo":"regulador MPPT","corriente":"20A"}'::jsonb),
  ('576111', 'REG', null::public.grid_type_enum, '{"tipo":"regulador MPPT","tension_bateria":"12/24/48V","corriente":"60A","pv_max":"hasta 4800W/48V"}'::jsonb),
  ('576150', 'REG', null::public.grid_type_enum, '{"tipo":"regulador MPPT","tension_bateria":"12/24/48V","corriente":"100A"}'::jsonb),
  ('576036', 'REG', null::public.grid_type_enum, '{"tipo":"regulador MPPT","tension_bateria":"12/24/48V","corriente":"var."}'::jsonb),
  ('045001', 'REG', null::public.grid_type_enum, '{"tipo":"regulador PWM","tension_bateria":"12/24V","corriente":"10A","pv_max":"130W/12V · 260W/24V","notas":"Off-grid muy pequeño"}'::jsonb),
  ('045002', 'REG', null::public.grid_type_enum, '{"tipo":"regulador PWM","tension_bateria":"12/24V","corriente":"20A","pv_max":"260W/12V · 520W/24V"}'::jsonb),
  ('045003', 'REG', null::public.grid_type_enum, '{"tipo":"regulador PWM","tension_bateria":"12/24V","corriente":"20A","pv_max":"300W/12V · 600W/24V","notas":"Visualiz. por app"}'::jsonb),
  ('045009', 'REG', null::public.grid_type_enum, '{"tipo":"regulador PWM","tension_bateria":"12/24V","corriente":"30A","pv_max":"390W/12V · 780W/24V"}'::jsonb),
  ('046036', 'REG', null::public.grid_type_enum, '{"tipo":"regulador PWM","tension_bateria":"12/24V","corriente":"60A","pv_max":"780W/12V · 1560W/24V"}'::jsonb),
  ('575804', 'REG', null::public.grid_type_enum, '{"tipo":"regulador PWM","tension_bateria":"12/24V","corriente":"20A","pv_max":"260W/12V · 520W/24V","notas":"Apto litio — Kit off-grid medio"}'::jsonb),
  ('575892', 'REG', null::public.grid_type_enum, '{"tipo":"regulador PWM","tension_bateria":"12/24V","corriente":"40A","pv_max":"540W/12V · 1040W/24V"}'::jsonb),
  ('576151', 'REG', null::public.grid_type_enum, '{"tipo":"regulador PWM","tension_bateria":"12/24V","corriente":"30A"}'::jsonb),
  ('036025', 'CAB', null::public.grid_type_enum, '{"tipo":"cable solar","seccion":"6mm²","color":"Rojo"}'::jsonb),
  ('036026', 'CAB', null::public.grid_type_enum, '{"tipo":"cable solar","seccion":"6mm²","color":"Negro"}'::jsonb),
  ('037036', 'CAB', null::public.grid_type_enum, '{"tipo":"cable solar","seccion":"4mm²","color":"Rojo","norma":"EN50618"}'::jsonb),
  ('037037', 'CAB', null::public.grid_type_enum, '{"tipo":"cable solar","seccion":"4mm²","color":"Negro","norma":"EN50618"}'::jsonb),
  ('575843', 'CAB', null::public.grid_type_enum, '{"tipo":"cable solar","seccion":"3mm"}'::jsonb),
  ('037002', 'CAB', null::public.grid_type_enum, '{"tipo":"conector","uso":"String estándar — uso general"}'::jsonb),
  ('037010', 'CAB', null::public.grid_type_enum, '{"tipo":"conector","uso":"Ramas adicionales"}'::jsonb),
  ('037023', 'CAB', null::public.grid_type_enum, '{"tipo":"conector","uso":"Combinador 4 strings en 1"}'::jsonb),
  ('037024', 'CAB', null::public.grid_type_enum, '{"tipo":"conector","uso":"Combinador 3 strings en 1"}'::jsonb),
  ('037056', 'CAB', null::public.grid_type_enum, '{"tipo":"conector","uso":"String con fusible integrado"}'::jsonb),
  ('MC4-CON2', 'CAB', null::public.grid_type_enum, '{"tipo":"conector","uso":"Sistemas de alta tensión"}'::jsonb),
  ('037026', 'MON', null::public.grid_type_enum, '{"tipo":"limitador de inyección","formato":"Monofásico","compatible_con":"Growatt on-grid / híbrido mono"}'::jsonb),
  ('038006', 'MON', null::public.grid_type_enum, '{"tipo":"limitador de inyección","formato":"Trifásico","compatible_con":"Growatt trifásico"}'::jsonb),
  ('576086', 'MON', null::public.grid_type_enum, '{"tipo":"limitador de inyección","formato":"Trifásico","compatible_con":"Growatt trifásico (alta corriente)"}'::jsonb),
  ('576101', 'MON', null::public.grid_type_enum, '{"tipo":"limitador de inyección","formato":"Trifásico","compatible_con":"Solplanet"}'::jsonb),
  ('576124', 'MON', null::public.grid_type_enum, '{"tipo":"limitador de inyección","formato":"Trifásico","compatible_con":"Huawei"}'::jsonb),
  ('576128', 'MON', null::public.grid_type_enum, '{"tipo":"limitador de inyección","formato":"Trifásico","compatible_con":"Deye string on-grid"}'::jsonb),
  ('576196', 'MON', null::public.grid_type_enum, '{"tipo":"limitador de inyección","formato":"Trifásico","compatible_con":"Solplanet"}'::jsonb),
  ('040014', 'PRO', null::public.grid_type_enum, '{"tipo":"descargador (SPD)","tension":"1000Vcc","corriente":"40kA","aplicacion":"DC — uso general en kits"}'::jsonb),
  ('575741', 'PRO', null::public.grid_type_enum, '{"tipo":"descargador (SPD)","tension":"500Vcc","aplicacion":"DC — sistemas pequeños off-grid"}'::jsonb),
  ('575821', 'PRO', null::public.grid_type_enum, '{"tipo":"descargador (SPD)","tension":"275V AC","corriente":"30kVA","aplicacion":"AC — híbridos y off-grid"}'::jsonb),
  ('575800', 'PRO', null::public.grid_type_enum, '{"tipo":"descargador (SPD)","tension":"420V AC","corriente":"40kA","aplicacion":"AC — trifásico"}'::jsonb),
  ('040037', 'PRO', null::public.grid_type_enum, '{"tipo":"descargador (SPD)","tension":"1040Vcc","corriente":"40kA","aplicacion":"DC"}'::jsonb),
  ('575868', 'PRO', null::public.grid_type_enum, '{"tipo":"descargador (SPD)","tension":"275V AC","corriente":"60kA","aplicacion":"AC monopolar"}'::jsonb),
  ('575814', 'PRO', null::public.grid_type_enum, '{"tipo":"descargador (SPD)","aplicacion":"Repuesto SPD"}'::jsonb),
  ('575815', 'PRO', null::public.grid_type_enum, '{"tipo":"descargador (SPD)","tension":"220/400V","corriente":"40A","aplicacion":"Protección sobretensión AC"}'::jsonb),
  ('040045', 'PRO', null::public.grid_type_enum, '{"tipo":"fusible","corriente":"70A","formato":"ANL","notas":"Off-grid pequeño"}'::jsonb),
  ('040046', 'PRO', null::public.grid_type_enum, '{"tipo":"fusible","corriente":"60A","formato":"ANL"}'::jsonb),
  ('040022', 'PRO', null::public.grid_type_enum, '{"tipo":"fusible","corriente":"80A","formato":"ANL"}'::jsonb),
  ('040021', 'PRO', null::public.grid_type_enum, '{"tipo":"fusible","corriente":"100A","formato":"ANL","notas":"Kits on-grid bajo / híbrido bajo"}'::jsonb),
  ('040001', 'PRO', null::public.grid_type_enum, '{"tipo":"fusible","corriente":"130A","formato":"ANL"}'::jsonb),
  ('040020', 'PRO', null::public.grid_type_enum, '{"tipo":"fusible","corriente":"150A","formato":"ANL","notas":"Kits on-grid medio y alto"}'::jsonb),
  ('575962', 'PRO', null::public.grid_type_enum, '{"tipo":"fusible","corriente":"175A","formato":"ANL"}'::jsonb),
  ('574687', 'PRO', null::public.grid_type_enum, '{"tipo":"fusible","corriente":"200A","formato":"ANL"}'::jsonb),
  ('575963', 'PRO', null::public.grid_type_enum, '{"tipo":"fusible","corriente":"300A","formato":"ANL","notas":"Sistemas grandes"}'::jsonb),
  ('040024', 'PRO', null::public.grid_type_enum, '{"tipo":"fusible","corriente":"50A","formato":"DC cilíndrico"}'::jsonb),
  ('040027', 'PRO', null::public.grid_type_enum, '{"tipo":"fusible","corriente":"var.","formato":"Cartucho","notas":"Protección string"}'::jsonb),
  ('576199', 'PRO', null::public.grid_type_enum, '{"tipo":"fusible","corriente":"25A","formato":"Cartucho 1000V","notas":"Alta tensión DC"}'::jsonb),
  ('575859', 'PRO', null::public.grid_type_enum, '{"tipo":"fusible","formato":"Portafusible","notas":"Siempre con fusible ANL"}'::jsonb),
  ('040026', 'PRO', null::public.grid_type_enum, '{"tipo":"fusible","formato":"Portafusible"}'::jsonb),
  ('575955', 'PRO', null::public.grid_type_enum, '{"tipo":"fusible","formato":"Portafusible","notas":"Alta tensión"}'::jsonb),
  ('040002', 'PRO', null::public.grid_type_enum, '{"tipo":"fusible","corriente":"20A"}'::jsonb),
  ('575957', 'PRO', null::public.grid_type_enum, '{"tipo":"interruptor CC","tension":"500V","corriente":"20A","notas":"Off-grid pequeño"}'::jsonb),
  ('575956', 'PRO', null::public.grid_type_enum, '{"tipo":"interruptor CC","tension":"550V","corriente":"40A","polos":"2P","notas":"Kits on-grid bajo / híbrido bajo"}'::jsonb),
  ('576056', 'PRO', null::public.grid_type_enum, '{"tipo":"interruptor CC","tension":"550V","corriente":"63A","polos":"2P","notas":"Kits on-grid medio / híbrido medio"}'::jsonb),
  ('040023', 'PRO', null::public.grid_type_enum, '{"tipo":"interruptor CC","tension":"1000V","corriente":"40A","polos":"4P"}'::jsonb),
  ('576159', 'PRO', null::public.grid_type_enum, '{"tipo":"interruptor CC","tension":"1000V","corriente":"20A","polos":"4P","notas":"Kits on-grid alto / híbrido alto"}'::jsonb),
  ('576160', 'PRO', null::public.grid_type_enum, '{"tipo":"interruptor CC","tension":"1000V","corriente":"32A","polos":"4P"}'::jsonb),
  ('040036', 'PRO', null::public.grid_type_enum, '{"tipo":"interruptor CC","corriente":"50A","polos":"2P"}'::jsonb),
  ('040040', 'PRO', null::public.grid_type_enum, '{"tipo":"interruptor CC","corriente":"32A","polos":"2P"}'::jsonb),
  ('040041', 'PRO', null::public.grid_type_enum, '{"tipo":"interruptor CC","corriente":"40A","polos":"2P"}'::jsonb),
  ('040047', 'PRO', null::public.grid_type_enum, '{"tipo":"interruptor CC","corriente":"10A","polos":"2P"}'::jsonb),
  ('040030', 'PRO', null::public.grid_type_enum, '{"tipo":"interruptor CC","corriente":"40A","polos":"2P"}'::jsonb),
  ('575894', 'PRO', null::public.grid_type_enum, '{"tipo":"interruptor CA","tension":"CA","corriente":"25A"}'::jsonb),
  ('575895', 'PRO', null::public.grid_type_enum, '{"tipo":"interruptor CA","tension":"CA","corriente":"32A"}'::jsonb),
  ('576085', 'PRO', null::public.grid_type_enum, '{"tipo":"disyuntor diferencial","corriente":"40A","sensibilidad":"300mA","polos":"4P"}'::jsonb),
  ('576109', 'PRO', null::public.grid_type_enum, '{"tipo":"disyuntor diferencial","corriente":"25A"}'::jsonb),
  ('576130', 'PRO', null::public.grid_type_enum, '{"tipo":"disyuntor diferencial","corriente":"40A","polos":"4P"}'::jsonb),
  ('576131', 'PRO', null::public.grid_type_enum, '{"tipo":"disyuntor diferencial","corriente":"63A","sensibilidad":"30mA","polos":"4P"}'::jsonb),
  ('576045', 'EST', null::public.grid_type_enum, '{"tipo":"soporte coplanar","marco":"30mm","notas":"Uso principal en todos los kits"}'::jsonb),
  ('576046', 'EST', null::public.grid_type_enum, '{"tipo":"soporte coplanar","marco":"30mm"}'::jsonb),
  ('575839', 'EST', null::public.grid_type_enum, '{"tipo":"soporte coplanar","marco":"30mm","notas":"Kit off-grid bajo"}'::jsonb),
  ('575824', 'EST', null::public.grid_type_enum, '{"tipo":"soporte coplanar","marco":"35mm","notas":"Para paneles con marco 35mm"}'::jsonb),
  ('037063', 'EST', null::public.grid_type_enum, '{"tipo":"soporte coplanar","notas":"1 unidad"}'::jsonb),
  ('575769', 'EST', null::public.grid_type_enum, '{"tipo":"estructura triangular","marco":"30mm"}'::jsonb),
  ('575768', 'EST', null::public.grid_type_enum, '{"tipo":"estructura triangular","marco":"30mm","notas":"Opcional KIT_ON_MEDIO"}'::jsonb),
  ('576068', 'EST', null::public.grid_type_enum, '{"tipo":"estructura triangular","marco":"30mm","notas":"Kits on-grid alto y off-grid alto"}'::jsonb),
  ('575835', 'EST', null::public.grid_type_enum, '{"tipo":"estructura triangular","marco":"35mm"}'::jsonb),
  ('576114', 'EST', null::public.grid_type_enum, '{"tipo":"estructura a suelo","capacidad":"4 paneles"}'::jsonb),
  ('576119', 'EST', null::public.grid_type_enum, '{"tipo":"estructura a suelo","capacidad":"4 paneles"}'::jsonb),
  ('576110', 'EST', null::public.grid_type_enum, '{"tipo":"estructura a suelo","capacidad":"20 paneles","notas":"Campo / instalaciones grandes"}'::jsonb),
  ('037019', 'EST', null::public.grid_type_enum, '{"tipo":"accesorio de soporte","uso":"Perfil Mibet/Wega"}'::jsonb),
  ('037020', 'EST', null::public.grid_type_enum, '{"tipo":"accesorio de soporte","uso":"Perfil Mibet/Wega"}'::jsonb),
  ('575825', 'EST', null::public.grid_type_enum, '{"tipo":"accesorio de soporte","uso":"Wega"}'::jsonb),
  ('575916', 'EST', null::public.grid_type_enum, '{"tipo":"accesorio de soporte","uso":"Wega"}'::jsonb),
  ('576047', 'EST', null::public.grid_type_enum, '{"tipo":"accesorio de soporte","uso":"Mibet — extensión de riel"}'::jsonb),
  ('037059', 'EST', null::public.grid_type_enum, '{"tipo":"accesorio de soporte","uso":"Tejas"}'::jsonb),
  ('037060', 'EST', null::public.grid_type_enum, '{"tipo":"accesorio de soporte","uso":"Estructura metálica"}'::jsonb),
  ('037061', 'EST', null::public.grid_type_enum, '{"tipo":"accesorio de soporte","uso":"Estructura metálica"}'::jsonb),
  ('037062', 'EST', null::public.grid_type_enum, '{"tipo":"accesorio de soporte","uso":"Estructura metálica"}'::jsonb),
  ('576182', 'EST', null::public.grid_type_enum, '{"tipo":"accesorio de soporte","uso":"Chapa corrugada"}'::jsonb),
  ('576183', 'EST', null::public.grid_type_enum, '{"tipo":"accesorio de soporte"}'::jsonb),
  ('575983', 'EST', null::public.grid_type_enum, '{"tipo":"accesorio de soporte","uso":"Batería ARK Growatt"}'::jsonb),
  ('576010', 'EST', null::public.grid_type_enum, '{"tipo":"estructura a suelo","peso":"42 kg","uso":"Lastrado estructura campo"}'::jsonb),
  ('576171', 'EST', null::public.grid_type_enum, '{"tipo":"estructura a suelo","peso":"22 kg","uso":"Lastrado estructura pequeña"}'::jsonb),
  ('575813', 'EST', null::public.grid_type_enum, '{"tipo":"soporte vehículo","notas":"Motorhomes"}'::jsonb)
)
update public.products p set
  category_id = c.id,
  grid_type = coalesce(src.grid, p.grid_type),
  generic_properties = coalesce(p.generic_properties, '{}'::jsonb) || src.props
from src
join public.product_categories c on c.prefix = src.prefix
where p.product_code = src.code;

-- El resto (productos ajenos, servicios) va a "Otros". Se borra la categoría Colchones.
update public.products set category_id = (select id from public.product_categories where prefix = 'OTR')
where category_id is null
   or category_id = (select id from public.product_categories where prefix = 'COL');
delete from public.product_categories where prefix = 'COL';

-- Kits predefinidos
insert into public.kits (code, name, grid_type, phases, battery_voltage, kwp, battery_kwh, inverter_kw,
  est_kwh_month, ref_kwh_month_min, ref_kwh_month_max, description, notes, sort_order)
values ('KIT_ON_BAJO', 'On-grid entrada 1.4 kW Growatt', 'ON-GRID', 'mono', null, 1.38, 0, 1.5,
  137, 150, 200, 'Depto o pareja sin AC. Ideal con factura de 150–180 kWh/mes; arriba de 200 evaluar KIT_ON_MEDIO.', 'Sin respaldo ante cortes de red.', 1)
on conflict (code) do nothing;

insert into public.kit_items (kit_id, product_id, qty, sort_order)
select k.id, p.id, v.qty, v.ord
from (values
  ('037046', 3, 1),
  ('036076', 1, 2),
  ('037030', 1, 3),
  ('037026', 1, 4),
  ('037002', 4, 5),
  ('036025', 15, 6),
  ('036026', 15, 7),
  ('576045', 2, 8),
  ('040014', 1, 9),
  ('575956', 1, 10),
  ('040021', 1, 11),
  ('575859', 1, 12),
  ('576085', 1, 13)
) as v(code, qty, ord)
join public.kits k on k.code = 'KIT_ON_BAJO'
join public.products p on p.product_code = v.code
on conflict (kit_id, product_id) do nothing;

insert into public.kit_options (kit_id, code, kind, name, changes, kwp, battery_kwh, est_kwh_month, notes, sort_order)
select k.id, v.code, v.kind, v.name, v.changes::jsonb, v.kwp, v.battery_kwh, v.est, v.notes, v.ord
from (values
  ('G1', 'generation', 'Growatt 2000W ampliado (+1 panel)', '[{"op":"remove","product_code":"036076"},{"op":"add","product_code":"576009","qty":1},{"op":"add","product_code":"037046","qty":1}]', 1.84::numeric, null::numeric, 182::numeric, null, 1),
  ('G2', 'generation', 'Alternativa Deye 2 kW (6× 410 Wp)', '[{"op":"remove","product_code":"037046"},{"op":"set","product_code":"575901","qty":6},{"op":"remove","product_code":"036076"},{"op":"remove","product_code":"037030"},{"op":"add","product_code":"576178","qty":1}]', 2.46::numeric, null::numeric, 244::numeric, 'Deye incluye WiFi y CT: no lleva dongle Growatt.', 2),
  ('E1', 'extra', 'Dongle WiFi Nueva Línea X', '[{"op":"add","product_code":"039016","qty":1}]', null::numeric, null::numeric, null::numeric, null, 3),
  ('E2', 'extra', 'Kit acople riel Mibet 100mm', '[{"op":"add","product_code":"576047","qty":1}]', null::numeric, null::numeric, null::numeric, null, 4),
  ('E3', 'extra', 'Conector MC4 1A2 (ramas adicionales)', '[{"op":"add","product_code":"037010","qty":1}]', null::numeric, null::numeric, null::numeric, null, 5)
) as v(code, kind, name, changes, kwp, battery_kwh, est, notes, ord)
join public.kits k on k.code = 'KIT_ON_BAJO'
on conflict (kit_id, code) do nothing;

insert into public.kits (code, name, grid_type, phases, battery_voltage, kwp, battery_kwh, inverter_kw,
  est_kwh_month, ref_kwh_month_min, ref_kwh_month_max, description, notes, sort_order)
values ('KIT_ON_MEDIO', 'On-grid residencial 3.3 kW Growatt', 'ON-GRID', 'mono', null, 3.28, 0, 3,
  325, 250, 350, 'Familia media con 1 AC y lavarropas. Arriba de 350 kWh/mes estables evaluar KIT_ON_ALTO.', 'Sin respaldo ante cortes de red.', 2)
on conflict (code) do nothing;

insert into public.kit_items (kit_id, product_id, qty, sort_order)
select k.id, p.id, v.qty, v.ord
from (values
  ('549423', 8, 1),
  ('576044', 1, 2),
  ('037030', 1, 3),
  ('037026', 1, 4),
  ('037002', 10, 5),
  ('036025', 30, 6),
  ('036026', 30, 7),
  ('576045', 4, 8),
  ('040014', 1, 9),
  ('576056', 1, 10),
  ('040020', 1, 11),
  ('575859', 1, 12),
  ('576085', 1, 13)
) as v(code, qty, ord)
join public.kits k on k.code = 'KIT_ON_MEDIO'
join public.products p on p.product_code = v.code
on conflict (kit_id, product_id) do nothing;

insert into public.kit_options (kit_id, code, kind, name, changes, kwp, battery_kwh, est_kwh_month, notes, sort_order)
select k.id, v.code, v.kind, v.name, v.changes::jsonb, v.kwp, v.battery_kwh, v.est, v.notes, v.ord
from (values
  ('G1', 'generation', 'Growatt 4.2 kW (10 paneles)', '[{"op":"set","product_code":"549423","qty":10},{"op":"remove","product_code":"576044"},{"op":"add","product_code":"037005","qty":1}]', 4.1::numeric, null::numeric, 406::numeric, null, 1),
  ('G2', 'generation', 'Alternativa Deye 2 kW (6× 460 Wp)', '[{"op":"remove","product_code":"549423"},{"op":"set","product_code":"575837","qty":6},{"op":"remove","product_code":"576044"},{"op":"remove","product_code":"037030"},{"op":"add","product_code":"576178","qty":1}]', 2.76::numeric, null::numeric, 273::numeric, 'Deye incluye WiFi y CT: no lleva dongle Growatt.', 2),
  ('E1', 'extra', 'Conector MC4 Branch 4A1 ×2', '[{"op":"add","product_code":"037023","qty":2}]', null::numeric, null::numeric, null::numeric, null, 3),
  ('E2', 'extra', 'Kit acople riel Mibet 100mm', '[{"op":"add","product_code":"576047","qty":1}]', null::numeric, null::numeric, null::numeric, null, 4),
  ('E3', 'extra', 'Techo plano: soporte triangular Wega', '[{"op":"add","product_code":"575769","qty":4},{"op":"remove","product_code":"576045"}]', null::numeric, null::numeric, null::numeric, 'El .md pedía el SKU 575768, que no existe; se usa 575769 (mismo soporte).', 5)
) as v(code, kind, name, changes, kwp, battery_kwh, est, notes, ord)
join public.kits k on k.code = 'KIT_ON_MEDIO'
on conflict (kit_id, code) do nothing;

insert into public.kits (code, name, grid_type, phases, battery_voltage, kwp, battery_kwh, inverter_kw,
  est_kwh_month, ref_kwh_month_min, ref_kwh_month_max, description, notes, sort_order)
values ('KIT_ON_ALTO', 'On-grid alta demanda 5.7 kW Growatt', 'ON-GRID', 'mono', null, 5.74, 0, 6,
  568, 450, 600, 'Familia de alta demanda con varios AC y termotanque. Arriba de 700 kWh/mes evaluar trifásico.', 'Sin respaldo ante cortes de red. Llevar AC y termotanque a horario solar.', 3)
on conflict (code) do nothing;

insert into public.kit_items (kit_id, product_id, qty, sort_order)
select k.id, p.id, v.qty, v.ord
from (values
  ('549423', 14, 1),
  ('039014', 1, 2),
  ('039016', 1, 3),
  ('037026', 1, 4),
  ('037002', 16, 5),
  ('037023', 2, 6),
  ('036025', 50, 7),
  ('036026', 50, 8),
  ('576045', 7, 9),
  ('040014', 2, 10),
  ('576159', 1, 11),
  ('040020', 1, 12),
  ('575859', 1, 13),
  ('576131', 1, 14)
) as v(code, qty, ord)
join public.kits k on k.code = 'KIT_ON_ALTO'
join public.products p on p.product_code = v.code
on conflict (kit_id, product_id) do nothing;

insert into public.kit_options (kit_id, code, kind, name, changes, kwp, battery_kwh, est_kwh_month, notes, sort_order)
select k.id, v.code, v.kind, v.name, v.changes::jsonb, v.kwp, v.battery_kwh, v.est, v.notes, v.ord
from (values
  ('G1', 'generation', 'Paneles 595 Wp (12×)', '[{"op":"remove","product_code":"549423"},{"op":"set","product_code":"046005","qty":12},{"op":"set","product_code":"576045","qty":6}]', 7.14::numeric, null::numeric, 707::numeric, 'El .md decía 16× 595 Wp = 7.140 Wp (inconsistente); se usan 12× 595 Wp = 7.140 Wp.', 1),
  ('G2', 'generation', 'Trifásico Growatt 10 kW (18× 585 Wp)', '[{"op":"remove","product_code":"549423"},{"op":"set","product_code":"576043","qty":18},{"op":"remove","product_code":"039014"},{"op":"add","product_code":"575973","qty":1},{"op":"remove","product_code":"037026"},{"op":"add","product_code":"038006","qty":1},{"op":"set","product_code":"576045","qty":9}]', 10.53::numeric, null::numeric, 1042::numeric, null, 2),
  ('E1', 'extra', 'Soporte triangular telescópico Mibet', '[{"op":"add","product_code":"576068","qty":1}]', null::numeric, null::numeric, null::numeric, null, 3),
  ('E2', 'extra', 'Kit acople riel Mibet 100mm', '[{"op":"add","product_code":"576047","qty":1}]', null::numeric, null::numeric, null::numeric, null, 4)
) as v(code, kind, name, changes, kwp, battery_kwh, est, notes, ord)
join public.kits k on k.code = 'KIT_ON_ALTO'
on conflict (kit_id, code) do nothing;

insert into public.kits (code, name, grid_type, phases, battery_voltage, kwp, battery_kwh, inverter_kw,
  est_kwh_month, ref_kwh_month_min, ref_kwh_month_max, description, notes, sort_order)
values ('KIT_HYB_BAJO', 'Híbrido 1.6 kW SPH 3 kW + Pylontech 4.8 kWh', 'HYBRID', 'mono', 48, 1.64, 4.8, 3,
  162, 150, 250, 'Depto o pareja con respaldo ante cortes. En corte alimenta heladera, LED y router.', 'Autonomía 4–5 h @ ~500 W críticos. No usar AC ni termotanque en corte con el banco base.', 4)
on conflict (code) do nothing;

insert into public.kit_items (kit_id, product_id, qty, sort_order)
select k.id, p.id, v.qty, v.ord
from (values
  ('549423', 4, 1),
  ('038017', 1, 2),
  ('037030', 1, 3),
  ('037026', 1, 4),
  ('046040', 1, 5),
  ('046038', 1, 6),
  ('037002', 6, 7),
  ('036025', 20, 8),
  ('036026', 20, 9),
  ('576045', 2, 10),
  ('040014', 1, 11),
  ('575821', 1, 12),
  ('575956', 1, 13),
  ('576023', 1, 14),
  ('040021', 1, 15),
  ('575859', 1, 16),
  ('576085', 1, 17)
) as v(code, qty, ord)
join public.kits k on k.code = 'KIT_HYB_BAJO'
join public.products p on p.product_code = v.code
on conflict (kit_id, product_id) do nothing;

insert into public.kit_options (kit_id, code, kind, name, changes, kwp, battery_kwh, est_kwh_month, notes, sort_order)
select k.id, v.code, v.kind, v.name, v.changes::jsonb, v.kwp, v.battery_kwh, v.est, v.notes, v.ord
from (values
  ('A1', 'autonomy', '2× Pylontech (9.6 kWh)', '[{"op":"add","product_code":"046040","qty":1},{"op":"add","product_code":"046038","qty":1}]', null::numeric, 9.6::numeric, null::numeric, null, 1),
  ('A2', 'autonomy', '3× Pylontech (14.4 kWh)', '[{"op":"add","product_code":"046040","qty":2},{"op":"add","product_code":"046038","qty":2}]', null::numeric, 14.4::numeric, null::numeric, null, 2),
  ('A3', 'autonomy', '1× Growatt Hope 5.5 kWh (reemplaza Pylontech)', '[{"op":"remove","product_code":"046040"},{"op":"remove","product_code":"046038"},{"op":"add","product_code":"575917","qty":1},{"op":"add","product_code":"575928","qty":1}]', null::numeric, 5.5::numeric, null::numeric, null, 3),
  ('A4', 'autonomy', '2× Growatt Hope (11 kWh)', '[{"op":"remove","product_code":"046040"},{"op":"remove","product_code":"046038"},{"op":"add","product_code":"575917","qty":2},{"op":"add","product_code":"575928","qty":2}]', null::numeric, 11::numeric, null::numeric, null, 4),
  ('G1', 'generation', 'Growatt SPH 3.6 kW (6 paneles)', '[{"op":"set","product_code":"549423","qty":6},{"op":"remove","product_code":"038017"},{"op":"add","product_code":"038018","qty":1},{"op":"set","product_code":"576045","qty":3}]', 2.46::numeric, null::numeric, 244::numeric, null, 5),
  ('G2', 'generation', 'Alternativa Deye 3.6 kW + Deye 5.12 kWh', '[{"op":"set","product_code":"549423","qty":6},{"op":"remove","product_code":"038017"},{"op":"remove","product_code":"037030"},{"op":"add","product_code":"575849","qty":1},{"op":"remove","product_code":"046040"},{"op":"remove","product_code":"046038"},{"op":"add","product_code":"575988","qty":1},{"op":"set","product_code":"576045","qty":3}]', 2.46::numeric, 5.12::numeric, 244::numeric, null, 6),
  ('E1', 'extra', 'Conector Victron VE.Can a CAN-bus BMS', '[{"op":"add","product_code":"040038","qty":1}]', null::numeric, null::numeric, null::numeric, null, 7),
  ('E2', 'extra', 'Conector puente baterías 25mm', '[{"op":"add","product_code":"576108","qty":1}]', null::numeric, null::numeric, null::numeric, null, 8)
) as v(code, kind, name, changes, kwp, battery_kwh, est, notes, ord)
join public.kits k on k.code = 'KIT_HYB_BAJO'
on conflict (kit_id, code) do nothing;

insert into public.kits (code, name, grid_type, phases, battery_voltage, kwp, battery_kwh, inverter_kw,
  est_kwh_month, ref_kwh_month_min, ref_kwh_month_max, description, notes, sort_order)
values ('KIT_HYB_MEDIO', 'Híbrido 3.3 kW SPH 5 kW + Hope 5.5 kWh', 'HYBRID', 'mono', 48, 3.28, 5.5, 5,
  325, 300, 500, 'Familia media con respaldo. En corte: heladera, luces y presurizadora.', 'Autonomía 5–6 h @ ~800 W. AC en corte solo con 2× Hope o más.', 5)
on conflict (code) do nothing;

insert into public.kit_items (kit_id, product_id, qty, sort_order)
select k.id, p.id, v.qty, v.ord
from (values
  ('549423', 8, 1),
  ('038019', 1, 2),
  ('037030', 1, 3),
  ('037026', 1, 4),
  ('575917', 1, 5),
  ('575928', 1, 6),
  ('037002', 10, 7),
  ('036025', 30, 8),
  ('036026', 30, 9),
  ('576045', 4, 10),
  ('040014', 1, 11),
  ('575821', 1, 12),
  ('576056', 1, 13),
  ('576023', 1, 14),
  ('040020', 1, 15),
  ('575859', 1, 16),
  ('576085', 1, 17)
) as v(code, qty, ord)
join public.kits k on k.code = 'KIT_HYB_MEDIO'
join public.products p on p.product_code = v.code
on conflict (kit_id, product_id) do nothing;

insert into public.kit_options (kit_id, code, kind, name, changes, kwp, battery_kwh, est_kwh_month, notes, sort_order)
select k.id, v.code, v.kind, v.name, v.changes::jsonb, v.kwp, v.battery_kwh, v.est, v.notes, v.ord
from (values
  ('A1', 'autonomy', '2× Hope (11 kWh)', '[{"op":"add","product_code":"575917","qty":1},{"op":"add","product_code":"575928","qty":1}]', null::numeric, 11::numeric, null::numeric, null, 1),
  ('A2', 'autonomy', '3× Hope (16.5 kWh)', '[{"op":"add","product_code":"575917","qty":2},{"op":"add","product_code":"575928","qty":2}]', null::numeric, 16.5::numeric, null::numeric, null, 2),
  ('A3', 'autonomy', '1× Pylontech 4.8 kWh (reemplaza Hope)', '[{"op":"remove","product_code":"575917"},{"op":"remove","product_code":"575928"},{"op":"add","product_code":"046040","qty":1},{"op":"add","product_code":"046038","qty":1}]', null::numeric, 4.8::numeric, null::numeric, null, 3),
  ('A4', 'autonomy', '2× Pylontech (9.6 kWh)', '[{"op":"remove","product_code":"575917"},{"op":"remove","product_code":"575928"},{"op":"add","product_code":"046040","qty":2},{"op":"add","product_code":"046038","qty":2}]', null::numeric, 9.6::numeric, null::numeric, null, 4),
  ('G1', 'generation', 'SPH 3 kW más económico (4 paneles)', '[{"op":"set","product_code":"549423","qty":4},{"op":"remove","product_code":"038019"},{"op":"add","product_code":"038017","qty":1},{"op":"set","product_code":"576045","qty":2}]', 1.64::numeric, null::numeric, 162::numeric, null, 5),
  ('G2', 'generation', 'Alternativa Deye 5 kW + Chisage 5.12 kWh', '[{"op":"set","product_code":"549423","qty":10},{"op":"remove","product_code":"038019"},{"op":"remove","product_code":"037030"},{"op":"add","product_code":"575842","qty":1},{"op":"remove","product_code":"575917"},{"op":"remove","product_code":"575928"},{"op":"add","product_code":"576094","qty":1},{"op":"set","product_code":"576045","qty":5}]', 4.1::numeric, 5.12::numeric, 406::numeric, null, 6),
  ('E1', 'extra', 'Kit cables batería Growatt AXE', '[{"op":"add","product_code":"575845","qty":1}]', null::numeric, null::numeric, null::numeric, null, 7),
  ('E2', 'extra', 'Kit base batería Growatt AXE', '[{"op":"add","product_code":"575846","qty":1}]', null::numeric, null::numeric, null::numeric, null, 8),
  ('E3', 'extra', 'Conector puente baterías 25mm', '[{"op":"add","product_code":"576108","qty":1}]', null::numeric, null::numeric, null::numeric, null, 9)
) as v(code, kind, name, changes, kwp, battery_kwh, est, notes, ord)
join public.kits k on k.code = 'KIT_HYB_MEDIO'
on conflict (kit_id, code) do nothing;

insert into public.kits (code, name, grid_type, phases, battery_voltage, kwp, battery_kwh, inverter_kw,
  est_kwh_month, ref_kwh_month_min, ref_kwh_month_max, description, notes, sort_order)
values ('KIT_HYB_ALTO', 'Híbrido trifásico 9.5 kW SPH 10 kW + 2× Hope', 'HYBRID', 'tri', 48, 9.52, 11, 10,
  943, 700, 1000, 'Alta demanda o comercio trifásico. La batería cubre circuitos críticos en corte.', 'Autonomía 6–7 h @ ~1.5 kW. Más de 1000 kWh/mes: análisis detallado.', 6)
on conflict (code) do nothing;

insert into public.kit_items (kit_id, product_id, qty, sort_order)
select k.id, p.id, v.qty, v.ord
from (values
  ('046005', 16, 1),
  ('038020', 1, 2),
  ('039016', 1, 3),
  ('038006', 1, 4),
  ('576086', 1, 5),
  ('575917', 2, 6),
  ('575928', 2, 7),
  ('037002', 18, 8),
  ('037023', 2, 9),
  ('036025', 60, 10),
  ('036026', 60, 11),
  ('576045', 8, 12),
  ('040014', 2, 13),
  ('575800', 1, 14),
  ('576159', 1, 15),
  ('576023', 1, 16),
  ('040020', 1, 17),
  ('575859', 1, 18),
  ('576131', 1, 19)
) as v(code, qty, ord)
join public.kits k on k.code = 'KIT_HYB_ALTO'
join public.products p on p.product_code = v.code
on conflict (kit_id, product_id) do nothing;

insert into public.kit_options (kit_id, code, kind, name, changes, kwp, battery_kwh, est_kwh_month, notes, sort_order)
select k.id, v.code, v.kind, v.name, v.changes::jsonb, v.kwp, v.battery_kwh, v.est, v.notes, v.ord
from (values
  ('A1', 'autonomy', '3× Hope (16.5 kWh)', '[{"op":"add","product_code":"575917","qty":1},{"op":"add","product_code":"575928","qty":1}]', null::numeric, 16.5::numeric, null::numeric, null, 1),
  ('A2', 'autonomy', '4× Hope (22 kWh)', '[{"op":"add","product_code":"575917","qty":2},{"op":"add","product_code":"575928","qty":2}]', null::numeric, 22::numeric, null::numeric, null, 2),
  ('A3', 'autonomy', 'Torre Growatt ARK 2.5H (consultar)', '[{"op":"add","product_code":"575978","qty":1},{"op":"add","product_code":"575979","qty":1},{"op":"add","product_code":"575982","qty":1}]', null::numeric, null::numeric, null::numeric, 'Verificar compatibilidad con SPH10000 trifásico antes de ofrecer.', 3),
  ('G1', 'generation', 'Monofásico SPH 5 kW (10× 410 Wp)', '[{"op":"remove","product_code":"046005"},{"op":"set","product_code":"549423","qty":10},{"op":"remove","product_code":"038020"},{"op":"add","product_code":"038019","qty":1},{"op":"remove","product_code":"039016"},{"op":"add","product_code":"037030","qty":1},{"op":"remove","product_code":"038006"},{"op":"remove","product_code":"576086"},{"op":"add","product_code":"037026","qty":1},{"op":"set","product_code":"576045","qty":5}]', 4.1::numeric, null::numeric, 406::numeric, 'Revisar protecciones AC (monofásico).', 4),
  ('G2', 'generation', 'Alternativa Deye 20 kW híbrido trifásico', '[{"op":"remove","product_code":"038020"},{"op":"add","product_code":"575989","qty":1}]', 9.52::numeric, null::numeric, 943::numeric, 'Banco de baterías a medida.', 5),
  ('E1', 'extra', 'Conector puente baterías 25mm ×2', '[{"op":"add","product_code":"576108","qty":2}]', null::numeric, null::numeric, null::numeric, null, 6),
  ('E2', 'extra', 'Soporte triangular telescópico Mibet', '[{"op":"add","product_code":"576068","qty":1}]', null::numeric, null::numeric, null::numeric, null, 7)
) as v(code, kind, name, changes, kwp, battery_kwh, est, notes, ord)
join public.kits k on k.code = 'KIT_HYB_ALTO'
on conflict (kit_id, code) do nothing;

insert into public.kits (code, name, grid_type, phases, battery_voltage, kwp, battery_kwh, inverter_kw,
  est_kwh_month, ref_kwh_month_min, ref_kwh_month_max, description, notes, sort_order)
values ('KIT_OFF_BAJO', 'Off-grid cabaña 450 W SPF 24V', 'OFF-GRID', 'mono', 24, 0.45, 2.64, 3,
  45, 30, 80, 'Cabaña o refugio sin red: heladera chica, LED y cargadores. Sin lavarropas ni AC.', 'Banco 24V: 4× Ritar 55Ah en 2S2P (~1.3 kWh útiles al 50 % DoD). Autonomía 4–6 h @ ~200 W.', 7)
on conflict (code) do nothing;

insert into public.kit_items (kit_id, product_id, qty, sort_order)
select k.id, p.id, v.qty, v.ord
from (values
  ('519961', 3, 1),
  ('038010', 1, 2),
  ('037042', 1, 3),
  ('037029', 4, 4),
  ('037002', 4, 5),
  ('037036', 10, 6),
  ('037037', 10, 7),
  ('575839', 2, 8),
  ('575741', 1, 9),
  ('575957', 1, 10),
  ('576022', 1, 11),
  ('040045', 1, 12),
  ('575859', 1, 13)
) as v(code, qty, ord)
join public.kits k on k.code = 'KIT_OFF_BAJO'
join public.products p on p.product_code = v.code
on conflict (kit_id, product_id) do nothing;

insert into public.kit_options (kit_id, code, kind, name, changes, kwp, battery_kwh, est_kwh_month, notes, sort_order)
select k.id, v.code, v.kind, v.name, v.changes::jsonb, v.kwp, v.battery_kwh, v.est, v.notes, v.ord
from (values
  ('A1', 'autonomy', '8× Ritar 55Ah (banco doble)', '[{"op":"add","product_code":"037029","qty":4}]', null::numeric, 5.28::numeric, null::numeric, null, 1),
  ('A2', 'autonomy', '4× GEL 100Ah (reemplaza Ritar)', '[{"op":"remove","product_code":"037029"},{"op":"add","product_code":"046024","qty":4}]', null::numeric, 4.8::numeric, null::numeric, null, 2),
  ('A3', 'autonomy', '4× GEL 75Ah (reemplaza Ritar)', '[{"op":"remove","product_code":"037029"},{"op":"add","product_code":"046014","qty":4}]', null::numeric, 3.6::numeric, null::numeric, null, 3),
  ('G1', 'generation', '+1 panel 150 Wp', '[{"op":"add","product_code":"519961","qty":1}]', 0.6::numeric, null::numeric, 59::numeric, null, 4),
  ('E1', 'extra', 'Módulo WiFi p/inversor Aexpert', '[{"op":"add","product_code":"038023","qty":1}]', null::numeric, null::numeric, null::numeric, null, 5),
  ('E2', 'extra', 'Seccionador CC 600V-16A', '[{"op":"add","product_code":"576021","qty":1}]', null::numeric, null::numeric, null::numeric, null, 6),
  ('E3', 'extra', 'Regulador PWM 20A apto litio', '[{"op":"add","product_code":"575804","qty":1}]', null::numeric, null::numeric, null::numeric, null, 7)
) as v(code, kind, name, changes, kwp, battery_kwh, est, notes, ord)
join public.kits k on k.code = 'KIT_OFF_BAJO'
on conflict (kit_id, code) do nothing;

insert into public.kits (code, name, grid_type, phases, battery_voltage, kwp, battery_kwh, inverter_kw,
  est_kwh_month, ref_kwh_month_min, ref_kwh_month_max, description, notes, sort_order)
values ('KIT_OFF_MEDIO', 'Off-grid vivienda rural 1.6 kW SPF 24V', 'OFF-GRID', 'mono', 24, 1.64, 3.6, 3,
  162, 120, 200, 'Vivienda rural básica 100 % solar. Lavarropas y microondas solo con sol fuerte.', 'Banco 24V: 4× GEL 75Ah en 2S2P. Autonomía 6–8 h @ ~400 W. Arriba de 200 kWh/mes evaluar KIT_OFF_ALTO.', 8)
on conflict (code) do nothing;

insert into public.kit_items (kit_id, product_id, qty, sort_order)
select k.id, p.id, v.qty, v.ord
from (values
  ('549423', 4, 1),
  ('038010', 1, 2),
  ('037042', 1, 3),
  ('046014', 4, 4),
  ('037002', 6, 5),
  ('036025', 25, 6),
  ('036026', 25, 7),
  ('576045', 2, 8),
  ('040014', 1, 9),
  ('575956', 1, 10),
  ('576022', 1, 11),
  ('040021', 1, 12),
  ('575859', 1, 13),
  ('575804', 1, 14)
) as v(code, qty, ord)
join public.kits k on k.code = 'KIT_OFF_MEDIO'
join public.products p on p.product_code = v.code
on conflict (kit_id, product_id) do nothing;

insert into public.kit_options (kit_id, code, kind, name, changes, kwp, battery_kwh, est_kwh_month, notes, sort_order)
select k.id, v.code, v.kind, v.name, v.changes::jsonb, v.kwp, v.battery_kwh, v.est, v.notes, v.ord
from (values
  ('A1', 'autonomy', '8× GEL 75Ah (banco doble)', '[{"op":"add","product_code":"046014","qty":4}]', null::numeric, 7.2::numeric, null::numeric, null, 1),
  ('A2', 'autonomy', '1× Growatt Hope (reemplaza GEL)', '[{"op":"remove","product_code":"046014"},{"op":"add","product_code":"575917","qty":1},{"op":"add","product_code":"575928","qty":1}]', null::numeric, 5.5::numeric, null::numeric, 'Hope es 51.2V: requiere inversor de 48V (ver G1/G2).', 2),
  ('A3', 'autonomy', '2× Growatt Hope (reemplaza GEL)', '[{"op":"remove","product_code":"046014"},{"op":"add","product_code":"575917","qty":2},{"op":"add","product_code":"575928","qty":2}]', null::numeric, 11::numeric, null::numeric, 'Hope es 51.2V: requiere inversor de 48V (ver G1/G2).', 3),
  ('G1', 'generation', 'Growatt SPF 5 kW 48V (6 paneles)', '[{"op":"set","product_code":"549423","qty":6},{"op":"remove","product_code":"038010"},{"op":"add","product_code":"038008","qty":1},{"op":"set","product_code":"576045","qty":3}]', 2.46::numeric, null::numeric, 244::numeric, 'Banco de 48V.', 4),
  ('G2', 'generation', 'Growatt SPF 6000 ES Plus 48V (6 paneles)', '[{"op":"set","product_code":"549423","qty":6},{"op":"remove","product_code":"038010"},{"op":"add","product_code":"575927","qty":1},{"op":"set","product_code":"576045","qty":3}]', 2.46::numeric, null::numeric, 244::numeric, 'Banco de 48V.', 5),
  ('E1', 'extra', 'Regulador Growatt SC4880 MPPT 80A', '[{"op":"add","product_code":"576147","qty":1}]', null::numeric, null::numeric, null::numeric, null, 6),
  ('E2', 'extra', 'Conector puente baterías 25mm', '[{"op":"add","product_code":"576108","qty":1}]', null::numeric, null::numeric, null::numeric, null, 7)
) as v(code, kind, name, changes, kwp, battery_kwh, est, notes, ord)
join public.kits k on k.code = 'KIT_OFF_MEDIO'
on conflict (kit_id, code) do nothing;

insert into public.kits (code, name, grid_type, phases, battery_voltage, kwp, battery_kwh, inverter_kw,
  est_kwh_month, ref_kwh_month_min, ref_kwh_month_max, description, notes, sort_order)
values ('KIT_OFF_ALTO', 'Off-grid rural 3.3 kW SPF 6000 ES + 2× Hope', 'OFF-GRID', 'mono', 48, 3.28, 11, 6,
  325, 250, 400, 'Vivienda rural media sin red. AC y lavarropas en horario solar.', 'Autonomía 8–10 h @ ~700 W. No prometer AC nocturno sin 3× Hope o generador.', 9)
on conflict (code) do nothing;

insert into public.kit_items (kit_id, product_id, qty, sort_order)
select k.id, p.id, v.qty, v.ord
from (values
  ('549423', 8, 1),
  ('575927', 1, 2),
  ('037042', 1, 3),
  ('575917', 2, 4),
  ('575928', 2, 5),
  ('037002', 10, 6),
  ('037023', 2, 7),
  ('036025', 40, 8),
  ('036026', 40, 9),
  ('576045', 4, 10),
  ('040014', 1, 11),
  ('576056', 1, 12),
  ('576023', 1, 13),
  ('040020', 1, 14),
  ('575859', 1, 15)
) as v(code, qty, ord)
join public.kits k on k.code = 'KIT_OFF_ALTO'
join public.products p on p.product_code = v.code
on conflict (kit_id, product_id) do nothing;

insert into public.kit_options (kit_id, code, kind, name, changes, kwp, battery_kwh, est_kwh_month, notes, sort_order)
select k.id, v.code, v.kind, v.name, v.changes::jsonb, v.kwp, v.battery_kwh, v.est, v.notes, v.ord
from (values
  ('A1', 'autonomy', '3× Hope (16.5 kWh)', '[{"op":"add","product_code":"575917","qty":1},{"op":"add","product_code":"575928","qty":1}]', null::numeric, 16.5::numeric, null::numeric, null, 1),
  ('A2', 'autonomy', '4× Hope (22 kWh)', '[{"op":"add","product_code":"575917","qty":2},{"op":"add","product_code":"575928","qty":2}]', null::numeric, 22::numeric, null::numeric, null, 2),
  ('A3', 'autonomy', 'GEL económico 8× 75Ah 48V (reemplaza Hope)', '[{"op":"remove","product_code":"575917"},{"op":"remove","product_code":"575928"},{"op":"add","product_code":"046014","qty":8}]', null::numeric, 7.2::numeric, null::numeric, null, 3),
  ('G1', 'generation', 'Menos paneles (6×)', '[{"op":"set","product_code":"549423","qty":6},{"op":"set","product_code":"576045","qty":3}]', 2.46::numeric, null::numeric, 244::numeric, null, 4),
  ('G2', 'generation', 'Más FV (10×)', '[{"op":"set","product_code":"549423","qty":10},{"op":"set","product_code":"576045","qty":5}]', 4.1::numeric, null::numeric, 406::numeric, 'Validar MPPT del SPF 6000 ES Plus.', 5),
  ('E1', 'extra', 'Conector puente baterías 25mm ×2', '[{"op":"add","product_code":"576108","qty":2}]', null::numeric, null::numeric, null::numeric, null, 6),
  ('E2', 'extra', 'Kit cables batería Growatt AXE', '[{"op":"add","product_code":"575845","qty":1}]', null::numeric, null::numeric, null::numeric, null, 7),
  ('E3', 'extra', 'Soporte triangular telescópico Mibet', '[{"op":"add","product_code":"576068","qty":1}]', null::numeric, null::numeric, null::numeric, null, 8),
  ('E4', 'extra', 'Bloque de hormigón 42kg', '[{"op":"add","product_code":"576010","qty":1}]', null::numeric, null::numeric, null::numeric, null, 9)
) as v(code, kind, name, changes, kwp, battery_kwh, est, notes, ord)
join public.kits k on k.code = 'KIT_OFF_ALTO'
on conflict (kit_id, code) do nothing;

-- Verificación: todos los SKU usados por kits y opcionales existen.
do $$
declare missing text;
begin
  select string_agg(code, ', ') into missing
  from unnest(array['036025', '036026', '036076', '037002', '037005', '037010', '037023', '037026', '037029', '037030', '037036', '037037', '037042', '037046', '038006', '038008', '038010', '038017', '038018', '038019', '038020', '038023', '039014', '039016', '040014', '040020', '040021', '040038', '040045', '046005', '046014', '046024', '046038', '046040', '519961', '549423', '575741', '575769', '575800', '575804', '575821', '575837', '575839', '575842', '575845', '575846', '575849', '575859', '575901', '575917', '575927', '575928', '575956', '575957', '575973', '575978', '575979', '575982', '575988', '575989', '576009', '576010', '576021', '576022', '576023', '576043', '576044', '576045', '576047', '576056', '576068', '576085', '576086', '576094', '576108', '576131', '576147', '576159', '576178']) as code
  where not exists (select 1 from public.products p where p.product_code = code);
  if missing is not null then
    raise exception 'SKU de kits inexistentes: %', missing;
  end if;
end $$;

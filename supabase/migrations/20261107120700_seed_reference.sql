-- =============================================================================
-- Permisos de roles (módulos V0) y datos de referencia:
-- zonas solares (04), equipos típicos (05 §3.2) y reglas de armado (00).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Roles: solo módulos V0 (ModuleSchema del front). "budgets" pasa a "quotes".
-- ---------------------------------------------------------------------------
update public.roles set permissions = jsonb_build_object(
  'dashboards',     jsonb_build_array('read'),
  'quotes',         jsonb_build_array('read', 'create', 'update', 'delete'),
  'clients',        jsonb_build_array('read', 'create', 'update', 'delete'),
  'products',       jsonb_build_array('read', 'create', 'update', 'delete'),
  'kits',           jsonb_build_array('read', 'create', 'update', 'delete'),
  'exchange_rates', jsonb_build_array('read', 'create', 'update', 'delete'),
  'configs',        jsonb_build_array('read', 'create', 'update', 'delete'),
  'user_profiles',  jsonb_build_array('read', 'create', 'update', 'delete')
) where name = 'Admin';

update public.roles set
  description = coalesce(description, 'Arma y emite presupuestos'),
  permissions = jsonb_build_object(
    'dashboards',     jsonb_build_array('read'),
    'quotes',         jsonb_build_array('read', 'create', 'update', 'delete'),
    'clients',        jsonb_build_array('read', 'create', 'update', 'delete'),
    'products',       jsonb_build_array('read'),
    'kits',           jsonb_build_array('read'),
    'exchange_rates', jsonb_build_array('read')
  ) where name = 'Vendedor';

update public.roles set permissions = jsonb_build_object(
  'dashboards', jsonb_build_array('read'),
  'quotes',     jsonb_build_array('read'),
  'clients',    jsonb_build_array('read'),
  'products',   jsonb_build_array('read'),
  'kits',       jsonb_build_array('read')
) where name = 'Lectura';

update public.roles set permissions = jsonb_build_object(
  'dashboards', jsonb_build_array('read'),
  'quotes',     jsonb_build_array('read', 'create', 'update', 'delete'),
  'clients',    jsonb_build_array('read', 'create', 'update', 'delete'),
  'products',   jsonb_build_array('read', 'create', 'update', 'delete'),
  'kits',       jsonb_build_array('read', 'create', 'update', 'delete')
) where name = 'Tester';

-- En una DB vacía crea los roles base.
insert into public.roles (name, description, permissions)
select v.name, v.description, '{}'::jsonb
from (values
  ('Admin', 'Acceso total'),
  ('Vendedor', 'Arma y emite presupuestos'),
  ('Lectura', 'Solo consulta')
) as v(name, description)
on conflict (name) do nothing;

-- ---------------------------------------------------------------------------
-- Zonas solares
-- ---------------------------------------------------------------------------
insert into public.solar_zones
  (kind, name, province, latitude, hsp_horizontal, hsp_optimal, optimal_angle, notes, sort_order)
values
  ('city', 'Córdoba capital',      'Córdoba',             31.4, 4.4, 5.0, 31, null, 1),
  ('city', 'Río Cuarto',           'Córdoba',             33.1, 4.3, 5.0, 33, null, 2),
  ('city', 'Villa María',          'Córdoba',             32.4, 4.4, 5.0, 32, null, 3),
  ('city', 'San Francisco',        'Córdoba',             31.4, 4.4, 5.0, 31, null, 4),
  ('city', 'Villa Carlos Paz',     'Córdoba',             31.4, 4.4, 5.0, 31, null, 5),
  ('city', 'Alta Gracia',          'Córdoba',             31.7, 4.4, 5.0, 32, null, 6),
  ('city', 'Cruz del Eje',         'Córdoba',             30.7, 4.6, 5.2, 30, 'Aplicar k_temp 0.90 en verano', 7),
  ('city', 'Jesús María',          'Córdoba',             30.9, 4.5, 5.1, 31, null, 8),
  ('city', 'Río Tercero',          'Córdoba',             32.2, 4.4, 5.0, 32, null, 9),
  ('city', 'Laboulaye',            'Córdoba',             34.1, 4.3, 4.9, 34, null, 10),
  ('city', 'Marcos Juárez',        'Córdoba',             32.7, 4.4, 5.0, 33, null, 11),
  ('city', 'Buenos Aires (AMBA)',  'Buenos Aires',        34.6, 4.2, 4.8, 34, null, 20),
  ('city', 'Rosario',              'Santa Fe',            32.9, 4.3, 4.9, 33, null, 21),
  ('city', 'Santa Fe capital',     'Santa Fe',            31.6, 4.4, 5.0, 32, null, 22),
  ('city', 'Mar del Plata',        'Buenos Aires',        38.0, 4.0, 4.7, 38, null, 23),
  ('city', 'Bahía Blanca',         'Buenos Aires',        38.7, 4.0, 4.8, 39, null, 24),
  ('city', 'La Plata',             'Buenos Aires',        34.9, 4.2, 4.8, 35, null, 25),
  ('city', 'Mendoza capital',      'Mendoza',             32.9, 5.2, 5.8, 33, null, 30),
  ('city', 'San Rafael',           'Mendoza',             34.6, 5.0, 5.7, 35, null, 31),
  ('city', 'San Juan capital',     'San Juan',            31.5, 5.5, 6.2, 31, null, 32),
  ('city', 'La Rioja capital',     'La Rioja',            29.4, 5.3, 5.9, 29, null, 33),
  ('city', 'San Luis capital',     'San Luis',            33.3, 5.0, 5.6, 33, null, 34),
  ('city', 'Salta capital',        'Salta',               24.8, 5.0, 5.5, 25, 'Aplicar k_temp 0.90 en verano', 40),
  ('city', 'Jujuy capital',        'Jujuy',               24.2, 5.2, 5.6, 24, null, 41),
  ('city', 'Tucumán capital',      'Tucumán',             26.8, 4.8, 5.3, 27, 'Aplicar k_temp 0.90 en verano', 42),
  ('city', 'Catamarca capital',    'Catamarca',           28.5, 5.3, 5.9, 28, null, 43),
  ('city', 'Santiago del Estero',  'Santiago del Estero', 27.8, 5.0, 5.5, 28, 'Aplicar k_temp 0.90 en verano', 44),
  ('city', 'Resistencia',          'Chaco',               27.5, 4.8, 5.2, 27, 'Aplicar k_temp 0.90 en verano', 50),
  ('city', 'Corrientes capital',   'Corrientes',          27.5, 4.8, 5.2, 27, null, 51),
  ('city', 'Posadas',              'Misiones',            27.4, 4.6, 5.0, 27, null, 52),
  ('city', 'Formosa capital',      'Formosa',             26.2, 4.9, 5.3, 26, 'Aplicar k_temp 0.90 en verano', 53),
  ('city', 'Neuquén capital',      'Neuquén',             38.9, 4.3, 5.2, 39, null, 60),
  ('city', 'Cipolletti',           'Río Negro',           38.9, 4.3, 5.2, 39, null, 61),
  ('city', 'Bariloche',            'Río Negro',           41.1, 3.8, 4.6, 41, null, 62),
  ('city', 'Comodoro Rivadavia',   'Chubut',              45.9, 3.8, 4.8, 46, null, 63),
  ('city', 'Río Gallegos',         'Santa Cruz',          51.6, 3.4, 4.5, 52, 'Dimensionar por mes crítico (junio)', 64),
  ('region', 'Centro',               'Córdoba, Santa Fe, Entre Ríos',          null, 4.4, 5.0, null, 'Valor por defecto del sistema', 100),
  ('region', 'Buenos Aires',         'Buenos Aires, AMBA',                     null, 4.2, 4.8, null, null, 101),
  ('region', 'Cuyo',                 'Mendoza, San Juan, San Luis',            null, 5.2, 5.8, null, 'Mayor recurso del país', 102),
  ('region', 'La Rioja / Catamarca', 'La Rioja, Catamarca',                    null, 5.3, 5.9, null, null, 103),
  ('region', 'NOA',                  'Jujuy, Salta, Tucumán',                  null, 5.0, 5.5, null, null, 104),
  ('region', 'Santiago del Estero',  'Santiago del Estero',                    null, 5.0, 5.5, null, 'Aplicar k_temp en verano', 105),
  ('region', 'NEA',                  'Chaco, Corrientes, Misiones, Formosa',   null, 4.8, 5.2, null, null, 106),
  ('region', 'Patagonia norte',      'Neuquén, Río Negro (norte)',             null, 4.3, 5.2, null, 'Alta amplitud estacional', 107),
  ('region', 'Patagonia sur',        'Chubut, Santa Cruz, Tierra del Fuego',   null, 3.7, 4.7, null, 'Dimensionar por mes crítico (junio)', 108)
on conflict (kind, name) do nothing;

-- ---------------------------------------------------------------------------
-- Equipos típicos
-- ---------------------------------------------------------------------------
insert into public.appliance_presets (name, watts, hours_per_day, sort_order) values
  ('Heladera familiar',               150,  24,   1),
  ('Aire acondicionado 3000 frig',    1050, 6,    2),
  ('Aire acondicionado 5000 frig',    1750, 6,    3),
  ('Televisor LED 42"',               80,   5,    4),
  ('Computadora de escritorio',       200,  8,    5),
  ('Notebook',                        65,   8,    6),
  ('Iluminación LED (hogar completo)', 100, 6,    7),
  ('Lavarropas',                      500,  1,    8),
  ('Microondas',                      1200, 0.25, 9),
  ('Bomba de agua 1HP',               750,  2,    10),
  ('Router WiFi',                     10,   24,   11)
on conflict (name) do nothing;

-- ---------------------------------------------------------------------------
-- Reglas de armado (texto breve para el prompt; las duras también están en código)
-- ---------------------------------------------------------------------------
insert into public.assembly_rules (grid_type, text, sort_order)
select v.grid_type::public.grid_type_enum, v.text, v.sort_order
from (values
  (null,       'Preferir siempre un kit predefinido dentro de ±15 % del Wp objetivo.', 1),
  (null,       'Marca prioritaria: Growatt (inversores, baterías Hope, dongles, limitadores).', 2),
  (null,       'Incluir siempre protecciones DC y AC, fusible con portafusible y soporte acorde al techo.', 3),
  (null,       'Consumo mayor a 1000 kWh/mes: marcar "Análisis detallado requerido".', 4),
  ('ON-GRID',  'Nunca proponer baterías. Aclarar que no hay respaldo ante cortes de red.', 10),
  ('HYBRID',   'Nunca usar inversores on-grid. La batería cubre cargas críticas en corte, no AC.', 20),
  ('OFF-GRID', 'Nunca usar inversores on-grid. Cargas grandes solo en horario solar.', 30)
) as v(grid_type, text, sort_order)
where not exists (select 1 from public.assembly_rules);

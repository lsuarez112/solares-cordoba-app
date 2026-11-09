-- F4: la IA también arma kits (Kits → Crear con IA). Se registra como step 'kit'.
alter table public.ai_requests drop constraint if exists ai_requests_step_check;
alter table public.ai_requests
  add constraint ai_requests_step_check check (step in ('extract', 'select', 'refine', 'kit'));

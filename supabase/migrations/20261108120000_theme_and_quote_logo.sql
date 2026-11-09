-- =============================================================================
-- Tema por usuario y logo del presupuesto.
-- =============================================================================

-- Tema de la interfaz por usuario (null = no elegido: se usa el del navegador).
alter table public.user_profiles
  add column if not exists theme text;

do $$ begin
  alter table public.user_profiles
    add constraint user_profiles_theme_check check (theme in ('light', 'dark', 'system'));
exception when duplicate_object then null; end $$;

-- La política de user_profiles solo deja editar al Admin. Para que cada usuario
-- guarde su tema sin poder tocar rol/estado, se expone solo esta RPC.
create or replace function public.set_my_theme(p_theme text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    raise exception 'No autenticado' using errcode = '42501';
  end if;
  if p_theme is not null and p_theme not in ('light', 'dark', 'system') then
    raise exception 'Tema inválido: %', p_theme;
  end if;
  update user_profiles set theme = p_theme, updated_at = now() where id = auth.uid();
end;
$$;

revoke all on function public.set_my_theme(text) from public, anon;
grant execute on function public.set_my_theme(text) to authenticated;

-- Logo del PDF del presupuesto: el de la empresa, uno propio o ninguno.
alter table public.app_settings
  add column if not exists quote_logo_mode text not null default 'company',
  add column if not exists quote_logo_url text;

do $$ begin
  alter table public.app_settings
    add constraint app_settings_quote_logo_mode_check
    check (quote_logo_mode in ('company', 'custom', 'none'));
exception when duplicate_object then null; end $$;

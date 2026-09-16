-- ============================================================================
-- CORREÇÃO RÁPIDA: perfil automático + backfill de quem já cadastrou
-- Cole no SQL Editor do Supabase e rode uma vez.
-- ============================================================================

-- 1) Garante o hotel demo (FK do hotel_id)
insert into public.hotels (id, name, city, settings)
values (
  'a0e1b2c3-d4e5-4f67-8899-000000000001',
  'Hotel Atlântico Copacabana',
  'Rio de Janeiro',
  '{}'::jsonb
)
on conflict (id) do nothing;

-- 2) Políticas abertas o suficiente para o app gravar perfil no cadastro
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select using (true);

drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles for insert with check (true);

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update using (true);

-- 3) Trigger: todo user novo em auth.users vira linha em profiles
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
begin
  v_role := coalesce(new.raw_user_meta_data->>'role', 'freelancer');
  if v_role not in ('gerencia', 'rh', 'freelancer') then
    v_role := 'freelancer';
  end if;

  insert into public.profiles (
    id, hotel_id, role, name, phone, hotel_name,
    department, primary_role, city, onboarded, settings
  )
  values (
    new.id,
    'a0e1b2c3-d4e5-4f67-8899-000000000001',
    v_role,
    coalesce(nullif(new.raw_user_meta_data->>'name', ''), split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'hotel_name', ''),
    case
      when v_role = 'rh' then 'RH / Controladoria'
      when v_role = 'gerencia' then 'Gerência Operacional'
      else ''
    end,
    case when v_role = 'freelancer' then 'Garçom' else '' end,
    'Rio de Janeiro',
    false,
    '{"whatsappNotifications": true, "emergencyAlerts": true}'::jsonb
  )
  on conflict (id) do update set
    name = excluded.name,
    phone = excluded.phone,
    role = excluded.role,
    hotel_name = excluded.hotel_name,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4) Backfill: quem já existe no Auth e ainda não tem profiles
insert into public.profiles (
  id, hotel_id, role, name, phone, hotel_name,
  department, primary_role, city, onboarded, settings
)
select
  u.id,
  'a0e1b2c3-d4e5-4f67-8899-000000000001',
  case
    when coalesce(u.raw_user_meta_data->>'role', 'freelancer') in ('gerencia', 'rh', 'freelancer')
      then coalesce(u.raw_user_meta_data->>'role', 'freelancer')
    else 'freelancer'
  end,
  coalesce(nullif(u.raw_user_meta_data->>'name', ''), split_part(u.email, '@', 1)),
  coalesce(u.raw_user_meta_data->>'phone', ''),
  coalesce(u.raw_user_meta_data->>'hotel_name', ''),
  case
    when coalesce(u.raw_user_meta_data->>'role', 'freelancer') = 'rh' then 'RH / Controladoria'
    when coalesce(u.raw_user_meta_data->>'role', 'freelancer') = 'gerencia' then 'Gerência Operacional'
    else ''
  end,
  case
    when coalesce(u.raw_user_meta_data->>'role', 'freelancer') = 'freelancer' then 'Garçom'
    else ''
  end,
  'Rio de Janeiro',
  false,
  '{"whatsappNotifications": true, "emergencyAlerts": true}'::jsonb
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;

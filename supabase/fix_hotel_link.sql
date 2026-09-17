-- ============================================================================
-- Desvincular contas novas do hotel demo + trigger sem hotel_id automático
-- Rode no SQL Editor do Supabase (uma vez).
-- ============================================================================

-- 1) Contas que ainda não terminaram o onboarding ficam sem hotel
update public.profiles
set hotel_id = null,
    hotel_name = case when coalesce(onboarded, false) = false then coalesce(nullif(hotel_name, ''), null) else hotel_name end
where coalesce(onboarded, false) = false
  and hotel_id = 'a0e1b2c3-d4e5-4f67-8899-000000000001';

-- 2) Trigger: usuário novo NÃO herda o Hotel Atlântico
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
    null,
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
    -- não sobrescreve hotel_id se o usuário já vinculou no onboarding
    hotel_id = coalesce(public.profiles.hotel_id, excluded.hotel_id),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

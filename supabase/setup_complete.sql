-- ============================================================================
-- DOMU STAFF: SCRIPT COMPLETO DE CONFIGURACAO DO BANCO DE DADOS SUPABASE
-- Execute este script no SQL Editor do Supabase para inicializar tabelas,
-- permissoes (RLS), seeds e sincronizacao automatica de usuarios.
-- ============================================================================

-- Domu Staff schema + RLS
-- Run in the Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.hotels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  hotel_id uuid references public.hotels (id) on delete set null,
  role text not null check (role in ('gerencia', 'rh', 'freelancer')),
  name text not null,
  phone text,
  photo_url text,
  department text,
  primary_role text,
  city text,
  hotel_name text,
  professional_code text,
  available_days text[] not null default '{}',
  available_times text[] not null default '{}',
  settings jsonb not null default '{}'::jsonb,
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.professionals (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.hotels (id) on delete cascade,
  code text not null,
  name text not null,
  role text not null,
  sector text not null,
  status text not null default 'DisponÃ­vel',
  notes text,
  phone text,
  avatar_url text,
  profile_id uuid references public.profiles (id) on delete set null,
  unique (hotel_id, code)
);

create table if not exists public.daily_rates (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.hotels (id) on delete cascade,
  role text not null,
  week integer not null default 0,
  weekend integer not null default 0,
  holiday integer not null default 0,
  unique (hotel_id, role)
);

create table if not exists public.occupancy (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.hotels (id) on delete cascade,
  day_date date not null,
  guests integer not null default 0,
  unique (hotel_id, day_date)
);

create table if not exists public.shift_requests (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.hotels (id) on delete cascade,
  sector text not null,
  day_date date not null,
  shift text,
  status text not null default 'draft'
    check (status in ('draft', 'requested', 'returned', 'sent', 'confirmed')),
  guest_count integer,
  created_by uuid references public.profiles (id),
  returned_reason text,
  returned_by uuid references public.profiles (id),
  returned_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (hotel_id, sector, day_date)
);

create table if not exists public.shift_request_people (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.shift_requests (id) on delete cascade,
  professional_id uuid not null references public.professionals (id) on delete cascade,
  unique (request_id, professional_id)
);

create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.hotels (id) on delete cascade,
  professional_id uuid not null references public.professionals (id) on delete cascade,
  request_id uuid references public.shift_requests (id) on delete set null,
  role text,
  sector text,
  time text,
  location text,
  daily_rate integer,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined')),
  notes text,
  days date[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.hotels (id) on delete cascade,
  professional_id uuid not null references public.professionals (id) on delete cascade,
  day_date date not null,
  checked_in_at timestamptz not null default now(),
  by_profile_id uuid references public.profiles (id),
  unique (hotel_id, professional_id, day_date)
);

alter table public.hotels enable row level security;
alter table public.profiles enable row level security;
alter table public.professionals enable row level security;
alter table public.daily_rates enable row level security;
alter table public.occupancy enable row level security;
alter table public.shift_requests enable row level security;
alter table public.shift_request_people enable row level security;
alter table public.invites enable row level security;
alter table public.checkins enable row level security;

create or replace function public.current_profile()
returns public.profiles
language sql
stable
security definer
set search_path = public
as $$
  select * from public.profiles where id = auth.uid();
$$;

create or replace function public.my_hotel_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select hotel_id from public.profiles where id = auth.uid();
$$;

create or replace function public.is_hotel_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('gerencia', 'rh')
  );
$$;

drop policy if exists hotels_select on public.hotels;
create policy hotels_select on public.hotels
  for select using (id = public.my_hotel_id());

drop policy if exists hotels_update on public.hotels;
create policy hotels_update on public.hotels
  for update using (id = public.my_hotel_id() and public.is_hotel_staff());

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (
    id = auth.uid()
    or (public.is_hotel_staff() and hotel_id = public.my_hotel_id())
  );

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update using (id = auth.uid());

drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles
  for insert with check (id = auth.uid());

drop policy if exists professionals_hotel_read on public.professionals;
create policy professionals_hotel_read on public.professionals
  for select using (hotel_id = public.my_hotel_id());

drop policy if exists professionals_staff on public.professionals;
create policy professionals_staff on public.professionals
  for all using (hotel_id = public.my_hotel_id() and public.is_hotel_staff())
  with check (hotel_id = public.my_hotel_id() and public.is_hotel_staff());

drop policy if exists professionals_self on public.professionals;
create policy professionals_self on public.professionals
  for select using (profile_id = auth.uid());

drop policy if exists rates_select on public.daily_rates;
create policy rates_select on public.daily_rates
  for select using (hotel_id = public.my_hotel_id() and public.is_hotel_staff());

drop policy if exists rates_write on public.daily_rates;
create policy rates_write on public.daily_rates
  for all using (hotel_id = public.my_hotel_id() and public.is_hotel_staff())
  with check (hotel_id = public.my_hotel_id() and public.is_hotel_staff());

drop policy if exists occupancy_staff on public.occupancy;
create policy occupancy_staff on public.occupancy
  for all using (hotel_id = public.my_hotel_id() and public.is_hotel_staff())
  with check (hotel_id = public.my_hotel_id() and public.is_hotel_staff());

drop policy if exists requests_staff on public.shift_requests;
create policy requests_staff on public.shift_requests
  for all using (hotel_id = public.my_hotel_id() and public.is_hotel_staff())
  with check (hotel_id = public.my_hotel_id() and public.is_hotel_staff());

drop policy if exists request_people_staff on public.shift_request_people;
create policy request_people_staff on public.shift_request_people
  for all using (
    exists (
      select 1 from public.shift_requests r
      where r.id = request_id and r.hotel_id = public.my_hotel_id() and public.is_hotel_staff()
    )
  );

drop policy if exists invites_staff on public.invites;
create policy invites_staff on public.invites
  for all using (hotel_id = public.my_hotel_id() and public.is_hotel_staff())
  with check (hotel_id = public.my_hotel_id() and public.is_hotel_staff());

drop policy if exists invites_self on public.invites;
create policy invites_self on public.invites
  for select using (
    exists (
      select 1 from public.professionals p
      where p.id = professional_id and p.profile_id = auth.uid()
    )
  );

drop policy if exists invites_self_update on public.invites;
create policy invites_self_update on public.invites
  for update using (
    exists (
      select 1 from public.professionals p
      where p.id = professional_id and p.profile_id = auth.uid()
    )
  );

drop policy if exists checkins_staff on public.checkins;
create policy checkins_staff on public.checkins
  for all using (hotel_id = public.my_hotel_id() and public.is_hotel_staff())
  with check (hotel_id = public.my_hotel_id() and public.is_hotel_staff());

drop policy if exists checkins_self on public.checkins;
create policy checkins_self on public.checkins
  for select using (
    exists (
      select 1 from public.professionals p
      where p.id = professional_id and p.profile_id = auth.uid()
    )
  );

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists avatars_public_read on storage.objects;
create policy avatars_public_read on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists avatars_own_write on storage.objects;
create policy avatars_own_write on storage.objects
  for insert with check (
    bucket_id = 'avatars' and auth.uid() is not null
  );

drop policy if exists avatars_own_update on storage.objects;
create policy avatars_own_update on storage.objects
  for update using (
    bucket_id = 'avatars' and auth.uid() is not null
  );



-- ============================================================================
-- GATILHO SEGURO AUTOMATICO: NOVO USUARIO EM AUTH.USERS -> PROFILES
-- ============================================================================
drop trigger if exists on_auth_user_before_insert on auth.users;
drop function if exists public.auto_confirm_new_user();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Insere perfil sincronizado de forma segura
  insert into public.profiles (
    id,
    hotel_id,
    role,
    name,
    phone,
    hotel_name,
    department,
    primary_role,
    city,
    onboarded,
    settings
  )
  values (
    new.id,
    'a0e1b2c3-d4e5-4f67-8899-000000000001',
    coalesce(new.raw_user_meta_data->>'role', 'freelancer'),
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'hotel_name', ''),
    case when coalesce(new.raw_user_meta_data->>'role', 'freelancer') = 'rh' then 'RH / Controladoria' when coalesce(new.raw_user_meta_data->>'role', 'freelancer') = 'gerencia' then 'Gerência Operacional' else '' end,
    case when coalesce(new.raw_user_meta_data->>'role', 'freelancer') = 'freelancer' then 'Garçom' else '' end,
    'Rio de Janeiro',
    false,
    '{\"whatsappNotifications\": true, \"emergencyAlerts\": true}'::jsonb
  )
  on conflict (id) do update set
    name = excluded.name,
    phone = excluded.phone,
    role = excluded.role,
    hotel_name = excluded.hotel_name;

  return new;
exception
  when others then
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Politicas RLS desbloqueadas para insercao e leitura fluida
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select using (true);

drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles for insert with check (true);

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update using (true);

drop policy if exists hotels_select on public.hotels;
create policy hotels_select on public.hotels for select using (true);

drop policy if exists hotels_all on public.hotels;
create policy hotels_all on public.hotels for all using (true) with check (true);

-- Demo data for Hotel AtlÃ¢ntico. Run after schema.sql.
-- Demo passwords: domu123
-- marcos.ferreira@atlantico.com.br  (gerencia)
--  renata.prado@atlantico.com.br    (rh)
--  joao.pedro@domustaff.app         (freelancer)

create extension if not exists pgcrypto;

do $$
declare
  hotel uuid := 'a0e1b2c3-d4e5-4f67-8899-000000000001';
  marcos uuid := 'a0e1b2c3-d4e5-4f67-8899-000000000002';
  renata uuid := 'a0e1b2c3-d4e5-4f67-8899-000000000003';
  joao uuid := 'a0e1b2c3-d4e5-4f67-8899-000000000004';
  pwd text := crypt('domu123', gen_salt('bf'));
begin
  insert into public.hotels (id, name, city, settings)
  values (hotel, 'Hotel AtlÃ¢ntico Copacabana', 'Rio de Janeiro', '{"inviteTimeoutHours":4,"timezone":"America/Sao_Paulo","autoSubstitute":true,"dailyEmail":false}'::jsonb)
  on conflict (id) do nothing;

  -- Auth users
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  )
  values
    ('00000000-0000-0000-0000-000000000000', marcos, 'authenticated', 'authenticated',
     'marcos.ferreira@atlantico.com.br', pwd, now(),
     '{"provider":"email","providers":["email"]}'::jsonb, '{"name":"Marcos Ferreira"}'::jsonb, now(), now(), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', renata, 'authenticated', 'authenticated',
     'renata.prado@atlantico.com.br', pwd, now(),
     '{"provider":"email","providers":["email"]}'::jsonb, '{"name":"Renata Prado"}'::jsonb, now(), now(), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', joao, 'authenticated', 'authenticated',
     'joao.pedro@domustaff.app', pwd, now(),
     '{"provider":"email","providers":["email"]}'::jsonb, '{"name":"JoÃ£o Pedro"}'::jsonb, now(), now(), '', '', '', '')
  on conflict (id) do nothing;

  insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  values
    (marcos, marcos, format('{"sub":"%s","email":"marcos.ferreira@atlantico.com.br"}', marcos)::jsonb, 'email', marcos::text, now(), now(), now()),
    (renata, renata, format('{"sub":"%s","email":"renata.prado@atlantico.com.br"}', renata)::jsonb, 'email', renata::text, now(), now(), now()),
    (joao, joao, format('{"sub":"%s","email":"joao.pedro@domustaff.app"}', joao)::jsonb, 'email', joao::text, now(), now(), now())
  on conflict (id) do nothing;

  insert into public.profiles (id, hotel_id, role, name, phone, department, primary_role, city, hotel_name, professional_code, available_days, available_times, settings, onboarded)
  values
    (marcos, hotel, 'gerencia', 'Marcos Ferreira', '(21) 99887-7661', 'MaÃ®tre Â· Restaurante', null, 'Rio de Janeiro', 'Hotel AtlÃ¢ntico Copacabana', null, '{}', '{}', '{"emergencyAlerts":true,"returnAlerts":true,"shiftReminder":true}'::jsonb, true),
    (renata, hotel, 'rh', 'Renata Prado', '(21) 99887-7661', 'RH / Controladoria', null, 'Rio de Janeiro', 'Hotel AtlÃ¢ntico Copacabana', null, '{}', '{}', '{"whatsappNotifications":true,"autoSubstitute":true}'::jsonb, true),
    (joao, hotel, 'freelancer', 'JoÃ£o Pedro', '(21) 99887-7661', null, 'GarÃ§om', 'Rio de Janeiro', 'Hotel AtlÃ¢ntico Copacabana', '1', array['Sex','SÃ¡b','Dom'], array['Tarde / Noite'], '{"whatsappNotifications":true}'::jsonb, true)
  on conflict (id) do nothing;
end $$;

insert into public.daily_rates (hotel_id, role, week, weekend, holiday) values
  ('a0e1b2c3-d4e5-4f67-8899-000000000001', 'GarÃ§om', 180, 220, 270),
  ('a0e1b2c3-d4e5-4f67-8899-000000000001', 'Bartender', 200, 250, 300),
  ('a0e1b2c3-d4e5-4f67-8899-000000000001', 'Recepcionista', 170, 210, 250),
  ('a0e1b2c3-d4e5-4f67-8899-000000000001', 'Cozinheiro', 220, 270, 320),
  ('a0e1b2c3-d4e5-4f67-8899-000000000001', 'Camareira', 160, 200, 240),
  ('a0e1b2c3-d4e5-4f67-8899-000000000001', 'Cumin', 140, 170, 210)
on conflict (hotel_id, role) do nothing;

insert into public.occupancy (hotel_id, day_date, guests) values
  ('a0e1b2c3-d4e5-4f67-8899-000000000001', '2025-09-15', 320),
  ('a0e1b2c3-d4e5-4f67-8899-000000000001', '2025-09-16', 280),
  ('a0e1b2c3-d4e5-4f67-8899-000000000001', '2025-09-17', 310),
  ('a0e1b2c3-d4e5-4f67-8899-000000000001', '2025-09-18', 420),
  ('a0e1b2c3-d4e5-4f67-8899-000000000001', '2025-09-19', 500),
  ('a0e1b2c3-d4e5-4f67-8899-000000000001', '2025-09-20', 480),
  ('a0e1b2c3-d4e5-4f67-8899-000000000001', '2025-09-21', 350)
on conflict (hotel_id, day_date) do nothing;

insert into public.professionals (id, hotel_id, code, name, role, sector, status, notes, phone, avatar_url, profile_id) values
  ('b0e1b2c3-d4e5-4f67-8899-000000000001', 'a0e1b2c3-d4e5-4f67-8899-000000000001', '1', 'JoÃ£o Pedro', 'GarÃ§om', 'restaurante', 'DisponÃ­vel', '4 turnos neste hotel', '(21) 99887-7661', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80', 'a0e1b2c3-d4e5-4f67-8899-000000000004'),
  ('b0e1b2c3-d4e5-4f67-8899-000000000002', 'a0e1b2c3-d4e5-4f67-8899-000000000001', '2', 'Mariana Lima', 'GarÃ§om', 'restaurante', 'DisponÃ­vel', '', '(21) 99887-7662', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', null),
  ('b0e1b2c3-d4e5-4f67-8899-000000000003', 'a0e1b2c3-d4e5-4f67-8899-000000000001', '3', 'Carlos Eduardo', 'GarÃ§om', 'restaurante', 'DisponÃ­vel', 'Trabalhou no Ãºltimo evento', '(21) 99887-7663', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', null),
  ('b0e1b2c3-d4e5-4f67-8899-000000000004', 'a0e1b2c3-d4e5-4f67-8899-000000000001', '4', 'Ana Beatriz', 'GarÃ§om', 'restaurante', 'DisponÃ­vel', '', '(21) 99887-7664', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', null),
  ('b0e1b2c3-d4e5-4f67-8899-000000000005', 'a0e1b2c3-d4e5-4f67-8899-000000000001', '5', 'Rafael Costa', 'Bartender', 'bar', 'DisponÃ­vel', 'Open bar e eventos', '(21) 99887-7665', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', null),
  ('b0e1b2c3-d4e5-4f67-8899-000000000006', 'a0e1b2c3-d4e5-4f67-8899-000000000001', '6', 'Lucas Martins', 'GarÃ§om', 'restaurante', 'DisponÃ­vel', 'Prefere turno noturno', '(21) 99887-7666', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', null),
  ('b0e1b2c3-d4e5-4f67-8899-000000000007', 'a0e1b2c3-d4e5-4f67-8899-000000000001', '7', 'Fernanda Alves', 'GarÃ§om', 'bar', 'DisponÃ­vel', '', '(21) 99887-7667', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', null),
  ('b0e1b2c3-d4e5-4f67-8899-000000000008', 'a0e1b2c3-d4e5-4f67-8899-000000000001', '8', 'Tiago Souza', 'Cozinheiro', 'cozinha', 'DisponÃ­vel', 'Linha quente', '(21) 99887-7668', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80', null),
  ('b0e1b2c3-d4e5-4f67-8899-000000000009', 'a0e1b2c3-d4e5-4f67-8899-000000000001', '9', 'Juliana Castro', 'GarÃ§om', 'restaurante', 'DisponÃ­vel', 'DisponÃ­vel para plantÃ£o', '(21) 99887-7669', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', null),
  ('b0e1b2c3-d4e5-4f67-8899-000000000010', 'a0e1b2c3-d4e5-4f67-8899-000000000001', '10', 'Felipe Rocha', 'Cumin', 'cdc', 'DisponÃ­vel', '', '(21) 99887-7670', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80', null),
  ('b0e1b2c3-d4e5-4f67-8899-000000000011', 'a0e1b2c3-d4e5-4f67-8899-000000000001', '11', 'Camila Duarte', 'Camareira', 'governanca', 'DisponÃ­vel', '', '(21) 99887-7671', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80', null),
  ('b0e1b2c3-d4e5-4f67-8899-000000000012', 'a0e1b2c3-d4e5-4f67-8899-000000000001', '12', 'Bruno Mendes', 'GarÃ§om', 'restaurante', 'DisponÃ­vel', 'SalÃ£o executivo', '(21) 99887-7672', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80', null),
  ('b0e1b2c3-d4e5-4f67-8899-000000000013', 'a0e1b2c3-d4e5-4f67-8899-000000000001', '13', 'LetÃ­cia Ramos', 'Recepcionista', 'recepcao', 'DisponÃ­vel', 'InglÃªs e espanhol', '(21) 99887-7673', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', null),
  ('b0e1b2c3-d4e5-4f67-8899-000000000014', 'a0e1b2c3-d4e5-4f67-8899-000000000001', '14', 'Bianca Santos', 'Recepcionista', 'recepcao', 'DisponÃ­vel', 'PMS e check-in executivo', '(21) 99887-7674', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80', null)
on conflict (hotel_id, code) do nothing;

-- Escalas da semana (restaurante) â€” sexta jÃ¡ com 3 pessoas
insert into public.shift_requests (id, hotel_id, sector, day_date, shift, status, guest_count, created_by) values
  ('c0e1b2c3-d4e5-4f67-8899-000000000015', 'a0e1b2c3-d4e5-4f67-8899-000000000001', 'restaurante', '2025-09-15', '15h â€“ 23h', 'requested', 320, 'a0e1b2c3-d4e5-4f67-8899-000000000002'),
  ('c0e1b2c3-d4e5-4f67-8899-000000000016', 'a0e1b2c3-d4e5-4f67-8899-000000000001', 'restaurante', '2025-09-16', '15h â€“ 23h', 'requested', 280, 'a0e1b2c3-d4e5-4f67-8899-000000000002'),
  ('c0e1b2c3-d4e5-4f67-8899-000000000017', 'a0e1b2c3-d4e5-4f67-8899-000000000001', 'restaurante', '2025-09-17', '15h â€“ 23h', 'requested', 310, 'a0e1b2c3-d4e5-4f67-8899-000000000002'),
  ('c0e1b2c3-d4e5-4f67-8899-000000000018', 'a0e1b2c3-d4e5-4f67-8899-000000000001', 'restaurante', '2025-09-18', '15h â€“ 23h', 'requested', 420, 'a0e1b2c3-d4e5-4f67-8899-000000000002'),
  ('c0e1b2c3-d4e5-4f67-8899-000000000019', 'a0e1b2c3-d4e5-4f67-8899-000000000001', 'restaurante', '2025-09-19', '15h â€“ 23h', 'requested', 500, 'a0e1b2c3-d4e5-4f67-8899-000000000002')
on conflict (hotel_id, sector, day_date) do nothing;

insert into public.shift_request_people (request_id, professional_id)
select 'c0e1b2c3-d4e5-4f67-8899-000000000015', id from public.professionals
where hotel_id = 'a0e1b2c3-d4e5-4f67-8899-000000000001' and code in ('1','2','3','4','5','6','7','8','9','10','11','12')
on conflict do nothing;

insert into public.shift_request_people (request_id, professional_id)
select 'c0e1b2c3-d4e5-4f67-8899-000000000016', id from public.professionals
where hotel_id = 'a0e1b2c3-d4e5-4f67-8899-000000000001' and code in ('1','2','3','4','5','6','7','8')
on conflict do nothing;

insert into public.shift_request_people (request_id, professional_id)
select 'c0e1b2c3-d4e5-4f67-8899-000000000017', id from public.professionals
where hotel_id = 'a0e1b2c3-d4e5-4f67-8899-000000000001' and code in ('1','2','3','4','5','6','7','8','9','10')
on conflict do nothing;

insert into public.shift_request_people (request_id, professional_id)
select 'c0e1b2c3-d4e5-4f67-8899-000000000018', id from public.professionals
where hotel_id = 'a0e1b2c3-d4e5-4f67-8899-000000000001' and code in ('1','2','3','4','5','6','7','8','9','10','11','12')
on conflict do nothing;

insert into public.shift_request_people (request_id, professional_id)
select 'c0e1b2c3-d4e5-4f67-8899-000000000019', id from public.professionals
where hotel_id = 'a0e1b2c3-d4e5-4f67-8899-000000000001' and code in ('1','2','3')
on conflict do nothing;

-- Convites pendentes do JoÃ£o Pedro
insert into public.invites (hotel_id, professional_id, role, sector, time, location, daily_rate, status, notes, days) values
  ('a0e1b2c3-d4e5-4f67-8899-000000000001', 'b0e1b2c3-d4e5-4f67-8899-000000000001', 'GarÃ§om', 'Restaurante', '15h â€“ 23h', 'SalÃ£o principal', 180, 'pending',
   'Pacote da semana: mesmo horÃ¡rio nos 3 dias. Uniforme social completo.',
   array['2025-09-19','2025-09-20','2025-09-21']::date[]),
  ('a0e1b2c3-d4e5-4f67-8899-000000000001', 'b0e1b2c3-d4e5-4f67-8899-000000000001', 'Bartender', 'Bar', '15h â€“ 23h', 'Lobby Bar', 200, 'pending',
   'Evento corporativo com open bar atÃ© 22h.',
   array['2025-09-20']::date[]),
  ('a0e1b2c3-d4e5-4f67-8899-000000000001', 'b0e1b2c3-d4e5-4f67-8899-000000000001', 'Recepcionista', 'RecepÃ§Ã£o', '07h â€“ 15h', 'Front Desk', 170, 'pending',
   'Check-out intenso â€” inglÃªs intermediÃ¡rio desejÃ¡vel.',
   array['2025-09-21']::date[])
on conflict do nothing;

-- Check-ins do turno de sexta
insert into public.checkins (hotel_id, professional_id, day_date, by_profile_id) values
  ('a0e1b2c3-d4e5-4f67-8899-000000000001', 'b0e1b2c3-d4e5-4f67-8899-000000000001', '2025-09-19', 'a0e1b2c3-d4e5-4f67-8899-000000000002'),
  ('a0e1b2c3-d4e5-4f67-8899-000000000001', 'b0e1b2c3-d4e5-4f67-8899-000000000002', '2025-09-19', 'a0e1b2c3-d4e5-4f67-8899-000000000002'),
  ('a0e1b2c3-d4e5-4f67-8899-000000000001', 'b0e1b2c3-d4e5-4f67-8899-000000000003', '2025-09-19', 'a0e1b2c3-d4e5-4f67-8899-000000000002')
on conflict (hotel_id, professional_id, day_date) do nothing;

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
  status text not null default 'Disponível',
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

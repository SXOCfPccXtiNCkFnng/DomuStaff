-- Web Push: subscriptions por dispositivo/usuário
-- Rode no SQL Editor do Supabase uma vez.

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint push_subscriptions_endpoint_unique unique (endpoint)
);

create index if not exists push_subscriptions_profile_idx
  on public.push_subscriptions (profile_id);

alter table public.push_subscriptions enable row level security;

drop policy if exists push_subscriptions_own on public.push_subscriptions;
create policy push_subscriptions_own on public.push_subscriptions
  for all
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- Staff autenticado pode disparar a Edge Function; a função usa service role
-- para ler subscriptions de outros usuários do mesmo hotel.

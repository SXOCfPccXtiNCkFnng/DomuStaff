-- ============================================================================
-- Hotels: CNPJ único + código de vínculo (evitar hotel duplicado)
-- Rode no SQL Editor do Supabase.
-- ============================================================================

alter table public.hotels
  add column if not exists cnpj text,
  add column if not exists code text,
  add column if not exists created_by uuid references public.profiles (id) on delete set null;

-- Normaliza CNPJ só com dígitos na constraint
create unique index if not exists hotels_cnpj_unique
  on public.hotels (cnpj)
  where cnpj is not null and cnpj <> '';

create unique index if not exists hotels_code_unique
  on public.hotels (code)
  where code is not null and code <> '';

-- Seed do Hotel Atlântico (demo) com CNPJ e código
update public.hotels
set
  cnpj = coalesce(nullif(cnpj, ''), '12345678000199'),
  code = coalesce(nullif(code, ''), 'ATL-COPA')
where id = 'a0e1b2c3-d4e5-4f67-8899-000000000001';

insert into public.hotels (id, name, city, cnpj, code, settings)
values (
  'a0e1b2c3-d4e5-4f67-8899-000000000001',
  'Hotel Atlântico Copacabana',
  'Rio de Janeiro',
  '12345678000199',
  'ATL-COPA',
  '{}'::jsonb
)
on conflict (id) do update set
  cnpj = coalesce(public.hotels.cnpj, excluded.cnpj),
  code = coalesce(public.hotels.code, excluded.code);

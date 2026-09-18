-- Multi-setor no profissional: onde pode ser chamado.
-- sector (text) continua sendo o setor principal (compat).
-- Rode no SQL Editor do Supabase uma vez.

alter table public.professionals
  add column if not exists sectors text[] not null default '{}';

update public.professionals
set sectors = array[sector]
where (sectors is null or cardinality(sectors) = 0)
  and sector is not null
  and sector <> '';

-- Garante pelo menos um setor
update public.professionals
set sectors = array['restaurante']
where sectors is null or cardinality(sectors) = 0;

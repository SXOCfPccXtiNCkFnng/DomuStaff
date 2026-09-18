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

-- Freelancer pode atualizar o próprio cadastro (setor)
drop policy if exists professionals_self_update on public.professionals;
create policy professionals_self_update on public.professionals
  for update using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

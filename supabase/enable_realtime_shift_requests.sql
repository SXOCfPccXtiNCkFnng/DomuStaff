-- Ativa Realtime nas tabelas de escala e convites (rode uma vez no SQL Editor do Supabase).
-- Sem isso, RH/Gerência/Freelancer não recebem avisos ao vivo.

alter table public.shift_requests replica identity full;
alter table public.invites replica identity full;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'shift_requests'
  ) then
    alter publication supabase_realtime add table public.shift_requests;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'invites'
  ) then
    alter publication supabase_realtime add table public.invites;
  end if;
end $$;

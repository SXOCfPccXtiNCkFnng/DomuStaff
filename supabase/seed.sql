-- Demo data for Hotel Atlântico. Run after schema.sql.
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
  values (hotel, 'Hotel Atlântico Copacabana', 'Rio de Janeiro', '{"inviteTimeoutHours":4,"timezone":"America/Sao_Paulo","autoSubstitute":true,"dailyEmail":false}'::jsonb)
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
     '{"provider":"email","providers":["email"]}'::jsonb, '{"name":"João Pedro"}'::jsonb, now(), now(), '', '', '', '')
  on conflict (id) do nothing;

  insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  values
    (marcos, marcos, format('{"sub":"%s","email":"marcos.ferreira@atlantico.com.br"}', marcos)::jsonb, 'email', marcos::text, now(), now(), now()),
    (renata, renata, format('{"sub":"%s","email":"renata.prado@atlantico.com.br"}', renata)::jsonb, 'email', renata::text, now(), now(), now()),
    (joao, joao, format('{"sub":"%s","email":"joao.pedro@domustaff.app"}', joao)::jsonb, 'email', joao::text, now(), now(), now())
  on conflict (id) do nothing;

  insert into public.profiles (id, hotel_id, role, name, phone, department, primary_role, city, hotel_name, professional_code, available_days, available_times, settings, onboarded)
  values
    (marcos, hotel, 'gerencia', 'Marcos Ferreira', '(21) 99887-7661', 'Maître · Restaurante', null, 'Rio de Janeiro', 'Hotel Atlântico Copacabana', null, '{}', '{}', '{"emergencyAlerts":true,"returnAlerts":true,"shiftReminder":true}'::jsonb, true),
    (renata, hotel, 'rh', 'Renata Prado', '(21) 99887-7661', 'RH / Controladoria', null, 'Rio de Janeiro', 'Hotel Atlântico Copacabana', null, '{}', '{}', '{"whatsappNotifications":true,"autoSubstitute":true}'::jsonb, true),
    (joao, hotel, 'freelancer', 'João Pedro', '(21) 99887-7661', null, 'Garçom', 'Rio de Janeiro', 'Hotel Atlântico Copacabana', '1', array['Sex','Sáb','Dom'], array['Tarde / Noite'], '{"whatsappNotifications":true}'::jsonb, true)
  on conflict (id) do nothing;
end $$;

insert into public.daily_rates (hotel_id, role, week, weekend, holiday) values
  ('a0e1b2c3-d4e5-4f67-8899-000000000001', 'Garçom', 180, 220, 270),
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
  ('b0e1b2c3-d4e5-4f67-8899-000000000001', 'a0e1b2c3-d4e5-4f67-8899-000000000001', '1', 'João Pedro', 'Garçom', 'restaurante', 'Disponível', '4 turnos neste hotel', '(21) 99887-7661', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80', 'a0e1b2c3-d4e5-4f67-8899-000000000004'),
  ('b0e1b2c3-d4e5-4f67-8899-000000000002', 'a0e1b2c3-d4e5-4f67-8899-000000000001', '2', 'Mariana Lima', 'Garçom', 'restaurante', 'Disponível', '', '(21) 99887-7662', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', null),
  ('b0e1b2c3-d4e5-4f67-8899-000000000003', 'a0e1b2c3-d4e5-4f67-8899-000000000001', '3', 'Carlos Eduardo', 'Garçom', 'restaurante', 'Disponível', 'Trabalhou no último evento', '(21) 99887-7663', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', null),
  ('b0e1b2c3-d4e5-4f67-8899-000000000004', 'a0e1b2c3-d4e5-4f67-8899-000000000001', '4', 'Ana Beatriz', 'Garçom', 'restaurante', 'Disponível', '', '(21) 99887-7664', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', null),
  ('b0e1b2c3-d4e5-4f67-8899-000000000005', 'a0e1b2c3-d4e5-4f67-8899-000000000001', '5', 'Rafael Costa', 'Bartender', 'bar', 'Disponível', 'Open bar e eventos', '(21) 99887-7665', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', null),
  ('b0e1b2c3-d4e5-4f67-8899-000000000006', 'a0e1b2c3-d4e5-4f67-8899-000000000001', '6', 'Lucas Martins', 'Garçom', 'restaurante', 'Disponível', 'Prefere turno noturno', '(21) 99887-7666', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', null),
  ('b0e1b2c3-d4e5-4f67-8899-000000000007', 'a0e1b2c3-d4e5-4f67-8899-000000000001', '7', 'Fernanda Alves', 'Garçom', 'bar', 'Disponível', '', '(21) 99887-7667', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', null),
  ('b0e1b2c3-d4e5-4f67-8899-000000000008', 'a0e1b2c3-d4e5-4f67-8899-000000000001', '8', 'Tiago Souza', 'Cozinheiro', 'cozinha', 'Disponível', 'Linha quente', '(21) 99887-7668', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80', null),
  ('b0e1b2c3-d4e5-4f67-8899-000000000009', 'a0e1b2c3-d4e5-4f67-8899-000000000001', '9', 'Juliana Castro', 'Garçom', 'restaurante', 'Disponível', 'Disponível para plantão', '(21) 99887-7669', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', null),
  ('b0e1b2c3-d4e5-4f67-8899-000000000010', 'a0e1b2c3-d4e5-4f67-8899-000000000001', '10', 'Felipe Rocha', 'Cumin', 'cdc', 'Disponível', '', '(21) 99887-7670', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80', null),
  ('b0e1b2c3-d4e5-4f67-8899-000000000011', 'a0e1b2c3-d4e5-4f67-8899-000000000001', '11', 'Camila Duarte', 'Camareira', 'governanca', 'Disponível', '', '(21) 99887-7671', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80', null),
  ('b0e1b2c3-d4e5-4f67-8899-000000000012', 'a0e1b2c3-d4e5-4f67-8899-000000000001', '12', 'Bruno Mendes', 'Garçom', 'restaurante', 'Disponível', 'Salão executivo', '(21) 99887-7672', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80', null),
  ('b0e1b2c3-d4e5-4f67-8899-000000000013', 'a0e1b2c3-d4e5-4f67-8899-000000000001', '13', 'Letícia Ramos', 'Recepcionista', 'recepcao', 'Disponível', 'Inglês e espanhol', '(21) 99887-7673', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', null),
  ('b0e1b2c3-d4e5-4f67-8899-000000000014', 'a0e1b2c3-d4e5-4f67-8899-000000000001', '14', 'Bianca Santos', 'Recepcionista', 'recepcao', 'Disponível', 'PMS e check-in executivo', '(21) 99887-7674', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80', null)
on conflict (hotel_id, code) do nothing;

-- Escalas da semana (restaurante) — sexta já com 3 pessoas
insert into public.shift_requests (id, hotel_id, sector, day_date, shift, status, guest_count, created_by) values
  ('c0e1b2c3-d4e5-4f67-8899-000000000015', 'a0e1b2c3-d4e5-4f67-8899-000000000001', 'restaurante', '2025-09-15', '15h – 23h', 'requested', 320, 'a0e1b2c3-d4e5-4f67-8899-000000000002'),
  ('c0e1b2c3-d4e5-4f67-8899-000000000016', 'a0e1b2c3-d4e5-4f67-8899-000000000001', 'restaurante', '2025-09-16', '15h – 23h', 'requested', 280, 'a0e1b2c3-d4e5-4f67-8899-000000000002'),
  ('c0e1b2c3-d4e5-4f67-8899-000000000017', 'a0e1b2c3-d4e5-4f67-8899-000000000001', 'restaurante', '2025-09-17', '15h – 23h', 'requested', 310, 'a0e1b2c3-d4e5-4f67-8899-000000000002'),
  ('c0e1b2c3-d4e5-4f67-8899-000000000018', 'a0e1b2c3-d4e5-4f67-8899-000000000001', 'restaurante', '2025-09-18', '15h – 23h', 'requested', 420, 'a0e1b2c3-d4e5-4f67-8899-000000000002'),
  ('c0e1b2c3-d4e5-4f67-8899-000000000019', 'a0e1b2c3-d4e5-4f67-8899-000000000001', 'restaurante', '2025-09-19', '15h – 23h', 'requested', 500, 'a0e1b2c3-d4e5-4f67-8899-000000000002')
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

-- Convites pendentes do João Pedro
insert into public.invites (hotel_id, professional_id, role, sector, time, location, daily_rate, status, notes, days) values
  ('a0e1b2c3-d4e5-4f67-8899-000000000001', 'b0e1b2c3-d4e5-4f67-8899-000000000001', 'Garçom', 'Restaurante', '15h – 23h', 'Salão principal', 180, 'pending',
   'Pacote da semana: mesmo horário nos 3 dias. Uniforme social completo.',
   array['2025-09-19','2025-09-20','2025-09-21']::date[]),
  ('a0e1b2c3-d4e5-4f67-8899-000000000001', 'b0e1b2c3-d4e5-4f67-8899-000000000001', 'Bartender', 'Bar', '15h – 23h', 'Lobby Bar', 200, 'pending',
   'Evento corporativo com open bar até 22h.',
   array['2025-09-20']::date[]),
  ('a0e1b2c3-d4e5-4f67-8899-000000000001', 'b0e1b2c3-d4e5-4f67-8899-000000000001', 'Recepcionista', 'Recepção', '07h – 15h', 'Front Desk', 170, 'pending',
   'Check-out intenso — inglês intermediário desejável.',
   array['2025-09-21']::date[])
on conflict do nothing;

-- Check-ins do turno de sexta
insert into public.checkins (hotel_id, professional_id, day_date, by_profile_id) values
  ('a0e1b2c3-d4e5-4f67-8899-000000000001', 'b0e1b2c3-d4e5-4f67-8899-000000000001', '2025-09-19', 'a0e1b2c3-d4e5-4f67-8899-000000000002'),
  ('a0e1b2c3-d4e5-4f67-8899-000000000001', 'b0e1b2c3-d4e5-4f67-8899-000000000002', '2025-09-19', 'a0e1b2c3-d4e5-4f67-8899-000000000002'),
  ('a0e1b2c3-d4e5-4f67-8899-000000000001', 'b0e1b2c3-d4e5-4f67-8899-000000000003', '2025-09-19', 'a0e1b2c3-d4e5-4f67-8899-000000000002')
on conflict (hotel_id, professional_id, day_date) do nothing;

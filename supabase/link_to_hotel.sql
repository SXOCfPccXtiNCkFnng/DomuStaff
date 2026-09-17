-- ============================================================================
-- Vínculo de freelancer/gerência por código + inserção na base de profissionais
-- Rode no SQL Editor do Supabase (uma vez).
-- ============================================================================

create or replace function public.link_to_hotel_by_code(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_hotel public.hotels%rowtype;
  v_profile public.profiles%rowtype;
  v_pro_code text;
  v_connected jsonb;
  v_entry jsonb;
  v_list jsonb;
begin
  if v_uid is null then
    raise exception 'Faça login novamente para vincular o estabelecimento.';
  end if;

  select * into v_hotel
  from public.hotels
  where upper(trim(code)) = upper(trim(p_code))
  limit 1;

  if not found then
    raise exception 'Estabelecimento não encontrado. Confira o código com o RH.';
  end if;

  select * into v_profile from public.profiles where id = v_uid;
  if not found then
    raise exception 'Perfil não encontrado.';
  end if;

  v_entry := jsonb_build_object(
    'id', v_hotel.id,
    'code', v_hotel.code,
    'name', v_hotel.name,
    'category', case when coalesce(v_hotel.city, '') <> '' then 'Unidade · ' || v_hotel.city else 'Unidade vinculada' end,
    'role', case
      when v_profile.role = 'gerencia' then coalesce(v_profile.department, 'Gerência Operacional')
      when v_profile.role = 'rh' then coalesce(v_profile.department, 'RH / Controladoria')
      else coalesce(v_profile.primary_role, 'Freelancer')
    end,
    'status', 'Ativo',
    'joinedAt', to_char(timezone('America/Sao_Paulo', now()), 'DD/MM/YYYY'),
    'totalShifts', 0,
    'rating', null,
    'isPrimary', true
  );

  v_connected := coalesce(v_profile.settings->'connectedEstablishments', '[]'::jsonb);
  if jsonb_typeof(v_connected) <> 'array' then
    v_connected := '[]'::jsonb;
  end if;

  -- remove duplicata do mesmo hotel e coloca o novo como principal
  select coalesce(jsonb_agg(elem), '[]'::jsonb)
    into v_list
  from jsonb_array_elements(v_connected) elem
  where coalesce(elem->>'id', '') <> v_hotel.id::text
    and upper(coalesce(elem->>'code', '')) <> upper(v_hotel.code);

  v_list := jsonb_build_array(v_entry) || coalesce(v_list, '[]'::jsonb);

  update public.profiles
  set
    hotel_id = v_hotel.id,
    hotel_name = v_hotel.name,
    professional_code = case
      when v_profile.role = 'freelancer' then coalesce(nullif(v_profile.professional_code, ''), right(replace(v_uid::text, '-', ''), 6))
      else v_profile.professional_code
    end,
    settings = coalesce(settings, '{}'::jsonb)
      || jsonb_build_object(
        'hotelCode', v_hotel.code,
        'hotelCnpj', coalesce(v_hotel.cnpj, ''),
        'connectedEstablishments', v_list
      ),
    updated_at = now()
  where id = v_uid
  returning * into v_profile;

  if v_profile.role = 'freelancer' then
    v_pro_code := coalesce(nullif(v_profile.professional_code, ''), right(replace(v_uid::text, '-', ''), 6));
    insert into public.professionals (
      hotel_id, code, name, role, sector, status, phone, profile_id
    ) values (
      v_hotel.id,
      v_pro_code,
      coalesce(nullif(v_profile.name, ''), 'Freelancer'),
      coalesce(nullif(v_profile.primary_role, ''), 'Garçom'),
      'restaurante',
      'Disponível',
      coalesce(v_profile.phone, ''),
      v_uid
    )
    on conflict (hotel_id, code) do update set
      name = excluded.name,
      role = excluded.role,
      phone = excluded.phone,
      profile_id = excluded.profile_id,
      status = coalesce(public.professionals.status, 'Disponível');
  end if;

  return jsonb_build_object(
    'ok', true,
    'hotel', jsonb_build_object(
      'id', v_hotel.id,
      'name', v_hotel.name,
      'city', v_hotel.city,
      'code', v_hotel.code,
      'cnpj', v_hotel.cnpj
    ),
    'connectedEstablishments', v_list,
    'professionalCode', v_profile.professional_code,
    'hotelId', v_hotel.id
  );
end;
$$;

revoke all on function public.link_to_hotel_by_code(text) from public;
grant execute on function public.link_to_hotel_by_code(text) to authenticated;

create or replace function public.unlink_hotel_by_id(p_hotel_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_profile public.profiles%rowtype;
  v_list jsonb := '[]'::jsonb;
  v_next_id uuid;
  v_next_name text;
  v_next_code text;
begin
  if v_uid is null then
    raise exception 'Faça login novamente.';
  end if;

  select * into v_profile from public.profiles where id = v_uid;
  if not found then
    raise exception 'Perfil não encontrado.';
  end if;

  select coalesce(jsonb_agg(elem), '[]'::jsonb)
    into v_list
  from jsonb_array_elements(coalesce(v_profile.settings->'connectedEstablishments', '[]'::jsonb)) elem
  where coalesce(elem->>'id', '') <> p_hotel_id::text;

  if v_profile.role = 'freelancer' then
    delete from public.professionals
    where hotel_id = p_hotel_id and profile_id = v_uid;
  end if;

  if jsonb_array_length(v_list) > 0 then
    v_next_id := nullif(v_list->0->>'id', '')::uuid;
    v_next_name := v_list->0->>'name';
    v_next_code := v_list->0->>'code';
  else
    v_next_id := null;
    v_next_name := '';
    v_next_code := null;
  end if;

  update public.profiles
  set
    hotel_id = case when hotel_id = p_hotel_id then v_next_id else hotel_id end,
    hotel_name = case when hotel_id = p_hotel_id then coalesce(v_next_name, '') else hotel_name end,
    settings = coalesce(settings, '{}'::jsonb)
      || jsonb_build_object(
        'connectedEstablishments', v_list,
        'hotelCode', coalesce(v_next_code, settings->>'hotelCode')
      ),
    updated_at = now()
  where id = v_uid
  returning * into v_profile;

  return jsonb_build_object(
    'ok', true,
    'connectedEstablishments', v_list,
    'hotelId', v_profile.hotel_id,
    'hotelName', v_profile.hotel_name
  );
end;
$$;

revoke all on function public.unlink_hotel_by_id(uuid) from public;
grant execute on function public.unlink_hotel_by_id(uuid) to authenticated;

drop policy if exists hotels_select on public.hotels;
create policy hotels_select on public.hotels
  for select to authenticated using (true);

drop policy if exists professionals_self_write on public.professionals;
create policy professionals_self_write on public.professionals
  for insert with check (profile_id = auth.uid());

drop policy if exists professionals_self_update on public.professionals;
create policy professionals_self_update on public.professionals
  for update using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

drop policy if exists professionals_self_delete on public.professionals;
create policy professionals_self_delete on public.professionals
  for delete using (profile_id = auth.uid());

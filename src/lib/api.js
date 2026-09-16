import { supabase, isSupabaseConfigured } from './supabase';
import { readDb, writeDb } from './localStore';
import {
  GERENCIA_DAYS, HOTEL_ID, formatInviteDays, inviteDateSummary, dayByIso, SECTOR_SHIFT,
  dailyRateFor, rateKindForDay,
} from './constants';

export { isSupabaseConfigured };

function profileToAccount(p) {
  if (!p) return null;
  return {
    id: p.id,
    role: p.role,
    name: p.name,
    phone: p.phone || '',
    photoUrl: p.photo_url || '',
    department: p.department || '',
    primaryRole: p.primary_role || 'Garçom',
    city: p.city || 'Rio de Janeiro',
    hotelOrRole: p.hotel_name || 'Hotel Atlântico Copacabana',
    professionalCode: p.professional_code || null,
    availableDays: p.available_days || [],
    availableTimes: p.available_times || [],
    settings: p.settings || {},
    onboarded: p.onboarded,
    hotelId: p.hotel_id,
  };
}

function mapInviteRow(row, hotelName, professionals) {
  const days = (row.days || []).map((iso) => {
    const d = dayByIso(iso);
    return d
      ? { id: d.id, label: d.label, date: d.date, dayLabel: d.label, dayNum: d.date.split('/')[0], iso: d.iso }
      : { id: iso, label: iso, date: iso, dayLabel: iso, dayNum: iso.slice(-2), iso };
  });
  const prof = professionals.find((p) => p.uuid === row.professional_id || p.id === row.professional_code);
  return {
    id: row.id,
    professionalId: prof?.id || row.professional_code,
    hotel: hotelName,
    sector: row.sector,
    role: row.role,
    date: inviteDateSummary(days) || row.time,
    time: row.time,
    location: row.location,
    dailyRate: row.daily_rate,
    status: row.status,
    notes: row.notes,
    dayLabel: days[0]?.dayLabel,
    dayNum: days[0]?.dayNum,
    days,
  };
}

export async function signIn(email, password) {
  if (!isSupabaseConfigured) {
    const db = readDb();
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) throw new Error('E-mail ou senha inválidos.');
    db.sessionId = user.id;
    writeDb(db);
    const profile = db.profiles.find((p) => p.id === user.id);
    return { user: { id: user.id, email }, account: profileToAccount(profile) };
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  const { data: profile, error: pErr } = await supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
  if (pErr) throw new Error(pErr.message);
  return { user: data.user, account: profileToAccount(profile) };
}

export async function signUp({ name, email, password, phone, hotelName }) {
  if (!isSupabaseConfigured) {
    const db = readDb();
    if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Este e-mail já está cadastrado.');
    }
    const id = crypto.randomUUID();
    db.users.push({ id, email, password });
    db.profiles.push({
      id,
      hotel_id: HOTEL_ID,
      role: 'gerencia',
      name,
      phone,
      photo_url: '',
      department: '',
      primary_role: '',
      city: 'Rio de Janeiro',
      hotel_name: hotelName,
      professional_code: null,
      available_days: [],
      available_times: [],
      settings: {},
      onboarded: false,
    });
    db.sessionId = id;
    writeDb(db);
    return { user: { id, email }, account: profileToAccount(db.profiles.at(-1)) };
  }
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Não foi possível criar a conta.');
  const row = {
    id: data.user.id,
    hotel_id: HOTEL_ID,
    role: 'gerencia',
    name,
    phone,
    hotel_name: hotelName,
    onboarded: false,
    settings: {},
  };
  const { error: pErr } = await supabase.from('profiles').insert(row);
  if (pErr) throw new Error(pErr.message);
  return { user: data.user, account: profileToAccount({ ...row, available_days: [], available_times: [] }) };
}

export async function signOut() {
  if (!isSupabaseConfigured) {
    const db = readDb();
    db.sessionId = null;
    writeDb(db);
    return;
  }
  await supabase.auth.signOut();
}

export async function getSession() {
  if (!isSupabaseConfigured) {
    const db = readDb();
    if (!db.sessionId) return null;
    const profile = db.profiles.find((p) => p.id === db.sessionId);
    const user = db.users.find((u) => u.id === db.sessionId);
    if (!profile || !user) return null;
    return { user: { id: user.id, email: user.email }, account: profileToAccount(profile) };
  }
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) return null;
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
  return { user, account: profileToAccount(profile) };
}

export async function saveOnboarding(accountId, payload) {
  if (!isSupabaseConfigured) {
    const db = readDb();
    db.profiles = db.profiles.map((p) => (p.id === accountId ? {
      ...p,
      role: payload.role,
      name: payload.name,
      phone: payload.phone,
      department: payload.department || '',
      primary_role: payload.primaryRole || '',
      hotel_name: payload.hotelOrRole || p.hotel_name,
      available_days: payload.availableDays || [],
      available_times: payload.availableTimes || [],
      settings: { ...p.settings, whatsappNotifications: payload.whatsappNotifications, emergencyAlerts: payload.emergencyAlerts },
      onboarded: true,
    } : p));
    writeDb(db);
    return profileToAccount(db.profiles.find((p) => p.id === accountId));
  }
  const { data, error } = await supabase.from('profiles').update({
    role: payload.role,
    name: payload.name,
    phone: payload.phone,
    department: payload.department || null,
    primary_role: payload.primaryRole || null,
    hotel_name: payload.hotelOrRole,
    available_days: payload.availableDays || [],
    available_times: payload.availableTimes || [],
    settings: payload.settings || {},
    onboarded: true,
    updated_at: new Date().toISOString(),
  }).eq('id', accountId).select().single();
  if (error) throw new Error(error.message);
  return profileToAccount(data);
}

export async function loadHotelData(account) {
  if (!isSupabaseConfigured) {
    const db = readDb();
    const invites = account.role === 'freelancer'
      ? db.invites.filter((i) => i.professionalId === (account.professionalCode || '1'))
      : db.invites;
    return {
      professionals: db.professionals,
      rates: db.rates,
      occupancy: db.occupancy,
      selectedByDay: db.selectedByDay,
      sentDays: db.sentDays,
      returnedByDay: db.returnedByDay,
      invites,
      checkins: db.checkins,
      hotelSettings: db.hotelSettings,
      hotel: db.hotel,
    };
  }

  const hotelId = account.hotelId || HOTEL_ID;
  const [
    { data: hotel },
    { data: professionals },
    { data: rates },
    { data: occupancy },
    { data: requests },
    { data: checkins },
  ] = await Promise.all([
    supabase.from('hotels').select('*').eq('id', hotelId).maybeSingle(),
    supabase.from('professionals').select('*').eq('hotel_id', hotelId),
    supabase.from('daily_rates').select('*').eq('hotel_id', hotelId),
    supabase.from('occupancy').select('*').eq('hotel_id', hotelId),
    supabase.from('shift_requests').select('*, shift_request_people(professional_id)').eq('hotel_id', hotelId),
    supabase.from('checkins').select('*').eq('hotel_id', hotelId),
  ]);

  const mappedPros = (professionals || []).map((p) => ({
    id: p.code,
    uuid: p.id,
    name: p.name,
    role: p.role,
    sector: p.sector,
    status: p.status,
    notes: p.notes || '',
    dailyRate: 180,
    avatar: p.avatar_url,
    phone: p.phone,
    profileId: p.profile_id,
  }));

  const occupancyMap = Object.fromEntries(GERENCIA_DAYS.map((d) => [d.id, d.guests]));
  (occupancy || []).forEach((row) => {
    const day = dayByIso(row.day_date);
    if (day) occupancyMap[day.id] = row.guests;
  });

  const selectedByDay = Object.fromEntries(GERENCIA_DAYS.map((d) => [d.id, []]));
  const sentDays = {};
  const returnedByDay = {};
  (requests || []).forEach((req) => {
    const day = dayByIso(req.day_date);
    if (!day) return;
    const codes = (req.shift_request_people || []).map((sp) => {
      const pro = mappedPros.find((p) => p.uuid === sp.professional_id);
      return pro?.id;
    }).filter(Boolean);
    selectedByDay[day.id] = codes;
    if (req.status === 'requested' || req.status === 'sent' || req.status === 'confirmed') {
      sentDays[day.id] = true;
    }
    if (req.status === 'returned' && req.returned_reason) {
      returnedByDay[day.id] = {
        reason: req.returned_reason,
        author: 'RH',
        at: req.returned_at,
        department: req.sector,
      };
    }
  });

  let inviteQuery = supabase.from('invites').select('*').eq('hotel_id', hotelId);
  if (account.role === 'freelancer' && account.professionalCode) {
    const mine = mappedPros.find((p) => p.id === account.professionalCode);
    if (mine?.uuid) inviteQuery = inviteQuery.eq('professional_id', mine.uuid);
  }
  const { data: inviteRows } = await inviteQuery.order('created_at', { ascending: false });
  const invites = (inviteRows || []).map((row) => mapInviteRow(row, hotel?.name || 'Hotel Atlântico Copacabana', mappedPros));

  const checkinCodes = (checkins || []).map((c) => mappedPros.find((p) => p.uuid === c.professional_id)?.id).filter(Boolean);

  return {
    professionals: mappedPros,
    rates: (rates || []).map((r) => ({ role: r.role, week: r.week, weekend: r.weekend, holiday: r.holiday })),
    occupancy: occupancyMap,
    selectedByDay,
    sentDays,
    returnedByDay,
    invites,
    checkins: checkinCodes,
    hotelSettings: hotel?.settings || {},
    hotel: hotel || { id: hotelId, name: 'Hotel Atlântico Copacabana', city: 'Rio de Janeiro' },
    _uuidByCode: Object.fromEntries(mappedPros.map((p) => [p.id, p.uuid])),
  };
}

export async function saveOccupancy(hotelId, dayId, guests) {
  const day = GERENCIA_DAYS.find((d) => d.id === dayId);
  if (!isSupabaseConfigured) {
    const db = readDb();
    db.occupancy[dayId] = guests;
    writeDb(db);
    return;
  }
  const { error } = await supabase.from('occupancy').upsert({
    hotel_id: hotelId || HOTEL_ID,
    day_date: day.iso,
    guests,
  }, { onConflict: 'hotel_id,day_date' });
  if (error) throw new Error(error.message);
}

export async function saveRate(hotelId, role, kind, value) {
  if (!isSupabaseConfigured) {
    const db = readDb();
    db.rates = db.rates.map((r) => (r.role === role ? { ...r, [kind]: value } : r));
    writeDb(db);
    return;
  }
  const { error } = await supabase.from('daily_rates').update({ [kind]: value }).eq('hotel_id', hotelId || HOTEL_ID).eq('role', role);
  if (error) throw new Error(error.message);
}

export async function saveProfile(accountId, patch) {
  if (!isSupabaseConfigured) {
    const db = readDb();
    db.profiles = db.profiles.map((p) => (p.id === accountId ? {
      ...p,
      name: patch.name ?? p.name,
      phone: patch.phone ?? p.phone,
      photo_url: patch.photoUrl ?? p.photo_url,
      department: patch.department ?? p.department,
      primary_role: patch.primaryRole ?? p.primary_role,
      city: patch.city ?? p.city,
      hotel_name: patch.hotelOrRole ?? p.hotel_name,
      available_days: patch.availableDays ?? p.available_days,
      available_times: patch.availableTimes ?? p.available_times,
      settings: patch.settings ? { ...p.settings, ...patch.settings } : p.settings,
    } : p));
    writeDb(db);
    return;
  }
  const row = {};
  if (patch.name != null) row.name = patch.name;
  if (patch.phone != null) row.phone = patch.phone;
  if (patch.photoUrl != null) row.photo_url = patch.photoUrl;
  if (patch.department != null) row.department = patch.department;
  if (patch.primaryRole != null) row.primary_role = patch.primaryRole;
  if (patch.city != null) row.city = patch.city;
  if (patch.hotelOrRole != null) row.hotel_name = patch.hotelOrRole;
  if (patch.availableDays != null) row.available_days = patch.availableDays;
  if (patch.availableTimes != null) row.available_times = patch.availableTimes;
  if (patch.settings != null) row.settings = patch.settings;
  row.updated_at = new Date().toISOString();
  const { error } = await supabase.from('profiles').update(row).eq('id', accountId);
  if (error) throw new Error(error.message);
}

export async function saveDraftScale({ hotelId, sector, dayId, professionalCodes, uuidByCode }) {
  if (!isSupabaseConfigured) {
    const db = readDb();
    db.selectedByDay[dayId] = professionalCodes;
    writeDb(db);
    return;
  }
  const day = GERENCIA_DAYS.find((d) => d.id === dayId);
  const hid = hotelId || HOTEL_ID;
  const { data: existing } = await supabase.from('shift_requests')
    .select('id').eq('hotel_id', hid).eq('sector', sector).eq('day_date', day.iso).maybeSingle();
  let requestId = existing?.id;
  if (!requestId) {
    const { data, error } = await supabase.from('shift_requests').insert({
      hotel_id: hid, sector, day_date: day.iso, shift: SECTOR_SHIFT[sector], status: 'draft',
    }).select('id').single();
    if (error) throw new Error(error.message);
    requestId = data.id;
  }
  await supabase.from('shift_request_people').delete().eq('request_id', requestId);
  const rows = professionalCodes.map((code) => ({ request_id: requestId, professional_id: uuidByCode[code] })).filter((r) => r.professional_id);
  if (rows.length) {
    const { error } = await supabase.from('shift_request_people').insert(rows);
    if (error) throw new Error(error.message);
  }
}

export async function sendToRH({ hotelId, sector, dayId, guestCount, professionalCodes, uuidByCode, createdBy }) {
  if (!isSupabaseConfigured) {
    const db = readDb();
    db.selectedByDay[dayId] = professionalCodes;
    db.sentDays[dayId] = true;
    if (db.returnedByDay[dayId]) delete db.returnedByDay[dayId];
    writeDb(db);
    return;
  }
  const day = GERENCIA_DAYS.find((d) => d.id === dayId);
  const hid = hotelId || HOTEL_ID;
  await saveDraftScale({ hotelId: hid, sector, dayId, professionalCodes, uuidByCode });
  const { error } = await supabase.from('shift_requests').update({
    status: 'requested',
    guest_count: guestCount,
    created_by: createdBy,
    returned_reason: null,
    returned_by: null,
    returned_at: null,
    updated_at: new Date().toISOString(),
  }).eq('hotel_id', hid).eq('sector', sector).eq('day_date', day.iso);
  if (error) throw new Error(error.message);
}

export async function returnRequest({ hotelId, sector, dayId, reason, returnedBy }) {
  if (!isSupabaseConfigured) {
    const db = readDb();
    db.returnedByDay[dayId] = { reason, author: 'RH', at: 'Agora', department: sector };
    delete db.sentDays[dayId];
    writeDb(db);
    return;
  }
  const day = GERENCIA_DAYS.find((d) => d.id === dayId);
  const { error } = await supabase.from('shift_requests').update({
    status: 'returned',
    returned_reason: reason,
    returned_by: returnedBy,
    returned_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('hotel_id', hotelId || HOTEL_ID).eq('sector', sector).eq('day_date', day.iso);
  if (error) throw new Error(error.message);
}

export async function approveAndSend({ hotelId, sector, dayIdsByCode, uuidByCode, rates, hotelName }) {
  if (!isSupabaseConfigured) {
    const db = readDb();
    const stamp = Date.now();
    const packages = Object.entries(dayIdsByCode).map(([code, dayIds], idx) => {
      const f = db.professionals.find((p) => p.id === code);
      const days = formatInviteDays(dayIds);
      return {
        id: `inv-pkg-${stamp}-${idx}`,
        professionalId: code,
        hotel: hotelName || db.hotel.name,
        sector: sector === 'restaurante' ? 'Restaurante' : sector,
        role: f?.role,
        date: inviteDateSummary(days),
        time: SECTOR_SHIFT[sector] || '15h – 23h',
        location: sector === 'restaurante' ? 'Salão principal' : sector,
        dailyRate: f?.dailyRate || 180,
        status: 'pending',
        notes: days.length > 1
          ? `Pacote de ${days.length} turnos no WhatsApp — aceite confirma todos os dias de uma vez.`
          : 'Convite enviado pelo RH após aprovação da escala.',
        dayLabel: days[0]?.dayLabel,
        dayNum: days[0]?.dayNum,
        days,
      };
    });
    db.invites = [...packages, ...db.invites];
    Object.keys(dayIdsByCode).forEach(() => {});
    GERENCIA_DAYS.forEach((d) => {
      const used = Object.values(dayIdsByCode).some((ids) => ids.includes(d.id));
      if (used) db.sentDays[d.id] = true;
    });
    writeDb(db);
    return packages;
  }

  const hid = hotelId || HOTEL_ID;
  const { data: pros } = await supabase.from('professionals').select('*').eq('hotel_id', hid);
  const mappedPros = (pros || []).map((p) => ({
    id: p.code, uuid: p.id, name: p.name, role: p.role,
  }));
  const sectorLabel = {
    restaurante: 'Restaurante', recepcao: 'Recepção', bar: 'Bar',
    cozinha: 'Cozinha', governanca: 'Governança', cdc: 'CDC',
  }[sector] || sector;

  const rows = [];
  for (const [code, dayIds] of Object.entries(dayIdsByCode)) {
    const uuid = uuidByCode[code];
    const pro = mappedPros.find((p) => p.id === code);
    if (!uuid || !pro) continue;
    const days = formatInviteDays(dayIds);
    const kind = rateKindForDay(dayIds[0]);
    const rate = dailyRateFor(pro.role, kind, rates);
    rows.push({
      hotel_id: hid,
      professional_id: uuid,
      role: pro.role,
      sector: sectorLabel,
      time: SECTOR_SHIFT[sector],
      location: sector === 'restaurante' ? 'Salão principal' : sectorLabel,
      daily_rate: rate,
      status: 'pending',
      notes: days.length > 1
        ? `Pacote de ${days.length} turnos no WhatsApp — aceite confirma todos os dias de uma vez.`
        : 'Convite enviado pelo RH após aprovação da escala.',
      days: days.map((d) => d.iso),
    });
  }
  if (!rows.length) return [];
  const { data, error } = await supabase.from('invites').insert(rows).select('*');
  if (error) throw new Error(error.message);
  for (const day of GERENCIA_DAYS) {
    const used = Object.values(dayIdsByCode).some((ids) => ids.includes(day.id));
    if (used) {
      await supabase.from('shift_requests').update({ status: 'sent', updated_at: new Date().toISOString() })
        .eq('hotel_id', hid).eq('sector', sector).eq('day_date', day.iso);
    }
  }
  return (data || []).map((row) => mapInviteRow(row, hotelName, mappedPros));
}

export async function setInviteStatus(inviteId, status) {
  if (!isSupabaseConfigured) {
    const db = readDb();
    db.invites = db.invites.map((i) => (i.id === inviteId ? { ...i, status } : i));
    writeDb(db);
    return;
  }
  const { error } = await supabase.from('invites').update({ status }).eq('id', inviteId);
  if (error) throw new Error(error.message);
}

export async function setCheckin({ hotelId, professionalCode, uuidByCode, dayId, present, byProfileId }) {
  const day = GERENCIA_DAYS.find((d) => d.id === dayId) || GERENCIA_DAYS.find((d) => d.id === 'sex');
  if (!isSupabaseConfigured) {
    const db = readDb();
    if (present) {
      if (!db.checkins.includes(professionalCode)) db.checkins.push(professionalCode);
    } else {
      db.checkins = db.checkins.filter((id) => id !== professionalCode);
    }
    writeDb(db);
    return;
  }
  const uuid = uuidByCode[professionalCode];
  if (!uuid) return;
  if (present) {
    const { error } = await supabase.from('checkins').upsert({
      hotel_id: hotelId || HOTEL_ID,
      professional_id: uuid,
      day_date: day.iso,
      by_profile_id: byProfileId,
    }, { onConflict: 'hotel_id,professional_id,day_date' });
    if (error) throw new Error(error.message);
  } else {
    await supabase.from('checkins').delete()
      .eq('hotel_id', hotelId || HOTEL_ID)
      .eq('professional_id', uuid)
      .eq('day_date', day.iso);
  }
}

export async function uploadPhoto(accountId, dataUrl) {
  if (!isSupabaseConfigured) {
    await saveProfile(accountId, { photoUrl: dataUrl });
    return dataUrl;
  }
  const blob = await (await fetch(dataUrl)).blob();
  const path = `${accountId}/${Date.now()}.jpg`;
  const { error } = await supabase.storage.from('avatars').upload(path, blob, { upsert: true, contentType: blob.type || 'image/jpeg' });
  if (error) {
    await saveProfile(accountId, { photoUrl: dataUrl });
    return dataUrl;
  }
  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  await saveProfile(accountId, { photoUrl: data.publicUrl });
  return data.publicUrl;
}

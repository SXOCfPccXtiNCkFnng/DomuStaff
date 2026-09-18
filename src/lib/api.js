import { supabase, isSupabaseConfigured } from './supabase';
import { readDb, writeDb } from './localStore';
import {
  GERENCIA_DAYS, HOTEL_ID, formatInviteDays, inviteDateSummary, dayByIso, SECTOR_SHIFT,
  dailyRateFor, rateKindForDay, shiftTimesMatch, normalizeSectorId,
} from './constants';

function mapStaffMember(p) {
  return {
    id: p.id,
    name: p.name || 'Sem nome',
    role: p.role || 'gerencia',
    department: p.department || (p.role === 'rh' ? 'RH / Controladoria' : 'Gerência Operacional'),
    phone: p.phone || '',
    photoUrl: p.photo_url || p.photoUrl || '',
  };
}

async function loadManagementTeam(hotelId) {
  if (!hotelId) return [];
  if (!isSupabaseConfigured) {
    const db = readDb();
    return (db.profiles || [])
      .filter((p) => p.hotel_id === hotelId && (p.role === 'gerencia' || p.role === 'rh'))
      .map(mapStaffMember)
      .sort((a, b) => {
        if (a.role === b.role) return a.name.localeCompare(b.name, 'pt-BR');
        return a.role === 'rh' ? -1 : 1;
      });
  }
  const { data, error } = await supabase
    .from('profiles')
    .select('id,name,role,department,phone,photo_url')
    .eq('hotel_id', hotelId)
    .in('role', ['gerencia', 'rh'])
    .order('name', { ascending: true });
  if (error) {
    console.warn('Não foi possível carregar a equipe de gestão:', error.message);
    return [];
  }
  return (data || []).map(mapStaffMember);
}

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
    city: p.city || '',
    hotelOrRole: p.hotel_name || '',
    professionalCode: p.professional_code || null,
    availableDays: p.available_days || [],
    availableTimes: p.available_times || [],
    settings: p.settings || {},
    hotelCode: p.settings?.hotelCode || '',
    hotelCnpj: p.settings?.hotelCnpj || '',
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

export async function signIn(email, password, rememberMe = false) {
  const cleanEmail = (email || '').trim().toLowerCase();
  
  if (!isSupabaseConfigured) {
    const db = readDb();
    const user = db.users.find((u) => u.email.toLowerCase() === cleanEmail && u.password === password);
    if (!user) throw new Error('E-mail ou senha incorretos. Verifique seus dados e tente novamente.');
    db.sessionId = user.id;
    writeDb(db);
    const profile = db.profiles.find((p) => p.id === user.id);
    return { user: { id: user.id, email: cleanEmail }, account: profileToAccount(profile) };
  }

  const { data, error } = await supabase.auth.signInWithPassword({ 
    email: cleanEmail, 
    password 
  });

  if (error) {
    const msg = error.message || '';
    if (msg.includes('Invalid login') || msg.includes('invalid_grant')) {
      throw new Error('E-mail ou senha incorretos. Verifique seus dados e tente novamente.');
    }
    if (msg.includes('Email not confirmed')) {
      throw new Error(
        'Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada ou fale com o suporte do Domu Staff.'
      );
    }
    if (msg.includes('rate limit') || msg.includes('Too many requests')) {
      throw new Error('Muitas tentativas em sequência. Aguarde alguns instantes e tente novamente.');
    }
    throw new Error('E-mail ou senha incorretos. Verifique seus dados e tente novamente.');
  }

  if (!data?.user) {
    throw new Error('Não foi possível autenticar o usuário. Tente novamente.');
  }

  let { data: profile, error: pErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .maybeSingle();

  if (pErr) {
    console.warn('Aviso ao carregar perfil:', pErr.message);
  }
  
  // If profile doesn't exist yet in the table, auto-create one from auth metadata
  if (!profile) {
    const meta = data.user.user_metadata || {};
    const newProfile = {
      id: data.user.id,
      hotel_id: null,
      role: meta.role || 'freelancer',
      name: meta.name || data.user.email?.split('@')[0] || 'Usuário',
      phone: meta.phone || '',
      hotel_name: meta.hotel_name || '',
      city: '',
      onboarded: false,
      settings: {}
    };
    await supabase.from('profiles').upsert(newProfile);
    profile = newProfile;
  }
  
  try {
    if (rememberMe) {
      localStorage.setItem('domu_remember_me', '1');
      sessionStorage.setItem('domu_session_active', '1');
    } else {
      localStorage.setItem('domu_remember_me', '0');
      sessionStorage.setItem('domu_session_active', '1');
    }
  } catch (e) {
    console.warn('Storage warning:', e);
  }
  return { user: data.user, account: profileToAccount(profile) };
}

export async function signUp({ name, email, password, phone, hotelName, role = 'freelancer' }) {
  const cleanEmail = email.trim();
  const cleanName = name.trim();
  const cleanHotel = hotelName?.trim() || (role === 'rh' ? 'Meu Estabelecimento' : '');
  const cleanPhone = phone?.trim() || '';
  const assignedRole = role || 'freelancer';

  if (!isSupabaseConfigured) {
    const db = readDb();
    if (db.users.some((u) => u.email.toLowerCase() === cleanEmail.toLowerCase())) {
      throw new Error('Este e-mail já esta cadastrado.');
    }
    const id = crypto.randomUUID();
    db.users.push({ id, email: cleanEmail, password });
    db.profiles.push({
      id,
      hotel_id: null,
      role: assignedRole,
      name: cleanName,
      phone: cleanPhone,
      photo_url: '',
      department: assignedRole === 'rh' ? 'RH / Controladoria' : assignedRole === 'gerencia' ? 'Gerência Operacional' : '',
      primary_role: assignedRole === 'freelancer' ? 'Garcom' : '',
      city: '',
      hotel_name: cleanHotel,
      professional_code: null,
      available_days: assignedRole === 'freelancer' ? ['Sex', 'Sab', 'Dom'] : [],
      available_times: assignedRole === 'freelancer' ? ['Tarde / Noite'] : [],
      settings: { whatsappNotifications: true, emergencyAlerts: true },
      onboarded: false,
    });
    db.sessionId = id;
    writeDb(db);
    return { user: { id, email: cleanEmail }, account: profileToAccount(db.profiles.at(-1)) };
  }

  // 1. Supabase Auth signup
  const { data, error } = await supabase.auth.signUp({ 
    email: cleanEmail, 
    password,
    options: {
      data: {
        name: cleanName,
        phone: cleanPhone,
        hotel_name: cleanHotel,
        role: assignedRole
      }
    }
  });

  if (error) {
    const msg = error.message || '';
    if (msg.includes('already registered') || msg.includes('unique') || msg.includes('exists') || msg.includes('User already registered')) {
      throw new Error('Este e-mail já está cadastrado no sistema. Faça login ou utilize outro.');
    }
    if (msg.includes('rate limit') || msg.includes('email rate limit') || msg.toLowerCase().includes('rate limit exceeded')) {
      throw new Error(
        'Muitos cadastros em pouco tempo. Aguarde alguns minutos e tente de novo.'
      );
    }
    if (msg.includes('Database error saving new user')) {
      throw new Error('Não foi possível criar a conta agora. Tente novamente em instantes.');
    }
    if (msg.includes('Password') || msg.includes('weak')) {
      throw new Error('A senha deve ter no mínimo 8 caracteres e ser segura.');
    }
    if (msg.includes('valid email')) {
      throw new Error('Por favor, informe um endereço de e-mail válido.');
    }
    throw new Error('Não foi possível criar a conta: ' + (msg || 'Verifique os dados e tente novamente.'));
  }

  if (!data.user) throw new Error('Não foi possivel criar a conta.');

  // 2. Tenta login imediato (precisa de sessão se o RLS exigir auth.uid())
  let hasSession = Boolean(data.session);
  if (!hasSession) {
    const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });
    if (loginErr) {
      throw new Error(
        'Conta criada, mas ainda falta confirmar o e-mail. Verifique sua caixa de entrada e depois faça login.'
      );
    }
    hasSession = Boolean(loginData?.session);
  }

  // 3. Garante linha em profiles (trigger pode falhar; upsert cobre)
  const row = {
    id: data.user.id,
    hotel_id: null,
    role: assignedRole,
    name: cleanName,
    phone: cleanPhone,
    hotel_name: cleanHotel,
    department: assignedRole === 'rh' ? 'RH / Controladoria' : assignedRole === 'gerencia' ? 'Gerência Operacional' : '',
    primary_role: assignedRole === 'freelancer' ? 'Garçom' : '',
    city: '',
    onboarded: false,
    settings: {
      whatsappNotifications: true,
      emergencyAlerts: true,
    },
  };

  const { error: pErr } = await supabase.from('profiles').upsert(row);
  if (pErr) {
    const { data: existing } = await supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
    if (!existing) {
      throw new Error(
        'Conta no Auth sem perfil. No SQL Editor rode supabase/fix_profiles_sync.sql e depois faça login.'
      );
    }
  }

  try {
    localStorage.setItem('domu_remember_me', '1');
    sessionStorage.setItem('domu_session_active', '1');
  } catch (_) {}

  return {
    user: data.user,
    hasSession,
    account: profileToAccount({ ...row, available_days: [], available_times: [] }),
  };
}

export async function signOut() {
  try {
    localStorage.removeItem('domu_remember_me');
    sessionStorage.removeItem('domu_session_active');
  } catch (e) {}

  if (!isSupabaseConfigured) {
    const db = readDb();
    db.sessionId = null;
    writeDb(db);
    return;
  }
  await supabase.auth.signOut();
}

export async function getSession() {
  // Check if session was marked as temporary (rememberMe === false) and browser was closed
  try {
    const rememberMe = localStorage.getItem('domu_remember_me');
    const sessionActive = sessionStorage.getItem('domu_session_active');
    if (rememberMe === '0' && !sessionActive) {
      // Browser was closed and user chose not to stay connected
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
      localStorage.removeItem('domu_remember_me');
      return null;
    }
  } catch (e) {
    console.warn('Session check warning:', e);
  }

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
  if (!accountId) throw new Error('Sessão inválida. Faça login novamente.');

  // Resolve hotel for RH / Gerência / Freelancer (via código do convite)
  let hotelId = payload.hotelId || null;
  let hotelName = payload.hotelOrRole || '';
  let hotelCode = payload.hotelCode || '';
  let hotelCnpj = onlyDigits(payload.hotelCnpj);
  const wantsJoin = payload.hotelMode === 'join' || Boolean(String(payload.hotelCode || '').trim());

  if (payload.role === 'rh' || payload.role === 'gerencia' || (payload.role === 'freelancer' && wantsJoin)) {
    const hotel = await resolveHotelForOnboarding({
      ...payload,
      accountId,
      hotelMode: payload.role === 'freelancer' ? 'join' : (payload.hotelMode || (wantsJoin ? 'join' : 'create')),
    });
    hotelId = hotel.id;
    hotelName = hotel.name;
    hotelCode = hotel.code;
    hotelCnpj = hotel.cnpj || hotelCnpj;
  }

  const linkedEstablishment = hotelId ? {
    id: hotelId,
    code: hotelCode || '',
    name: hotelName || 'Estabelecimento',
    category: 'Principal',
    role: payload.role === 'gerencia'
      ? (payload.department || 'Gerência Operacional')
      : payload.role === 'rh'
        ? (payload.department || 'RH / Controladoria')
        : (payload.primaryRole || 'Freelancer'),
    status: 'Ativo',
    joinedAt: new Date().toLocaleDateString('pt-BR'),
    totalShifts: 0,
    rating: null,
    isPrimary: true,
  } : null;

  const prevConnected = Array.isArray(payload.settings?.connectedEstablishments)
    ? payload.settings.connectedEstablishments
    : [];
  const connectedEstablishments = linkedEstablishment
    ? [
      linkedEstablishment,
      ...prevConnected.filter((h) => h && h.code !== linkedEstablishment.code && h.id !== linkedEstablishment.id),
    ]
    : prevConnected;

  if (!isSupabaseConfigured) {
    const db = readDb();
    const idx = db.profiles.findIndex((p) => p.id === accountId);
    const base = idx >= 0 ? db.profiles[idx] : {
      id: accountId,
      hotel_id: hotelId || null,
      photo_url: '',
      city: '',
      professional_code: null,
    };
    const next = {
      ...base,
      hotel_id: hotelId || null,
      role: payload.role,
      name: payload.name,
      phone: payload.phone,
      department: payload.department || '',
      primary_role: payload.primaryRole || '',
      hotel_name: hotelName || base.hotel_name || '',
      city: payload.city || base.city || '',
      available_days: payload.availableDays || [],
      available_times: payload.availableTimes || [],
      settings: {
        ...(base.settings || {}),
        whatsappNotifications: payload.whatsappNotifications !== false,
        emergencyAlerts: payload.emergencyAlerts !== false,
        hotelCode: hotelCode || undefined,
        hotelCnpj: hotelCnpj || undefined,
        connectedEstablishments,
        ...(payload.settings || {}),
        connectedEstablishments,
      },
      onboarded: true,
    };
    if (idx >= 0) db.profiles[idx] = next;
    else db.profiles.push(next);
    if (hotelId && hotelName) {
      db.hotel = {
        id: hotelId,
        name: hotelName,
        city: payload.city || '',
        code: hotelCode,
        cnpj: hotelCnpj || undefined,
      };
    }
    if (payload.role === 'freelancer' && hotelId) {
      const code = String(base.professional_code || Date.now()).slice(-6);
      next.professional_code = code;
      const exists = (db.professionals || []).some((p) => p.profile_id === accountId || (p.hotel_id === hotelId && p.code === code));
      if (!exists) {
        db.professionals = [
          ...(db.professionals || []),
          {
            id: code,
            uuid: crypto.randomUUID?.() || String(Date.now()),
            hotel_id: hotelId,
            name: payload.name,
            role: payload.primaryRole || 'Garçom',
            sector: 'restaurante',
            status: 'Disponível',
            phone: payload.phone || '',
            profile_id: accountId,
          },
        ];
      }
    }
    writeDb(db);
    return profileToAccount(next);
  }

  const row = {
    id: accountId,
    hotel_id: hotelId || null,
    role: payload.role,
    name: payload.name,
    phone: payload.phone || '',
    department: payload.department || null,
    primary_role: payload.primaryRole || null,
    hotel_name: hotelName || '',
    city: payload.city || '',
    available_days: payload.availableDays || [],
    available_times: payload.availableTimes || [],
    settings: {
      whatsappNotifications: payload.whatsappNotifications !== false,
      emergencyAlerts: payload.emergencyAlerts !== false,
      hotelCode: hotelCode || undefined,
      hotelCnpj: hotelCnpj || undefined,
      connectedEstablishments,
      ...(payload.settings || {}),
      connectedEstablishments,
    },
    onboarded: true,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('profiles')
    .upsert(row, { onConflict: 'id' })
    .select('*')
    .single();

  if (error) throw new Error(error.message || 'Não foi possível salvar o onboarding.');

  if (payload.role === 'freelancer' && hotelId) {
    const code = String(data.professional_code || onlyDigits(Date.now()).slice(-6) || '1');
    await supabase.from('professionals').upsert({
      hotel_id: hotelId,
      code,
      name: payload.name,
      role: payload.primaryRole || 'Garçom',
      sector: 'restaurante',
      status: 'Disponível',
      phone: payload.phone || '',
      profile_id: accountId,
    }, { onConflict: 'hotel_id,code' });
    if (!data.professional_code) {
      await supabase.from('profiles').update({ professional_code: code }).eq('id', accountId);
      data.professional_code = code;
    }
  }

  return profileToAccount(data);
}

function onlyDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

function formatCnpj(digits) {
  const d = onlyDigits(digits).slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

/** Valida CNPJ com dígitos verificadores (rejeita sequências 000... / 111...). */
function isValidCnpj(value) {
  const cnpj = onlyDigits(value);
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1+$/.test(cnpj)) return false;

  const calc = (base, weights) => {
    const sum = weights.reduce((acc, w, i) => acc + Number(base[i]) * w, 0);
    const mod = sum % 11;
    return mod < 2 ? 0 : 11 - mod;
  };

  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const d1 = calc(cnpj, w1);
  const d2 = calc(cnpj, w2);
  return d1 === Number(cnpj[12]) && d2 === Number(cnpj[13]);
}

/** Código forte e difícil de chutar: XXXX-XXXX-XXXX (sem O/0/I/1). */
function generateEstablishmentCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const chunk = (n) => {
    let out = '';
    const bytes = new Uint8Array(n);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(bytes);
    else for (let i = 0; i < n; i += 1) bytes[i] = Math.floor(Math.random() * 256);
    for (let i = 0; i < n; i += 1) out += alphabet[bytes[i] % alphabet.length];
    return out;
  };
  return `${chunk(4)}-${chunk(4)}-${chunk(4)}`;
}

function suggestHotelCode(name) {
  // legado — preferir generateEstablishmentCode
  return generateEstablishmentCode();
}

async function resolveHotelForOnboarding(payload) {
  const mode = payload.hotelMode || 'create';
  const cnpj = onlyDigits(payload.hotelCnpj);
  const code = String(payload.hotelCode || '').trim().toUpperCase();
  const name = String(payload.hotelOrRole || '').trim();

  if (!isSupabaseConfigured) {
    const db = readDb();
    if (!db.hotelsList) {
      db.hotelsList = [{
        id: HOTEL_ID,
        name: 'Hotel Atlântico Copacabana',
        city: 'Rio de Janeiro',
        cnpj: '12345678000199',
        code: 'ATL-COPA',
      }];
    }

    if (mode === 'join') {
      const found = db.hotelsList.find((h) => h.code === code || (cnpj && h.cnpj === cnpj));
      if (!found) throw new Error('Estabelecimento não encontrado. Confira o código (ex.: EST-001) ou o CNPJ.');
      return found;
    }

    if (cnpj.length !== 14 || !isValidCnpj(cnpj)) throw new Error('Informe um CNPJ válido.');
    if (!name) throw new Error('Informe o nome do estabelecimento.');
    const dup = db.hotelsList.find((h) => h.cnpj === cnpj);
    if (dup) {
      throw new Error(
        `Este CNPJ já está cadastrado como "${dup.name}". Use a opção "Já tenho código" com o código ${dup.code}.`
      );
    }
    let newCode = generateEstablishmentCode();
    while (db.hotelsList.some((h) => h.code === newCode)) newCode = generateEstablishmentCode();
    const hotel = { id: crypto.randomUUID(), name, city: payload.city || '', cnpj, code: newCode };
    db.hotelsList.push(hotel);
    writeDb(db);
    return hotel;
  }

  if (mode === 'join') {
    if (!code && cnpj.length !== 14) {
      throw new Error('Informe o código do estabelecimento ou o CNPJ para entrar.');
    }
    let query = supabase.from('hotels').select('id,name,city,cnpj,code');
    if (code) query = query.eq('code', code);
    else query = query.eq('cnpj', cnpj);
    const { data, error } = await query.maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new Error('Estabelecimento não encontrado. Peça o código ao RH do estabelecimento.');
    return data;
  }

  if (cnpj.length !== 14 || !isValidCnpj(cnpj)) throw new Error('Informe um CNPJ válido.');
  if (!name) throw new Error('Informe o nome do estabelecimento.');

  const { data: existing } = await supabase.from('hotels').select('id,name,code,cnpj').eq('cnpj', cnpj).maybeSingle();
  if (existing) {
    throw new Error(
      `Este CNPJ já está cadastrado como "${existing.name}". Use "Já tenho código" com o código ${existing.code || 'do estabelecimento'}.`
    );
  }

  let newCode = generateEstablishmentCode();
  for (let i = 0; i < 5; i += 1) {
    const { data: codeClash } = await supabase.from('hotels').select('id').eq('code', newCode).maybeSingle();
    if (!codeClash) break;
    newCode = generateEstablishmentCode();
  }

  const { data: created, error } = await supabase.from('hotels').insert({
    name,
    city: payload.city || null,
    cnpj,
    code: newCode,
    created_by: payload.accountId || null,
    settings: {},
  }).select('id,name,city,cnpj,code').single();

  if (error) {
    if (String(error.message || '').toLowerCase().includes('duplicate') || error.code === '23505') {
      throw new Error('CNPJ ou código já cadastrado. Use a opção de entrar com o código do estabelecimento.');
    }
    throw new Error(error.message || 'Não foi possível criar o estabelecimento. Rode supabase/hotels_cnpj.sql no SQL Editor.');
  }
  return created;
}

export { formatCnpj, onlyDigits, suggestHotelCode, generateEstablishmentCode, isValidCnpj };

export async function loadHotelData(account) {
  if (!isSupabaseConfigured) {
    const db = readDb();
    const invites = account.role === 'freelancer'
      ? db.invites.filter((i) => i.professionalId === (account.professionalCode || '1'))
      : db.invites;
    const isDemoHotel = account.hotelId === HOTEL_ID;
    const linkedHotel = account.hotelId
      ? (db.hotelsList || []).find((h) => h.id === account.hotelId)
        || (isDemoHotel ? db.hotel : {
          id: account.hotelId,
          name: account.hotelOrRole || '',
          city: account.city || '',
          code: account.hotelCode || '',
          cnpj: account.hotelCnpj || '',
        })
      : {
        id: null,
        name: account.hotelOrRole || '',
        city: account.city || '',
        code: account.hotelCode || '',
        cnpj: account.hotelCnpj || '',
      };
    return {
      professionals: isDemoHotel ? db.professionals : [],
      rates: isDemoHotel ? db.rates : [],
      occupancy: isDemoHotel
        ? db.occupancy
        : Object.fromEntries(GERENCIA_DAYS.map((d) => [d.id, 0])),
      selectedByDay: isDemoHotel
        ? db.selectedByDay
        : Object.fromEntries(GERENCIA_DAYS.map((d) => [d.id, []])),
      shiftByDay: isDemoHotel ? (db.shiftByDay || {}) : {},
      sentDays: isDemoHotel ? db.sentDays : {},
      invitedByDay: isDemoHotel ? (db.invitedByDay || {}) : {},
      returnedByDay: isDemoHotel ? db.returnedByDay : {},
      requestStatusByDay: {},
      invites: isDemoHotel ? invites : [],
      checkins: isDemoHotel ? db.checkins : [],
      hotelSettings: isDemoHotel ? db.hotelSettings : {},
      hotel: linkedHotel,
      managementTeam: await loadManagementTeam(account.hotelId),
    };
  }

  const hotelId = account.hotelId || null;
  if (!hotelId) {
    return {
      professionals: [],
      rates: [],
      occupancy: Object.fromEntries(GERENCIA_DAYS.map((d) => [d.id, 0])),
      selectedByDay: Object.fromEntries(GERENCIA_DAYS.map((d) => [d.id, []])),
      shiftByDay: {},
      sentDays: {},
      invitedByDay: {},
      returnedByDay: {},
      requestStatusByDay: {},
      invites: [],
      checkins: [],
      hotelSettings: {},
      hotel: {
        id: null,
        name: account.hotelOrRole || '',
        city: account.city || '',
        code: account.hotelCode || account.settings?.hotelCode || '',
        cnpj: account.hotelCnpj || account.settings?.hotelCnpj || '',
      },
      managementTeam: [],
      _uuidByCode: {},
    };
  }
  const [
    { data: hotel },
    prosResult,
    { data: rates },
    { data: occupancy },
    { data: requests },
    { data: checkins },
  ] = await Promise.all([
    supabase.from('hotels').select('*').eq('id', hotelId).maybeSingle(),
    supabase.from('professionals').select('*, profiles:profile_id(photo_url)').eq('hotel_id', hotelId),
    supabase.from('daily_rates').select('*').eq('hotel_id', hotelId),
    supabase.from('occupancy').select('*').eq('hotel_id', hotelId),
    supabase.from('shift_requests').select('*, shift_request_people(professional_id)').eq('hotel_id', hotelId),
    supabase.from('checkins').select('*').eq('hotel_id', hotelId),
  ]);
  let professionals = prosResult.data;
  if (prosResult.error) {
    const fallback = await supabase.from('professionals').select('*').eq('hotel_id', hotelId);
    professionals = fallback.data;
  }
  const managementTeam = await loadManagementTeam(hotelId);

  const mappedPros = (professionals || []).map((p) => {
    const profilePhoto = Array.isArray(p.profiles)
      ? p.profiles[0]?.photo_url
      : p.profiles?.photo_url;
    const sectorsRaw = Array.isArray(p.sectors) && p.sectors.length
      ? p.sectors
      : (p.sector ? [p.sector] : ['restaurante']);
    return {
      id: p.code,
      uuid: p.id,
      name: p.name,
      role: p.role,
      sector: p.sector || sectorsRaw[0] || 'restaurante',
      sectors: sectorsRaw,
      status: p.status,
      notes: p.notes || '',
      dailyRate: 180,
      avatar: p.avatar_url || profilePhoto || '',
      phone: p.phone,
      profileId: p.profile_id,
    };
  });

  const occupancyMap = Object.fromEntries(GERENCIA_DAYS.map((d) => [d.id, 0]));
  const occupancyByIso = {};
  (occupancy || []).forEach((row) => {
    occupancyByIso[row.day_date] = row.guests;
    const day = dayByIso(row.day_date);
    if (day) occupancyMap[day.id] = row.guests;
  });

  const selectedByDay = Object.fromEntries(GERENCIA_DAYS.map((d) => [d.id, []]));
  const shiftByDay = {};
  const sentDays = {};
  const returnedByDay = {};
  const requestStatusByDay = {};
  const statusRank = { draft: 0, returned: 1, requested: 2, sent: 3, confirmed: 4 };
  const isGerencia = account.role === 'gerencia';
  (requests || []).forEach((req) => {
    // Gerência: só pedidos da própria conta (ou legado sem created_by)
    if (isGerencia && req.created_by && req.created_by !== account.id) return;
    const day = dayByIso(req.day_date);
    if (!day) return;
    const codes = (req.shift_request_people || []).map((sp) => {
      const pro = mappedPros.find((p) => p.uuid === sp.professional_id);
      return pro?.id;
    }).filter(Boolean);
    selectedByDay[day.id] = [...new Set([...(selectedByDay[day.id] || []), ...codes])];
    if (req.shift) {
      if (!shiftByDay[day.id] || typeof shiftByDay[day.id] !== 'object') {
        shiftByDay[day.id] = {};
      }
      shiftByDay[day.id][req.sector || 'restaurante'] = req.shift;
    }
    const nextStatus = req.status || 'draft';
    const prevStatus = requestStatusByDay[day.id];
    if (!prevStatus || (statusRank[nextStatus] ?? 0) >= (statusRank[prevStatus] ?? 0)) {
      requestStatusByDay[day.id] = nextStatus;
    }
    // sentDays = já aprovado pelo RH (convites disparados)
    if (req.status === 'sent' || req.status === 'confirmed') {
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
  const myPro = account.role === 'freelancer'
    ? mappedPros.find((p) =>
      (account.professionalCode && p.id === account.professionalCode)
      || (p.profileId && p.profileId === account.id),
    )
    : null;
  if (account.role === 'freelancer') {
    if (myPro?.uuid) {
      inviteQuery = inviteQuery.eq('professional_id', myPro.uuid);
    } else {
      inviteQuery = inviteQuery.eq('professional_id', '00000000-0000-0000-0000-000000000000');
    }
  }
  const { data: inviteRows } = await inviteQuery.order('created_at', { ascending: false });
  const invites = (inviteRows || []).map((row) => mapInviteRow(row, hotel?.name || account.hotelOrRole || 'Estabelecimento', mappedPros));

  // Códigos já convocados por dia+horário: [{ code, time }]
  const invitedByDay = Object.fromEntries(GERENCIA_DAYS.map((d) => [d.id, []]));
  const resolveDay = (isoOrDay) => {
    if (!isoOrDay) return null;
    if (typeof isoOrDay === 'object') {
      const iso = isoOrDay.iso || isoOrDay.day_date || isoOrDay.date;
      return resolveDay(iso);
    }
    const raw = String(isoOrDay);
    const iso = raw.slice(0, 10);
    return dayByIso(iso) || dayByIso(raw) || GERENCIA_DAYS.find((d) => d.iso === iso || d.iso === raw) || null;
  };
  const pushInvited = (code, time, iso, status = 'pending', sector = '') => {
    const day = resolveDay(iso);
    if (!day || !code) return;
    let t = (time && time !== '—') ? String(time) : '';
    if (!t) {
      const bySector = shiftByDay[day.id];
      if (bySector && typeof bySector === 'object') {
        t = bySector.restaurante || Object.values(bySector).find(Boolean) || '';
      } else if (typeof bySector === 'string') {
        t = bySector;
      }
    }
    const sec = normalizeSectorId(sector) || '';
    const list = invitedByDay[day.id];
    const same = list.findIndex((e) => e.code === code && (!t || !e.time || shiftTimesMatch(e.time, t)));
    if (same >= 0) {
      const prev = list[same];
      list[same] = {
        code,
        time: t || prev.time || '',
        status: status || prev.status || 'pending',
        sector: sec || prev.sector || '',
      };
      return;
    }
    list.push({ code, time: t, status: status || 'pending', sector: sec });
  };

  if (account.role !== 'freelancer') {
    (inviteRows || []).forEach((row) => {
      const code = mappedPros.find((p) => p.uuid === row.professional_id)?.id;
      if (!code) return;
      const st = row.status || 'pending';
      // pending / accepted / declined / confirmed — recusado continua visível pro RH
      if (!['pending', 'accepted', 'declined', 'confirmed'].includes(st)) return;
      const dayList = Array.isArray(row.days) ? row.days : [];
      dayList.forEach((iso) => pushInvited(code, row.time || '', iso, st, row.sector || ''));
    });

    // Se todos os convites do dia foram aceitos, marca a escala como confirmada na UI
    GERENCIA_DAYS.forEach((day) => {
      const list = invitedByDay[day.id] || [];
      if (!list.length) return;
      const allAccepted = list.every((e) => e.status === 'accepted' || e.status === 'confirmed');
      const anyDeclined = list.some((e) => e.status === 'declined');
      const anyPending = list.some((e) => e.status === 'pending');
      if (allAccepted && requestStatusByDay[day.id] === 'sent') {
        requestStatusByDay[day.id] = 'confirmed';
      } else if (anyDeclined && !anyPending && requestStatusByDay[day.id] === 'sent') {
        // mantém sent, mas o Kanban usa os statuses dos convites
      }
    });
  }

  const checkinCodes = (checkins || []).map((c) => mappedPros.find((p) => p.uuid === c.professional_id)?.id).filter(Boolean);

  return {
    professionals: mappedPros,
    rates: (rates || []).map((r) => ({ role: r.role, week: r.week, weekend: r.weekend, holiday: r.holiday })),
    occupancy: occupancyMap,
    occupancyByIso,
    selectedByDay,
    shiftByDay,
    sentDays,
    returnedByDay,
    requestStatusByDay,
    invitedByDay,
    invites,
    checkins: checkinCodes,
    hotelSettings: hotel?.settings || {},
    hotel: hotel || { id: hotelId, name: account.hotelOrRole || '', city: '' },
    managementTeam,
    _uuidByCode: Object.fromEntries(mappedPros.map((p) => [p.id, p.uuid])),
    _myProfessionalUuid: myPro?.uuid || null,
  };
}

export async function saveOccupancy(hotelId, dayId, guests, dayIso) {
  const day = GERENCIA_DAYS.find((d) => d.id === dayId);
  const iso = dayIso || day?.iso;
  if (!isSupabaseConfigured) {
    const db = readDb();
    db.occupancy[dayId] = guests;
    if (iso) {
      db.occupancyByIso = { ...(db.occupancyByIso || {}), [iso]: guests };
    }
    writeDb(db);
    return;
  }
  if (!hotelId) throw new Error('Estabelecimento não vinculado. Conclua o cadastro do local.');
  if (!iso) throw new Error('Não foi possível salvar a ocupação deste dia.');
  const { error } = await supabase.from('occupancy').upsert({
    hotel_id: hotelId,
    day_date: iso,
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
  if (!hotelId) throw new Error('Estabelecimento não vinculado. Conclua o cadastro do local.');
  const { data: existing } = await supabase
    .from('daily_rates')
    .select('week,weekend,holiday')
    .eq('hotel_id', hotelId)
    .eq('role', role)
    .maybeSingle();
  const row = {
    hotel_id: hotelId,
    role,
    week: kind === 'week' ? value : (existing?.week ?? 0),
    weekend: kind === 'weekend' ? value : (existing?.weekend ?? 0),
    holiday: kind === 'holiday' ? value : (existing?.holiday ?? 0),
  };
  const { error } = await supabase.from('daily_rates').upsert(row, { onConflict: 'hotel_id,role' });
  if (error) throw new Error(error.message);
}

export async function saveRatesBatch(hotelId, rates) {
  if (!hotelId || !rates?.length) return;
  if (!isSupabaseConfigured) {
    const db = readDb();
    db.rates = rates.map((r) => ({
      role: r.role,
      week: Number(r.week) || 0,
      weekend: Number(r.weekend) || 0,
      holiday: Number(r.holiday) || 0,
    }));
    writeDb(db);
    return;
  }
  const rows = rates.map((r) => ({
    hotel_id: hotelId,
    role: r.role,
    week: Number(r.week) || 0,
    weekend: Number(r.weekend) || 0,
    holiday: Number(r.holiday) || 0,
  }));
  const { error } = await supabase.from('daily_rates').upsert(rows, { onConflict: 'hotel_id,role' });
  if (error) throw new Error(error.message);
}

/** Busca estabelecimento real pelo código de conexão (ex.: HOT-TEST). */
export async function findHotelByCode(rawCode) {
  const code = String(rawCode || '').trim().toUpperCase();
  if (!code) throw new Error('Informe o código do estabelecimento.');

  if (!isSupabaseConfigured) {
    const db = readDb();
    const found = (db.hotelsList || []).find((h) => String(h.code || '').toUpperCase() === code)
      || (db.hotel && String(db.hotel.code || '').toUpperCase() === code ? db.hotel : null);
    if (!found) throw new Error('Estabelecimento não encontrado. Confira o código com o RH.');
    return {
      id: found.id,
      name: found.name,
      city: found.city || '',
      cnpj: found.cnpj || '',
      code: found.code,
    };
  }

  const { data, error } = await supabase
    .from('hotels')
    .select('id,name,city,cnpj,code')
    .eq('code', code)
    .maybeSingle();
  if (error) throw new Error(error.message || 'Não foi possível buscar o estabelecimento.');
  if (!data) throw new Error('Estabelecimento não encontrado. Peça o código ao RH.');
  return data;
}

/** Vincula a conta ao hotel pelo código e (freelancer) entra na base de profissionais. */
export async function linkToHotelByCode(rawCode) {
  const code = String(rawCode || '').trim().toUpperCase();
  if (!code) throw new Error('Informe o código do estabelecimento.');

  if (!isSupabaseConfigured) {
    const hotel = await findHotelByCode(code);
    const db = readDb();
    const idx = db.profiles.findIndex((p) => p.id === db.sessionId);
    if (idx < 0) throw new Error('Faça login novamente.');
    const profile = db.profiles[idx];
    const entry = {
      id: hotel.id,
      code: hotel.code,
      name: hotel.name,
      category: hotel.city ? `Unidade · ${hotel.city}` : 'Unidade vinculada',
      role: profile.role === 'gerencia'
        ? (profile.department || 'Gerência Operacional')
        : profile.role === 'rh'
          ? (profile.department || 'RH / Controladoria')
          : (profile.primary_role || 'Freelancer'),
      status: 'Ativo',
      joinedAt: new Date().toLocaleDateString('pt-BR'),
      totalShifts: 0,
      rating: null,
      isPrimary: true,
    };
    const prev = Array.isArray(profile.settings?.connectedEstablishments)
      ? profile.settings.connectedEstablishments
      : [];
    const connected = [
      entry,
      ...prev.filter((h) => h && h.id !== hotel.id && String(h.code || '').toUpperCase() !== code),
    ];
    let professionalCode = profile.professional_code;
    if (profile.role === 'freelancer') {
      professionalCode = professionalCode || String(Date.now()).slice(-6);
      const exists = (db.professionals || []).some(
        (p) => p.profile_id === profile.id && p.hotel_id === hotel.id
      );
      if (!exists) {
        db.professionals = [
          ...(db.professionals || []),
          {
            id: professionalCode,
            uuid: crypto.randomUUID?.() || String(Date.now()),
            hotel_id: hotel.id,
            name: profile.name,
            role: profile.primary_role || 'Garçom',
            sector: 'restaurante',
            status: 'Disponível',
            phone: profile.phone || '',
            profile_id: profile.id,
          },
        ];
      }
    }
    db.profiles[idx] = {
      ...profile,
      hotel_id: hotel.id,
      hotel_name: hotel.name,
      professional_code: professionalCode,
      settings: {
        ...(profile.settings || {}),
        hotelCode: hotel.code,
        hotelCnpj: hotel.cnpj || '',
        connectedEstablishments: connected,
      },
    };
    db.hotel = { ...hotel };
    writeDb(db);
    return {
      ok: true,
      hotel,
      connectedEstablishments: connected,
      professionalCode,
      hotelId: hotel.id,
      account: profileToAccount(db.profiles[idx]),
    };
  }

  const { data, error } = await supabase.rpc('link_to_hotel_by_code', { p_code: code });
  if (error) {
    const msg = error.message || '';
    if (msg.includes('function') && msg.includes('does not exist')) {
      throw new Error(
        'Falta ativar o vínculo no banco. No SQL Editor rode supabase/link_to_hotel.sql e tente de novo.'
      );
    }
    throw new Error(msg || 'Não foi possível vincular o estabelecimento.');
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', (await supabase.auth.getUser()).data.user?.id).maybeSingle();
  return {
    ok: true,
    hotel: data?.hotel,
    connectedEstablishments: data?.connectedEstablishments || [],
    professionalCode: data?.professionalCode,
    hotelId: data?.hotelId,
    account: profileToAccount(profile),
  };
}

export async function unlinkFromHotel(hotelId) {
  if (!hotelId) throw new Error('Estabelecimento inválido.');

  if (!isSupabaseConfigured) {
    const db = readDb();
    const idx = db.profiles.findIndex((p) => p.id === db.sessionId);
    if (idx < 0) throw new Error('Faça login novamente.');
    const profile = db.profiles[idx];
    const prev = Array.isArray(profile.settings?.connectedEstablishments)
      ? profile.settings.connectedEstablishments
      : [];
    const connected = prev.filter((h) => h && h.id !== hotelId);
    const nextPrimary = connected[0] || null;
    if (profile.role === 'freelancer') {
      db.professionals = (db.professionals || []).filter(
        (p) => !(p.profile_id === profile.id && p.hotel_id === hotelId)
      );
    }
    db.profiles[idx] = {
      ...profile,
      hotel_id: profile.hotel_id === hotelId ? (nextPrimary?.id || null) : profile.hotel_id,
      hotel_name: profile.hotel_id === hotelId ? (nextPrimary?.name || '') : profile.hotel_name,
      settings: {
        ...(profile.settings || {}),
        connectedEstablishments: connected,
        hotelCode: nextPrimary?.code || profile.settings?.hotelCode,
      },
    };
    writeDb(db);
    return {
      ok: true,
      connectedEstablishments: connected,
      hotelId: db.profiles[idx].hotel_id,
      hotelName: db.profiles[idx].hotel_name,
      account: profileToAccount(db.profiles[idx]),
    };
  }

  const { data, error } = await supabase.rpc('unlink_hotel_by_id', { p_hotel_id: hotelId });
  if (error) {
    const msg = error.message || '';
    if (msg.includes('function') && msg.includes('does not exist')) {
      throw new Error(
        'Falta ativar o desvínculo no banco. No SQL Editor rode supabase/link_to_hotel.sql e tente de novo.'
      );
    }
    throw new Error(msg || 'Não foi possível desvincular o estabelecimento.');
  }
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', (await supabase.auth.getUser()).data.user?.id).maybeSingle();
  return {
    ok: true,
    connectedEstablishments: data?.connectedEstablishments || [],
    hotelId: data?.hotelId || null,
    hotelName: data?.hotelName || '',
    account: profileToAccount(profile),
  };
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
      settings: patch.settings ? { ...(p.settings || {}), ...patch.settings } : p.settings,
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
  if (patch.settings != null) {
    const { data: existing } = await supabase
      .from('profiles')
      .select('settings')
      .eq('id', accountId)
      .maybeSingle();
    row.settings = { ...(existing?.settings || {}), ...patch.settings };
  }
  row.updated_at = new Date().toISOString();
  const { error } = await supabase.from('profiles').update(row).eq('id', accountId);
  if (error) throw new Error(error.message);
}

export async function saveDraftScale({ hotelId, sector, dayId, professionalCodes, uuidByCode, createdBy, shift }) {
  if (!isSupabaseConfigured) {
    const db = readDb();
    db.selectedByDay[dayId] = professionalCodes;
    if (shift) {
      const sec = sector || 'restaurante';
      const prev = db.shiftByDay || {};
      const dayEntry = prev[dayId] && typeof prev[dayId] === 'object' ? { ...prev[dayId] } : {};
      dayEntry[sec] = shift;
      db.shiftByDay = { ...prev, [dayId]: dayEntry };
    }
    writeDb(db);
    return;
  }
  const dayRow = GERENCIA_DAYS.find((d) => d.id === dayId);
  if (!dayRow?.iso) throw new Error('Dia inválido para a escala.');
  const hid = hotelId || HOTEL_ID;
  const shiftLabel = shift || SECTOR_SHIFT[sector] || '15h – 23h';
  const { data: existing } = await supabase.from('shift_requests')
    .select('id, created_by').eq('hotel_id', hid).eq('sector', sector).eq('day_date', dayRow.iso).maybeSingle();
  let requestId = existing?.id;
  if (!requestId) {
    const { data, error } = await supabase.from('shift_requests').insert({
      hotel_id: hid,
      sector,
      day_date: dayRow.iso,
      shift: shiftLabel,
      status: 'draft',
      created_by: createdBy || null,
    }).select('id').single();
    if (error) throw new Error(error.message);
    requestId = data.id;
  } else {
    await supabase.from('shift_requests').update({
      shift: shiftLabel,
      ...(createdBy && !existing.created_by ? { created_by: createdBy } : {}),
      updated_at: new Date().toISOString(),
    }).eq('id', requestId);
  }
  const { error: delErr } = await supabase.from('shift_request_people').delete().eq('request_id', requestId);
  if (delErr) throw new Error(delErr.message);
  const seen = new Set();
  const rows = [];
  const missing = [];
  for (const code of professionalCodes || []) {
    const professionalId = uuidByCode?.[code];
    if (!professionalId) {
      missing.push(code);
      continue;
    }
    if (seen.has(professionalId)) continue;
    seen.add(professionalId);
    rows.push({ request_id: requestId, professional_id: professionalId });
  }
  if ((professionalCodes || []).length > 0 && rows.length === 0) {
    throw new Error('Não foi possível vincular os profissionais à escala. Atualize a página e tente de novo.');
  }
  if (missing.length && rows.length === 0) {
    throw new Error('Profissional sem vínculo no estabelecimento. Atualize a página e tente de novo.');
  }
  if (rows.length) {
    const { error } = await supabase
      .from('shift_request_people')
      .upsert(rows, { onConflict: 'request_id,professional_id', ignoreDuplicates: true });
    if (error) throw new Error(error.message);
  }
}

export async function sendToRH({ hotelId, sector, dayId, guestCount, professionalCodes, uuidByCode, createdBy, shift }) {
  if (!isSupabaseConfigured) {
    const db = readDb();
    db.selectedByDay[dayId] = professionalCodes;
    db.sentDays[dayId] = true;
    if (db.returnedByDay[dayId]) delete db.returnedByDay[dayId];
    writeDb(db);
    return;
  }
  if (!professionalCodes?.length) {
    throw new Error('Selecione ao menos um profissional antes de enviar ao RH.');
  }
  const day = GERENCIA_DAYS.find((d) => d.id === dayId);
  const hid = hotelId || HOTEL_ID;
  await saveDraftScale({ hotelId: hid, sector, dayId, professionalCodes, uuidByCode, createdBy, shift });
  const { error } = await supabase.from('shift_requests').update({
    status: 'requested',
    guest_count: guestCount,
    created_by: createdBy,
    shift: shift || SECTOR_SHIFT[sector] || '15h – 23h',
    returned_reason: null,
    returned_by: null,
    returned_at: null,
    updated_at: new Date().toISOString(),
  }).eq('hotel_id', hid).eq('sector', sector).eq('day_date', day.iso);
  if (error) throw new Error(error.message);
}

export async function returnRequest({ hotelId, sector, dayId, dayIso, reason, returnedBy }) {
  if (!isSupabaseConfigured) {
    const db = readDb();
    db.returnedByDay[dayId] = { reason, author: 'RH', at: 'Agora', department: sector };
    delete db.sentDays[dayId];
    writeDb(db);
    return;
  }
  if (!hotelId) throw new Error('Estabelecimento não vinculado.');
  const day = GERENCIA_DAYS.find((d) => d.id === dayId);
  const iso = dayIso || day?.iso;
  if (!iso) throw new Error('Dia inválido para devolução.');

  const { data: existing } = await supabase
    .from('shift_requests')
    .select('id')
    .eq('hotel_id', hotelId)
    .eq('sector', sector)
    .eq('day_date', iso)
    .maybeSingle();

  const payload = {
    status: 'returned',
    returned_reason: reason,
    returned_by: returnedBy,
    returned_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (existing?.id) {
    const { error } = await supabase.from('shift_requests').update(payload).eq('id', existing.id);
    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await supabase.from('shift_requests').insert({
    hotel_id: hotelId,
    sector,
    day_date: iso,
    shift: SECTOR_SHIFT[sector] || null,
    ...payload,
  });
  if (error) throw new Error(error.message);
}

export async function approveAndSend({ hotelId, sector, dayIdsByCode, uuidByCode, rates, hotelName, shift, weekDays }) {
  const daysRef = weekDays?.length ? weekDays : GERENCIA_DAYS;
  const shiftLabel = shift || SECTOR_SHIFT[sector] || '15h – 23h';

  if (!isSupabaseConfigured) {
    const db = readDb();
    const stamp = Date.now();
    const packages = Object.entries(dayIdsByCode).map(([code, dayIds], idx) => {
      const f = db.professionals.find((p) => p.id === code);
      const days = dayIds
        .map((id) => daysRef.find((d) => d.id === id))
        .filter(Boolean)
        .map((d) => ({
          id: d.id,
          label: d.label,
          date: d.date,
          dayLabel: d.label,
          dayNum: d.date.split('/')[0],
          iso: d.iso,
        }));
      return {
        id: `inv-pkg-${stamp}-${idx}`,
        professionalId: code,
        hotel: hotelName || db.hotel.name,
        sector: sector === 'restaurante' ? 'Restaurante' : sector,
        role: f?.role,
        date: inviteDateSummary(days),
        time: shiftLabel,
        location: sector === 'restaurante' ? 'Salão principal' : sector,
        dailyRate: f?.dailyRate || 180,
        status: 'pending',
        notes: days.length > 1
          ? `Pacote de ${days.length} turnos — aceite confirma todos os dias de uma vez.`
          : 'Convite enviado pelo RH após aprovação da escala.',
        dayLabel: days[0]?.dayLabel,
        dayNum: days[0]?.dayNum,
        days,
      };
    });
    db.invites = [...packages, ...db.invites];
    daysRef.forEach((d) => {
      const used = Object.values(dayIdsByCode).some((ids) => ids.includes(d.id));
      if (used) db.sentDays[d.id] = true;
    });
    writeDb(db);
    return packages;
  }

  const hid = hotelId || HOTEL_ID;
  const { data: pros } = await supabase.from('professionals').select('*').eq('hotel_id', hid);
  const mappedPros = (pros || []).map((p) => ({
    id: p.code, uuid: p.id, name: p.name, role: p.role, profileId: p.profile_id,
  }));
  const sectorLabel = {
    restaurante: 'Restaurante', recepcao: 'Recepção', bar: 'Bar',
    cozinha: 'Cozinha', governanca: 'Governança', cdc: 'CDC',
  }[sector] || sector;

  const rows = [];
  for (const [code, dayIds] of Object.entries(dayIdsByCode)) {
    const uuid = uuidByCode?.[code] || mappedPros.find((p) => p.id === code)?.uuid;
    const pro = mappedPros.find((p) => p.id === code);
    if (!uuid || !pro) continue;
    const days = dayIds
      .map((id) => daysRef.find((d) => d.id === id))
      .filter(Boolean)
      .map((d) => ({
        id: d.id,
        label: d.label,
        date: d.date,
        dayLabel: d.label,
        dayNum: d.date.split('/')[0],
        iso: d.iso,
      }));
    if (!days.length) continue;
    const kind = rateKindForDay(days[0]);
    const rate = dailyRateFor(pro.role, kind, rates);
    rows.push({
      hotel_id: hid,
      professional_id: uuid,
      role: pro.role,
      sector: sectorLabel,
      time: shiftLabel,
      location: sector === 'restaurante' ? 'Salão principal' : sectorLabel,
      daily_rate: rate,
      status: 'pending',
      notes: days.length > 1
        ? `Pacote de ${days.length} turnos — aceite confirma todos os dias de uma vez.`
        : 'Convite enviado pelo RH após aprovação da escala.',
      days: days.map((d) => d.iso),
    });
  }
  if (!rows.length) return [];
  const { data, error } = await supabase.from('invites').insert(rows).select('*');
  if (error) throw new Error(error.message);
  for (const day of daysRef) {
    const used = Object.values(dayIdsByCode).some((ids) => ids.includes(day.id));
    if (used && day.iso) {
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
    return { status };
  }
  const { data: row, error } = await supabase
    .from('invites')
    .update({ status })
    .eq('id', inviteId)
    .select('id, hotel_id, professional_id, sector, time, days, status, role')
    .single();
  if (error) throw new Error(error.message);

  // Se aceitou, sobe a escala dos dias cobertos para confirmed
  if (status === 'accepted' && row?.hotel_id && Array.isArray(row.days)) {
    for (const isoRaw of row.days) {
      const iso = String(isoRaw).slice(0, 10);
      await supabase.from('shift_requests')
        .update({ status: 'confirmed', updated_at: new Date().toISOString() })
        .eq('hotel_id', row.hotel_id)
        .eq('day_date', iso)
        .in('status', ['sent', 'requested']);
    }
  }
  return row;
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

/** Atualiza setores em que o freelancer pode atuar (primeiro = principal). */
export async function updateProfessionalSectors({ hotelId, profileId, professionalCode, sectors }) {
  const list = [...new Set((sectors || []).map((s) => String(s).trim()).filter(Boolean))];
  if (!list.length) throw new Error('Selecione ao menos um setor.');
  const primary = list[0];

  if (!isSupabaseConfigured) {
    const db = readDb();
    db.professionals = (db.professionals || []).map((p) => {
      const match = (professionalCode && p.id === professionalCode)
        || (profileId && p.profile_id === profileId && (!hotelId || p.hotel_id === hotelId));
      if (!match) return p;
      return { ...p, sector: primary, sectors: list };
    });
    writeDb(db);
    return { sector: primary, sectors: list };
  }

  let q = supabase.from('professionals').update({
    sector: primary,
    sectors: list,
    updated_at: new Date().toISOString(),
  });
  if (professionalCode) q = q.eq('code', professionalCode);
  if (hotelId) q = q.eq('hotel_id', hotelId);
  if (profileId) q = q.eq('profile_id', profileId);
  const { error } = await q;
  if (error) {
    // Coluna sectors pode ainda não existir — tenta só sector
    if (/sectors|column/i.test(error.message || '')) {
      const { error: e2 } = await supabase.from('professionals').update({
        sector: primary,
        updated_at: new Date().toISOString(),
      }).eq('profile_id', profileId).eq('hotel_id', hotelId || HOTEL_ID);
      if (e2) throw new Error(e2.message);
      return { sector: primary, sectors: list };
    }
    throw new Error(error.message);
  }
  return { sector: primary, sectors: list };
}

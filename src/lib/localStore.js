import {
  HOTEL_ID, IDS, DEMO_ACCOUNTS, INITIAL_PROFESSIONALS, DAILY_RATES, GERENCIA_DAYS,
  DEFAULT_SELECTED_BY_DAY, INITIAL_INVITES,
} from './constants';

const KEY = 'domu-staff-db-v1';

function emptyDb() {
  return {
    users: DEMO_ACCOUNTS.map((a) => ({
      id: IDS[a.id === 'gerencia' ? 'marcos' : a.id === 'rh' ? 'renata' : 'joao'],
      email: a.email,
      password: a.password,
    })),
    sessionId: null,
    hotel: { id: HOTEL_ID, name: 'Hotel Atlântico Copacabana', city: 'Rio de Janeiro' },
    profiles: [
      {
        id: IDS.marcos,
        hotel_id: HOTEL_ID,
        role: 'gerencia',
        name: 'Marcos Ferreira',
        phone: '(21) 99887-7661',
        photo_url: '',
        department: 'Maître · Restaurante',
        primary_role: '',
        city: 'Rio de Janeiro',
        hotel_name: 'Hotel Atlântico Copacabana',
        professional_code: null,
        available_days: [],
        available_times: [],
        settings: { emergencyAlerts: true, returnAlerts: true, shiftReminder: true, whatsappNotifications: true },
        onboarded: true,
      },
      {
        id: IDS.renata,
        hotel_id: HOTEL_ID,
        role: 'rh',
        name: 'Renata Prado',
        phone: '(21) 99887-7661',
        photo_url: '',
        department: 'RH / Controladoria',
        primary_role: '',
        city: 'Rio de Janeiro',
        hotel_name: 'Hotel Atlântico Copacabana',
        professional_code: null,
        available_days: [],
        available_times: [],
        settings: { whatsappNotifications: true, autoSubstitute: true, dailyEmail: false, inviteTimeoutHours: 4, timezone: 'America/Sao_Paulo' },
        onboarded: true,
      },
      {
        id: IDS.joao,
        hotel_id: HOTEL_ID,
        role: 'freelancer',
        name: 'João Pedro',
        phone: '(21) 99887-7661',
        photo_url: '',
        department: '',
        primary_role: 'Garçom',
        city: 'Rio de Janeiro',
        hotel_name: 'Hotel Atlântico Copacabana',
        professional_code: '1',
        available_days: ['Sex', 'Sáb', 'Dom'],
        available_times: ['Tarde / Noite'],
        settings: { whatsappNotifications: true, shiftReminder: true, presenceNotify: true },
        onboarded: true,
      },
    ],
    professionals: INITIAL_PROFESSIONALS.map((p) => ({ ...p })),
    rates: DAILY_RATES.map((r) => ({ ...r })),
    occupancy: Object.fromEntries(GERENCIA_DAYS.map((d) => [d.id, d.guests])),
    selectedByDay: { ...DEFAULT_SELECTED_BY_DAY, sex: [...DEFAULT_SELECTED_BY_DAY.sex] },
    sentDays: {},
    returnedByDay: {},
    invites: INITIAL_INVITES.map((i) => ({ ...i, days: i.days.map((d) => ({ ...d })) })),
    checkins: ['1', '2', '3'],
    hotelSettings: {
      whatsappNotifications: true,
      emergencyAlerts: true,
      dailyEmail: false,
      inviteTimeoutHours: 4,
      timezone: 'America/Sao_Paulo',
      autoSubstitute: true,
      returnAlerts: true,
      shiftReminder: true,
      presenceNotify: true,
    },
  };
}

export function readDb() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const db = emptyDb();
      writeDb(db);
      return db;
    }
    return JSON.parse(raw);
  } catch {
    const db = emptyDb();
    writeDb(db);
    return db;
  }
}

export function writeDb(db) {
  localStorage.setItem(KEY, JSON.stringify(db));
}

export function resetDb() {
  const db = emptyDb();
  writeDb(db);
  return db;
}

import {
  Utensils, ConciergeBell, Wine, ChefHat, Bed, Package,
} from 'lucide-react';

export const HOTEL_ID = 'a0e1b2c3-d4e5-4f67-8899-000000000001';

const DAY_META = [
  { id: 'seg', label: 'Seg', full: 'segunda' },
  { id: 'ter', label: 'Ter', full: 'terça' },
  { id: 'qua', label: 'Qua', full: 'quarta' },
  { id: 'qui', label: 'Qui', full: 'quinta' },
  { id: 'sex', label: 'Sex', full: 'sexta' },
  { id: 'sab', label: 'Sáb', full: 'sábado' },
  { id: 'dom', label: 'Dom', full: 'domingo' },
];

function toLocalIso(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function todayLocalIso() {
  return toLocalIso(new Date());
}

/** Segunda-feira da semana da data (semana começa na segunda). */
export function getMonday(date = new Date()) {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

/** Semana dinâmica a partir da semana atual + offset (0 = esta semana). */
export function buildWeekDays(weekOffset = 0) {
  const monday = getMonday(new Date());
  monday.setDate(monday.getDate() + weekOffset * 7);
  const todayIso = todayLocalIso();

  return DAY_META.map((meta, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const iso = toLocalIso(d);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return {
      id: meta.id,
      label: meta.label,
      date: `${dd}/${mm}`,
      iso,
      fullDay: `${meta.full}, ${dd}/${mm}`,
      guests: 0,
      recommended: '—',
      needed: 0,
      defaultFilled: 0,
      isToday: iso === todayIso,
      isPast: iso < todayIso,
    };
  });
}

export function formatWeekRangeLabel(days) {
  if (!days?.length) return '';
  const first = days[0];
  const last = days[days.length - 1];
  const monthNames = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
  ];
  const y = Number(first.iso.slice(0, 4));
  const m = monthNames[Number(first.iso.slice(5, 7)) - 1];
  return `${first.date.split('/')[0]} – ${last.date.split('/')[0]} de ${m} de ${y}`;
}

/** Semana atual (atualizada via setGerenciaDays quando o usuário navega). */
export let GERENCIA_DAYS = buildWeekDays(0);
export let WEEK_START = GERENCIA_DAYS[0]?.iso || toLocalIso(getMonday());

export function setGerenciaDays(days) {
  GERENCIA_DAYS = days;
  WEEK_START = days[0]?.iso || WEEK_START;
  return GERENCIA_DAYS;
}

export const IDS = {
  marcos: 'a0e1b2c3-d4e5-4f67-8899-000000000002',
  renata: 'a0e1b2c3-d4e5-4f67-8899-000000000003',
  joao: 'a0e1b2c3-d4e5-4f67-8899-000000000004',
};

export const DEMO_ACCOUNTS = [
  { id: 'gerencia', email: 'marcos.ferreira@atlantico.com.br', password: 'domu123', name: 'Marcos Ferreira', role: 'Gerência · Maître' },
  { id: 'rh', email: 'renata.prado@atlantico.com.br', password: 'domu123', name: 'Renata Prado', role: 'RH / Controladoria' },
  { id: 'freelancer', email: 'joao.pedro@domustaff.app', password: 'domu123', name: 'João Pedro', role: 'Freelancer · Garçom' },
];

export const SECTOR_SHIFT = {
  restaurante: '15h – 23h',
  recepcao: '07h – 15h',
  bar: '15h – 23h',
  cozinha: '09h – 17h',
  governanca: '07h – 15h',
  cdc: '07h – 15h',
};

/** Turnos padrão do SaaS (hotel, restaurante, eventos…). */
export const SHIFT_OPTIONS = [
  { id: 'manha', label: 'Manhã', time: '07h – 15h' },
  { id: 'comercial', label: 'Comercial', time: '09h – 17h' },
  { id: 'tarde', label: 'Tarde / Noite', time: '15h – 23h' },
  { id: 'jantar', label: 'Jantar', time: '18h – 00h' },
  { id: 'noturno', label: 'Noturno', time: '23h – 07h' },
];

/** Normaliza horário para comparar (traços/espaços/h diferentes). */
export function normalizeShiftTime(t) {
  if (t == null || t === '' || t === '—' || t === '-') return '';
  return String(t)
    .replace(/[–—−]/g, '-')
    .replace(/\s+/g, '')
    .replace(/h/gi, 'h')
    .trim()
    .toLowerCase();
}

export function shiftTimesMatch(a, b) {
  const na = normalizeShiftTime(a);
  const nb = normalizeShiftTime(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  // "15h-23h" vs "15:00-23:00"
  const toParts = (s) => s.replace(/:/g, 'h').match(/(\d{1,2})h(\d{0,2})/g);
  const pa = toParts(na);
  const pb = toParts(nb);
  if (!pa || !pb || pa.length < 2 || pb.length < 2) return false;
  const norm = (p) => p.map((x) => {
    const m = x.match(/(\d{1,2})h(\d*)/);
    return `${String(Number(m[1])).padStart(2, '0')}h${(m[2] || '00').padStart(2, '0')}`;
  }).join('-');
  return norm(pa) === norm(pb);
}

export function shiftOptionFromTime(time) {
  const n = normalizeShiftTime(time);
  if (!n) return null;
  return SHIFT_OPTIONS.find((s) => normalizeShiftTime(s.time) === n) || null;
}

export function defaultShiftForSector(sectorId) {
  const time = SECTOR_SHIFT[sectorId] || '15h – 23h';
  return SHIFT_OPTIONS.find((s) => s.time === time) || SHIFT_OPTIONS[2];
}

export const GERENCIA_SECTORS = [
  { id: 'restaurante', label: 'Restaurante', icon: Utensils },
  { id: 'recepcao', label: 'Recepção', icon: ConciergeBell },
  { id: 'bar', label: 'Bar', icon: Wine },
  { id: 'cozinha', label: 'Cozinha', icon: ChefHat },
  { id: 'governanca', label: 'Governança', icon: Bed },
  { id: 'cdc', label: 'CDC', icon: Package },
];

/** Normaliza id ou label de setor para o id canônico. */
export function normalizeSectorId(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return '';
  const byId = GERENCIA_SECTORS.find((s) => s.id === raw);
  if (byId) return byId.id;
  const byLabel = GERENCIA_SECTORS.find((s) => s.label.toLowerCase() === raw);
  if (byLabel) return byLabel.id;
  // acentos / aliases
  const aliases = {
    recepção: 'recepcao',
    governança: 'governanca',
    restaurante: 'restaurante',
    bar: 'bar',
    cozinha: 'cozinha',
    cdc: 'cdc',
  };
  return aliases[raw] || raw.normalize('NFD').replace(/\p{M}/gu, '').replace(/\s+/g, '') || '';
}

export function sectorLabelFromId(sectorId) {
  const id = normalizeSectorId(sectorId);
  return GERENCIA_SECTORS.find((s) => s.id === id)?.label || sectorId || '—';
}

/** Lista de setores em que o profissional pode atuar (sempre ≥ 1). */
export function freelancerSectors(f) {
  if (!f) return ['restaurante'];
  const fromArr = Array.isArray(f.sectors)
    ? f.sectors.map(normalizeSectorId).filter(Boolean)
    : [];
  if (fromArr.length) return [...new Set(fromArr)];
  const one = normalizeSectorId(f.sector) || 'restaurante';
  return [one];
}

export function freelaInSector(f, sectorId) {
  const sid = normalizeSectorId(sectorId);
  if (!sid) return true;
  return freelancerSectors(f).includes(sid);
}

/** Seleção da escala: string (legado) ou { code, time }. */
export function selectionEntries(list) {
  return (list || [])
    .map((e) => (typeof e === 'string' ? { code: e, time: '' } : { code: e?.code, time: e?.time || '' }))
    .filter((e) => e.code);
}

export function flattenSelectionCodes(list) {
  return [...new Set(selectionEntries(list).map((e) => e.code))];
}

/** Códigos selecionados para um turno (entradas sem time valem para qualquer turno — legado). */
export function codesForShift(list, shiftTime) {
  return selectionEntries(list)
    .filter((e) => !shiftTime || !e.time || shiftTimesMatch(e.time, shiftTime))
    .map((e) => e.code);
}

export const DAILY_RATES = [
  { role: 'Garçom', week: 180, weekend: 220, holiday: 270 },
  { role: 'Bartender', week: 200, weekend: 250, holiday: 300 },
  { role: 'Recepcionista', week: 170, weekend: 210, holiday: 250 },
  { role: 'Cozinheiro', week: 220, weekend: 270, holiday: 320 },
  { role: 'Camareira', week: 160, weekend: 200, holiday: 240 },
  { role: 'Cumin', week: 140, weekend: 170, holiday: 210 },
];

export const RATE_KIND_LABEL = { week: 'Semana', weekend: 'Fim de semana', holiday: 'Feriado' };

export const PROFILE_HOME = {
  gerencia: 'gerencia_montar_escala',
  rh: 'main_kanban',
  freelancer: 'freelancer_convites',
};

export const INITIAL_PROFESSIONALS = [
  { id: '1', name: 'João Pedro', role: 'Garçom', sector: 'restaurante', status: 'Disponível', notes: '4 turnos neste hotel', dailyRate: 180, avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80', phone: '(21) 99887-7661' },
  { id: '2', name: 'Mariana Lima', role: 'Garçom', sector: 'restaurante', status: 'Disponível', notes: '', dailyRate: 180, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', phone: '(21) 99887-7662' },
  { id: '3', name: 'Carlos Eduardo', role: 'Garçom', sector: 'restaurante', status: 'Disponível', notes: 'Trabalhou no último evento', dailyRate: 180, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', phone: '(21) 99887-7663' },
  { id: '4', name: 'Ana Beatriz', role: 'Garçom', sector: 'restaurante', status: 'Disponível', notes: '', dailyRate: 180, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', phone: '(21) 99887-7664' },
  { id: '5', name: 'Rafael Costa', role: 'Bartender', sector: 'bar', status: 'Disponível', notes: 'Open bar e eventos', dailyRate: 200, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', phone: '(21) 99887-7665' },
  { id: '6', name: 'Lucas Martins', role: 'Garçom', sector: 'restaurante', status: 'Disponível', notes: 'Prefere turno noturno', dailyRate: 180, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', phone: '(21) 99887-7666' },
  { id: '7', name: 'Fernanda Alves', role: 'Garçom', sector: 'bar', status: 'Disponível', notes: '', dailyRate: 180, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', phone: '(21) 99887-7667' },
  { id: '8', name: 'Tiago Souza', role: 'Cozinheiro', sector: 'cozinha', status: 'Disponível', notes: 'Linha quente', dailyRate: 220, avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80', phone: '(21) 99887-7668' },
  { id: '9', name: 'Juliana Castro', role: 'Garçom', sector: 'restaurante', status: 'Disponível', notes: 'Disponível para plantão', dailyRate: 180, avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', phone: '(21) 99887-7669' },
  { id: '10', name: 'Felipe Rocha', role: 'Cumin', sector: 'cdc', status: 'Disponível', notes: '', dailyRate: 140, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80', phone: '(21) 99887-7670' },
  { id: '11', name: 'Camila Duarte', role: 'Camareira', sector: 'governanca', status: 'Disponível', notes: '', dailyRate: 160, avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80', phone: '(21) 99887-7671' },
  { id: '12', name: 'Bruno Mendes', role: 'Garçom', sector: 'restaurante', status: 'Disponível', notes: 'Salão executivo', dailyRate: 180, avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80', phone: '(21) 99887-7672' },
  { id: '13', name: 'Letícia Ramos', role: 'Recepcionista', sector: 'recepcao', status: 'Disponível', notes: 'Inglês e espanhol', dailyRate: 170, avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', phone: '(21) 99887-7673' },
  { id: '14', name: 'Bianca Santos', role: 'Recepcionista', sector: 'recepcao', status: 'Disponível', notes: 'PMS e check-in executivo', dailyRate: 170, avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80', phone: '(21) 99887-7674' },
];

export const DEFAULT_SELECTED_BY_DAY = {
  seg: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  ter: ['1', '2', '3', '4', '5', '6', '7', '8'],
  qua: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
  qui: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  sex: ['1', '2', '3'],
  sab: [],
  dom: [],
};

export const INITIAL_INVITES = [
  {
    id: 'inv1',
    professionalId: '1',
    hotel: 'Hotel Atlântico Copacabana',
    sector: 'Restaurante',
    role: 'Garçom',
    date: 'Sex 19/09 · Sáb 20/09 · Dom 21/09',
    time: '15h – 23h',
    location: 'Salão principal',
    dailyRate: 180,
    status: 'pending',
    notes: 'Pacote da semana: mesmo horário nos 3 dias. Uniforme social completo.',
    dayLabel: 'Sex',
    dayNum: '19',
    days: [
      { id: 'sex', label: 'Sex', date: '19/09', dayLabel: 'Sex', dayNum: '19', iso: '2025-09-19' },
      { id: 'sab', label: 'Sáb', date: '20/09', dayLabel: 'Sáb', dayNum: '20', iso: '2025-09-20' },
      { id: 'dom', label: 'Dom', date: '21/09', dayLabel: 'Dom', dayNum: '21', iso: '2025-09-21' },
    ],
  },
  {
    id: 'inv2',
    professionalId: '1',
    hotel: 'Hotel Atlântico Copacabana',
    sector: 'Bar',
    role: 'Bartender',
    date: 'Sábado, 20/09',
    time: '15h – 23h',
    location: 'Lobby Bar',
    dailyRate: 200,
    status: 'pending',
    notes: 'Evento corporativo com open bar até 22h.',
    dayLabel: 'Sáb',
    dayNum: '20',
    days: [{ id: 'sab', label: 'Sáb', date: '20/09', dayLabel: 'Sáb', dayNum: '20', iso: '2025-09-20' }],
  },
  {
    id: 'inv3',
    professionalId: '1',
    hotel: 'Hotel Atlântico Copacabana',
    sector: 'Recepção',
    role: 'Recepcionista',
    date: 'Domingo, 21/09',
    time: '07h – 15h',
    location: 'Front Desk',
    dailyRate: 170,
    status: 'pending',
    notes: 'Check-out intenso — inglês intermediário desejável.',
    dayLabel: 'Dom',
    dayNum: '21',
    days: [{ id: 'dom', label: 'Dom', date: '21/09', dayLabel: 'Dom', dayNum: '21', iso: '2025-09-21' }],
  },
];

export function formatBRL(value) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function dailyRateFor(role, kind = 'week', rates = DAILY_RATES) {
  const row = rates.find((r) => r.role === role);
  if (!row) return 180;
  return Number(row[kind] ?? row.week) || 0;
}

/** Feriados nacionais fixos (MM-DD). */
const BR_FIXED_HOLIDAYS = new Set([
  '01-01', // Confraternização Universal
  '04-21', // Tiradentes
  '05-01', // Dia do Trabalho
  '09-07', // Independência
  '10-12', // Nossa Senhora Aparecida
  '11-02', // Finados
  '11-15', // Proclamação da República
  '11-20', // Consciência Negra
  '12-25', // Natal
]);

export function isBrazilianHoliday(iso) {
  if (!iso || String(iso).length < 10) return false;
  return BR_FIXED_HOLIDAYS.has(String(iso).slice(5, 10));
}

/** Aceita id ('sab') ou objeto do dia ({ id, iso }). Feriado tem prioridade sobre fim de semana. */
export function rateKindForDay(dayOrId) {
  if (dayOrId && typeof dayOrId === 'object') {
    if (dayOrId.iso && isBrazilianHoliday(dayOrId.iso)) return 'holiday';
    const id = dayOrId.id;
    return id === 'sab' || id === 'dom' ? 'weekend' : 'week';
  }
  const dayId = dayOrId;
  return dayId === 'sab' || dayId === 'dom' ? 'weekend' : 'week';
}

/** Tons discretos para o mapa da semana (fim de semana / feriado). */
export function dayMapTone(kind, { active = false, isToday = false } = {}) {
  if (active) {
    return {
      background: '#EBF3FF',
      border: '1px solid #0066FF',
      title: '#0066FF',
      meta: '#0066FF',
      bar: '#0066FF',
    };
  }
  if (isToday) {
    return {
      background: '#F0FDF4',
      border: '1px solid #16A34A',
      title: '#0F172A',
      meta: '#15803D',
      bar: '#16A34A',
    };
  }
  if (kind === 'holiday') {
    return {
      background: '#FFF8F6',
      border: '1px solid #F0D6CF',
      title: '#0F172A',
      meta: '#9A3412',
      bar: '#E8A598',
    };
  }
  if (kind === 'weekend') {
    return {
      background: '#FFFBF5',
      border: '1px solid #EAD9C4',
      title: '#0F172A',
      meta: '#9A6B2F',
      bar: '#D4B483',
    };
  }
  return {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    title: '#0F172A',
    meta: '#94A3B8',
    bar: 'transparent',
  };
}

export function staffNeeded(guests, options = {}) {
  const g = Number(guests || 0);
  const per = Math.max(1, Number(options.peoplePerStaff) || 25);
  const min = Math.max(1, Number(options.minStaff) || 6);
  let base = g > 0
    ? Math.max(min, Math.round(g / per) || 1)
    : min;

  if (options.autoScaleHistory && Array.isArray(options.weekGuestCounts)) {
    const vals = options.weekGuestCounts.map(Number).filter((n) => n > 0);
    if (vals.length) {
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
      const hist = Math.max(min, Math.round(avg / per));
      base = Math.round((base * 0.6) + (hist * 0.4));
    }
  }

  if (options.suggestOnHighOccupancy && g > 0) {
    const capacityHint = Math.max(per, base * per);
    if (g >= capacityHint * 0.85) base += 2;
  }

  return Math.max(1, base);
}

/** Opções de meta a partir das configs do estabelecimento. */
export function staffingOptionsFromTech(tech = {}, weekGuestCounts) {
  return {
    peoplePerStaff: Number(tech.peoplePerStaff) || 25,
    minStaff: Number(tech.minStaff) || 6,
    suggestOnHighOccupancy: !!tech.suggestOnHighOccupancy,
    autoScaleHistory: !!tech.autoScaleHistory,
    weekGuestCounts,
  };
}

export function dayByIso(iso) {
  return GERENCIA_DAYS.find((d) => d.iso === iso);
}

export function dayById(id) {
  return GERENCIA_DAYS.find((d) => d.id === id);
}

export function formatInviteDays(dayIds) {
  return dayIds
    .map((id) => GERENCIA_DAYS.find((d) => d.id === id))
    .filter(Boolean)
    .map((d) => ({
      id: d.id,
      label: d.label,
      date: d.date,
      dayLabel: d.label,
      dayNum: d.date.split('/')[0],
      iso: d.iso,
    }));
}

export function inviteDateSummary(days) {
  if (!days?.length) return '';
  if (days.length === 1) return `${days[0].label}, ${days[0].date}`;
  return days.map((d) => `${d.label} ${d.date}`).join(' · ');
}

export function initialsFrom(name) {
  return (name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || '?';
}

import {
  Utensils, ConciergeBell, Wine, ChefHat, Bed, Package,
} from 'lucide-react';

export const HOTEL_ID = 'a0e1b2c3-d4e5-4f67-8899-000000000001';
export const WEEK_START = '2025-09-15';

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

export const GERENCIA_DAYS = [
  { id: 'seg', label: 'Seg', date: '15/09', iso: '2025-09-15', fullDay: 'segunda, 15/09', guests: 320, recommended: '14 – 18 pessoas', needed: 14, defaultFilled: 12 },
  { id: 'ter', label: 'Ter', date: '16/09', iso: '2025-09-16', fullDay: 'terça, 16/09', guests: 280, recommended: '12 – 16 pessoas', needed: 12, defaultFilled: 8 },
  { id: 'qua', label: 'Qua', date: '17/09', iso: '2025-09-17', fullDay: 'quarta, 17/09', guests: 310, recommended: '14 – 18 pessoas', needed: 14, defaultFilled: 10 },
  { id: 'qui', label: 'Qui', date: '18/09', iso: '2025-09-18', fullDay: 'quinta, 18/09', guests: 420, recommended: '18 – 24 pessoas', needed: 16, defaultFilled: 12 },
  { id: 'sex', label: 'Sex', date: '19/09', iso: '2025-09-19', fullDay: 'sexta, 19/09', guests: 500, recommended: '22 – 28 pessoas', needed: 14, defaultFilled: 3 },
  { id: 'sab', label: 'Sáb', date: '20/09', iso: '2025-09-20', fullDay: 'sábado, 20/09', guests: 480, recommended: '20 – 28 pessoas', needed: 16, defaultFilled: 0 },
  { id: 'dom', label: 'Dom', date: '21/09', iso: '2025-09-21', fullDay: 'domingo, 21/09', guests: 350, recommended: '16 – 22 pessoas', needed: 12, defaultFilled: 0 },
];

export const GERENCIA_SECTORS = [
  { id: 'restaurante', label: 'Restaurante', icon: Utensils },
  { id: 'recepcao', label: 'Recepção', icon: ConciergeBell },
  { id: 'bar', label: 'Bar', icon: Wine },
  { id: 'cozinha', label: 'Cozinha', icon: ChefHat },
  { id: 'governanca', label: 'Governança', icon: Bed },
  { id: 'cdc', label: 'CDC', icon: Package },
];

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

export function rateKindForDay(dayId) {
  return dayId === 'sab' || dayId === 'dom' ? 'weekend' : 'week';
}

export function staffNeeded(guests) {
  return Math.max(6, Math.round(Number(guests || 0) / 25));
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

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  GERENCIA_DAYS, GERENCIA_SECTORS, PROFILE_HOME, SECTOR_SHIFT, DAILY_RATES,
  SHIFT_OPTIONS, defaultShiftForSector,
  formatInviteDays, inviteDateSummary, dailyRateFor, rateKindForDay, initialsFrom,
  buildWeekDays, setGerenciaDays, formatWeekRangeLabel, shiftTimesMatch,
  normalizeSectorId, freelaInSector, freelancerSectors, sectorLabelFromId,
  selectionEntries, flattenSelectionCodes, codesForShift, normalizeShiftTime,
} from '../lib/constants';
import * as api from '../lib/api';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { playNotifySound } from '../lib/notifySound';
import {
  enableWebPush, disableWebPush, hasActivePushSubscription, syncWebPushIfGranted,
  isWebPushSupported,
} from '../lib/webPush';

const AppContext = createContext(null);
const JOIN_INVITE_KEY = 'domu_join_invite';

function normalizeInviteRole(role) {
  const r = String(role || '').trim().toLowerCase();
  if (r === 'gerencia' || r === 'gestao' || r === 'manager') return 'gerencia';
  if (r === 'rh' || r === 'hr') return 'rh';
  if (r === 'freelancer' || r === 'freela') return 'freelancer';
  return null;
}

function readStoredJoinInvite() {
  try {
    const raw = sessionStorage.getItem(JOIN_INVITE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const role = normalizeInviteRole(parsed?.role);
    const code = String(parsed?.code || '').trim().toUpperCase();
    if (!role && !code) return null;
    return { code, role: role || 'freelancer' };
  } catch {
    return null;
  }
}

function parseJoinInviteFromUrl() {
  if (typeof window === 'undefined') return readStoredJoinInvite();
  try {
    const url = new URL(window.location.href);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    const code = String(url.searchParams.get('code') || '').trim().toUpperCase();
    const role = normalizeInviteRole(url.searchParams.get('role'));
    const isJoinPath = path === '/join' || path.endsWith('/join');
    if (isJoinPath || code || role) {
      const invite = {
        code,
        role: role || 'freelancer',
      };
      sessionStorage.setItem(JOIN_INVITE_KEY, JSON.stringify(invite));
      if (isJoinPath || code || url.searchParams.has('role')) {
        window.history.replaceState({}, '', '/');
      }
      return invite;
    }
  } catch {
    /* ignore */
  }
  return readStoredJoinInvite();
}

function clearJoinInviteStorage() {
  try { sessionStorage.removeItem(JOIN_INVITE_KEY); } catch { /* ignore */ }
}

function friendlyMessage(msg, fallback = 'Algo deu errado. Tente de novo.') {
  if (msg == null || msg === '') return fallback;
  const s = String(msg);
  const lower = s.toLowerCase();
  if (/duplicate key|unique constraint|violates unique|already exists/i.test(s)) {
    return 'Essa pessoa já está na escala deste dia. Atualize a página se a lista parecer desatualizada.';
  }
  if (/foreign key|not-null|check constraint|permission denied|row-level security|rls/i.test(s)) {
    return 'Não foi possível salvar a escala agora. Tente de novo em instantes.';
  }
  if (/supabase|postgres|sql editor|auth\.users|\.env\.local|setup_complete|jwt|pgrst/i.test(s)) {
    return 'Não foi possível concluir agora. Tente novamente em instantes.';
  }
  if (/^[a-z_]+$/.test(s) || lower.includes('error') && lower.includes('code')) {
    return fallback;
  }
  return s;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp precisa estar dentro de AppProvider');
  return ctx;
}

export function AppProvider({ children }) {
  const [bootstrapping, setBootstrapping] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [registerType, setRegisterType] = useState('freelancer');
  const [registerName, setRegisterName] = useState('');
  const [registerHotel, setRegisterHotel] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [busy, setBusy] = useState(false);

  const [account, setAccount] = useState(null);
  const [joinInvite, setJoinInvite] = useState(() => parseJoinInviteFromUrl());
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [selectedProfile, setSelectedProfile] = useState(() => {
    const invite = parseJoinInviteFromUrl();
    return invite?.role || 'freelancer';
  });
  const [onboardingData, setOnboardingData] = useState(() => {
    const invite = parseJoinInviteFromUrl();
    return {
      name: '',
      hotelOrRole: '',
      hotelMode: invite?.code ? 'join' : 'create',
      hotelCnpj: '',
      hotelCode: invite?.code || '',
      department: invite?.role === 'gerencia'
        ? 'Gerência Operacional'
        : invite?.role === 'rh'
          ? 'RH / Controladoria'
          : '',
      phone: '',
      primaryRole: 'Garçom',
      city: '',
      availableDays: ['Sex', 'Sáb', 'Dom'],
      availableTimes: ['Tarde / Noite'],
      whatsappNotifications: true,
      emergencyAlerts: true,
      photoUrl: '',
      sectors: ['restaurante'],
    };
  });
  const [currentView, setCurrentView] = useState(() => (parseJoinInviteFromUrl() ? 'register' : 'login'));

  const [activeRequest, setActiveRequest] = useState({
    department: 'Restaurante',
    dayText: '',
    fullDateText: '',
    guests: 0,
    recommended: '—',
    requestedPeople: 0,
    status: 'SOLICITADA',
    shift: '',
  });

  const [freelancersList, setFreelancersList] = useState([]);
  const [managementTeam, setManagementTeam] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeTab, setActiveTab] = useState('selecionados');
  const [toast, setToast] = useState(null);
  const [navOpen, setNavOpen] = useState(false);
  const [selectedGerenciaDay, setSelectedGerenciaDay] = useState(() => buildWeekDays(0).find((d) => d.isToday)?.id || 'seg');
  const [selectedSector, setSelectedSector] = useState('restaurante');
  const [rhSectorFilter, setRhSectorFilter] = useState('all');
  const [shiftByDay, setShiftByDay] = useState({});
  const [gerenciaSearchQuery, setGerenciaSearchQuery] = useState('');
  const [freelancerBaseQuery, setFreelancerBaseQuery] = useState('');
  const [freelancerBaseSector, setFreelancerBaseSector] = useState('todos');
  const [dayPickerFor, setDayPickerFor] = useState(null);
  const [dayPickerSelected, setDayPickerSelected] = useState(['sex']);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [returnedByDay, setReturnedByDay] = useState({});
  const [selectedFreelancersByDay, setSelectedFreelancersByDay] = useState({
    seg: [], ter: [], qua: [], qui: [], sex: [], sab: [], dom: [],
  });
  const [sentDays, setSentDays] = useState({});
  const [requestStatusByDay, setRequestStatusByDay] = useState({});
  const [sentBaselineByDay, setSentBaselineByDay] = useState({});
  const [invitedByDay, setInvitedByDay] = useState({});
  const [checkedInIds, setCheckedInIds] = useState([]);
  const [rhDay, setRhDay] = useState(() => buildWeekDays(0).find((d) => d.isToday)?.id || 'seg');
  const [dailyRates, setDailyRates] = useState([]);
  const [guestCountByDay, setGuestCountByDay] = useState(() =>
    Object.fromEntries(buildWeekDays(0).map((d) => [d.id, 0]))
  );
  const [occupancyByIso, setOccupancyByIso] = useState({});
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekDays, setWeekDays] = useState(() => buildWeekDays(0));
  const [techSettings, setTechSettings] = useState({
    whatsappNotifications: true,
    emergencyAlerts: true,
    dailyEmail: false,
    inviteTimeoutHours: 4,
    timeoutMinutes: 30,
    timezone: 'America/Sao_Paulo',
    autoSubstitute: true,
    returnAlerts: true,
    shiftReminder: true,
    presenceNotify: true,
    alertPeak: true,
    alertConfirmations: true,
    peoplePerStaff: 25,
    minStaff: 6,
    suggestOnHighOccupancy: false,
    autoScaleHistory: false,
    connectedEstablishments: [],
  });
  const [freelancerInvites, setFreelancerInvites] = useState([]);
  const [uuidByCode, setUuidByCode] = useState({});
  const [myProfessionalUuid, setMyProfessionalUuid] = useState(null);
  const [hotel, setHotel] = useState({ name: '', city: '', code: '', cnpj: '' });
  const [savingSettings, setSavingSettings] = useState(false);
  const [inboxBadge, setInboxBadge] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [pushReady, setPushReady] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const [notifPanelTick, setNotifPanelTick] = useState(0);
  const requestOpenNotifPanel = () => setNotifPanelTick((n) => n + 1);
  const accountRef = React.useRef(account);
  accountRef.current = account;
  const applyHotelDataRef = React.useRef(null);
  const notificationsRef = React.useRef(notifications);
  notificationsRef.current = notifications;

  const pushNotification = (item, { sound = true, toast: showToast = true } = {}) => {
    const sourceId = item.sourceId || null;
    if (sourceId && notificationsRef.current.some((n) => n.sourceId === sourceId)) {
      return;
    }
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: item.title,
      body: item.body || '',
      at: item.at || new Date().toISOString(),
      read: false,
      view: item.view || null,
      kind: item.kind || 'info',
      sourceId,
    };
    setNotifications((prev) => [entry, ...prev].slice(0, 60));
    setInboxBadge((n) => n + 1);
    if (showToast) {
      triggerToast(item.title, 'notify', { sound });
    } else if (sound) {
      playNotifySound();
    }
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted' && showToast) {
      try {
        new Notification('Domu Staff', {
          body: item.body || item.title,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          silent: false,
          tag: sourceId || entry.id,
        });
      } catch { /* ignore */ }
    }
  };

  const markNotificationRead = (id) => {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      setInboxBadge(next.filter((n) => !n.read).length);
      return next;
    });
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setInboxBadge(0);
  };

  const clearInboxBadge = () => setInboxBadge(0);

  const triggerToast = (msg, type = 'ok', opts = {}) => {
    const withSound = opts.sound === true || type === 'notify';
    setToast({
      msg: friendlyMessage(msg, type === 'err' ? 'Não foi possível concluir.' : 'Pronto.'),
      type: type === 'notify' ? 'ok' : type,
      sound: withSound,
    });
    if (withSound) playNotifySound();
    window.clearTimeout(triggerToast._t);
    triggerToast._t = window.setTimeout(() => setToast(null), withSound ? 6500 : 4500);
  };

  const remapGuestsForWeek = (days, byIso) => {
    setGuestCountByDay(Object.fromEntries(days.map((d) => [d.id, byIso[d.iso] ?? 0])));
  };

  const shiftWeek = async (delta) => {
    const next = weekOffset + delta;
    const days = buildWeekDays(next);
    setWeekOffset(next);
    setWeekDays(days);
    setGerenciaDays(days);
    const today = days.find((d) => d.isToday);
    const fallback = days[0];
    if (today) {
      setRhDay(today.id);
      setSelectedGerenciaDay(today.id);
    } else if (fallback) {
      setRhDay(fallback.id);
      setSelectedGerenciaDay(fallback.id);
    }
    // Recarrega escalas/convites da semana — evita misturar sex/sáb de outra semana
    const acc = accountRef.current;
    if (acc?.hotelId) {
      try {
        const data = await api.loadHotelData(acc);
        applyHotelDataRef.current?.(data);
      } catch {
        remapGuestsForWeek(days, occupancyByIso);
      }
    } else {
      remapGuestsForWeek(days, occupancyByIso);
    }
  };

  const applyHotelData = (data) => {
    setFreelancersList(data.professionals || []);
    setManagementTeam(Array.isArray(data.managementTeam) ? data.managementTeam : []);
    setDailyRates(data.rates?.length ? data.rates : DAILY_RATES.map((r) => ({ ...r })));
    const byIso = data.occupancyByIso || {};
    // Compat: occupancy keyed by day id for current week
    if (!Object.keys(byIso).length && data.occupancy) {
      weekDays.forEach((d) => {
        if (data.occupancy[d.id] != null) byIso[d.iso] = data.occupancy[d.id];
      });
    }
    setOccupancyByIso(byIso);
    remapGuestsForWeek(weekDays, byIso);
    const shiftMap = data.shiftByDay || {};
    const selectedNormalized = {};
    Object.entries(data.selectedByDay || {}).forEach(([dayId, list]) => {
      const shiftEntry = shiftMap[dayId];
      const defaultTime = typeof shiftEntry === 'object'
        ? (Object.values(shiftEntry).find(Boolean) || '')
        : (shiftEntry || '');
      selectedNormalized[dayId] = (list || []).map((item) => {
        if (item && typeof item === 'object' && item.code) {
          return { code: item.code, time: item.time || defaultTime };
        }
        return { code: item, time: defaultTime };
      });
    });
    setSelectedFreelancersByDay(selectedNormalized);
    setShiftByDay(shiftMap);
    setSentDays(data.sentDays);
    setRequestStatusByDay(data.requestStatusByDay || {});
    // Baseline do que já foi enviado — trava "Reenviar" até mudar a equipe
    const baseline = {};
    Object.entries(data.requestStatusByDay || {}).forEach(([dayId, status]) => {
      if (!['requested', 'sent', 'confirmed'].includes(status)) return;
      const codes = flattenSelectionCodes(selectedNormalized[dayId] || []);
      GERENCIA_SECTORS.forEach((sec) => {
        const sectorCodes = codes
          .filter((id) => {
            const p = (data.professionals || []).find((x) => x.id === id);
            return freelaInSector(p, sec.id);
          })
          .sort();
        baseline[`${dayId}:${sec.id}`] = sectorCodes.join('|');
      });
    });
    setSentBaselineByDay(baseline);
    setInvitedByDay(data.invitedByDay || {});
    setReturnedByDay(data.returnedByDay);
    setFreelancerInvites(data.invites);
    setCheckedInIds(data.checkins);
    setTechSettings((prev) => {
      const merged = { ...prev, ...data.hotelSettings };
      if (merged.timeoutMinutes == null && merged.inviteTimeoutHours != null) {
        merged.timeoutMinutes = Math.round(Number(merged.inviteTimeoutHours) * 60) || 30;
      }
      if (merged.timeoutMinutes == null) merged.timeoutMinutes = 30;
      return merged;
    });
    setHotel({
      ...(data.hotel || {}),
      city: data.hotel?.city || '',
    });
    setUuidByCode(data._uuidByCode || Object.fromEntries((data.professionals || []).map((p) => [p.id, p.uuid])));
    if (data._myProfessionalUuid) setMyProfessionalUuid(data._myProfessionalUuid);
    else {
      const mine = (data.professionals || []).find((p) =>
        (accountRef.current?.professionalCode && p.id === accountRef.current.professionalCode)
        || (p.profileId && p.profileId === accountRef.current?.id),
      );
      setMyProfessionalUuid(mine?.uuid || null);
    }
  };
  applyHotelDataRef.current = applyHotelData;

  const applyJoinInviteToOnboarding = (invite, acc = null) => {
    if (!invite?.role && !invite?.code) return;
    if (invite.role) setSelectedProfile(invite.role);
    setOnboardingData((prev) => ({
      ...prev,
      name: acc?.name || prev.name,
      phone: acc?.phone || prev.phone,
      hotelMode: invite.code ? 'join' : (prev.hotelMode || 'create'),
      hotelCode: invite.code || prev.hotelCode || '',
      department: invite.role === 'gerencia'
        ? (prev.department || 'Gerência Operacional')
        : invite.role === 'rh'
          ? (prev.department || 'RH / Controladoria')
          : prev.department,
    }));
  };

  const hydrateAccount = async (acc) => {
    setAccount(acc);
    const invite = joinInvite || readStoredJoinInvite();
    const roleForOnboarding = (!acc.onboarded && invite?.role) ? invite.role : acc.role;
    setSelectedProfile(roleForOnboarding);
    setOnboardingData({
      name: acc.name,
      hotelOrRole: acc.hotelOrRole || '',
      department: acc.department || (
        roleForOnboarding === 'gerencia' ? 'Gerência Operacional'
          : roleForOnboarding === 'rh' ? 'RH / Controladoria' : ''
      ),
      phone: acc.phone || '',
      primaryRole: acc.primaryRole,
      city: acc.city || '',
      hotelMode: (!acc.onboarded && invite?.code) ? 'join' : 'create',
      hotelCnpj: acc.hotelCnpj || acc.settings?.hotelCnpj || '',
      hotelCode: (!acc.onboarded && invite?.code)
        ? invite.code
        : (acc.hotelCode || acc.settings?.hotelCode || ''),
      availableDays: acc.availableDays?.length ? acc.availableDays : ['Sex', 'Sáb', 'Dom'],
      availableTimes: acc.availableTimes?.length ? acc.availableTimes : ['Tarde / Noite'],
      whatsappNotifications: acc.settings?.whatsappNotifications !== false,
      emergencyAlerts: acc.settings?.emergencyAlerts !== false,
      photoUrl: acc.photoUrl || '',
      sectors: Array.isArray(acc.settings?.sectors) && acc.settings.sectors.length
        ? acc.settings.sectors
        : ['restaurante'],
    });
    const defSector = normalizeSectorId(acc.settings?.defaultSector);
    if (defSector) setSelectedSector(defSector);
    setTechSettings((prev) => {
      const fromAcc = Array.isArray(acc.settings?.connectedEstablishments)
        ? acc.settings.connectedEstablishments
        : [];
      const cleaned = acc.role === 'freelancer'
        ? fromAcc.filter((h) => h && h.joinedAt !== 'Vinculado')
        : fromAcc;
      return {
        ...prev,
        ...(acc.settings || {}),
        connectedEstablishments: cleaned.length ? cleaned : (acc.role === 'freelancer' ? [] : (prev.connectedEstablishments || [])),
      };
    });
    const data = await api.loadHotelData(acc);
    applyHotelData(data);
    if (acc.role === 'freelancer') {
      const me = (data.professionals || []).find((p) =>
        (acc.id && p.profileId === acc.id)
        || (acc.professionalCode && p.id === acc.professionalCode),
      );
      if (me) {
        const secs = freelancerSectors(me);
        setOnboardingData((prev) => ({ ...prev, sectors: secs }));
      }
    }
    if ((data.hotel?.id || data.hotel?.code || data.hotel?.name) && acc.role !== 'freelancer') {
      setTechSettings((prev) => {
        const list = Array.isArray(prev.connectedEstablishments) ? prev.connectedEstablishments : [];
        const code = data.hotel.code || acc.settings?.hotelCode || acc.hotelCode || '';
        const already = list.some((h) => (code && h.code === code) || (data.hotel.id && h.id === data.hotel.id));
        if (already) return prev;
        const primary = {
          id: data.hotel.id || 'primary',
          code: code || '—',
          name: data.hotel.name || acc.hotelOrRole || 'Estabelecimento vinculado',
          category: 'Principal',
          role: acc.role === 'gerencia'
            ? (acc.department || 'Gerência Operacional')
            : (acc.department || 'RH / Controladoria'),
          status: 'Ativo',
          joinedAt: 'Vinculado',
          totalShifts: 0,
          rating: null,
          isPrimary: true,
        };
        return { ...prev, connectedEstablishments: [primary, ...list] };
      });
      setHotel((prev) => ({
        ...prev,
        ...(data.hotel || {}),
        code: data.hotel?.code || prev.code || acc.settings?.hotelCode || '',
        name: data.hotel?.name || prev.name || acc.hotelOrRole || '',
      }));
    } else if (data.hotel?.id || data.hotel?.code || data.hotel?.name) {
      setHotel((prev) => ({
        ...prev,
        ...(data.hotel || {}),
        code: data.hotel?.code || prev.code || acc.settings?.hotelCode || '',
        name: data.hotel?.name || prev.name || acc.hotelOrRole || '',
      }));
    }
    if (!acc.onboarded) {
      if (invite) setJoinInvite(invite);
      setOnboardingStep(1);
      setCurrentView('onboarding');
    } else {
      clearJoinInviteStorage();
      setJoinInvite(null);
      setCurrentView(PROFILE_HOME[acc.role] || 'gerencia_montar_escala');
    }
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const session = await api.getSession();
        if (!alive) return;
        if (session?.account) await hydrateAccount(session.account);
        else {
          const invite = joinInvite || readStoredJoinInvite();
          if (invite) {
            setJoinInvite(invite);
            applyJoinInviteToOnboarding(invite);
            setCurrentView('register');
          } else {
            setCurrentView('login');
          }
        }
      } catch {
        if (alive) setCurrentView('login');
      } finally {
        if (alive) setBootstrapping(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // Tempo real: escalas enviadas / devolvidas / convites sem recarregar a página
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !account?.hotelId) return undefined;

    let debounceTimer = null;
    const hotelId = account.hotelId;
    const role = account.role;
    const myId = account.id;

    const refreshHotel = async () => {
      try {
        const acc = accountRef.current;
        if (!acc?.hotelId) return;
        const data = await api.loadHotelData(acc);
        applyHotelDataRef.current?.(data);
      } catch {
        /* ignore transient realtime errors */
      }
    };

    const channel = supabase.channel(`hotel-live-${hotelId}-${role || 'x'}`);

    if (role === 'rh' || role === 'gerencia') {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shift_requests',
          filter: `hotel_id=eq.${hotelId}`,
        },
        (payload) => {
          const row = payload.new || {};
          const prev = payload.old || {};
          const status = row.status;
          const prevStatus = prev.status;
          const createdBy = row.created_by;

          window.clearTimeout(debounceTimer);
          debounceTimer = window.setTimeout(() => {
            refreshHotel();
          }, 350);

          const becameRequested = (status === 'requested' || status === 'sent')
            && prevStatus !== 'requested'
            && prevStatus !== 'sent';
          const becameReturned = status === 'returned' && prevStatus !== 'returned';
          const becameSent = status === 'sent' && prevStatus !== 'sent';

          if (role === 'rh' && becameRequested) {
            if (createdBy && createdBy === myId) return;
            pushNotification({
              title: 'Nova escala da Gerência',
              body: 'Há uma solicitação pronta para revisar e aprovar.',
              view: 'main_kanban',
              kind: 'scale',
              sourceId: row.id ? `scale-${row.id}-${status}` : null,
            });
          }

          if (role === 'gerencia' && becameReturned) {
            if (row.returned_by && row.returned_by === myId) return;
            pushNotification({
              title: 'Escala devolvida pelo RH',
              body: row.returned_reason
                ? `Motivo: ${row.returned_reason}`
                : 'Abra Meus pedidos para ver a observação.',
              view: 'gerencia_pedidos',
              kind: 'return',
              sourceId: row.id ? `return-${row.id}` : null,
            });
          }

          if (role === 'gerencia' && becameSent) {
            pushNotification({
              title: 'RH aprovou a escala',
              body: 'Os convites foram enviados aos freelancers.',
              view: 'gerencia_pedidos',
              kind: 'scale-sent',
              sourceId: row.id ? `sent-${row.id}` : null,
            });
          }
        },
      );

      // Aceite / recusa de convite pelos freelancers
      channel.on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'invites',
          filter: `hotel_id=eq.${hotelId}`,
        },
        (payload) => {
          const row = payload.new || {};
          const prev = payload.old || {};
          if (!row.status || row.status === prev.status) return;

          window.clearTimeout(debounceTimer);
          debounceTimer = window.setTimeout(() => {
            refreshHotel();
          }, 300);

          const who = [row.role, row.sector, row.time].filter(Boolean).join(' · ');
          if (row.status === 'accepted') {
            pushNotification({
              title: 'Convite aceito',
              body: who || 'Um profissional confirmou a escala.',
              view: role === 'gerencia' ? 'gerencia_pedidos' : 'main_kanban',
              kind: 'invite-accepted',
              sourceId: row.id ? `invite-ok-${row.id}` : null,
            });
          } else if (row.status === 'declined') {
            pushNotification({
              title: 'Convite recusado',
              body: who || 'Um profissional recusou — chame um substituto.',
              view: role === 'gerencia' ? 'gerencia_montar_escala' : 'approval_details',
              kind: 'invite-declined',
              sourceId: row.id ? `invite-no-${row.id}` : null,
            });
          }
        },
      );
    }

    if (role === 'freelancer') {
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'invites',
          filter: `hotel_id=eq.${hotelId}`,
        },
        (payload) => {
          const row = payload.new || {};
          const proUuid = myProfessionalUuid;
          // Só notifica o convite deste profissional
          if (!proUuid || row.professional_id !== proUuid) return;

          window.clearTimeout(debounceTimer);
          debounceTimer = window.setTimeout(() => {
            refreshHotel();
          }, 300);

          pushNotification({
            title: 'Novo convite de escala',
            body: [row.sector, row.role, row.time].filter(Boolean).join(' · ') || 'Abra Convites para responder.',
            view: 'freelancer_convites',
            kind: 'invite',
            sourceId: row.id ? `invite-${row.id}` : null,
          });
        },
      );
    }

    channel.subscribe();

    // Se já autorizou antes, re-sincroniza a subscription (não pede de novo)
    if (account?.id) {
      syncWebPushIfGranted(account.id).then((ok) => { if (ok) setPushReady(true); });
    }
    hasActivePushSubscription().then((ok) => setPushReady(!!ok));

    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      refreshHotel();
    };
    document.addEventListener('visibilitychange', onVisible);

    const onSwMessage = (event) => {
      const view = event?.data?.view;
      if (event?.data?.type === 'domu-notification-click' && view) {
        setCurrentView(view);
      }
    };
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', onSwMessage);
    }

    return () => {
      window.clearTimeout(debounceTimer);
      document.removeEventListener('visibilitychange', onVisible);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', onSwMessage);
      }
      supabase.removeChannel(channel);
    };
  }, [account?.hotelId, account?.role, account?.id, myProfessionalUuid]);

  const enableMobilePush = async () => {
    if (!account?.id) {
      triggerToast('Faça login para ativar notificações.', 'err');
      return false;
    }
    setPushBusy(true);
    try {
      await enableWebPush(account.id);
      setPushReady(true);
      triggerToast('Notificações no celular ativadas.');
      return true;
    } catch (err) {
      triggerToast(err.message || 'Não foi possível ativar as notificações.', 'err');
      return false;
    } finally {
      setPushBusy(false);
    }
  };

  const disableMobilePush = async () => {
    if (!account?.id) return false;
    setPushBusy(true);
    try {
      await disableWebPush(account.id);
      setPushReady(false);
      triggerToast('Notificações no celular desativadas.');
      return true;
    } catch (err) {
      triggerToast(err.message || 'Não foi possível desativar.', 'err');
      return false;
    } finally {
      setPushBusy(false);
    }
  };

  // Histórico: convites pendentes já existentes (sem spam de som)
  useEffect(() => {
    if (account?.role !== 'freelancer') return;
    freelancerInvites
      .filter((i) => i.status === 'pending')
      .forEach((inv) => {
        pushNotification({
          title: 'Convite pendente',
          body: [inv.hotel, inv.sector, inv.time].filter(Boolean).join(' · '),
          view: 'freelancer_convites',
          kind: 'invite',
          sourceId: `invite-${inv.id}`,
          at: inv.createdAt || undefined,
        }, { sound: false, toast: false });
      });
  }, [account?.role, freelancerInvites]);

  // Histórico: devoluções / escalas pendentes para staff
  useEffect(() => {
    if (account?.role === 'gerencia') {
      Object.entries(returnedByDay || {}).forEach(([dayId, info]) => {
        if (!info?.reason) return;
        pushNotification({
          title: 'Escala devolvida pelo RH',
          body: info.reason,
          view: 'gerencia_pedidos',
          kind: 'return',
          sourceId: `return-local-${dayId}-${String(info.reason).slice(0, 24)}`,
        }, { sound: false, toast: false });
      });
    }
    if (account?.role === 'rh') {
      Object.entries(requestStatusByDay || {}).forEach(([dayId, status]) => {
        if (status !== 'requested' && status !== 'sent') return;
        pushNotification({
          title: status === 'sent' ? 'Escala enviada aos freelas' : 'Escala aguardando aprovação',
          body: `Dia ${dayId.toUpperCase()} — abra Escalas da semana.`,
          view: status === 'sent' ? 'approval_details' : 'main_kanban',
          kind: 'scale',
          sourceId: `status-${dayId}-${status}`,
        }, { sound: false, toast: false });
      });
    }
  }, [account?.role, returnedByDay, requestStatusByDay]);

  const signInWith = async (email, password) => {
    setAuthError('');
    const cleanEmail = (email || '').trim();
    if (!cleanEmail) {
      setAuthError('Por favor, digite seu e-mail.');
      return;
    }
    if (!password) {
      setAuthError('Por favor, digite sua senha de acesso.');
      return;
    }
    setBusy(true);
    try {
      const { account: acc } = await api.signIn(cleanEmail, password);
      if (!acc) {
        throw new Error('Conta não encontrada no sistema. Verifique seus dados ou crie uma nova conta.');
      }
      await hydrateAccount(acc);
    } catch (err) {
      const raw = err.message || '';
      if (raw.includes('Invalid login') || raw.includes('invalid_credentials') || raw.includes('incorretos')) {
        setAuthError('E-mail ou senha incorretos. Verifique os dados digitados e tente novamente.');
      } else if (raw.includes('not confirmed') || raw.includes('Confirm email') || raw.includes('Confirm user') || raw.includes('confirm')) {
        setAuthError(
          'Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada ou fale com o suporte do Domu Staff.'
        );
      } else if (raw.includes('rate limit') || raw.includes('Too many')) {
        setAuthError('Muitas tentativas em sequência. Aguarde alguns instantes e tente novamente.');
      } else {
        setAuthError(raw || 'E-mail ou senha incorretos. Verifique seus dados e tente novamente.');
      }
    } finally {
      setBusy(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    await signInWith(loginEmail, loginPassword);
  };

      const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    // 1. Strict Name Validation (Full Name: Name + Surname)
    const trimmedName = (registerName || '').trim();
    const nameParts = trimmedName.split(/\s+/).filter(Boolean);
    if (nameParts.length < 2 || nameParts.some(p => p.length < 2)) {
      setAuthError('Por favor, informe seu nome completo (nome e sobrenome).');
      return;
    }
    if (/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(trimmedName)) {
      setAuthError('O nome não deve conter números ou símbolos especiais.');
      return;
    }

    // 2. Strict Email Validation (RFC 5322 regex)
    const trimmedEmail = (registerEmail || '').trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      setAuthError('Por favor, informe um endereço de e-mail válido (ex: seu.nome@email.com).');
      return;
    }

    // 3. Strict Phone / WhatsApp Validation (Brazilian DDD + 10 or 11 digits)
    const rawPhone = (registerPhone || '').replace(/\D/g, '');
    if (rawPhone.length < 10 || rawPhone.length > 11) {
      setAuthError('Por favor, informe um número de WhatsApp válido com DDD (ex: (21) 99999-9999).');
      return;
    }
    const ddd = parseInt(rawPhone.slice(0, 2), 10);
    if (ddd < 11 || ddd > 99) {
      setAuthError('DDD inválido. Informe um DDD brasileiro válido entre 11 e 99.');
      return;
    }

    // 4. Strict Password Validation (8+ chars, upper, lower, number)
    if (registerPassword.length < 8) {
      setAuthError('A senha deve ter no mínimo 8 caracteres.');
      return;
    }
    if (!/[A-Z]/.test(registerPassword)) {
      setAuthError('A senha deve conter pelo menos uma letra maiúscula (A-Z).');
      return;
    }
    if (!/[a-z]/.test(registerPassword)) {
      setAuthError('A senha deve conter pelo menos uma letra minúscula (a-z).');
      return;
    }
    if (!/[0-9]/.test(registerPassword)) {
      setAuthError('A senha deve conter pelo menos um número (0-9).');
      return;
    }
    if (registerPassword !== registerConfirmPassword) {
      setAuthError('As senhas não coincidem. Digite a mesma senha nos dois campos.');
      return;
    }

    setBusy(true);
    try {
      const invite = joinInvite || readStoredJoinInvite();
      const assignedRole = invite?.role
        || (registerType === 'establishment' ? 'rh' : 'freelancer');
      const { account: acc, hasSession } = await api.signUp({
        name: trimmedName,
        email: trimmedEmail,
        password: registerPassword,
        phone: registerPhone,
        hotelName: registerType === 'establishment' ? registerHotel : '',
        role: assignedRole,
      });

      if (invite) {
        setJoinInvite(invite);
        applyJoinInviteToOnboarding(invite, acc);
      }

      if ((hasSession || acc) && acc) {
        await hydrateAccount(acc);
        triggerToast('Conta criada com sucesso! Continue a configuração.');
      } else {
        triggerToast('Cadastro realizado! Por favor, faça login com suas credenciais.');
        setCurrentView('login');
      }
    } catch (err) {
      setAuthError(err.message || 'Falha no cadastro');
    } finally {
      setBusy(false);
    }
  };

  const handleFinishOnboarding = async () => {
    setBusy(true);
    try {
      let accountId = account?.id;
      if (!accountId && api.isSupabaseConfigured) {
        const session = await api.getSession();
        accountId = session?.user?.id || session?.account?.id;
      }
      if (!accountId) {
        triggerToast('Sessão expirada. Faça login de novo para concluir.');
        setCurrentView('login');
        return;
      }

      const next = await api.saveOnboarding(accountId, {
        role: joinInvite?.role || selectedProfile,
        name: onboardingData.name,
        phone: onboardingData.phone,
        department: onboardingData.department,
        primaryRole: onboardingData.primaryRole,
        hotelOrRole: onboardingData.hotelOrRole,
        hotelMode: (joinInvite?.code || onboardingData.hotelMode === 'join') ? 'join' : (onboardingData.hotelMode || 'create'),
        hotelCnpj: onboardingData.hotelCnpj || '',
        hotelCode: joinInvite?.code || onboardingData.hotelCode || '',
        city: onboardingData.city,
        availableDays: onboardingData.availableDays,
        availableTimes: onboardingData.availableTimes,
        whatsappNotifications: onboardingData.whatsappNotifications,
        emergencyAlerts: onboardingData.emergencyAlerts,
        settings: {
          ...(account?.settings || {}),
          whatsappNotifications: onboardingData.whatsappNotifications,
          emergencyAlerts: onboardingData.emergencyAlerts,
        },
      });

      setAccount(next);
      setSelectedProfile(next.role || selectedProfile);
      setOnboardingData((prev) => ({
        ...prev,
        hotelOrRole: next.hotelOrRole || prev.hotelOrRole,
        hotelCode: next.hotelCode || next.settings?.hotelCode || prev.hotelCode,
        hotelCnpj: next.hotelCnpj || next.settings?.hotelCnpj || prev.hotelCnpj,
      }));
      setTechSettings((prev) => ({
        ...prev,
        ...(next.settings || {}),
        connectedEstablishments: Array.isArray(next.settings?.connectedEstablishments)
          ? next.settings.connectedEstablishments
          : (prev.connectedEstablishments || []),
      }));
      try {
        const data = await api.loadHotelData(next);
        applyHotelData(data);
      } catch {
        /* hotel data opcional no fim do onboarding */
      }
      triggerToast(
        next.hotelCode || next.settings?.hotelCode
          ? `Configuração concluída! Você está vinculado a ${next.hotelOrRole || next.settings?.hotelCode || 'o estabelecimento'}.`
          : 'Configuração concluída! Bem-vindo ao painel.'
      );
      setCurrentView(PROFILE_HOME[next.role || selectedProfile] || 'freelancer_convites');
      clearJoinInviteStorage();
      setJoinInvite(null);
    } catch (err) {
      triggerToast(err.message || 'Não foi possível salvar o onboarding.', 'err');
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    await api.signOut();
    setAccount(null);
    setNavOpen(false);
    setCurrentView('login');
    triggerToast('Você saiu da conta.');
  };

  const updateGuestCount = (dayId, value) => {
    const next = value === '' || value === null
      ? ''
      : Math.max(0, parseInt(String(value).replace(/\D/g, ''), 10) || 0);
    const day = weekDays.find((d) => d.id === dayId) || GERENCIA_DAYS.find((d) => d.id === dayId);
    setGuestCountByDay((prev) => ({ ...prev, [dayId]: next }));
    if (day?.iso && next !== '') {
      setOccupancyByIso((prev) => ({ ...prev, [day.iso]: next }));
    }
  };

  const persistOccupancyDay = async (dayId) => {
    if (!account?.hotelId) return;
    const day = weekDays.find((d) => d.id === dayId) || GERENCIA_DAYS.find((d) => d.id === dayId);
    if (!day?.iso) return;
    const raw = guestCountByDay[dayId];
    const n = raw === '' || raw == null ? 0 : Math.max(0, parseInt(raw, 10) || 0);
    try {
      await api.saveOccupancy(account.hotelId, dayId, n, day.iso);
    } catch (err) {
      triggerToast(err.message || 'Não foi possível salvar a previsão de pessoas.', 'err');
    }
  };

  const getShiftForDay = (dayId, sectorId = selectedSector) => {
    const entry = shiftByDay[dayId];
    if (entry && typeof entry === 'object' && entry[sectorId]) return entry[sectorId];
    if (typeof entry === 'string' && entry) return entry;
    return defaultShiftForSector(sectorId).time;
  };

  const updateDailyRate = (role, kind, value) => {
    const next = value === '' || value === null
      ? ''
      : Math.max(0, parseInt(String(value).replace(/\D/g, ''), 10) || 0);
    setDailyRates((prev) => {
      const base = prev.length ? prev : DAILY_RATES.map((r) => ({ ...r }));
      return base.map((row) => (row.role === role ? { ...row, [kind]: next } : row));
    });
  };

  const persistDraft = (nextByDay = selectedFreelancersByDay, overrides = {}) => {
    const dayId = overrides.dayId || selectedGerenciaDay;
    const sector = overrides.sector || selectedSector;
    const shiftLabel = overrides.shift || getShiftForDay(dayId, sector);
    const allEntries = selectionEntries(nextByDay[dayId] || []);
    const professionalCodes = codesForShift(allEntries, shiftLabel).filter((code) => {
      const f = freelancersList.find((p) => p.id === code);
      if (!f) return false;
      return freelaInSector(f, sector);
    });
    persistDraft._pending = {
      hotelId: account?.hotelId,
      sector,
      dayId,
      professionalCodes,
      uuidByCode,
      createdBy: account?.id,
      shift: shiftLabel,
      ...overrides,
      professionalCodes,
    };
    if (persistDraft._busy) return;
    persistDraft._busy = true;
    (async () => {
      while (persistDraft._pending) {
        const snap = persistDraft._pending;
        persistDraft._pending = null;
        try {
          await api.saveDraftScale(snap);
        } catch (err) {
          triggerToast(err.message || 'Não foi possível salvar a seleção.', 'err');
        }
      }
      persistDraft._busy = false;
    })();
  };

  const setShiftForDay = (dayId, time, sectorId = selectedSector) => {
    setShiftByDay((prev) => {
      const prevEntry = prev[dayId];
      const bySector = prevEntry && typeof prevEntry === 'object' ? { ...prevEntry } : {};
      bySector[sectorId] = time;
      return { ...prev, [dayId]: bySector };
    });
    if (dayId === selectedGerenciaDay) {
      persistDraft(selectedFreelancersByDay, { dayId, sector: sectorId, shift: time });
    }
  };

  const toggleGerenciaFreelancer = (id) => {
    const shiftLabel = getShiftForDay(selectedGerenciaDay, selectedSector);
    setSelectedFreelancersByDay((prev) => {
      const entries = selectionEntries(prev[selectedGerenciaDay] || []);
      const onThisShift = entries.some(
        (e) => e.code === id && (!e.time || shiftTimesMatch(e.time, shiftLabel)),
      );
      let nextEntries;
      if (onThisShift) {
        nextEntries = entries.filter(
          (e) => !(e.code === id && (!e.time || shiftTimesMatch(e.time, shiftLabel))),
        );
      } else {
        // Mantém seleção em outros turnos do mesmo dia
        nextEntries = [
          ...entries.filter((e) => !(e.code === id && !e.time)),
          { code: id, time: shiftLabel },
        ];
      }
      const next = { ...prev, [selectedGerenciaDay]: nextEntries };
      persistDraft(next, { shift: shiftLabel });
      return next;
    });
  };

  const handleCancelGerenciaSelection = () => {
    const shiftLabel = getShiftForDay(selectedGerenciaDay, selectedSector);
    setSelectedFreelancersByDay((prev) => {
      const entries = selectionEntries(prev[selectedGerenciaDay] || []);
      const remaining = entries.filter((e) => {
        if (e.time && !shiftTimesMatch(e.time, shiftLabel)) return true;
        const f = freelancersList.find((p) => p.id === e.code);
        return f && !freelaInSector(f, selectedSector);
      });
      const next = { ...prev, [selectedGerenciaDay]: remaining };
      persistDraft(next, { shift: shiftLabel });
      return next;
    });
    triggerToast('Seleção deste turno cancelada.');
  };

  /** Quem já foi chamado (pending/aceito) em outro setor neste dia — primeiro setor ganha. */
  const claimedByOtherSector = (code, dayId = selectedGerenciaDay, sectorId = selectedSector) => {
    const sid = normalizeSectorId(sectorId);
    const entries = invitedByDay[dayId] || [];
    for (const e of entries) {
      const c = typeof e === 'string' ? e : e.code;
      if (c !== code) continue;
      const st = typeof e === 'string' ? 'pending' : (e.status || 'pending');
      if (!['pending', 'accepted', 'confirmed'].includes(st)) continue;
      const eSec = normalizeSectorId(typeof e === 'string' ? '' : e.sector);
      if (eSec && eSec !== sid) return eSec;
      if (!eSec) {
        const f = freelancersList.find((p) => p.id === code);
        const primary = normalizeSectorId(f?.sector) || 'restaurante';
        if (primary !== sid) return primary;
      }
    }
    return null;
  };

  const handleSendToRH = async () => {
    const currentDayObj = (weekDays?.length ? weekDays : GERENCIA_DAYS).find((d) => d.id === selectedGerenciaDay);
    if (currentDayObj?.isPast) {
      triggerToast('Não é possível enviar escala de um dia que já passou.', 'err');
      return;
    }
    const shiftLabel = getShiftForDay(selectedGerenciaDay, selectedSector);
    const codes = codesForShift(selectedFreelancersByDay[selectedGerenciaDay] || [], shiftLabel).filter((id) => {
      const f = freelancersList.find((p) => p.id === id);
      return freelaInSector(f, selectedSector);
    });
    const alreadyForShift = new Set(
      (invitedByDay[selectedGerenciaDay] || [])
        .filter((e) => {
          const st = typeof e === 'string' ? 'pending' : (e.status || 'pending');
          // Já chamado neste horário (qualquer status) — não reenvia
          if (!['pending', 'accepted', 'confirmed', 'declined'].includes(st)) return false;
          const eSec = normalizeSectorId(typeof e === 'string' ? '' : e.sector);
          if (eSec && eSec !== selectedSector) return false;
          const t = typeof e === 'string' ? '' : (e.time || '');
          return !t || shiftTimesMatch(t, shiftLabel);
        })
        .map((e) => (typeof e === 'string' ? e : e.code)),
    );
    const claimedOther = codes.filter((id) => claimedByOtherSector(id));
    const freshCodes = codes.filter((id) => !alreadyForShift.has(id) && !claimedByOtherSector(id));
    if (!freshCodes.length) {
      triggerToast(
        claimedOther.length
          ? `Já convocados por outro setor neste dia (${sectorLabelFromId(claimedByOtherSector(claimedOther[0]))}). O setor que chama primeiro fica com a pessoa.`
          : alreadyForShift.size
            ? 'Esses profissionais já foram convocados neste horário. Troque o turno ou chame outra pessoa.'
            : 'Selecione ao menos um profissional antes de enviar ao RH.',
        'err',
      );
      return;
    }
    const missingUuid = freshCodes.filter((c) => !uuidByCode?.[c]);
    if (missingUuid.length) {
      triggerToast('Não foi possível identificar um dos profissionais. Atualize a página e tente de novo.', 'err');
      return;
    }
    try {
      // Evita corrida: rascunho vazio sobrescrever o envio
      persistDraft._pending = null;
      await api.sendToRH({
        hotelId: account?.hotelId,
        sector: selectedSector,
        dayId: selectedGerenciaDay,
        guestCount: guestCountByDay[selectedGerenciaDay],
        professionalCodes: freshCodes,
        uuidByCode,
        createdBy: account?.id,
        shift: shiftLabel,
      });
      setRequestStatusByDay((prev) => ({ ...prev, [selectedGerenciaDay]: 'requested' }));
      setSentBaselineByDay((prev) => ({
        ...prev,
        [`${selectedGerenciaDay}:${selectedSector}`]: [...freshCodes].sort().join('|'),
      }));
      setInvitedByDay((prev) => {
        const next = { ...prev };
        const list = next[selectedGerenciaDay] ? [...next[selectedGerenciaDay]] : [];
        freshCodes.forEach((code) => {
          if (!list.some((e) => (typeof e === 'string' ? e : e.code) === code
            && shiftTimesMatch(typeof e === 'string' ? shiftLabel : (e.time || shiftLabel), shiftLabel)
            && normalizeSectorId(typeof e === 'string' ? selectedSector : (e.sector || selectedSector)) === selectedSector)) {
            list.push({ code, time: shiftLabel, status: 'pending', sector: selectedSector });
          }
        });
        next[selectedGerenciaDay] = list;
        return next;
      });
      setReturnedByDay((prev) => {
        if (!prev[selectedGerenciaDay]) return prev;
        const next = { ...prev };
        delete next[selectedGerenciaDay];
        return next;
      });
      triggerToast(`Escala de ${currentDayObj ? currentDayObj.fullDay : 'hoje'} enviada com sucesso para o RH!`);
    } catch (err) {
      triggerToast(err.message, 'err');
    }
  };

  const freelancerAgenda = useMemo(() => {
    return freelancerInvites
      .filter((i) => i.status === 'accepted')
      .flatMap((i) => {
        const days = i.days?.length
          ? i.days
          : [{ id: 'd', dayLabel: i.dayLabel, dayNum: i.dayNum }];
        return days.map((d) => ({
          id: `${i.id}-${d.id || d.dayNum}`,
          hotel: i.hotel,
          sector: i.sector,
          time: i.time,
          dailyRate: i.dailyRate,
          dayLabel: d.dayLabel || d.label,
          dayNum: d.dayNum,
          checkIn: false,
        }));
      });
  }, [freelancerInvites]);

  const handleAcceptInvite = async (id) => {
    const inv = freelancerInvites.find((i) => i.id === id);
    const n = inv?.days?.length || 1;
    setFreelancerInvites((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'accepted' } : i)));
    try {
      await api.setInviteStatus(id, 'accepted');
      // Atualiza status local dos dias cobertos
      const dayIds = (inv?.days || []).map((d) => d.id || d).filter(Boolean);
      if (dayIds.length) {
        setRequestStatusByDay((prev) => {
          const next = { ...prev };
          dayIds.forEach((dayId) => {
            if (typeof dayId === 'string' && dayId.length <= 5) next[dayId] = 'confirmed';
          });
          return next;
        });
        setInvitedByDay((prev) => {
          const next = { ...prev };
          dayIds.forEach((dayId) => {
            if (typeof dayId !== 'string' || dayId.length > 5) return;
            const list = (next[dayId] || []).map((e) => {
              const code = typeof e === 'string' ? e : e.code;
              if (code !== inv?.professionalId && code !== account?.professionalCode) return e;
              return { code, time: typeof e === 'string' ? '' : (e.time || inv?.time || ''), status: 'accepted' };
            });
            next[dayId] = list;
          });
          return next;
        });
      }
    } catch (err) {
      triggerToast(err.message, 'err');
    }
    triggerToast(n > 1 ? `${n} turnos aceitos — entraram na sua agenda.` : 'Vaga aceita! O turno entrou na sua agenda.');
  };

  const handleDeclineInvite = async (id) => {
    const inv = freelancerInvites.find((i) => i.id === id);
    setFreelancerInvites((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'declined' } : i)));
    try {
      await api.setInviteStatus(id, 'declined');
      const dayIds = (inv?.days || []).map((d) => d.id || d).filter(Boolean);
      if (dayIds.length) {
        setInvitedByDay((prev) => {
          const next = { ...prev };
          dayIds.forEach((dayId) => {
            if (typeof dayId !== 'string' || dayId.length > 5) return;
            const list = (next[dayId] || []).map((e) => {
              const code = typeof e === 'string' ? e : e.code;
              if (code !== inv?.professionalId && code !== account?.professionalCode) return e;
              return { code, time: typeof e === 'string' ? '' : (e.time || inv?.time || ''), status: 'declined' };
            });
            // se não estava na lista, adiciona
            const code = inv?.professionalId || account?.professionalCode;
            if (code && !list.some((e) => (typeof e === 'string' ? e : e.code) === code)) {
              list.push({ code, time: inv?.time || '', status: 'declined' });
            }
            next[dayId] = list;
          });
          return next;
        });
      }
    } catch (err) {
      triggerToast(err.message, 'err');
    }
    triggerToast('Convite recusado. O RH será notificado para buscar substituto.');
  };

  const openDayPicker = (freelancer) => {
    setDayPickerFor(freelancer);
    setDayPickerSelected([selectedGerenciaDay || 'sex']);
  };

  const toggleDayPickerDay = (dayId) => {
    setDayPickerSelected((prev) => {
      if (prev.includes(dayId)) {
        if (prev.length === 1) return prev;
        return prev.filter((d) => d !== dayId);
      }
      return [...prev, dayId];
    });
  };

  const confirmDayPicker = () => {
    if (!dayPickerFor || dayPickerSelected.length === 0) return;
    const f = dayPickerFor;
    const ordered = GERENCIA_DAYS.map((d) => d.id).filter((id) => dayPickerSelected.includes(id));
    const teamIds = f._teamIds?.length ? f._teamIds : [f.id];
    if (f.sector) setSelectedSector(f.sector);
    setSelectedGerenciaDay(ordered[0]);
    setSelectedFreelancersByDay((prev) => {
      const next = { ...prev };
      const shiftLabel = getShiftForDay(ordered[0], f.sector || selectedSector);
      ordered.forEach((dayId) => {
        const current = selectionEntries(next[dayId] || []);
        const existing = new Set(flattenSelectionCodes(current));
        teamIds.forEach((code) => {
          if (existing.has(code)) return;
          current.push({ code, time: getShiftForDay(dayId, f.sector || selectedSector) || shiftLabel });
        });
        next[dayId] = current;
      });
      persistDraft(next, { dayId: ordered[0], sector: f.sector || selectedSector, shift: shiftLabel });
      return next;
    });
    setDayPickerFor(null);
    setCurrentView('gerencia_montar_escala');
    triggerToast(f.id === '__team__'
      ? `Equipe replicada em ${ordered.length} dia${ordered.length > 1 ? 's' : ''}`
      : (ordered.length > 1 ? `${f.name} incluído em ${ordered.length} dias` : `${f.name} incluído na escala`));
  };

  const toggleAvailableDay = (day) => {
    setOnboardingData((prev) => {
      const has = prev.availableDays.includes(day);
      return { ...prev, availableDays: has ? prev.availableDays.filter((d) => d !== day) : [...prev.availableDays, day] };
    });
  };

  const toggleAvailableTime = (time) => {
    const hints = { '07h – 15h': 'Manhã', '09h – 17h': 'Comercial', '15h – 23h': 'Tarde / Noite', '23h – 07h': 'Noturno' };
    setOnboardingData((prev) => {
      const hint = hints[time];
      const has = prev.availableTimes.includes(time) || (hint && prev.availableTimes.includes(hint));
      if (has) return { ...prev, availableTimes: prev.availableTimes.filter((t) => t !== time && t !== hint) };
      return { ...prev, availableTimes: [...prev.availableTimes.filter((t) => t !== hint), time] };
    });
  };

  const saveAvailability = async () => {
    if (!account) return;
    await api.saveProfile(account.id, {
      availableDays: onboardingData.availableDays,
      availableTimes: onboardingData.availableTimes,
    });
    triggerToast('Disponibilidade salva. Os próximos convites usam esses dias e turnos.');
  };

  const saveSettings = async () => {
    if (!account) {
      triggerToast('Faça login novamente para salvar.', 'err');
      return;
    }
    if (savingSettings) return;
    setSavingSettings(true);
    const role = account.role || selectedProfile;
    const linkedHotelName = hotel?.name || onboardingData.hotelOrRole || '';
    const hotelCode = hotel?.code || techSettings.hotelCode || account.settings?.hotelCode || account.hotelCode || '';
    const hotelCnpj = hotel?.cnpj || techSettings.hotelCnpj || account.settings?.hotelCnpj || account.hotelCnpj || '';
    try {
      const nextSettings = {
        ...(account.settings || {}),
        ...techSettings,
        timeoutMinutes: Number(techSettings.timeoutMinutes) || 30,
        inviteTimeoutHours: Math.max(1, Math.round((Number(techSettings.timeoutMinutes) || 30) / 60)),
        peoplePerStaff: Math.max(1, Number(techSettings.peoplePerStaff) || 25),
        minStaff: Math.max(1, Number(techSettings.minStaff) || 6),
        whatsappNotifications: onboardingData.whatsappNotifications,
        emergencyAlerts: onboardingData.emergencyAlerts,
        alertPeak: techSettings.alertPeak !== false,
        alertConfirmations: techSettings.alertConfirmations !== false,
        hotelCode: hotelCode || undefined,
        hotelCnpj: hotelCnpj || undefined,
        connectedEstablishments: Array.isArray(techSettings.connectedEstablishments)
          ? techSettings.connectedEstablishments
          : [],
        defaultSector: role === 'gerencia'
          ? (normalizeSectorId(techSettings.defaultSector || selectedSector) || 'restaurante')
          : techSettings.defaultSector,
        sectors: role === 'freelancer'
          ? (Array.isArray(onboardingData.sectors) && onboardingData.sectors.length
            ? onboardingData.sectors.map(normalizeSectorId).filter(Boolean)
            : ['restaurante'])
          : techSettings.sectors,
      };

      await api.saveProfile(account.id, {
        name: onboardingData.name,
        phone: onboardingData.phone,
        photoUrl: onboardingData.photoUrl,
        department: onboardingData.department,
        primaryRole: onboardingData.primaryRole,
        city: onboardingData.city,
        // Gerência/RH: nome do vínculo vem do hotel; freela pode editar livremente
        hotelOrRole: (role === 'gerencia' || role === 'rh')
          ? (linkedHotelName || onboardingData.hotelOrRole)
          : onboardingData.hotelOrRole,
        settings: nextSettings,
      });

      if (role === 'gerencia' && nextSettings.defaultSector) {
        setSelectedSector(nextSettings.defaultSector);
      }

      if (role === 'freelancer' && account.hotelId) {
        try {
          const updated = await api.updateProfessionalSectors({
            hotelId: account.hotelId,
            profileId: account.id,
            professionalCode: account.professionalCode,
            sectors: nextSettings.sectors,
          });
          setFreelancersList((prev) => prev.map((p) => (
            p.profileId === account.id || p.id === account.professionalCode
              ? { ...p, sector: updated.sector, sectors: updated.sectors }
              : p
          )));
          setOnboardingData((prev) => ({ ...prev, sectors: updated.sectors }));
        } catch (err) {
          console.warn(err);
          triggerToast(err.message || 'Não foi possível salvar os setores do profissional.', 'err');
        }
      }
      setAccount((prev) => prev ? {
        ...prev,
        name: onboardingData.name,
        phone: onboardingData.phone,
        photoUrl: onboardingData.photoUrl,
        primaryRole: onboardingData.primaryRole,
        city: onboardingData.city,
        department: onboardingData.department,
        hotelOrRole: (role === 'gerencia' || role === 'rh')
          ? (linkedHotelName || onboardingData.hotelOrRole)
          : onboardingData.hotelOrRole,
        hotelCode,
        hotelCnpj,
        settings: nextSettings,
      } : prev);
      setTechSettings((prev) => ({ ...prev, ...nextSettings }));
      if (role === 'gerencia' || role === 'rh') {
        setOnboardingData((prev) => ({
          ...prev,
          hotelOrRole: linkedHotelName || prev.hotelOrRole,
        }));
      }

      let opsWarning = null;
      if (account.hotelId && (role === 'rh' || role === 'gerencia')) {
        try {
          const normalizedGuests = {};
          const nextByIso = { ...occupancyByIso };
          for (const day of weekDays) {
            const raw = guestCountByDay[day.id];
            const n = raw === '' || raw == null ? 0 : Math.max(0, parseInt(raw, 10) || 0);
            normalizedGuests[day.id] = n;
            if (day.iso) nextByIso[day.iso] = n;
            await api.saveOccupancy(account.hotelId, day.id, n, day.iso);
          }
          setGuestCountByDay((prev) => ({ ...prev, ...normalizedGuests }));
          setOccupancyByIso(nextByIso);

          // Diárias: só RH (Gerência não sobrescreve a tabela oficial)
          if (role === 'rh') {
            const normalizedRates = (dailyRates.length ? dailyRates : DAILY_RATES).map((row) => ({
              ...row,
              week: row.week === '' || row.week == null ? 0 : Number(row.week) || 0,
              weekend: row.weekend === '' || row.weekend == null ? 0 : Number(row.weekend) || 0,
              holiday: row.holiday === '' || row.holiday == null ? 0 : Number(row.holiday) || 0,
            }));
            setDailyRates(normalizedRates);
            await api.saveRatesBatch(account.hotelId, normalizedRates);
          }
        } catch (opsErr) {
          opsWarning = opsErr.message || 'Não foi possível gravar ocupação ou diárias.';
        }
      }

      if (opsWarning) {
        triggerToast('Alteração salva, mas parte dos dados operacionais ficou pendente. Tente de novo.', 'err');
      } else {
        triggerToast('Alteração salva.', 'ok');
      }
    } catch (err) {
      triggerToast(err.message || 'Não foi possível salvar as configurações.', 'err');
    } finally {
      setSavingSettings(false);
    }
  };

  const goHome = () => {
    setNavOpen(false);
    setCurrentView(PROFILE_HOME[selectedProfile] || 'gerencia_montar_escala');
  };

  const pendingInviteCount = freelancerInvites.filter((i) => i.status === 'pending').length;

  const activeUser = useMemo(() => {
    const name = onboardingData.name || account?.name || '';
    const roleLabel = selectedProfile === 'freelancer'
      ? `Freelancer · ${onboardingData.primaryRole || 'Garçom'}`
      : selectedProfile === 'rh'
        ? (onboardingData.department || 'RH / Controladoria')
        : (onboardingData.department || 'Gerência Operacional');
    return { initials: initialsFrom(name), name, role: roleLabel };
  }, [selectedProfile, onboardingData, account]);

  const handleApproveAndSend = async () => {
    const sectorMeta = GERENCIA_SECTORS.find((s) => s.label === activeRequest.department)
      || GERENCIA_SECTORS.find((s) => s.id === selectedSector)
      || GERENCIA_SECTORS[0];
    const dayList = weekDays?.length ? weekDays : GERENCIA_DAYS;
    const alreadyInvited = new Set(
      (invitedByDay[rhDay] || []).map((e) => (typeof e === 'string' ? e : e.code)),
    );
    const fromDay = flattenSelectionCodes(selectedFreelancersByDay[rhDay] || []);
    const picked = [...new Set((selectedIds.length ? selectedIds : fromDay).filter(Boolean))];
    // Só envia quem ainda não foi convocado (permite chamar extras depois)
    const uniqueCodes = picked.filter((c) => !alreadyInvited.has(c));

    if (!uniqueCodes.length) {
      triggerToast(
        alreadyInvited.size
          ? 'Ninguém novo para enviar. Marque alguém em Equipe ou em Fora da escala.'
          : 'Selecione ao menos uma pessoa na equipe para enviar o convite.',
        'err',
      );
      return;
    }

    const dayIdsByCode = {};
    // Um convite = um dia (o dia em análise). Evita Sex+Sáb no mesmo pacote.
    uniqueCodes.forEach((fid) => {
      dayIdsByCode[fid] = [rhDay];
    });

    const missingUuid = uniqueCodes.filter((c) => !uuidByCode?.[c]);
    if (missingUuid.length) {
      triggerToast('Não foi possível identificar um dos profissionais. Atualize a página e tente de novo.', 'err');
      return;
    }

    try {
      const shift = getShiftForDay(rhDay, sectorMeta.id);
      const packages = await api.approveAndSend({
        hotelId: account?.hotelId,
        sector: sectorMeta.id,
        dayIdsByCode,
        uuidByCode,
        rates: dailyRates,
        hotelName: hotel?.name,
        shift,
        weekDays: dayList,
      });
      if (!packages?.length) {
        triggerToast('Nenhum convite foi criado. Confira se o freelancer está na base do estabelecimento.', 'err');
        return;
      }
      setFreelancerInvites((prev) => [...packages, ...prev]);
      setRequestStatusByDay((prev) => {
        const next = { ...prev };
        Object.values(dayIdsByCode).flat().forEach((id) => { next[id] = 'sent'; });
        return next;
      });
      setSentDays((prev) => {
        const next = { ...prev };
        Object.values(dayIdsByCode).flat().forEach((id) => { next[id] = true; });
        return next;
      });
      setInvitedByDay((prev) => {
        const next = { ...prev };
        const shiftLabel = shift || '';
        Object.entries(dayIdsByCode).forEach(([code, dayIds]) => {
          dayIds.forEach((dayId) => {
            const list = next[dayId] ? [...next[dayId]] : [];
            const exists = list.some((e) => {
              const c = typeof e === 'string' ? e : e.code;
              const t = typeof e === 'string' ? '' : (e.time || '');
              return c === code && (!t || !shiftLabel || t === shiftLabel);
            });
            if (!exists) list.push({ code, time: shiftLabel });
            else {
              const idx = list.findIndex((e) => (typeof e === 'string' ? e : e.code) === code);
              if (idx >= 0 && shiftLabel) {
                list[idx] = { code, time: shiftLabel };
              }
            }
            next[dayId] = list;
          });
        });
        return next;
      });
      // Remove da seleção "pendente" quem já foi enviado
      setSelectedIds((prev) => prev.filter((id) => !uniqueCodes.includes(id)));
      setActiveRequest((prev) => ({ ...prev, status: 'ENVIADA' }));
      const multi = Object.values(dayIdsByCode).some((d) => d.length > 1);
      triggerToast(multi
        ? 'Aprovado. Convites em pacote enviados aos freelancers.'
        : 'Solicitação aprovada! Convites enviados aos freelancers.', 'ok', { sound: true });
      setCurrentView('main_kanban');
    } catch (err) {
      triggerToast(err.message, 'err');
    }
  };

  const handleReturnToMaitre = () => {
    setReturnReason('');
    setReturnModalOpen(true);
  };

  const confirmReturnToMaitre = async () => {
    const reason = returnReason.trim();
    if (!reason) {
      triggerToast('Informe o motivo da devolução.', 'err');
      return;
    }
    const dayId = rhDay || 'sex';
    const dayObj = weekDays.find((d) => d.id === dayId);
    const sectorMeta = GERENCIA_SECTORS.find((s) => s.label === activeRequest.department)
      || GERENCIA_SECTORS.find((s) => s.id === selectedSector)
      || GERENCIA_SECTORS[0];
    try {
      await api.returnRequest({
        hotelId: account?.hotelId,
        sector: sectorMeta.id,
        dayId,
        dayIso: dayObj?.iso,
        reason,
        returnedBy: account?.id,
      });
      setReturnedByDay((prev) => ({
        ...prev,
        [dayId]: { reason, author: account?.name || 'RH', at: 'Agora', department: activeRequest.department || sectorMeta.label },
      }));
      setRequestStatusByDay((prev) => ({ ...prev, [dayId]: 'returned' }));
      setSentDays((prev) => {
        const next = { ...prev };
        delete next[dayId];
        return next;
      });
      setActiveRequest((prev) => ({ ...prev, status: 'DEVOLVIDA' }));
      setReturnModalOpen(false);
      setReturnReason('');
      triggerToast('Escala devolvida à Gerência com a observação.');
      setCurrentView('main_kanban');
    } catch (err) {
      triggerToast(err.message, 'err');
    }
  };

  const toggleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(freelancersList.map((f) => f.id));
    else setSelectedIds([]);
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const confirmPresence = async (f) => {
    const today = (weekDays?.length ? weekDays : GERENCIA_DAYS).find((d) => d.isToday)
      || (weekDays?.length ? weekDays : GERENCIA_DAYS)[0];
    const dayId = today?.id || 'sex';
    setCheckedInIds((prev) => (prev.includes(f.id) ? prev : [...prev, f.id]));
    try {
      await api.setCheckin({
        hotelId: account?.hotelId,
        professionalCode: f.id,
        uuidByCode,
        dayId,
        present: true,
        byProfileId: account?.id,
      });
    } catch (err) { triggerToast(err.message, 'err'); }
    triggerToast(`${f.name} marcado como presente`);
  };

  const undoPresence = async (f) => {
    const today = (weekDays?.length ? weekDays : GERENCIA_DAYS).find((d) => d.isToday)
      || (weekDays?.length ? weekDays : GERENCIA_DAYS)[0];
    const dayId = today?.id || 'sex';
    setCheckedInIds((prev) => prev.filter((id) => id !== f.id));
    try {
      await api.setCheckin({
        hotelId: account?.hotelId,
        professionalCode: f.id,
        uuidByCode,
        dayId,
        present: false,
        byProfileId: account?.id,
      });
    } catch (err) { triggerToast(err.message, 'err'); }
    triggerToast(`Presença de ${f.name} desfeita`);
  };

  const changeAccountField = async (key, value) => {
    setOnboardingData((prev) => ({ ...prev, [key]: value }));
    if (key === 'photoUrl' && account) {
      try {
        const url = value ? await api.uploadPhoto(account.id, value) : '';
        if (!value) await api.saveProfile(account.id, { photoUrl: '' });
        setOnboardingData((prev) => ({ ...prev, photoUrl: url || value }));
        setAccount((prev) => (prev ? { ...prev, photoUrl: url || value } : prev));
      } catch (err) {
        triggerToast(err.message, 'err');
      }
    }
  };

  const linkEstablishmentByCode = async (rawCode) => {
    if (!account) throw new Error('Faça login novamente.');
    const result = await api.linkToHotelByCode(rawCode);
    const nextAccount = result.account || {
      ...account,
      hotelId: result.hotelId || result.hotel?.id,
      hotelOrRole: result.hotel?.name || account.hotelOrRole,
      hotelCode: result.hotel?.code,
      professionalCode: result.professionalCode || account.professionalCode,
      settings: {
        ...(account.settings || {}),
        hotelCode: result.hotel?.code,
        connectedEstablishments: result.connectedEstablishments || [],
      },
    };
    setAccount(nextAccount);
    setOnboardingData((prev) => ({
      ...prev,
      hotelOrRole: result.hotel?.name || prev.hotelOrRole,
    }));
    setTechSettings((prev) => ({
      ...prev,
      hotelCode: result.hotel?.code || prev.hotelCode,
      connectedEstablishments: result.connectedEstablishments || [],
    }));
    if (result.hotel) {
      setHotel({
        id: result.hotel.id,
        name: result.hotel.name,
        city: result.hotel.city || '',
        code: result.hotel.code,
        cnpj: result.hotel.cnpj || '',
      });
    }
    try {
      const data = await api.loadHotelData(nextAccount);
      applyHotelData(data);
    } catch (_) { /* lista pode atualizar no próximo login */ }
    return result;
  };

  const unlinkEstablishmentById = async (hotelId) => {
    if (!account) throw new Error('Faça login novamente.');
    const result = await api.unlinkFromHotel(hotelId);
    const nextAccount = result.account || {
      ...account,
      hotelId: result.hotelId,
      hotelOrRole: result.hotelName || '',
      settings: {
        ...(account.settings || {}),
        connectedEstablishments: result.connectedEstablishments || [],
      },
    };
    setAccount(nextAccount);
    setOnboardingData((prev) => ({
      ...prev,
      hotelOrRole: result.hotelName || '',
    }));
    setTechSettings((prev) => ({
      ...prev,
      connectedEstablishments: result.connectedEstablishments || [],
      hotelCode: result.connectedEstablishments?.[0]?.code || '',
    }));
    const primary = result.connectedEstablishments?.[0];
    setHotel((prev) => ({
      id: result.hotelId || null,
      name: result.hotelName || primary?.name || '',
      city: prev.city || '',
      code: primary?.code || '',
      cnpj: prev.cnpj || '',
    }));
    try {
      const data = await api.loadHotelData(nextAccount);
      applyHotelData(data);
    } catch (_) { /* ok */ }
    return result;
  };

  const value = {
    bootstrapping,
    configured: api.isSupabaseConfigured,
    currentView, setCurrentView,
    showPassword, setShowPassword,
    loginEmail, setLoginEmail,
    loginPassword, setLoginPassword,
    rememberMe, setRememberMe,
    registerType, setRegisterType,
    registerName, setRegisterName,
    registerHotel, setRegisterHotel,
    registerEmail, setRegisterEmail,
    registerPhone, setRegisterPhone,
    registerPassword, setRegisterPassword,
    registerConfirmPassword, setRegisterConfirmPassword,
    authError, setAuthError, busy,
    account, hotel, joinInvite,
    onboardingStep, setOnboardingStep,
    selectedProfile, setSelectedProfile,
    onboardingData, setOnboardingData,
    activeRequest, setActiveRequest,
    freelancersList, managementTeam, selectedIds, setSelectedIds, activeTab, setActiveTab,
    toast, navOpen, setNavOpen, triggerToast,
    inboxBadge, clearInboxBadge,
    notifications, pushNotification, markNotificationRead, markAllNotificationsRead,
    pushReady, pushBusy, enableMobilePush, disableMobilePush,
    isWebPushSupported: isWebPushSupported(),
    pushPermission: typeof Notification !== 'undefined' ? Notification.permission : 'unsupported',
    notifPanelTick, requestOpenNotifPanel,
    selectedGerenciaDay, setSelectedGerenciaDay,
    selectedSector, setSelectedSector, rhSectorFilter, setRhSectorFilter,
    shiftByDay, getShiftForDay, setShiftForDay,
    gerenciaSearchQuery, setGerenciaSearchQuery,
    freelancerBaseQuery, setFreelancerBaseQuery,
    freelancerBaseSector, setFreelancerBaseSector,
    dayPickerFor, setDayPickerFor, dayPickerSelected, setDayPickerSelected,
    returnModalOpen, setReturnModalOpen, returnReason, setReturnReason,
    returnedByDay, selectedFreelancersByDay, setSelectedFreelancersByDay,
    sentDays, requestStatusByDay, sentBaselineByDay, invitedByDay, checkedInIds, rhDay, setRhDay,
    dailyRates, guestCountByDay, techSettings, setTechSettings,
    freelancerInvites, freelancerAgenda, pendingInviteCount, activeUser,
    weekDays, weekOffset, shiftWeek, weekLabel: formatWeekRangeLabel(weekDays),
    pendingApprovalsCount: Object.values(requestStatusByDay || {}).filter(
      (s) => s === 'requested',
    ).length,
    handleLoginSubmit, signInWith, handleRegisterSubmit, handleFinishOnboarding, handleLogout,
    updateGuestCount, persistOccupancyDay, updateDailyRate,
    toggleGerenciaFreelancer, handleCancelGerenciaSelection, handleSendToRH,
    claimedByOtherSector,
    handleAcceptInvite, handleDeclineInvite, saveAvailability,
    openDayPicker, toggleDayPickerDay, confirmDayPicker,
    toggleAvailableDay, toggleAvailableTime,
    goHome, handleApproveAndSend, handleReturnToMaitre, confirmReturnToMaitre,
    toggleSelectAll, toggleSelectOne, confirmPresence, undoPresence,
    saveSettings, savingSettings, changeAccountField,
    linkEstablishmentByCode, unlinkEstablishmentById,
    GERENCIA_DAYS: weekDays, GERENCIA_SECTORS, SECTOR_SHIFT, SHIFT_OPTIONS, PROFILE_HOME,
    formatInviteDays, inviteDateSummary, dailyRateFor, rateKindForDay,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

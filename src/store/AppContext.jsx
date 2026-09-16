import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  GERENCIA_DAYS, GERENCIA_SECTORS, PROFILE_HOME, SECTOR_SHIFT,
  formatInviteDays, inviteDateSummary, dailyRateFor, rateKindForDay, initialsFrom,
} from '../lib/constants';
import * as api from '../lib/api';

const AppContext = createContext(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp precisa estar dentro de AppProvider');
  return ctx;
}

export function AppProvider({ children }) {
  const [bootstrapping, setBootstrapping] = useState(true);
  const [currentView, setCurrentView] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState('marcos.ferreira@atlantico.com.br');
  const [loginPassword, setLoginPassword] = useState('domu123');
  const [rememberMe, setRememberMe] = useState(true);
  const [registerName, setRegisterName] = useState('');
  const [registerHotel, setRegisterHotel] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [busy, setBusy] = useState(false);

  const [account, setAccount] = useState(null);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [selectedProfile, setSelectedProfile] = useState('gerencia');
  const [onboardingData, setOnboardingData] = useState({
    name: '',
    hotelOrRole: 'Hotel Atlântico Copacabana',
    department: '',
    phone: '',
    primaryRole: 'Garçom',
    city: 'Rio de Janeiro',
    availableDays: ['Sex', 'Sáb', 'Dom'],
    availableTimes: ['Tarde / Noite'],
    whatsappNotifications: true,
    emergencyAlerts: true,
    photoUrl: '',
  });

  const [activeRequest, setActiveRequest] = useState({
    department: 'Restaurante',
    dayText: 'Sexta, 19/09',
    fullDateText: 'Sexta, 19 de setembro de 2025',
    guests: 500,
    recommended: '22 – 28 pessoas',
    requestedPeople: 14,
    status: 'SOLICITADA',
  });

  const [freelancersList, setFreelancersList] = useState([]);
  const [selectedIds, setSelectedIds] = useState(['1', '2', '3', '4', '5', '6', '7', '8']);
  const [activeTab, setActiveTab] = useState('selecionados');
  const [toast, setToast] = useState(null);
  const [navOpen, setNavOpen] = useState(false);
  const [selectedGerenciaDay, setSelectedGerenciaDay] = useState('sex');
  const [selectedSector, setSelectedSector] = useState('restaurante');
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
  const [checkedInIds, setCheckedInIds] = useState([]);
  const [rhDay, setRhDay] = useState('sex');
  const [dailyRates, setDailyRates] = useState([]);
  const [guestCountByDay, setGuestCountByDay] = useState(() =>
    Object.fromEntries(GERENCIA_DAYS.map((d) => [d.id, d.guests]))
  );
  const [techSettings, setTechSettings] = useState({
    whatsappNotifications: true,
    emergencyAlerts: true,
    dailyEmail: false,
    inviteTimeoutHours: 4,
    timezone: 'America/Sao_Paulo',
    autoSubstitute: true,
    returnAlerts: true,
    shiftReminder: true,
    presenceNotify: true,
  });
  const [freelancerInvites, setFreelancerInvites] = useState([]);
  const [uuidByCode, setUuidByCode] = useState({});
  const [hotel, setHotel] = useState({ name: 'Hotel Atlântico Copacabana', city: 'Rio de Janeiro' });

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const applyHotelData = (data) => {
    setFreelancersList(data.professionals);
    setDailyRates(data.rates.length ? data.rates : []);
    setGuestCountByDay(data.occupancy);
    setSelectedFreelancersByDay(data.selectedByDay);
    setSentDays(data.sentDays);
    setReturnedByDay(data.returnedByDay);
    setFreelancerInvites(data.invites);
    setCheckedInIds(data.checkins);
    setTechSettings((prev) => ({ ...prev, ...data.hotelSettings }));
    setHotel(data.hotel);
    setUuidByCode(data._uuidByCode || Object.fromEntries((data.professionals || []).map((p) => [p.id, p.uuid])));
  };

  const hydrateAccount = async (acc) => {
    setAccount(acc);
    setSelectedProfile(acc.role);
    setOnboardingData({
      name: acc.name,
      hotelOrRole: acc.hotelOrRole,
      department: acc.department,
      phone: acc.phone,
      primaryRole: acc.primaryRole,
      city: acc.city,
      availableDays: acc.availableDays,
      availableTimes: acc.availableTimes,
      whatsappNotifications: acc.settings?.whatsappNotifications !== false,
      emergencyAlerts: acc.settings?.emergencyAlerts !== false,
      photoUrl: acc.photoUrl || '',
    });
    const data = await api.loadHotelData(acc);
    applyHotelData(data);
    if (!acc.onboarded) {
      setOnboardingStep(1);
      setCurrentView('onboarding');
    } else {
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
        else setCurrentView('login');
      } catch {
        if (alive) setCurrentView('login');
      } finally {
        if (alive) setBootstrapping(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const signInWith = async (email, password) => {
    setAuthError('');
    setBusy(true);
    try {
      const { account: acc } = await api.signIn(email, password);
      if (!acc) throw new Error('Perfil não encontrado. Rode o seed no Supabase.');
      await hydrateAccount(acc);
    } catch (err) {
      setAuthError(err.message || 'Falha no login');
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
    setBusy(true);
    try {
      const { account: acc } = await api.signUp({
        name: registerName,
        email: registerEmail,
        password: registerPassword,
        phone: registerPhone,
        hotelName: registerHotel,
      });
      await hydrateAccount(acc);
      triggerToast('Conta criada! Vamos personalizar sua experiência.');
    } catch (err) {
      setAuthError(err.message || 'Falha no cadastro');
    } finally {
      setBusy(false);
    }
  };

  const handleFinishOnboarding = async () => {
    if (!account) return;
    const next = await api.saveOnboarding(account.id, {
      role: selectedProfile,
      name: onboardingData.name,
      phone: onboardingData.phone,
      department: onboardingData.department,
      primaryRole: onboardingData.primaryRole,
      hotelOrRole: onboardingData.hotelOrRole,
      availableDays: onboardingData.availableDays,
      availableTimes: onboardingData.availableTimes,
      whatsappNotifications: onboardingData.whatsappNotifications,
      emergencyAlerts: onboardingData.emergencyAlerts,
      settings: {
        ...account.settings,
        whatsappNotifications: onboardingData.whatsappNotifications,
        emergencyAlerts: onboardingData.emergencyAlerts,
      },
    });
    setAccount(next);
    triggerToast('Configuração concluída com sucesso! Bem-vindo ao painel.');
    setCurrentView(PROFILE_HOME[selectedProfile] || 'main_kanban');
  };

  const handleLogout = async () => {
    await api.signOut();
    setAccount(null);
    setNavOpen(false);
    setCurrentView('login');
    triggerToast('Você saiu da conta.');
  };

  const updateGuestCount = async (dayId, value) => {
    const n = Math.max(0, parseInt(value, 10) || 0);
    setGuestCountByDay((prev) => ({ ...prev, [dayId]: n }));
    try { await api.saveOccupancy(account?.hotelId, dayId, n); } catch (err) { triggerToast(err.message); }
  };

  const updateDailyRate = async (role, kind, value) => {
    const n = Math.max(0, parseInt(value, 10) || 0);
    setDailyRates((prev) => prev.map((row) => (row.role === role ? { ...row, [kind]: n } : row)));
    try { await api.saveRate(account?.hotelId, role, kind, n); } catch (err) { triggerToast(err.message); }
  };

  const persistDraft = async (nextByDay = selectedFreelancersByDay) => {
    try {
      await api.saveDraftScale({
        hotelId: account?.hotelId,
        sector: selectedSector,
        dayId: selectedGerenciaDay,
        professionalCodes: nextByDay[selectedGerenciaDay] || [],
        uuidByCode,
      });
    } catch (err) {
      triggerToast(err.message);
    }
  };

  const toggleGerenciaFreelancer = (id) => {
    setSelectedFreelancersByDay((prev) => {
      const currentList = prev[selectedGerenciaDay] || [];
      const updated = currentList.includes(id)
        ? currentList.filter((item) => item !== id)
        : [...currentList, id];
      const next = { ...prev, [selectedGerenciaDay]: updated };
      persistDraft(next);
      return next;
    });
  };

  const handleCancelGerenciaSelection = () => {
    setSelectedFreelancersByDay((prev) => {
      const next = { ...prev, [selectedGerenciaDay]: [] };
      persistDraft(next);
      return next;
    });
    triggerToast('Seleção de freelancers para este dia cancelada.');
  };

  const handleSendToRH = async () => {
    const currentDayObj = GERENCIA_DAYS.find((d) => d.id === selectedGerenciaDay);
    const codes = selectedFreelancersByDay[selectedGerenciaDay] || [];
    try {
      await api.sendToRH({
        hotelId: account?.hotelId,
        sector: selectedSector,
        dayId: selectedGerenciaDay,
        guestCount: guestCountByDay[selectedGerenciaDay],
        professionalCodes: codes,
        uuidByCode,
        createdBy: account?.id,
      });
      setSentDays((prev) => ({ ...prev, [selectedGerenciaDay]: true }));
      setReturnedByDay((prev) => {
        if (!prev[selectedGerenciaDay]) return prev;
        const next = { ...prev };
        delete next[selectedGerenciaDay];
        return next;
      });
      triggerToast(`Escala de ${currentDayObj ? currentDayObj.fullDay : 'hoje'} enviada com sucesso para o RH!`);
    } catch (err) {
      triggerToast(err.message);
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
    try { await api.setInviteStatus(id, 'accepted'); } catch (err) { triggerToast(err.message); }
    triggerToast(n > 1 ? `${n} turnos aceitos — entraram na sua agenda.` : 'Vaga aceita! O turno entrou na sua agenda.');
  };

  const handleDeclineInvite = async (id) => {
    setFreelancerInvites((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'declined' } : i)));
    try { await api.setInviteStatus(id, 'declined'); } catch (err) { triggerToast(err.message); }
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
      ordered.forEach((dayId) => {
        const current = next[dayId] || [];
        next[dayId] = Array.from(new Set([...current, ...teamIds]));
      });
      persistDraft({ ...next, [ordered[0]]: next[ordered[0]] });
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
    if (!account) return;
    await api.saveProfile(account.id, {
      name: onboardingData.name,
      phone: onboardingData.phone,
      photoUrl: onboardingData.photoUrl,
      department: onboardingData.department,
      primaryRole: onboardingData.primaryRole,
      city: onboardingData.city,
      hotelOrRole: onboardingData.hotelOrRole,
      settings: {
        ...techSettings,
        whatsappNotifications: onboardingData.whatsappNotifications,
        emergencyAlerts: onboardingData.emergencyAlerts,
      },
    });
    setAccount((prev) => prev ? { ...prev, name: onboardingData.name, photoUrl: onboardingData.photoUrl } : prev);
    triggerToast('Configurações salvas.');
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
        : (onboardingData.department || 'Maître');
    return { initials: initialsFrom(name), name, role: roleLabel };
  }, [selectedProfile, onboardingData, account]);

  const handleApproveAndSend = async () => {
    setActiveRequest((prev) => ({ ...prev, status: 'ENVIADA' }));
    const sectorMeta = GERENCIA_SECTORS.find((s) => s.label === activeRequest.department)
      || GERENCIA_SECTORS.find((s) => s.id === selectedSector)
      || GERENCIA_SECTORS[0];
    const dayIdsByCode = {};
    selectedIds.forEach((fid) => {
      let dayIds = GERENCIA_DAYS.map((d) => d.id).filter((id) => (selectedFreelancersByDay[id] || []).includes(fid));
      if (!dayIds.includes(rhDay)) dayIds = [...dayIds, rhDay];
      if (!dayIds.length) dayIds = [rhDay];
      dayIdsByCode[fid] = GERENCIA_DAYS.map((d) => d.id).filter((id) => dayIds.includes(id));
    });
    try {
      const packages = await api.approveAndSend({
        hotelId: account?.hotelId,
        sector: sectorMeta.id,
        dayIdsByCode,
        uuidByCode,
        rates: dailyRates,
        hotelName: hotel?.name,
      });
      if (packages?.length) {
        setFreelancerInvites((prev) => [...packages, ...prev]);
      }
      const multi = Object.values(dayIdsByCode).some((d) => d.length > 1);
      triggerToast(multi
        ? 'Aprovado. Convites em pacote enviados no WhatsApp (todos os dias juntos).'
        : 'Solicitação aprovada! Convites enviados via WhatsApp.');
      setCurrentView('main_kanban');
    } catch (err) {
      triggerToast(err.message);
    }
  };

  const handleReturnToMaitre = () => {
    setReturnReason('');
    setReturnModalOpen(true);
  };

  const confirmReturnToMaitre = async () => {
    const reason = returnReason.trim();
    if (!reason) {
      triggerToast('Informe o motivo da devolução');
      return;
    }
    const dayId = rhDay || 'sex';
    try {
      await api.returnRequest({
        hotelId: account?.hotelId,
        sector: selectedSector,
        dayId,
        reason,
        returnedBy: account?.id,
      });
      setReturnedByDay((prev) => ({
        ...prev,
        [dayId]: { reason, author: account?.name || 'RH', at: 'Agora', department: activeRequest.department },
      }));
      setSentDays((prev) => {
        const next = { ...prev };
        delete next[dayId];
        return next;
      });
      setActiveRequest((prev) => ({ ...prev, status: 'DEVOLVIDA' }));
      setReturnModalOpen(false);
      setReturnReason('');
      triggerToast('Devolvida ao maître com o motivo');
      setCurrentView('main_kanban');
    } catch (err) {
      triggerToast(err.message);
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
    setCheckedInIds((prev) => (prev.includes(f.id) ? prev : [...prev, f.id]));
    try {
      await api.setCheckin({
        hotelId: account?.hotelId,
        professionalCode: f.id,
        uuidByCode,
        dayId: 'sex',
        present: true,
        byProfileId: account?.id,
      });
    } catch (err) { triggerToast(err.message); }
    triggerToast(`${f.name} marcado como presente`);
  };

  const undoPresence = async (f) => {
    setCheckedInIds((prev) => prev.filter((id) => id !== f.id));
    try {
      await api.setCheckin({
        hotelId: account?.hotelId,
        professionalCode: f.id,
        uuidByCode,
        dayId: 'sex',
        present: false,
        byProfileId: account?.id,
      });
    } catch (err) { triggerToast(err.message); }
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
        triggerToast(err.message);
      }
    }
  };

  const value = {
    bootstrapping,
    configured: api.isSupabaseConfigured,
    currentView, setCurrentView,
    showPassword, setShowPassword,
    loginEmail, setLoginEmail,
    loginPassword, setLoginPassword,
    rememberMe, setRememberMe,
    registerName, setRegisterName,
    registerHotel, setRegisterHotel,
    registerEmail, setRegisterEmail,
    registerPhone, setRegisterPhone,
    registerPassword, setRegisterPassword,
    authError, busy,
    account, hotel,
    onboardingStep, setOnboardingStep,
    selectedProfile, setSelectedProfile,
    onboardingData, setOnboardingData,
    activeRequest, setActiveRequest,
    freelancersList, selectedIds, setSelectedIds, activeTab, setActiveTab,
    toast, navOpen, setNavOpen, triggerToast,
    selectedGerenciaDay, setSelectedGerenciaDay,
    selectedSector, setSelectedSector,
    gerenciaSearchQuery, setGerenciaSearchQuery,
    freelancerBaseQuery, setFreelancerBaseQuery,
    freelancerBaseSector, setFreelancerBaseSector,
    dayPickerFor, setDayPickerFor, dayPickerSelected, setDayPickerSelected,
    returnModalOpen, setReturnModalOpen, returnReason, setReturnReason,
    returnedByDay, selectedFreelancersByDay, setSelectedFreelancersByDay,
    sentDays, checkedInIds, rhDay, setRhDay,
    dailyRates, guestCountByDay, techSettings, setTechSettings,
    freelancerInvites, freelancerAgenda, pendingInviteCount, activeUser,
    handleLoginSubmit, signInWith, handleRegisterSubmit, handleFinishOnboarding, handleLogout,
    updateGuestCount, updateDailyRate,
    toggleGerenciaFreelancer, handleCancelGerenciaSelection, handleSendToRH,
    handleAcceptInvite, handleDeclineInvite, saveAvailability,
    openDayPicker, toggleDayPickerDay, confirmDayPicker,
    toggleAvailableDay, toggleAvailableTime,
    goHome, handleApproveAndSend, handleReturnToMaitre, confirmReturnToMaitre,
    toggleSelectAll, toggleSelectOne, confirmPresence, undoPresence,
    saveSettings, changeAccountField,
    GERENCIA_DAYS, GERENCIA_SECTORS, SECTOR_SHIFT, PROFILE_HOME,
    formatInviteDays, inviteDateSummary, dailyRateFor, rateKindForDay,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

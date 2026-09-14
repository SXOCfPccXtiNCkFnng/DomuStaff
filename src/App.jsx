import React, { useState } from 'react';
import { 
  Calendar, Users, CheckCircle2, MessageSquare, Clock, Settings, Search, 
  Bell, ChevronLeft, ChevronRight, Phone, MoreHorizontal, Plus, ArrowLeft,
  Edit, Info, Check, Send, RotateCcw, AlertTriangle, Layers, LogOut, ChevronDown,
  Utensils, Wine, ChefHat, Package, Bed, TrendingUp, Eye, EyeOff, Building2,
  Lock, Mail, ArrowRight, ShieldCheck, Zap, User, Sparkles, X, Filter, FileText,
  ConciergeBell
} from 'lucide-react';

const INITIAL_SELECTED_FREELANCERS = [
  { id: '1', name: 'João Pedro', role: 'Garçom', status: 'Disponível', notes: '—', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80', phone: '(21) 99887-7661' },
  { id: '2', name: 'Mariana Lima', role: 'Garçom', status: 'Disponível', notes: '—', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', phone: '(21) 99887-7662' },
  { id: '3', name: 'Carlos Eduardo', role: 'Garçom', status: 'Disponível', notes: 'Já trabalhou no evento anterior', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', phone: '(21) 99887-7663' },
  { id: '4', name: 'Ana Beatriz', role: 'Garçom', status: 'Disponível', notes: '—', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', phone: '(21) 99887-7664' },
  { id: '5', name: 'Rafael Costa', role: 'Garçom', status: 'Disponível', notes: '—', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', phone: '(21) 99887-7665' },
  { id: '6', name: 'Lucas Martins', role: 'Garçom', status: 'Disponível', notes: 'Prefere turno noturno', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', phone: '(21) 99887-7666' },
  { id: '7', name: 'Fernanda Alves', role: 'Garçom', status: 'Disponível', notes: '—', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', phone: '(21) 99887-7667' },
  { id: '8', name: 'Tiago Souza', role: 'Garçom', status: 'Disponível', notes: '—', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80', phone: '(21) 99887-7668' },
  { id: '9', name: 'Juliana Castro', role: 'Garçom', status: 'Disponível', notes: 'Disponível para plantão', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', phone: '(21) 99887-7669' },
  { id: '10', name: 'Felipe Rocha', role: 'Garçom', status: 'Disponível', notes: '—', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80', phone: '(21) 99887-7670' },
  { id: '11', name: 'Camila Duarte', role: 'Garçom', status: 'Disponível', notes: '—', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80', phone: '(21) 99887-7671' },
  { id: '12', name: 'Bruno Mendes', role: 'Garçom', status: 'Disponível', notes: 'Experiência em salão executivo', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80', phone: '(21) 99887-7672' },
  { id: '13', name: 'Letícia Ramos', role: 'Recepcionista', status: 'Disponível', notes: 'Inglês e espanhol fluentes', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', phone: '(21) 99887-7673' },
  { id: '14', name: 'Bianca Santos', role: 'Recepcionista', status: 'Disponível', notes: 'Experiência em PMS e check-in executivo', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80', phone: '(21) 99887-7674' },
];

const GERENCIA_DAYS = [
  { id: 'seg', label: 'Seg', date: '15/09', fullDay: 'segunda, 15/09', guests: '320 hóspedes', recommended: '14 – 18 pessoas', needed: 14, defaultFilled: 12 },
  { id: 'ter', label: 'Ter', date: '16/09', fullDay: 'terça, 16/09', guests: '280 hóspedes', recommended: '12 – 16 pessoas', needed: 12, defaultFilled: 8 },
  { id: 'qua', label: 'Qua', date: '17/09', fullDay: 'quarta, 17/09', guests: '310 hóspedes', recommended: '14 – 18 pessoas', needed: 14, defaultFilled: 10 },
  { id: 'qui', label: 'Qui', date: '18/09', fullDay: 'quinta, 18/09', guests: '420 hóspedes', recommended: '18 – 24 pessoas', needed: 16, defaultFilled: 12 },
  { id: 'sex', label: 'Sex', date: '19/09', fullDay: 'sexta, 19/09', guests: '500 hóspedes', recommended: '22 – 28 pessoas', needed: 14, defaultFilled: 3 },
  { id: 'sab', label: 'Sáb', date: '20/09', fullDay: 'sábado, 20/09', guests: '480 hóspedes', recommended: '20 – 28 pessoas', needed: 16, defaultFilled: 0 },
  { id: 'dom', label: 'Dom', date: '21/09', fullDay: 'domingo, 21/09', guests: '350 hóspedes', recommended: '16 – 22 pessoas', needed: 12, defaultFilled: 0 },
];

const GERENCIA_SECTORS = [
  { id: 'restaurante', label: 'Restaurante', icon: Utensils },
  { id: 'recepcao', label: 'Recepção', icon: ConciergeBell },
  { id: 'bar', label: 'Bar', icon: Wine },
  { id: 'cozinha', label: 'Cozinha', icon: ChefHat },
  { id: 'governanca', label: 'Governança', icon: Bed },
  { id: 'cdc', label: 'CDC', icon: Package },
];

export default function App() {
  // Views: 'login' | 'register' | 'onboarding' | 'gerencia_montar_escala' | 'main_kanban' | 'approval_details'
  const [currentView, setCurrentView] = useState('gerencia_montar_escala');
  
  // Auth Form State
  const [showPassword, setShowPassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState('renata.prado@atlantico.com.br');
  const [loginPassword, setLoginPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);

  // Register Form State
  const [registerName, setRegisterName] = useState('');
  const [registerHotel, setRegisterHotel] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  // RH Shift Request State
  const [activeRequest, setActiveRequest] = useState({
    department: 'Restaurante',
    dayText: 'Sexta, 19/09',
    fullDateText: 'Sexta, 19 de setembro de 2025',
    guests: 500,
    recommended: '22 – 28 pessoas',
    requestedPeople: 14,
    status: 'SOLICITADA',
    maitreName: 'Marcos Almeida',
    maitreRole: 'Maître',
    maitreTime: 'Hoje, 10:24',
    maitreObs: 'Maior movimento no jantar. Priorizar freelancers com experiência em eventos grandes.'
  });

  const [freelancersList, setFreelancersList] = useState(INITIAL_SELECTED_FREELANCERS);
  const [selectedIds, setSelectedIds] = useState(['1', '2', '3', '4', '5', '6', '7', '8']);
  const [activeTab, setActiveTab] = useState('selecionados');
  const [toast, setToast] = useState(null);

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setOnboardingStep(1);
    setCurrentView('onboarding');
  };

  // Onboarding State
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [selectedProfile, setSelectedProfile] = useState('gerencia'); // 'freelancer' | 'rh' | 'gerencia'
  const [onboardingData, setOnboardingData] = useState({
    name: 'Renata Prado',
    hotelOrRole: 'Hotel Atlântico Copacabana',
    department: 'Gerência de Operações & A&B',
    phone: '(21) 99887-7661',
    primaryRole: 'Garçom',
    availableDays: ['Sex', 'Sáb', 'Dom'],
    availableTimes: ['Tarde / Noite'],
    whatsappNotifications: true,
    emergencyAlerts: true
  });

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (registerName) {
      setOnboardingData(prev => ({
        ...prev,
        name: registerName,
        hotelOrRole: registerHotel || prev.hotelOrRole,
        phone: registerPhone || prev.phone
      }));
    }
    triggerToast('Conta criada! Vamos personalizar sua experiência.');
    setOnboardingStep(1);
    setCurrentView('onboarding');
  };

  // Gerência - Montar Escala State
  const [selectedGerenciaDay, setSelectedGerenciaDay] = useState('sex');
  const [selectedSector, setSelectedSector] = useState('restaurante');
  const [gerenciaSearchQuery, setGerenciaSearchQuery] = useState('');
  const [selectedFreelancersByDay, setSelectedFreelancersByDay] = useState({
    seg: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    ter: ['1', '2', '3', '4', '5', '6', '7', '8'],
    qua: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    qui: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    sex: ['1', '2', '3'],
    sab: [],
    dom: []
  });
  const [sentDays, setSentDays] = useState({});

  const toggleGerenciaFreelancer = (id) => {
    setSelectedFreelancersByDay(prev => {
      const currentList = prev[selectedGerenciaDay] || [];
      const updated = currentList.includes(id)
        ? currentList.filter(item => item !== id)
        : [...currentList, id];
      return { ...prev, [selectedGerenciaDay]: updated };
    });
  };

  const handleCancelGerenciaSelection = () => {
    setSelectedFreelancersByDay(prev => ({ ...prev, [selectedGerenciaDay]: [] }));
    triggerToast('Seleção de freelancers para este dia cancelada.');
  };

  const handleSendToRH = () => {
    const currentDayObj = GERENCIA_DAYS.find(d => d.id === selectedGerenciaDay);
    setSentDays(prev => ({ ...prev, [selectedGerenciaDay]: true }));
    triggerToast(`Escala de ${currentDayObj ? currentDayObj.fullDay : 'hoje'} enviada com sucesso para o RH!`);
  };

  const handleFinishOnboarding = () => {
    triggerToast('Configuração concluída com sucesso! Bem-vindo ao painel.');
    if (selectedProfile === 'gerencia') {
      setCurrentView('gerencia_montar_escala');
    } else {
      setCurrentView('main_kanban');
    }
  };

  const handleApproveAndSend = () => {
    setActiveRequest(prev => ({ ...prev, status: 'ENVIADA' }));
    triggerToast('Solicitação aprovada com sucesso! Convites enviados via WhatsApp para a equipe.');
    setCurrentView('main_kanban');
  };

  const handleReturnToMaitre = () => {
    triggerToast('Solicitação devolvida ao maître para ajustes.');
    setCurrentView('main_kanban');
  };

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(freelancersList.map(f => f.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // =========================================================================
  // VIEW: LOGIN & CADASTRO (MODERN ENTERPRISE HOSPITALITY SHOWCASE)
  // =========================================================================
  if (currentView === 'login' || currentView === 'register') {
    return (
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        background: '#F8FAFC',
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
      }}>
        {/* Toast Notification */}
        {toast && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: '#0F172A',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            borderLeft: '4px solid #0066FF'
          }}>
            <CheckCircle2 size={16} color="#38BDF8" />
            {toast}
          </div>
        )}

        {/* LEFT SIDE: Clean Brand & Information */}
        <div 
          className="auth-left-showcase"
          style={{
            flex: '1 1 52%',
            backgroundColor: '#070D1F',
            background: 'linear-gradient(180deg, #070D1F 0%, #0B1633 100%)',
            color: '#FFFFFF',
            padding: '56px 64px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative'
          }}
        >
          {/* Top Brand Identity: Somente a Logo e escrito Domu Staff */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img 
              src="/logobranca.png" 
              alt="Domu Staff" 
              style={{ height: '34px', width: 'auto', objectFit: 'contain' }} 
            />
            <span style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.3px' }}>
              Domu Staff
            </span>
          </div>

          {/* Central Information Area */}
          <div style={{ maxWidth: '500px', margin: '48px 0' }}>
            <h1 style={{
              fontSize: '36px',
              fontWeight: 800,
              lineHeight: 1.25,
              letterSpacing: '-0.6px',
              color: '#FFFFFF',
              marginBottom: '18px'
            }}>
              Tecnologia para gestão e convocação de escalas.
            </h1>

            <p style={{
              fontSize: '15px',
              lineHeight: 1.6,
              color: '#94A3B8',
              marginBottom: '36px'
            }}>
              Organize escalas flexíveis, automatize o contato com freelancers e centralize aprovações operacionais para hotéis, bares e restaurantes.
            </p>

            {/* Informações objetivas e limpas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{
                padding: '16px 20px',
                background: 'rgba(255, 255, 255, 0.04)',
                borderLeft: '3px solid #0066FF',
                borderRadius: '0 8px 8px 0'
              }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
                  Convocação direta via WhatsApp
                </div>
                <div style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.5 }}>
                  Disparo de oportunidades para profissionais qualificados com confirmação ágil e sem ruído de grupos.
                </div>
              </div>

              <div style={{
                padding: '16px 20px',
                background: 'rgba(255, 255, 255, 0.04)',
                borderLeft: '3px solid #0066FF',
                borderRadius: '0 8px 8px 0'
              }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
                  Dimensionamento por demanda
                </div>
                <div style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.5 }}>
                  Planejamento de contingente alinhado à taxa de ocupação de hóspedes e eventos em tempo real.
                </div>
              </div>

              <div style={{
                padding: '16px 20px',
                background: 'rgba(255, 255, 255, 0.04)',
                borderLeft: '3px solid #0066FF',
                borderRadius: '0 8px 8px 0'
              }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
                  Governança e controle de presença
                </div>
                <div style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.5 }}>
                  Aprovação formal do RH, histórico completo de assiduidade e pontualidade da equipe.
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ fontSize: '12px', color: '#64748B' }}>
            © 2026 Domu Staff • domustaff.app
          </div>
        </div>

        {/* RIGHT SIDE: Authentication Form Portal */}
        <div 
          className="auth-right-container"
          style={{
            flex: '1 1 48%',
            background: '#F8FAFC',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 40px',
            position: 'relative'
          }}
        >
          <div style={{ width: '100%', maxWidth: '440px' }}>
            
            {/* Mobile-only Top Brand Logo */}
            <div 
              className="auth-mobile-logo"
              style={{
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                marginBottom: '24px'
              }}
            >
              <img src="/logo.png" alt="Domu Staff" style={{ height: '32px', width: 'auto' }} />
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>Domu Staff</span>
            </div>

            {/* Segmented Tab Switcher [Entrar | Cadastrar] */}
            <div style={{
              display: 'flex',
              background: '#E2E8F0',
              padding: '4px',
              borderRadius: '10px',
              marginBottom: '24px'
            }}>
              <button
                type="button"
                onClick={() => setCurrentView('login')}
                style={{
                  flex: 1,
                  padding: '9px 0',
                  fontSize: '13px',
                  fontWeight: currentView === 'login' ? 700 : 600,
                  color: currentView === 'login' ? '#0F172A' : '#64748B',
                  background: currentView === 'login' ? '#FFFFFF' : 'transparent',
                  borderRadius: '7px',
                  boxShadow: currentView === 'login' ? '0 2px 6px rgba(15, 23, 42, 0.08)' : 'none',
                  transition: 'all 0.18s ease',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Entrar na Conta
              </button>
              <button
                type="button"
                onClick={() => setCurrentView('register')}
                style={{
                  flex: 1,
                  padding: '9px 0',
                  fontSize: '13px',
                  fontWeight: currentView === 'register' ? 700 : 600,
                  color: currentView === 'register' ? '#0F172A' : '#64748B',
                  background: currentView === 'register' ? '#FFFFFF' : 'transparent',
                  borderRadius: '7px',
                  boxShadow: currentView === 'register' ? '0 2px 6px rgba(15, 23, 42, 0.08)' : 'none',
                  transition: 'all 0.18s ease',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Criar Conta Grátis
              </button>
            </div>

            {/* FORM CARD */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '14px',
              padding: '32px 28px',
              boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.06)'
            }}>
              
              {/* Header inside Card */}
              <div style={{ marginBottom: '22px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.4px', marginBottom: '6px' }}>
                  {currentView === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
                </h2>
                <p style={{ fontSize: '13.5px', color: '#64748B', lineHeight: 1.5 }}>
                  {currentView === 'login' 
                    ? 'Informe suas credenciais para acessar o painel de escalas.' 
                    : 'Cadastre seu estabelecimento para começar a gerenciar sua equipe.'}
                </p>
              </div>

              {/* LOGIN FORM */}
              {currentView === 'login' && (
                <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      E-mail Corporativo
                    </label>
                    <div className="auth-input-container">
                      <Mail size={16} className="auth-input-icon" />
                      <input 
                        type="email"
                        required
                        className="auth-input"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="seu@hotel.com.br"
                      />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                        Senha de Acesso
                      </label>
                      <a 
                        href="#recuperar" 
                        onClick={(e) => { e.preventDefault(); alert('Instruções de redefinição foram enviadas para seu e-mail.'); }} 
                        style={{ fontSize: '12px', fontWeight: 600, color: '#0066FF', textDecoration: 'none' }}
                      >
                        Esqueceu a senha?
                      </a>
                    </div>
                    <div className="auth-input-container">
                      <Lock size={16} className="auth-input-icon" />
                      <input 
                        type={showPassword ? 'text' : 'password'}
                        required
                        className="auth-input"
                        style={{ paddingRight: '42px' }}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Sua senha"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: '14px', color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer' }}
                        title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#0066FF' }}
                    />
                    <label htmlFor="rememberMe" style={{ fontSize: '12.5px', color: '#475569', cursor: 'pointer' }}>
                      Manter conectado neste dispositivo
                    </label>
                  </div>

                  <button 
                    type="submit"
                    className="auth-btn-primary"
                    style={{ width: '100%', marginTop: '4px' }}
                  >
                    <span>Acessar plataforma</span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              )}

              {/* REGISTER FORM */}
              {currentView === 'register' && (
                <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Nome Completo do Responsável
                    </label>
                    <div className="auth-input-container">
                      <User size={16} className="auth-input-icon" />
                      <input 
                        type="text"
                        required
                        className="auth-input"
                        placeholder="Ex: Renata Prado"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Hotel ou Restaurante
                    </label>
                    <div className="auth-input-container">
                      <Building2 size={16} className="auth-input-icon" />
                      <input 
                        type="text"
                        required
                        className="auth-input"
                        placeholder="Ex: Hotel Atlântico Copacabana"
                        value={registerHotel}
                        onChange={(e) => setRegisterHotel(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        E-mail Corporativo
                      </label>
                      <div className="auth-input-container">
                        <Mail size={16} className="auth-input-icon" />
                        <input 
                          type="email"
                          required
                          className="auth-input"
                          placeholder="renata@hotel.com"
                          value={registerEmail}
                          onChange={(e) => setRegisterEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        WhatsApp Convocação
                      </label>
                      <div className="auth-input-container">
                        <Phone size={16} className="auth-input-icon" />
                        <input 
                          type="tel"
                          required
                          className="auth-input"
                          placeholder="(21) 99999-9999"
                          value={registerPhone}
                          onChange={(e) => setRegisterPhone(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Senha
                    </label>
                    <div className="auth-input-container">
                      <Lock size={16} className="auth-input-icon" />
                      <input 
                        type="password"
                        required
                        className="auth-input"
                        placeholder="Mínimo 8 caracteres"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="auth-btn-primary"
                    style={{ width: '100%', marginTop: '4px' }}
                  >
                    <span>Criar conta</span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              )}

            </div>

            {/* Security Guarantee Footer */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '20px',
              fontSize: '12px',
              color: '#64748B'
            }}>
              <span>Ambiente corporativo seguro • Domu Staff</span>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: ONBOARDING (4 ETAPAS)
  // =========================================================================
  if (currentView === 'onboarding') {
    return (
      <div style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '36px 20px 24px',
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
      }}>
        {/* Top Header with Domu Staff Logo */}
        <div style={{ width: '100%', maxWidth: '840px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logo.png" alt="Domu Staff" style={{ height: '30px', width: 'auto' }} />
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>Domu Staff</span>
          </div>
          <button
            type="button"
            onClick={() => setCurrentView('login')}
            style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Sair da configuração
          </button>
        </div>

        {/* Stepper Bar */}
        <div style={{ width: '100%', maxWidth: '840px', marginBottom: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            {[
              { num: 1, title: 'Tipo de conta' },
              { num: 2, title: 'Seus dados' },
              { num: 3, title: selectedProfile === 'freelancer' ? 'Disponibilidade' : 'Configurações' },
              { num: 4, title: 'Concluir' }
            ].map((step, idx) => {
              const isActive = onboardingStep === step.num;
              const isCompleted = onboardingStep > step.num;
              return (
                <div key={step.num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2, flex: 1 }}>
                  {idx < 3 && (
                    <div style={{
                      position: 'absolute',
                      top: '15px',
                      left: '50%',
                      width: '100%',
                      height: '2px',
                      backgroundColor: isCompleted ? '#0066FF' : '#E2E8F0',
                      zIndex: -1
                    }} />
                  )}
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: isActive || isCompleted ? '#0066FF' : '#FFFFFF',
                    border: isActive || isCompleted ? '2px solid #0066FF' : '2px solid #CBD5E1',
                    color: isActive || isCompleted ? '#FFFFFF' : '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '13px',
                    marginBottom: '8px',
                    boxShadow: isActive ? '0 0 0 4px rgba(0, 102, 255, 0.15)' : 'none',
                    transition: 'all 0.2s ease'
                  }}>
                    {isCompleted ? <Check size={16} strokeWidth={3} /> : step.num}
                  </div>
                  <span style={{
                    fontSize: '12.5px',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#0F172A' : '#64748B',
                    textAlign: 'center'
                  }}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ width: '100%', maxWidth: '960px', flex: 1, display: 'flex', flexDirection: 'column' }}>

          {/* ========================================================================= */}
          {/* STEP 1: Tipo de conta */}
          {/* ========================================================================= */}
          {onboardingStep === 1 && (
            <div>
              <div style={{ marginBottom: '28px' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
                  BEM-VINDO AO DOMU STAFF
                </div>
                <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px', marginBottom: '8px' }}>
                  Qual é o seu perfil?
                </h1>
                <p style={{ fontSize: '15px', color: '#64748B' }}>
                  Escolha como você vai usar a plataforma para personalizarmos sua experiência.
                </p>
              </div>

              {/* 3 Profile Cards Grid */}
              <div className="onboarding-profile-grid">
                
                {/* Card 1: Sou freelancer */}
                <div 
                  className={`onboarding-profile-card ${selectedProfile === 'freelancer' ? 'selected' : ''}`}
                  onClick={() => setSelectedProfile('freelancer')}
                >
                  {selectedProfile === 'freelancer' && (
                    <div style={{
                      position: 'absolute',
                      top: '14px',
                      right: '14px',
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: '#0066FF',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Check size={13} strokeWidth={3} />
                    </div>
                  )}

                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: '#EBF3FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                    color: '#0066FF'
                  }}>
                    <User size={24} />
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                    Sou freelancer
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5, marginBottom: '20px', minHeight: '40px' }}>
                    Quero visualizar escalas, receber convites e confirmar minha disponibilidade.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
                    {[
                      'Receba convites de escalas',
                      'Defina sua disponibilidade',
                      'Acompanhe suas escalas',
                      'Comunique-se com o RH'
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px', color: '#334155' }}>
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#EBF3FF', color: '#0066FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Check size={11} strokeWidth={3} />
                        </div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card 2: Sou do RH */}
                <div 
                  className={`onboarding-profile-card ${selectedProfile === 'rh' ? 'selected' : ''}`}
                  onClick={() => setSelectedProfile('rh')}
                >
                  {selectedProfile === 'rh' && (
                    <div style={{
                      position: 'absolute',
                      top: '14px',
                      right: '14px',
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: '#0066FF',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Check size={13} strokeWidth={3} />
                    </div>
                  )}

                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: '#F3E8FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                    color: '#9333EA'
                  }}>
                    <Users size={24} />
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                    Sou do RH
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5, marginBottom: '20px', minHeight: '40px' }}>
                    Quero gerenciar escalas, enviar convites e acompanhar a equipe de freelancers.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
                    {[
                      'Monte e gerencie escalas',
                      'Envie convites em massa',
                      'Acompanhe confirmações',
                      'Veja relatórios e métricas'
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px', color: '#334155' }}>
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#F3E8FF', color: '#9333EA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Check size={11} strokeWidth={3} />
                        </div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card 3: Sou Gerencia (Ajustado conforme pedido do usuário!) */}
                <div 
                  className={`onboarding-profile-card ${selectedProfile === 'gerencia' ? 'selected' : ''}`}
                  onClick={() => setSelectedProfile('gerencia')}
                >
                  {selectedProfile === 'gerencia' && (
                    <div style={{
                      position: 'absolute',
                      top: '14px',
                      right: '14px',
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: '#0066FF',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Check size={13} strokeWidth={3} />
                    </div>
                  )}

                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: '#DCFCE7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                    color: '#16A34A'
                  }}>
                    <ChefHat size={24} />
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                    Sou Gerencia
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5, marginBottom: '20px', minHeight: '40px' }}>
                    Quero montar a escala e selecionar freelancers para o meu setor.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
                    {[
                      'Monte a escala do seu setor',
                      'Selecione freelancers',
                      'Acompanhe confirmações',
                      'Gerencie substituições'
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px', color: '#334155' }}>
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Check size={11} strokeWidth={3} />
                        </div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Info Note Box */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: '#F0F7FF',
                border: '1px solid #DBEAFE',
                borderRadius: '10px',
                padding: '14px 18px',
                marginTop: '24px'
              }}>
                <Info size={18} color="#0066FF" style={{ flexShrink: 0 }} />
                <div>
                  <strong style={{ color: '#0F172A', fontSize: '13px' }}>Você pode alterar depois</strong>
                  <span style={{ color: '#64748B', fontSize: '13px' }}> — Essa configuração pode ser modificada a qualquer momento nas configurações da sua conta.</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '28px' }}>
                <button 
                  type="button"
                  className="btn-primary" 
                  style={{ padding: '12px 32px', fontSize: '14px', borderRadius: '8px' }} 
                  onClick={() => setOnboardingStep(2)}
                >
                  <span>Continuar</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: Seus dados */}
          {/* ========================================================================= */}
          {onboardingStep === 2 && (
            <div style={{ maxWidth: '640px', margin: '0 auto', width: '100%' }}>
              <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
                  ETAPA 2 DE 4 • SEUS DADOS
                </div>
                <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.4px', marginBottom: '6px' }}>
                  Complete as informações do seu perfil
                </h2>
                <p style={{ fontSize: '14px', color: '#64748B' }}>
                  {selectedProfile === 'freelancer' 
                    ? 'Esses dados serão enviados aos gestores ao convocarem você para um turno.' 
                    : 'Identifique seu estabelecimento e cargo para gerenciar as escalas.'}
                </p>
              </div>

              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '28px', boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Nome Completo
                    </label>
                    <div className="auth-input-container">
                      <User size={16} className="auth-input-icon" />
                      <input 
                        type="text"
                        required
                        className="auth-input"
                        value={onboardingData.name}
                        onChange={(e) => setOnboardingData({ ...onboardingData, name: e.target.value })}
                        placeholder="Ex: Renata Prado"
                      />
                    </div>
                  </div>

                  {selectedProfile === 'freelancer' ? (
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Função Principal
                      </label>
                      <select
                        className="auth-input"
                        style={{ paddingLeft: '14px' }}
                        value={onboardingData.primaryRole}
                        onChange={(e) => setOnboardingData({ ...onboardingData, primaryRole: e.target.value })}
                      >
                        <option value="Garçom">Garçom</option>
                        <option value="Maître">Maître</option>
                        <option value="Bartender">Bartender</option>
                        <option value="Cozinheiro">Cozinheiro</option>
                        <option value="Cumim">Cumim</option>
                        <option value="Recepcionista">Recepcionista</option>
                      </select>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                          Hotel / Estabelecimento
                        </label>
                        <div className="auth-input-container">
                          <Building2 size={16} className="auth-input-icon" />
                          <input 
                            type="text"
                            required
                            className="auth-input"
                            value={onboardingData.hotelOrRole}
                            onChange={(e) => setOnboardingData({ ...onboardingData, hotelOrRole: e.target.value })}
                            placeholder="Ex: Hotel Atlântico Copacabana"
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                          Departamento / Setor de Gestão
                        </label>
                        <input 
                          type="text"
                          required
                          className="auth-input"
                          style={{ paddingLeft: '14px' }}
                          value={onboardingData.department}
                          onChange={(e) => setOnboardingData({ ...onboardingData, department: e.target.value })}
                          placeholder="Ex: Gerência de A&B / Restaurante"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      WhatsApp para Contato
                    </label>
                    <div className="auth-input-container">
                      <Phone size={16} className="auth-input-icon" />
                      <input 
                        type="tel"
                        required
                        className="auth-input"
                        value={onboardingData.phone}
                        onChange={(e) => setOnboardingData({ ...onboardingData, phone: e.target.value })}
                        placeholder="(21) 99887-7661"
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '28px' }}>
                  <button 
                    type="button"
                    className="btn-outline" 
                    onClick={() => setOnboardingStep(1)}
                  >
                    <ArrowLeft size={16} />
                    <span>Voltar</span>
                  </button>
                  <button 
                    type="button"
                    className="btn-primary" 
                    onClick={() => setOnboardingStep(3)}
                  >
                    <span>Continuar</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: Configurações & Disponibilidade */}
          {/* ========================================================================= */}
          {onboardingStep === 3 && (
            <div style={{ maxWidth: '640px', margin: '0 auto', width: '100%' }}>
              <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
                  ETAPA 3 DE 4 • {selectedProfile === 'freelancer' ? 'DISPONIBILIDADE' : 'CONFIGURAÇÕES'}
                </div>
                <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.4px', marginBottom: '6px' }}>
                  {selectedProfile === 'freelancer' ? 'Dias e horários disponíveis' : 'Preferências operacionais'}
                </h2>
                <p style={{ fontSize: '14px', color: '#64748B' }}>
                  {selectedProfile === 'freelancer'
                    ? 'Informe os dias da semana e horários em que você tem disponibilidade para ser escalado.'
                    : 'Defina as preferências de disparo e alertas para as escalas do seu estabelecimento.'}
                </p>
              </div>

              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '28px', boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)' }}>
                
                {/* FREELANCER: Seleção de Dias e Horários de Disponibilidade */}
                {selectedProfile === 'freelancer' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                    
                    {/* Dias da Semana */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <label style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                          Dias em que você pode trabalhar:
                        </label>
                        <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                          <button
                            type="button"
                            onClick={() => setOnboardingData(p => ({ ...p, availableDays: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'] }))}
                            style={{ color: '#0066FF', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            Todos
                          </button>
                          <span style={{ color: '#CBD5E1' }}>•</span>
                          <button
                            type="button"
                            onClick={() => setOnboardingData(p => ({ ...p, availableDays: ['Sex', 'Sáb', 'Dom'] }))}
                            style={{ color: '#0066FF', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            Finais de Semana
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                        {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(day => {
                          const isSelected = (onboardingData.availableDays || []).includes(day);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => {
                                setOnboardingData(prev => {
                                  const current = prev.availableDays || [];
                                  const updated = current.includes(day)
                                    ? current.filter(d => d !== day)
                                    : [...current, day];
                                  return { ...prev, availableDays: updated };
                                });
                              }}
                              style={{
                                padding: '12px 0',
                                textAlign: 'center',
                                borderRadius: '8px',
                                border: isSelected ? '2px solid #0066FF' : '1px solid #E2E8F0',
                                background: isSelected ? '#EBF3FF' : '#FFFFFF',
                                color: isSelected ? '#0066FF' : '#475569',
                                fontWeight: isSelected ? 800 : 600,
                                fontSize: '13px',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Horários / Períodos de Preferência */}
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '10px' }}>
                        Horários de preferência:
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {[
                          { id: 'manha', label: 'Manhã', time: '07h às 15h' },
                          { id: 'intermediario', label: 'Intermediário', time: '09h às 17h' },
                          { id: 'tarde_noite', label: 'Tarde / Noite', time: '15h às 23h' },
                          { id: 'noturno', label: 'Noturno', time: '23h às 07h' }
                        ].map(slot => {
                          const isSelected = (onboardingData.availableTimes || []).includes(slot.label);
                          return (
                            <div
                              key={slot.id}
                              onClick={() => {
                                setOnboardingData(prev => {
                                  const current = prev.availableTimes || [];
                                  const updated = current.includes(slot.label)
                                    ? current.filter(t => t !== slot.label)
                                    : [...current, slot.label];
                                  return { ...prev, availableTimes: updated };
                                });
                              }}
                              style={{
                                padding: '12px 14px',
                                borderRadius: '8px',
                                border: isSelected ? '1.5px solid #0066FF' : '1px solid #E2E8F0',
                                background: isSelected ? '#F0F7FF' : '#FFFFFF',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <div>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: isSelected ? '#0066FF' : '#0F172A' }}>
                                  {slot.label}
                                </div>
                                <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                                  {slot.time}
                                </div>
                              </div>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                readOnly
                                style={{ accentColor: '#0066FF', pointerEvents: 'none' }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* WhatsApp Alert */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '14px 16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                      <div style={{ maxWidth: '460px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                          <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>Receber convites de escala via WhatsApp</span>
                          <span style={{ fontSize: '11px', background: '#EBF3FF', color: '#0066FF', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>Recomendado</span>
                        </div>
                        <p style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.4 }}>
                          Você receberá convites de vagas compatíveis com seus dias e horários para aceitar ou recusar com 1 clique.
                        </p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={onboardingData.whatsappNotifications} 
                        onChange={(e) => setOnboardingData({ ...onboardingData, whatsappNotifications: e.target.checked })}
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#0066FF', marginTop: '4px' }}
                      />
                    </div>

                  </div>
                ) : (
                  /* GERÊNCIA / RH: Preferências Operacionais */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {/* Convocação WhatsApp */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                      <div style={{ maxWidth: '460px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>Convocação Oficial via WhatsApp</span>
                          <span style={{ fontSize: '11px', background: '#EBF3FF', color: '#0066FF', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>Recomendado</span>
                        </div>
                        <p style={{ fontSize: '12.5px', color: '#64748B', lineHeight: 1.4 }}>
                          Envio direto de convites para profissionais cadastrados com confirmação imediata e sem ruído de grupos.
                        </p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={onboardingData.whatsappNotifications} 
                        onChange={(e) => setOnboardingData({ ...onboardingData, whatsappNotifications: e.target.checked })}
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#0066FF', marginTop: '4px' }}
                      />
                    </div>

                    {/* Alertas de Emergência */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                      <div style={{ maxWidth: '460px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '4px' }}>
                          Alertas para Substituições de Emergência
                        </span>
                        <p style={{ fontSize: '12.5px', color: '#64748B', lineHeight: 1.4 }}>
                          Notificações imediatas caso algum profissional cancele a presença com menos de 4 horas de antecedência.
                        </p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={onboardingData.emergencyAlerts} 
                        onChange={(e) => setOnboardingData({ ...onboardingData, emergencyAlerts: e.target.checked })}
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#0066FF', marginTop: '4px' }}
                      />
                    </div>

                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '28px' }}>
                  <button 
                    type="button"
                    className="btn-outline" 
                    onClick={() => setOnboardingStep(2)}
                  >
                    <ArrowLeft size={16} />
                    <span>Voltar</span>
                  </button>
                  <button 
                    type="button"
                    className="btn-primary" 
                    onClick={() => setOnboardingStep(4)}
                  >
                    <span>Continuar</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: Concluir */}
          {/* ========================================================================= */}
          {onboardingStep === 4 && (
            <div style={{ maxWidth: '580px', margin: '0 auto', width: '100%', textAlign: 'center' }}>
              <div style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '40px 32px',
                boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)'
              }}>
                <div style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  background: '#EBF3FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  color: '#0066FF'
                }}>
                  <CheckCircle2 size={38} />
                </div>

                <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                  Tudo pronto para começar!
                </h2>
                <p style={{ fontSize: '14.5px', color: '#64748B', lineHeight: 1.5, marginBottom: '28px' }}>
                  Sua conta no Domu Staff foi configurada com sucesso. Agora você tem acesso completo à gestão de escalas.
                </p>

                {/* Summary Box */}
                <div style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '18px 20px',
                  textAlign: 'left',
                  marginBottom: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: '#64748B' }}>Perfil Selecionado:</span>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '12px',
                      background: selectedProfile === 'gerencia' ? '#DCFCE7' : selectedProfile === 'rh' ? '#F3E8FF' : '#EBF3FF',
                      color: selectedProfile === 'gerencia' ? '#16A34A' : selectedProfile === 'rh' ? '#9333EA' : '#0066FF'
                    }}>
                      {selectedProfile === 'gerencia' ? 'Sou Gerencia' : selectedProfile === 'rh' ? 'Sou do RH' : 'Sou freelancer'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: '#64748B' }}>Responsável:</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{onboardingData.name}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: '#64748B' }}>{selectedProfile === 'freelancer' ? 'Função Principal:' : 'Estabelecimento:'}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                      {selectedProfile === 'freelancer' ? onboardingData.primaryRole : onboardingData.hotelOrRole}
                    </span>
                  </div>

                  {selectedProfile === 'freelancer' && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '13px', color: '#64748B' }}>Dias Disponíveis:</span>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                          {(onboardingData.availableDays || []).join(', ') || 'A definir'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '13px', color: '#64748B' }}>Horários Preferidos:</span>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                          {(onboardingData.availableTimes || []).join(', ') || 'Todos os turnos'}
                        </span>
                      </div>
                    </>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: '#64748B' }}>Canal de Convocação:</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#16A34A' }}>WhatsApp Ativo</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                  <button 
                    type="button"
                    className="btn-outline" 
                    onClick={() => setOnboardingStep(3)}
                  >
                    <ArrowLeft size={16} />
                    <span>Voltar</span>
                  </button>
                  <button 
                    type="button"
                    className="btn-primary" 
                    style={{ padding: '12px 36px', fontSize: '14px', borderRadius: '8px' }}
                    onClick={handleFinishOnboarding}
                  >
                    <span>Acessar Plataforma</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Support & Navigation */}
        <div style={{
          width: '100%',
          maxWidth: '960px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '32px',
          paddingTop: '20px',
          borderTop: '1px solid #E2E8F0'
        }}>
          {/* Dots Indicator */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {[1, 2, 3, 4].map(num => (
              <div 
                key={num}
                onClick={() => setOnboardingStep(num)}
                style={{
                  width: onboardingStep === num ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  backgroundColor: onboardingStep === num ? '#0066FF' : '#CBD5E1',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              />
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748B' }}>
            <span>Precisa de ajuda?</span>
            <a 
              href="#suporte" 
              onClick={(e) => { e.preventDefault(); alert('Suporte Domu Staff disponível via WhatsApp ou e-mail: suporte@domustaff.app'); }}
              style={{ color: '#0066FF', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <MessageSquare size={14} />
              Falar com suporte
            </a>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN DASHBOARD VIEWS (KANBAN & APPROVAL DETAILS)
  // =========================================================================
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F4F7FC', fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" }}>
      
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#0F172A',
          color: '#FFFFFF',
          padding: '12px 20px',
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: 600,
          boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          borderLeft: '4px solid #0066FF'
        }}>
          {toast}
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEFT FIXED SIDEBAR */}
      {/* ========================================================================= */}
      <aside style={{
        width: '240px',
        background: '#FFFFFF',
        borderRight: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '20px 16px',
        position: 'sticky',
        top: 0,
        height: '100vh'
      }}>
        <div>
          {/* Logo Brand */}
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '26px', paddingLeft: '4px', cursor: 'pointer' }}
            onClick={() => setCurrentView('gerencia_montar_escala')}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#0066FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF'
            }}>
              <Calendar size={20} />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', lineHeight: 1.15 }}>
                Domu Staff
              </div>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                Hotel Atlântico
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {[
              { id: 'escalas', icon: Calendar, label: 'Montar escala' },
              { id: 'pedidos', icon: FileText, label: 'Meus pedidos', badge: '3' },
              { id: 'turno_hoje', icon: CheckCircle2, label: 'Turno de hoje' },
              { id: 'freelancers', icon: Users, label: 'Freelancers' },
              { id: 'calendario', icon: Clock, label: 'Calendário' },
              { id: 'comunicacoes', icon: MessageSquare, label: 'Comunicações com RH' },
              { id: 'configuracoes', icon: Settings, label: 'Configurações' },
            ].map((item) => {
              const isActive = (item.id === 'escalas' && currentView === 'gerencia_montar_escala') ||
                               (item.id === 'pedidos' && currentView === 'gerencia_pedidos') ||
                               (item.id === 'turno_hoje' && currentView === 'gerencia_turno_hoje');
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'pedidos') {
                      setCurrentView('gerencia_pedidos');
                    } else if (item.id === 'escalas') {
                      setCurrentView('gerencia_montar_escala');
                    } else if (item.id === 'turno_hoje') {
                      setCurrentView('gerencia_turno_hoje');
                    } else {
                      triggerToast(`Navegando para ${item.label}`);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#0066FF' : '#475569',
                    background: isActive ? '#EBF3FF' : 'transparent',
                    textAlign: 'left',
                    width: '100%',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <item.icon size={17} color={isActive ? '#0066FF' : '#64748B'} />
                    {item.label}
                  </div>
                  {item.badge && (
                    <span style={{
                      background: '#EF4444',
                      color: 'white',
                      fontSize: '11px',
                      fontWeight: 800,
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile */}
        <div style={{ paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#0066FF',
              color: 'white',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px'
            }}>
              {currentView === 'gerencia_montar_escala' ? 'MF' : 'RP'}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentView === 'gerencia_montar_escala' ? 'Marcos Ferreira' : 'Renata Prado'}
              </div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>
                {currentView === 'gerencia_montar_escala' ? 'Maître' : 'RH'}
              </div>
            </div>
          </div>
          <button 
            onClick={() => {
              triggerToast('Você saiu da conta.');
              setCurrentView('login');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 4px',
              color: '#DC2626',
              fontSize: '12px',
              fontWeight: 600,
              marginTop: '4px',
              cursor: 'pointer',
              border: 'none',
              background: 'transparent'
            }}
          >
            <LogOut size={15} /> Sair
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN VIEW CONTAINER */}
      {/* ========================================================================= */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        
        {/* TOP GLOBAL HEADER BAR */}
        <header style={{
          background: '#FFFFFF',
          padding: '12px 24px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 90
        }}>
          {/* Search bar */}
          {/* Search bar */}
          <div style={{ position: 'relative', width: '380px' }}>
            <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '10px' }} />
            <input 
              type="text"
              placeholder="Buscar por nome, setor ou dia..."
              style={{
                width: '100%',
                padding: '8px 65px 8px 36px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                background: '#F8FAFC',
                fontSize: '13px',
                outline: 'none'
              }}
            />
            <span style={{
              position: 'absolute',
              right: '10px',
              top: '8px',
              fontSize: '11px',
              color: '#94A3B8',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '4px',
              padding: '1px 6px',
              fontWeight: 600
            }}>
              Ctrl K
            </span>
          </div>

          {/* Right Profile Info & Notifications */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>

            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <Bell size={18} color="#64748B" />
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '7px',
                height: '7px',
                background: '#EF4444',
                borderRadius: '50%'
              }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Hotel Atlântico</div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>Copacabana - RJ</div>
              </div>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#0066FF',
                color: 'white',
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {currentView === 'gerencia_montar_escala' ? 'MF' : 'RP'}
              </div>
              <ChevronDown size={14} color="#64748B" />
            </div>
          </div>
        </header>

        {/* PAGE CONTENT ROUTER */}
        <div style={{ padding: '24px', flex: 1 }}>
          
          {/* ========================================================================= */}
          {/* VIEW: GERÊNCIA - MONTAR ESCALA */}
          {/* ========================================================================= */}
          {currentView === 'gerencia_montar_escala' && (() => {
            const currentDayObj = GERENCIA_DAYS.find(d => d.id === selectedGerenciaDay) || GERENCIA_DAYS[4];
            const currentDaySelectedIds = selectedFreelancersByDay[selectedGerenciaDay] || [];
            const currentDaySelectedFreelancers = INITIAL_SELECTED_FREELANCERS.filter(f => currentDaySelectedIds.includes(f.id));
            
            const filteredFreelancers = INITIAL_SELECTED_FREELANCERS.filter(f => {
              if (!gerenciaSearchQuery) return true;
              const q = gerenciaSearchQuery.toLowerCase();
              return f.name.toLowerCase().includes(q) || f.role.toLowerCase().includes(q);
            });

            const isAllSelected = filteredFreelancers.length > 0 && filteredFreelancers.every(f => currentDaySelectedIds.includes(f.id));

            const handleToggleSelectAllDay = (e) => {
              if (e.target.checked) {
                const allIds = Array.from(new Set([...currentDaySelectedIds, ...filteredFreelancers.map(f => f.id)]));
                setSelectedFreelancersByDay(prev => ({ ...prev, [selectedGerenciaDay]: allIds }));
              } else {
                const unselectIds = new Set(filteredFreelancers.map(f => f.id));
                const remaining = currentDaySelectedIds.filter(id => !unselectIds.has(id));
                setSelectedFreelancersByDay(prev => ({ ...prev, [selectedGerenciaDay]: remaining }));
              }
            };

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Header Title Bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <button 
                      type="button"
                      onClick={() => setCurrentView('gerencia_pedidos')}
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        background: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#0066FF',
                        transition: 'all 0.15s ease'
                      }}
                      title="Voltar"
                    >
                      <ArrowLeft size={18} />
                    </button>
                    <div>
                      <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.3px', margin: 0 }}>
                        Montar escala
                      </h1>
                      <p style={{ fontSize: '13px', color: '#64748B', marginTop: '3px', margin: 0 }}>
                        Selecione os freelancers para cada dia e envie para o RH.
                      </p>
                    </div>
                  </div>

                  <button 
                    type="button"
                    onClick={() => triggerToast('Visualização semanal detalhada')}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '8px',
                      border: '1px solid #D0E2FF',
                      background: '#FFFFFF',
                      color: '#0066FF',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    Ver semana
                  </button>
                </div>

                {/* Date Navigator and Sector Filters */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  {/* Date Navigator */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button 
                      type="button"
                      onClick={() => triggerToast('Semana anterior')}
                      style={{ width: '34px', height: '34px', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '7px 16px',
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#0F172A'
                    }}>
                      <Calendar size={15} color="#0066FF" />
                      <span>15 – 21 de setembro de 2025</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => triggerToast('Próxima semana')}
                      style={{ width: '34px', height: '34px', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  {/* Sectors */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {GERENCIA_SECTORS.map(sec => {
                      const isSecActive = selectedSector === sec.id;
                      const SecIcon = sec.icon;
                      return (
                        <button
                          key={sec.id}
                          type="button"
                          onClick={() => setSelectedSector(sec.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '7px 16px',
                            borderRadius: '8px',
                            border: isSecActive ? '1.5px solid #0066FF' : '1px solid #E2E8F0',
                            background: isSecActive ? '#EBF3FF' : '#FFFFFF',
                            color: isSecActive ? '#0066FF' : '#475569',
                            fontSize: '13px',
                            fontWeight: isSecActive ? 700 : 500,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <SecIcon size={15} color={isSecActive ? '#0066FF' : '#64748B'} />
                          <span>{sec.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Days of Week Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
                  {GERENCIA_DAYS.map(day => {
                    const isDayActive = selectedGerenciaDay === day.id;
                    const count = (selectedFreelancersByDay[day.id] || []).length;
                    const displayFilled = selectedFreelancersByDay[day.id] !== undefined ? count : day.defaultFilled;
                    const pct = Math.min(100, Math.round((displayFilled / day.needed) * 100));

                    return (
                      <div
                        key={day.id}
                        onClick={() => setSelectedGerenciaDay(day.id)}
                        style={{
                          background: isDayActive ? '#F0F7FF' : '#FFFFFF',
                          border: isDayActive ? '2px solid #0066FF' : '1px solid #E2E8F0',
                          borderRadius: '10px',
                          padding: '14px 10px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          boxShadow: isDayActive ? '0 4px 14px rgba(0, 102, 255, 0.09)' : '0 1px 3px rgba(0, 0, 0, 0.02)'
                        }}
                      >
                        <div style={{ fontSize: '13px', fontWeight: 800, color: isDayActive ? '#0066FF' : '#0F172A', marginBottom: '4px' }}>
                          {day.label} <span style={{ fontWeight: isDayActive ? 800 : 700 }}>{day.date}</span>
                        </div>
                        <div style={{ fontSize: '11px', color: isDayActive ? '#0066FF' : '#64748B', marginBottom: '2px' }}>
                          {day.guests}
                        </div>
                        <div style={{ fontSize: '11px', color: isDayActive ? '#0066FF' : '#64748B', marginBottom: '10px' }}>
                          {day.recommended}
                        </div>
                        
                        <div style={{ fontSize: '12.5px', fontWeight: 800, color: isDayActive ? '#0066FF' : '#0F172A', marginBottom: '6px' }}>
                          {displayFilled} / {day.needed}
                        </div>

                        {/* Progress Bar */}
                        <div style={{ height: '4px', background: '#E2E8F0', borderRadius: '2px', overflow: 'hidden' }}>
                          <div 
                            style={{ 
                              height: '100%', 
                              width: `${pct}%`, 
                              background: isDayActive ? '#0066FF' : (displayFilled > 0 ? '#10B981' : 'transparent'),
                              borderRadius: '2px',
                              transition: 'width 0.2s ease'
                            }} 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Two-Column Layout */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: '20px', alignItems: 'start' }}>
                  
                  {/* LEFT COLUMN: Freelancers disponíveis */}
                  <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                      <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                        Freelancers disponíveis
                      </h2>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569', background: '#F1F5F9', padding: '2px 8px', borderRadius: '12px' }}>
                        28
                      </span>
                    </div>

                    {/* Search & Filter */}
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '10px' }} />
                        <input 
                          type="text"
                          value={gerenciaSearchQuery}
                          onChange={(e) => setGerenciaSearchQuery(e.target.value)}
                          placeholder="Buscar por nome ou função..."
                          style={{
                            width: '100%',
                            padding: '8px 12px 8px 36px',
                            borderRadius: '8px',
                            border: '1px solid #E2E8F0',
                            fontSize: '13px',
                            outline: 'none',
                            background: '#FAFAFA'
                          }}
                        />
                      </div>
                      <button 
                        type="button"
                        onClick={() => triggerToast('Filtro por função')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          border: '1px solid #E2E8F0',
                          background: '#FFFFFF',
                          color: '#475569',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        <Filter size={14} />
                        <span>Filtros</span>
                      </button>
                    </div>

                    {/* Table */}
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <th style={{ width: '36px', padding: '10px 8px' }}>
                              <input 
                                type="checkbox"
                                checked={isAllSelected}
                                onChange={handleToggleSelectAllDay}
                                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#0066FF' }}
                              />
                            </th>
                            <th style={{ padding: '10px 8px', fontSize: '12px', fontWeight: 700, color: '#64748B' }}>Nome</th>
                            <th style={{ padding: '10px 8px', fontSize: '12px', fontWeight: 700, color: '#64748B' }}>Função</th>
                            <th style={{ padding: '10px 8px', fontSize: '12px', fontWeight: 700, color: '#64748B' }}>Disponibilidade</th>
                            <th style={{ padding: '10px 8px', fontSize: '12px', fontWeight: 700, color: '#64748B', textAlign: 'center' }}>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredFreelancers.map(f => {
                            const isSelected = currentDaySelectedIds.includes(f.id);
                            return (
                              <tr 
                                key={f.id}
                                style={{
                                  borderBottom: '1px solid #F8FAFC',
                                  background: isSelected ? '#F8FAFC' : 'transparent'
                                }}
                              >
                                <td style={{ padding: '10px 8px' }}>
                                  <input 
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleGerenciaFreelancer(f.id)}
                                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#0066FF' }}
                                  />
                                </td>
                                <td style={{ padding: '10px 8px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <img 
                                      src={f.avatar} 
                                      alt={f.name}
                                      style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                                    />
                                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                                      {f.name}
                                    </span>
                                  </div>
                                </td>
                                <td style={{ padding: '10px 8px', fontSize: '12.5px', color: '#64748B' }}>
                                  {f.role}
                                </td>
                                <td style={{ padding: '10px 8px' }}>
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '3px 10px',
                                    borderRadius: '12px',
                                    background: '#ECFDF5',
                                    color: '#059669',
                                    fontSize: '11.5px',
                                    fontWeight: 600
                                  }}>
                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                                    Disponível
                                  </span>
                                </td>
                                <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                                  <button
                                    type="button"
                                    onClick={() => triggerToast(`Abrindo WhatsApp com ${f.name} (${f.phone})`)}
                                    style={{
                                      width: '30px',
                                      height: '30px',
                                      borderRadius: '6px',
                                      border: '1px solid #E2E8F0',
                                      background: '#FFFFFF',
                                      color: '#0066FF',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      cursor: 'pointer',
                                      transition: 'all 0.15s ease'
                                    }}
                                    title="Contatar via WhatsApp"
                                  >
                                    <Phone size={14} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Selecionados & Resumo */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {/* Card 1: Selecionados para [dia] */}
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                          Selecionados para {currentDayObj.fullDay}
                        </h3>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#0066FF', background: '#EBF3FF', padding: '2px 8px', borderRadius: '12px' }}>
                          {currentDaySelectedIds.length} / {currentDayObj.needed}
                        </span>
                      </div>

                      {/* Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #F1F5F9', marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: '#64748B' }}>
                        <span>Nome</span>
                        <span style={{ paddingRight: '36px' }}>Função</span>
                      </div>

                      {/* List */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                        {currentDaySelectedFreelancers.length === 0 ? (
                          <div style={{ padding: '24px 10px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>
                            Nenhum freelancer selecionado ainda. Marque na lista ao lado para adicionar.
                          </div>
                        ) : (
                          currentDaySelectedFreelancers.map(f => (
                            <div 
                              key={f.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '6px 4px',
                                borderBottom: '1px solid #F8FAFC'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <img 
                                  src={f.avatar} 
                                  alt={f.name}
                                  style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }}
                                />
                                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                                  {f.name}
                                </span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <span style={{ fontSize: '12.5px', color: '#64748B' }}>
                                  {f.role}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => toggleGerenciaFreelancer(f.id)}
                                  style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '4px',
                                    border: '1px solid #E2E8F0',
                                    background: '#FFFFFF',
                                    color: '#64748B',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                  }}
                                  title="Remover"
                                >
                                  <X size={13} />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Add more button */}
                      <button
                        type="button"
                        onClick={() => triggerToast('Selecione os profissionais na lista ao lado.')}
                        style={{
                          width: '100%',
                          marginTop: '14px',
                          padding: '10px',
                          borderRadius: '8px',
                          border: '1.5px dashed #93C5FD',
                          background: '#F8FAFC',
                          color: '#0066FF',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <Plus size={15} />
                        <span>Adicionar mais freelancers</span>
                      </button>
                    </div>

                    {/* Card 2: Resumo do dia */}
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', marginBottom: '14px' }}>
                        Resumo do dia
                      </h3>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#334155' }}>
                          <Users size={16} color="#475569" />
                          <span><strong>{currentDayObj.guests}</strong></span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#334155' }}>
                          <TrendingUp size={16} color="#475569" />
                          <span>Recomendado: <strong>{currentDayObj.recommended}</strong></span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12.5px', color: '#64748B' }}>Selecionados</span>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                          {currentDaySelectedIds.length} de {currentDayObj.needed}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            height: '100%', 
                            width: `${Math.min(100, Math.round((currentDaySelectedIds.length / currentDayObj.needed) * 100))}%`, 
                            background: '#0066FF',
                            borderRadius: '3px',
                            transition: 'width 0.2s ease'
                          }} 
                        />
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={handleCancelGerenciaSelection}
                        style={{
                          flex: 1,
                          padding: '12px',
                          borderRadius: '8px',
                          border: '1px solid #E2E8F0',
                          background: '#FFFFFF',
                          color: '#0F172A',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Cancelar seleção
                      </button>

                      <button
                        type="button"
                        onClick={handleSendToRH}
                        style={{
                          flex: 1.5,
                          padding: '12px',
                          borderRadius: '8px',
                          border: 'none',
                          background: '#0066FF',
                          color: '#FFFFFF',
                          fontSize: '13px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(0, 102, 255, 0.25)'
                        }}
                      >
                        <Send size={15} />
                        <span>Enviar para o RH</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            );
          })()}

          {/* ========================================================================= */}
          {/* VIEW: GERÊNCIA - MEUS PEDIDOS AO RH */}
          {/* ========================================================================= */}
          {currentView === 'gerencia_pedidos' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Header Title Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.3px', margin: 0 }}>
                    Meus pedidos ao RH
                  </h1>
                  <p style={{ fontSize: '13px', color: '#64748B', marginTop: '3px', margin: 0 }}>
                    Acompanhe o status das convocações de escalas solicitadas ao departamento de RH.
                  </p>
                </div>

                <button 
                  type="button"
                  onClick={() => setCurrentView('gerencia_montar_escala')}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#0066FF',
                    color: '#FFFFFF',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 2px 8px rgba(0, 102, 255, 0.2)'
                  }}
                >
                  <Plus size={16} />
                  <span>Montar nova escala</span>
                </button>
              </div>

              {/* Status Summary Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
                {[
                  { label: 'Total de Pedidos', val: '4', color: '#0F172A', bg: '#FFFFFF' },
                  { label: 'Em Análise pelo RH', val: '1', color: '#CA8A04', bg: '#FEFCE8' },
                  { label: 'Aprovados & Convocando', val: '2', color: '#0066FF', bg: '#EBF3FF' },
                  { label: 'Escalas Confirmadas', val: '1', color: '#16A34A', bg: '#F0FDF4' },
                ].map((item, i) => (
                  <div key={i} style={{ background: item.bg, border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px 20px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>{item.label}</div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: item.color }}>{item.val}</div>
                  </div>
                ))}
              </div>

              {/* Orders Table */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Solicitações da Semana
                  </h3>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>
                    15 a 21 de Setembro de 2025
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    {
                      day: 'sex',
                      title: 'Sexta-feira, 19/09 • Restaurante (Jantar)',
                      status: sentDays['sex'] ? 'Enviada ao RH • Aguardando aprovação' : 'Rascunho em montagem',
                      statusColor: sentDays['sex'] ? '#CA8A04' : '#64748B',
                      statusBg: sentDays['sex'] ? '#FEFCE8' : '#F1F5F9',
                      requested: `${(selectedFreelancersByDay['sex'] || []).length} selecionados de 14 necessários`,
                      guests: '500 hóspedes previstos',
                      actionLabel: sentDays['sex'] ? 'Ver escala' : 'Continuar montando'
                    },
                    {
                      day: 'qui',
                      title: 'Quinta-feira, 18/09 • Restaurante (Almoço & Jantar)',
                      status: 'Aprovada pelo RH • Convocando via WhatsApp (9/12 aceitaram)',
                      statusColor: '#0066FF',
                      statusBg: '#EBF3FF',
                      requested: '12 pessoas convocadas',
                      guests: '420 hóspedes previstos',
                      actionLabel: 'Ver escala'
                    },
                    {
                      day: 'qua',
                      title: 'Quarta-feira, 17/09 • Restaurante (Jantar)',
                      status: 'Escala 100% Confirmada (10/10 profissionais)',
                      statusColor: '#16A34A',
                      statusBg: '#F0FDF4',
                      requested: '10 pessoas confirmadas',
                      guests: '310 hóspedes previstos',
                      actionLabel: 'Ver escala'
                    },
                    {
                      day: 'ter',
                      title: 'Terça-feira, 16/09 • Restaurante (Almoço)',
                      status: 'Turno Concluído com Sucesso',
                      statusColor: '#475569',
                      statusBg: '#F8FAFC',
                      requested: '8 pessoas presentes',
                      guests: '280 hóspedes atendidos',
                      actionLabel: 'Ver histórico'
                    }
                  ].map((order, idx) => (
                    <div 
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        background: '#FFFFFF',
                        transition: 'border 0.15s ease'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
                          {order.title}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#64748B' }}>
                          <span>{order.requested}</span>
                          <span>•</span>
                          <span>{order.guests}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          color: order.statusColor,
                          background: order.statusBg
                        }}>
                          {order.status}
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedGerenciaDay(order.day);
                            setCurrentView('gerencia_montar_escala');
                          }}
                          style={{
                            padding: '7px 14px',
                            borderRadius: '6px',
                            border: '1px solid #D0E2FF',
                            background: '#FFFFFF',
                            color: '#0066FF',
                            fontSize: '12.5px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {order.actionLabel}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW: GERÊNCIA - TURNO DE HOJE (PRESENÇA) */}
          {/* ========================================================================= */}
          {currentView === 'gerencia_turno_hoje' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.3px', margin: 0 }}>
                    Turno de hoje — Sexta-feira, 19/09
                  </h1>
                  <p style={{ fontSize: '13px', color: '#64748B', marginTop: '3px', margin: 0 }}>
                    Acompanhe o check-in e a presença em tempo real dos freelancers escalados para o salão.
                  </p>
                </div>

                <button 
                  type="button"
                  onClick={() => setCurrentView('gerencia_montar_escala')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #D0E2FF',
                    background: '#FFFFFF',
                    color: '#0066FF',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Montar Escala da Semana
                </button>
              </div>

              {/* Real-time check-in cards */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      Restaurante & Bar • Turno da Noite (15h às 23h)
                    </h3>
                    <span style={{ fontSize: '11px', background: '#DCFCE7', color: '#16A34A', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                      Turno em andamento
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {INITIAL_SELECTED_FREELANCERS.slice(0, 5).map((f, idx) => (
                    <div 
                      key={f.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        border: '1px solid #F1F5F9',
                        borderRadius: '8px',
                        background: '#FAFAFA'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={f.avatar} alt={f.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>{f.name}</div>
                          <div style={{ fontSize: '12px', color: '#64748B' }}>{f.role} • WhatsApp: {f.phone}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: '12px',
                          background: idx < 3 ? '#DCFCE7' : '#FEFCE8',
                          color: idx < 3 ? '#16A34A' : '#CA8A04'
                        }}>
                          {idx < 3 ? '● Presente (Check-in 14:52)' : '● A caminho (Previsão 15:05)'}
                        </span>
                        <button
                          type="button"
                          onClick={() => triggerToast(`Presença de ${f.name} confirmada!`)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid #E2E8F0',
                            background: '#FFFFFF',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Confirmar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 1: TELA PRINCIPAL DO RH ("Escalas da Semana") */}
          {/* ========================================================================= */}
          {currentView === 'main_kanban' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Page Title & Controls Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>
                    Escalas da Semana
                  </h1>
                  <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
                    Acompanhe o andamento das solicitações, aprove e envie para os freelancers.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '2px' }}>
                    <button style={{ padding: '6px 8px', color: '#64748B' }}><ChevronLeft size={16} /></button>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', padding: '0 8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={15} color="#0066FF" /> 15 - 21 de setembro de 2025
                    </span>
                    <button style={{ padding: '6px 8px', color: '#64748B' }}><ChevronRight size={16} /></button>
                  </div>
                  <button style={{ padding: '7px 14px', background: '#EBF3FF', color: '#0066FF', borderRadius: '6px', fontSize: '13px', fontWeight: 700 }}>
                    Hoje
                  </button>
                </div>
              </div>

              {/* Days Selector Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                {[
                  { day: 'Seg 15/09', guests: '320 hóspedes' },
                  { day: 'Ter 16/09', guests: '280 hóspedes' },
                  { day: 'Qua 17/09', guests: '310 hóspedes' },
                  { day: 'Qui 18/09', guests: '420 hóspedes' },
                  { day: 'Sex 19/09', guests: '500 hóspedes', active: true },
                  { day: 'Sáb 20/09', guests: '480 hóspedes' },
                  { day: 'Dom 21/09', guests: '350 hóspedes' },
                ].map((d, i) => (
                  <div key={i} style={{
                    background: d.active ? '#EBF3FF' : '#FFFFFF',
                    border: d.active ? '2px solid #0066FF' : '1px solid #E2E8F0',
                    borderRadius: '6px',
                    padding: '10px 8px',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: d.active ? '#0066FF' : '#0F172A' }}>
                      {d.day}
                    </div>
                    <div style={{ fontSize: '11px', color: d.active ? '#0066FF' : '#64748B', marginTop: '2px', fontWeight: 500 }}>
                      {d.guests}
                    </div>
                  </div>
                ))}
              </div>

              {/* Filters Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <select style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#FFFFFF', fontSize: '12px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                    <option>Todos os setores</option>
                    <option>Restaurante</option>
                    <option>Recepção</option>
                    <option>Bar</option>
                    <option>Cozinha</option>
                    <option>Governança</option>
                    <option>CDC</option>
                  </select>

                  <select style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#FFFFFF', fontSize: '12px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                    <option>Status: Todos</option>
                    <option>Solicitadas</option>
                    <option>Em análise</option>
                    <option>Enviadas</option>
                    <option>Confirmadas</option>
                  </select>
                </div>

                <div style={{ position: 'relative', width: '280px' }}>
                  <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '9px' }} />
                  <input 
                    type="text"
                    placeholder="Buscar por evento, setor ou nome..."
                    style={{
                      width: '100%',
                      padding: '6px 10px 6px 30px',
                      borderRadius: '6px',
                      border: '1px solid #E2E8F0',
                      background: '#FFFFFF',
                      fontSize: '12px'
                    }}
                  />
                </div>
              </div>

              {/* 5 Kanban Etapas Columns */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px', alignItems: 'start' }}>
                
                {/* 1. SOLICITADAS */}
                <div style={{ background: '#F8FAFC', borderRadius: '8px', padding: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#0066FF', color: 'white', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        1
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#0066FF' }}>Solicitadas</div>
                        <div style={{ fontSize: '10px', color: '#64748B' }}>Pelo maître/gerente</div>
                      </div>
                    </div>
                    <span style={{ background: '#E2E8F0', color: '#334155', padding: '1px 6px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                      2
                    </span>
                  </div>

                  {/* Card 1: Restaurante */}
                  <div 
                    onClick={() => setCurrentView('approval_details')}
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '6px',
                      padding: '12px',
                      border: '1px solid #E2E8F0',
                      marginBottom: '10px',
                      cursor: 'pointer',
                      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Utensils size={15} color="#0066FF" />
                        <strong style={{ fontSize: '13px', color: '#0F172A' }}>Restaurante</strong>
                      </div>
                      <ChevronRight size={15} color="#94A3B8" />
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '8px' }}>Sex, 19/09 • 14 pessoas</div>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {INITIAL_SELECTED_FREELANCERS.slice(0, 4).map((f, idx) => (
                        <img key={f.id} src={f.avatar} alt={f.name} style={{ width: '22px', height: '22px', borderRadius: '50%', border: '1px solid white', marginLeft: idx > 0 ? '-5px' : 0, objectFit: 'cover' }} />
                      ))}
                      <span style={{ background: '#EBF3FF', color: '#0066FF', fontSize: '10px', fontWeight: 700, padding: '2px 5px', borderRadius: '6px', marginLeft: '4px' }}>
                        +11
                      </span>
                    </div>
                  </div>

                  {/* Card 2: Bar */}
                  <div style={{ background: '#FFFFFF', borderRadius: '6px', padding: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Wine size={15} color="#0066FF" />
                        <strong style={{ fontSize: '13px', color: '#0F172A' }}>Bar</strong>
                      </div>
                      <ChevronRight size={15} color="#94A3B8" />
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '8px' }}>Sex, 19/09 • 6 pessoas</div>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {INITIAL_SELECTED_FREELANCERS.slice(0, 3).map((f, idx) => (
                        <img key={f.id} src={f.avatar} alt={f.name} style={{ width: '22px', height: '22px', borderRadius: '50%', border: '1px solid white', marginLeft: idx > 0 ? '-5px' : 0, objectFit: 'cover' }} />
                      ))}
                      <span style={{ background: '#EBF3FF', color: '#0066FF', fontSize: '10px', fontWeight: 700, padding: '2px 5px', borderRadius: '6px', marginLeft: '4px' }}>
                        +3
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. EM ANÁLISE */}
                <div style={{ background: '#F8FAFC', borderRadius: '8px', padding: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#2563EB', color: 'white', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        2
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#2563EB' }}>Em análise</div>
                        <div style={{ fontSize: '10px', color: '#64748B' }}>Revisão do RH</div>
                      </div>
                    </div>
                    <span style={{ background: '#E2E8F0', color: '#334155', padding: '1px 6px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                      2
                    </span>
                  </div>

                  {/* Card 1: Cozinha */}
                  <div style={{ background: '#FFFFFF', borderRadius: '6px', padding: '12px', border: '1px solid #E2E8F0', marginBottom: '10px', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ChefHat size={15} color="#2563EB" />
                        <strong style={{ fontSize: '13px', color: '#0F172A' }}>Cozinha</strong>
                      </div>
                      <ChevronRight size={15} color="#94A3B8" />
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '8px' }}>Sex, 19/09 • 8 pessoas</div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {INITIAL_SELECTED_FREELANCERS.slice(0, 3).map((f, idx) => (
                        <img key={f.id} src={f.avatar} alt={f.name} style={{ width: '22px', height: '22px', borderRadius: '50%', border: '1px solid white', marginLeft: idx > 0 ? '-5px' : 0, objectFit: 'cover' }} />
                      ))}
                      <span style={{ background: '#EBF3FF', color: '#0066FF', fontSize: '10px', fontWeight: 700, padding: '2px 5px', borderRadius: '6px', marginLeft: '4px' }}>
                        +5
                      </span>
                    </div>
                  </div>

                  {/* Card 2: Governança */}
                  <div style={{ background: '#FFFFFF', borderRadius: '6px', padding: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Bed size={15} color="#2563EB" />
                        <strong style={{ fontSize: '13px', color: '#0F172A' }}>Governança</strong>
                      </div>
                      <ChevronRight size={15} color="#94A3B8" />
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '8px' }}>Sex, 19/09 • 10 pessoas</div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {INITIAL_SELECTED_FREELANCERS.slice(0, 3).map((f, idx) => (
                        <img key={f.id} src={f.avatar} alt={f.name} style={{ width: '22px', height: '22px', borderRadius: '50%', border: '1px solid white', marginLeft: idx > 0 ? '-5px' : 0, objectFit: 'cover' }} />
                      ))}
                      <span style={{ background: '#EBF3FF', color: '#0066FF', fontSize: '10px', fontWeight: 700, padding: '2px 5px', borderRadius: '6px', marginLeft: '4px' }}>
                        +7
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. ENVIADAS */}
                <div style={{ background: '#FEFCE8', borderRadius: '8px', padding: '12px', border: '1px solid #FEF08A' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#CA8A04', color: 'white', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        3
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#CA8A04' }}>Enviadas</div>
                        <div style={{ fontSize: '10px', color: '#854D0E' }}>Para os freelancers</div>
                      </div>
                    </div>
                    <span style={{ background: '#FEF08A', color: '#854D0E', padding: '1px 6px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                      2
                    </span>
                  </div>

                  {/* Card 1: Restaurante */}
                  <div style={{ background: '#FFFFFF', borderRadius: '6px', padding: '12px', border: '1px solid #E2E8F0', marginBottom: '10px', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Utensils size={15} color="#CA8A04" />
                        <strong style={{ fontSize: '13px', color: '#0F172A' }}>Restaurante</strong>
                      </div>
                      <ChevronRight size={15} color="#94A3B8" />
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '8px' }}>Sex, 19/09 • 14 pessoas</div>

                    <div style={{ background: '#E2E8F0', height: '4px', borderRadius: '2px', overflow: 'hidden', marginBottom: '6px' }}>
                      <div style={{ width: '57%', background: '#10B981', height: '100%' }} />
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#047857', textAlign: 'center' }}>
                      8/14 respostas
                    </div>
                  </div>

                  {/* Card 2: CDC */}
                  <div style={{ background: '#FFFFFF', borderRadius: '6px', padding: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Package size={15} color="#CA8A04" />
                        <strong style={{ fontSize: '13px', color: '#0F172A' }}>CDC</strong>
                      </div>
                      <ChevronRight size={15} color="#94A3B8" />
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '8px' }}>Sex, 19/09 • 6 pessoas</div>

                    <div style={{ background: '#E2E8F0', height: '4px', borderRadius: '2px', overflow: 'hidden', marginBottom: '6px' }}>
                      <div style={{ width: '33%', background: '#0066FF', height: '100%' }} />
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#0066FF', textAlign: 'center' }}>
                      2/6 respostas
                    </div>
                  </div>
                </div>

                {/* 4. CONFIRMADAS */}
                <div style={{ background: '#F0FDF4', borderRadius: '8px', padding: '12px', border: '1px solid #BBF7D0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#16A34A', color: 'white', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        4
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#16A34A' }}>Confirmadas</div>
                        <div style={{ fontSize: '10px', color: '#14532D' }}>Prontas para a escala</div>
                      </div>
                    </div>
                    <span style={{ background: '#BBF7D0', color: '#14532D', padding: '1px 6px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                      1
                    </span>
                  </div>

                  {/* Card: Bar */}
                  <div style={{ background: '#FFFFFF', borderRadius: '6px', padding: '12px', border: '1px solid #BBF7D0', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Wine size={15} color="#16A34A" />
                        <strong style={{ fontSize: '13px', color: '#0F172A' }}>Bar</strong>
                      </div>
                      <CheckCircle2 size={16} color="#16A34A" />
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '8px' }}>Sex, 19/09 • 6 pessoas</div>

                    <div style={{ background: '#DCFCE7', height: '4px', borderRadius: '2px', overflow: 'hidden', marginBottom: '6px' }}>
                      <div style={{ width: '100%', background: '#16A34A', height: '100%' }} />
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#15803D', textAlign: 'center' }}>
                      6/6 confirmados
                    </div>
                  </div>
                </div>

                {/* 5. PENDÊNCIAS */}
                <div style={{ background: '#FEF2F2', borderRadius: '8px', padding: '12px', border: '1px solid #FECACA' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#DC2626', color: 'white', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        5
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#DC2626' }}>Pendências</div>
                        <div style={{ fontSize: '10px', color: '#991B1B' }}>Aguardando ação</div>
                      </div>
                    </div>
                    <span style={{ background: '#FEE2E2', color: '#991B1B', padding: '1px 6px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                      1
                    </span>
                  </div>

                  {/* Card: Governança */}
                  <div style={{ background: '#FFFFFF', borderRadius: '6px', padding: '12px', border: '1px solid #FECACA', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Bed size={15} color="#DC2626" />
                        <strong style={{ fontSize: '13px', color: '#0F172A' }}>Governança</strong>
                      </div>
                      <AlertTriangle size={16} color="#DC2626" />
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '8px' }}>Sex, 19/09 • 10 pessoas</div>

                    <div style={{ background: '#FEE2E2', height: '4px', borderRadius: '2px', overflow: 'hidden', marginBottom: '6px' }}>
                      <div style={{ width: '70%', background: '#DC2626', height: '100%' }} />
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#DC2626', textAlign: 'center' }}>
                      3 pendências
                    </div>
                  </div>
                </div>

              </div>

              {/* Footer Summary Bar */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '8px',
                padding: '14px 20px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)'
              }}>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>Resumo do dia — Sexta, 19 de setembro</h3>
                  <div style={{ display: 'flex', gap: '20px', marginTop: '4px', fontSize: '12px', color: '#64748B' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Users size={14} color="#0066FF" /> <strong>500</strong> hóspedes
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <TrendingUp size={14} color="#0066FF" /> Recomendado: <strong>22 – 28 pessoas</strong>
                    </span>
                  </div>
                </div>

                {/* Metrics Badges */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { label: 'Setores', val: '6', bg: '#F1F5F9', color: '#334155' },
                    { label: 'Solicitadas', val: '5', bg: '#EBF3FF', color: '#0066FF' },
                    { label: 'Em análise', val: '2', bg: '#DBEAFE', color: '#2563EB' },
                    { label: 'Enviadas', val: '2', bg: '#FEF9C3', color: '#CA8A04' },
                    { label: 'Confirmada', val: '1', bg: '#DCFCE7', color: '#16A34A' },
                    { label: 'Pendências', val: '1', bg: '#FEE2E2', color: '#DC2626' },
                  ].map((m, idx) => (
                    <div key={idx} style={{
                      background: m.bg,
                      padding: '6px 10px',
                      borderRadius: '6px',
                      textAlign: 'center',
                      minWidth: '54px'
                    }}>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: m.color }}>{m.val}</div>
                      <div style={{ fontSize: '10px', fontWeight: 600, color: m.color }}>{m.label}</div>
                    </div>
                  ))}
                </div>

                <button style={{
                  background: 'transparent',
                  border: '1px solid #0066FF',
                  color: '#0066FF',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  Ver escala completa ➔
                </button>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 2: TELA DE APROVAÇÃO ("Aprovar e enviar freelancers") */}
          {/* ========================================================================= */}
          {currentView === 'approval_details' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Back to week link */}
              <div>
                <button 
                  onClick={() => setCurrentView('main_kanban')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#0066FF',
                    background: 'transparent'
                  }}
                >
                  <ArrowLeft size={15} /> Voltar para a semana
                </button>
              </div>

              {/* Title & Date switcher */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>
                    Aprovar e enviar freelancers
                  </h1>
                  <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
                    Revise a seleção feita pelo maître/gerente e envie os convites para os freelancers.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '2px' }}>
                  <button style={{ padding: '6px 8px', color: '#64748B' }}><ChevronLeft size={16} /></button>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', padding: '0 8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={15} color="#0066FF" /> Sexta, 19 de setembro de 2025
                  </span>
                  <button style={{ padding: '6px 8px', color: '#64748B' }}><ChevronRight size={16} /></button>
                </div>
              </div>

              {/* 5-Step Process Wizard */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '8px',
                padding: '14px 24px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)'
              }}>
                {[
                  { step: '1', title: 'Solicitação', sub: 'Maître/gerente selecionou', status: 'done' },
                  { step: '2', title: 'Revisão do RH', sub: 'Você está aqui', status: 'current' },
                  { step: '3', title: 'Envio para freelancers', sub: 'Aguardando envio', status: 'next' },
                  { step: '4', title: 'Acompanhamento', sub: 'Aguardando respostas', status: 'next' },
                  { step: '5', title: 'Escala confirmada', sub: 'Concluído', status: 'next' },
                ].map((st, idx) => (
                  <React.Fragment key={idx}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: st.status === 'done' || st.status === 'current' ? '#0066FF' : '#F1F5F9',
                        color: st.status === 'done' || st.status === 'current' ? '#FFFFFF' : '#94A3B8',
                        fontWeight: 800,
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {st.status === 'done' ? <Check size={16} /> : st.step}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: st.status === 'current' ? 800 : 700, color: st.status === 'current' ? '#0066FF' : st.status === 'done' ? '#0F172A' : '#64748B' }}>
                          {st.title}
                        </div>
                        <div style={{ fontSize: '11px', color: st.status === 'current' ? '#0066FF' : '#94A3B8' }}>
                          {st.sub}
                        </div>
                      </div>
                    </div>

                    {idx < 4 && (
                      <div style={{ flex: 1, height: '2px', background: st.status === 'done' ? '#0066FF' : '#E2E8F0', margin: '0 12px' }} />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Main Grid: Left Details & Table vs Right Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>
                
                {/* Left Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Shift Banner & Summary metrics */}
                  <div style={{
                    background: '#FFFFFF',
                    borderRadius: '8px',
                    padding: '16px 20px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: '#EBF3FF', color: '#0066FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Utensils size={20} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>Restaurante</h2>
                            <span style={{ background: '#EBF3FF', color: '#0066FF', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px' }}>
                              Sexta, 19/09
                            </span>
                          </div>
                        </div>
                      </div>

                      <span style={{ background: '#FEF3C7', color: '#B45309', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Clock size={13} /> Em revisão
                      </span>
                    </div>

                    {/* Stat Badges */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', background: '#F8FAFC', padding: '12px', borderRadius: '6px', border: '1px solid #F1F5F9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={16} color="#0066FF" />
                        <div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>Hóspedes previstos</div>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>500 hóspedes</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <TrendingUp size={16} color="#0066FF" />
                        <div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>Recomendado</div>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>22 – 28 pessoas</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={16} color="#0066FF" />
                        <div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>Solicitados</div>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>14 pessoas</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Table Card */}
                  <div style={{ background: '#FFFFFF', borderRadius: '8px', padding: '16px 20px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)' }}>
                    
                    {/* Tabs & Add button */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', gap: '20px' }}>
                        <button 
                          onClick={() => setActiveTab('selecionados')}
                          style={{
                            fontSize: '13px',
                            fontWeight: 800,
                            color: activeTab === 'selecionados' ? '#0066FF' : '#64748B',
                            borderBottom: activeTab === 'selecionados' ? '2px solid #0066FF' : '2px solid transparent',
                            paddingBottom: '10px',
                            marginBottom: '-11px'
                          }}
                        >
                          Selecionados (14)
                        </button>
                        <button 
                          onClick={() => setActiveTab('sugestoes')}
                          style={{
                            fontSize: '13px',
                            fontWeight: 600,
                            color: activeTab === 'sugestoes' ? '#0066FF' : '#64748B',
                            borderBottom: activeTab === 'sugestoes' ? '2px solid #0066FF' : '2px solid transparent',
                            paddingBottom: '10px',
                            marginBottom: '-11px'
                          }}
                        >
                          Sugestões de disponíveis (12)
                        </button>
                      </div>

                      <button style={{
                        background: '#EBF3FF',
                        color: '#0066FF',
                        border: '1px solid #93C5FD',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Plus size={15} /> Adicionar freelancer
                      </button>
                    </div>

                    {/* Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '12px' }}>
                          <th style={{ padding: '8px', width: '32px' }}>
                            <input 
                              type="checkbox" 
                              checked={selectedIds.length === freelancersList.length} 
                              onChange={toggleSelectAll}
                              style={{ cursor: 'pointer' }}
                            />
                          </th>
                          <th style={{ padding: '8px' }}>Nome</th>
                          <th style={{ padding: '8px' }}>Função</th>
                          <th style={{ padding: '8px' }}>Disponibilidade</th>
                          <th style={{ padding: '8px' }}>Observações</th>
                          <th style={{ padding: '8px', textAlign: 'right' }}>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {freelancersList.map((f) => {
                          const isChecked = selectedIds.includes(f.id);
                          return (
                            <tr key={f.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                              <td style={{ padding: '10px 8px' }}>
                                <input 
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleSelectOne(f.id)}
                                  style={{ cursor: 'pointer' }}
                                />
                              </td>
                              <td style={{ padding: '10px 8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <img src={f.avatar} alt={f.name} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                                  <span style={{ fontWeight: 700, color: '#0F172A' }}>{f.name}</span>
                                </div>
                              </td>
                              <td style={{ padding: '10px 8px', color: '#475569' }}>{f.role}</td>
                              <td style={{ padding: '10px 8px' }}>
                                <span style={{ background: '#DCFCE7', color: '#15803D', fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                  <span className="dot-indicator" style={{ background: '#15803D' }} /> Disponível
                                </span>
                              </td>
                              <td style={{ padding: '10px 8px', color: '#64748B', fontSize: '12px' }}>
                                {f.notes}
                              </td>
                              <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                                <div style={{ display: 'inline-flex', gap: '4px' }}>
                                  <button 
                                    onClick={() => alert(`Ligando para ${f.name} (${f.phone})...`)}
                                    style={{ padding: '5px 7px', background: '#F1F5F9', borderRadius: '6px', color: '#0066FF' }}
                                    title="Ligar para o freelancer"
                                  >
                                    <Phone size={13} />
                                  </button>
                                  <button 
                                    onClick={() => alert(`Abrindo conversa no WhatsApp com ${f.name}...`)}
                                    style={{ padding: '5px 7px', background: '#DCFCE7', borderRadius: '6px', color: '#15803D' }}
                                    title="Enviar mensagem WhatsApp"
                                  >
                                    <MessageSquare size={13} />
                                  </button>
                                  <button style={{ padding: '5px 7px', color: '#94A3B8' }}>
                                    <MoreHorizontal size={15} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    <div style={{ textAlign: 'center', marginTop: '14px' }}>
                      <button style={{ fontSize: '12px', fontWeight: 700, color: '#0066FF', background: 'transparent', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <ChevronDown size={15} /> Mostrar mais 6 freelancers
                      </button>
                    </div>

                  </div>
                </div>

                {/* Right Panel: Day Details & Action Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Card 1: Detalhes do dia */}
                  <div style={{ background: '#FFFFFF', borderRadius: '8px', padding: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>Detalhes do dia</h3>
                      <button style={{ padding: '3px 8px', background: '#EBF3FF', color: '#0066FF', borderRadius: '6px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Edit size={12} /> Editar
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#475569', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={15} color="#64748B" /> Sexta, 19 de setembro de 2025
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={15} color="#64748B" /> 500 hóspedes
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <TrendingUp size={15} color="#64748B" /> Recomendado: 22 – 28 pessoas
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Utensils size={15} color="#64748B" /> Restaurante
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={15} color="#64748B" /> 14 pessoas solicitadas
                      </div>
                    </div>

                    {/* Maître Observation Note Box */}
                    <div style={{
                      background: '#EBF3FF',
                      borderRadius: '6px',
                      padding: '12px',
                      borderLeft: '3px solid #0066FF'
                    }}>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: '#0066FF', marginBottom: '4px' }}>
                        Observação do maître/gerente
                      </div>
                      <p style={{ fontSize: '12px', color: '#1E293B', fontStyle: 'italic', lineHeight: 1.4 }}>
                        "{activeRequest.maitreObs}"
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B', marginTop: '6px', fontWeight: 600 }}>
                        <span>— Marcos Almeida (Maître)</span>
                        <span>{activeRequest.maitreTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Resumo da seleção & CTAs */}
                  <div style={{ background: '#FFFFFF', borderRadius: '8px', padding: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginBottom: '10px' }}>
                      Resumo da seleção
                    </h3>

                    <div style={{ fontSize: '12px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Users size={15} color="#0066FF" /> <strong>{selectedIds.length} freelancers selecionados</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#15803D', fontWeight: 600, fontSize: '12px' }}>
                        <span className="dot-indicator" style={{ background: '#15803D' }} /> Todos estão disponíveis
                      </div>
                    </div>

                    {/* Info Callout */}
                    <div style={{
                      background: '#F0F9FF',
                      border: '1px solid #BAE6FD',
                      borderRadius: '6px',
                      padding: '10px',
                      display: 'flex',
                      gap: '8px',
                      marginBottom: '16px'
                    }}>
                      <Info size={16} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <p style={{ fontSize: '11px', color: '#0369A1', lineHeight: 1.4 }}>
                        Após a aprovação, os convites serão enviados via WhatsApp para que os freelancers confirmem a presença.
                      </p>
                    </div>

                    {/* Actions CTAs */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <button 
                        onClick={handleApproveAndSend}
                        className="btn-primary"
                        style={{ width: '100%', padding: '11px' }}
                      >
                        <Send size={16} /> Aprovar e enviar para os freelancers
                      </button>

                      <button 
                        onClick={handleReturnToMaitre}
                        style={{
                          background: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          color: '#0066FF',
                          padding: '10px',
                          borderRadius: '6px',
                          fontWeight: 700,
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <RotateCcw size={15} /> Devolver para ajustes
                      </button>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

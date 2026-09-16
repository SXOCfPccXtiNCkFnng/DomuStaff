import React from 'react';
import {
  Check, ArrowLeft, ArrowRight, Info, User, Users, ChefHat, Building2, Phone, CheckCircle2, MessageSquare
} from 'lucide-react';
import { useApp } from '../../store/AppContext';

export default function OnboardingView() {
  const {
    currentView, setCurrentView, toast, navOpen, setNavOpen, triggerToast,
    selectedProfile, setSelectedProfile, onboardingData, setOnboardingData, activeUser, hotel,
    selectedGerenciaDay, setSelectedGerenciaDay, selectedSector, setSelectedSector,
    gerenciaSearchQuery, setGerenciaSearchQuery,
    freelancerBaseQuery, setFreelancerBaseQuery, freelancerBaseSector, setFreelancerBaseSector,
    selectedFreelancersByDay, setSelectedFreelancersByDay,
    sentDays, returnedByDay, guestCountByDay, dailyRates, rhDay, setRhDay,
    freelancersList, selectedIds, setSelectedIds, activeTab, setActiveTab,
    checkedInIds, activeRequest, freelancerInvites, freelancerAgenda,
    pendingInviteCount, dayPickerFor, setDayPickerFor, dayPickerSelected,
    returnModalOpen, setReturnModalOpen, returnReason, setReturnReason,
    toggleGerenciaFreelancer, handleCancelGerenciaSelection, handleSendToRH,
    openDayPicker, toggleDayPickerDay, confirmDayPicker,
    handleApproveAndSend, handleReturnToMaitre, confirmReturnToMaitre,
    toggleSelectOne, confirmPresence, undoPresence, goHome, handleLogout,
    handleAcceptInvite, handleDeclineInvite, saveAvailability, saveSettings,
    toggleAvailableDay, toggleAvailableTime, changeAccountField,
    updateGuestCount, updateDailyRate, techSettings, setTechSettings,
    onboardingStep, setOnboardingStep, handleFinishOnboarding, busy,
  } = useApp();

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
        fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif"
      }}>
        {/* Top Header with Domu Staff Logo */}
        <div style={{ width: '100%', maxWidth: '840px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logo.png" alt="Domu Staff" style={{ height: '30px', width: 'auto' }} />
            <span style={{ fontSize: '18px', fontWeight: 600, color: '#0F172A' }}>Domu Staff</span>
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
                    fontWeight: 500,
                    fontSize: '13px',
                    marginBottom: '8px',
                    boxShadow: isActive ? '0 0 0 4px rgba(31, 75, 67, 0.12)' : 'none',
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
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
                  BEM-VINDO AO DOMU STAFF
                </div>
                <h1 style={{ fontSize: '32px', fontWeight: 600, color: '#0F172A', letterSpacing: '-0.5px', marginBottom: '8px' }}>
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
                    borderRadius: '2px',
                    backgroundColor: '#EBF3FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                    color: '#0066FF'
                  }}>
                    <User size={24} />
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0F172A', marginBottom: '8px' }}>
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
                    borderRadius: '2px',
                    backgroundColor: '#F3E8FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                    color: '#475569'
                  }}>
                    <Users size={24} />
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0F172A', marginBottom: '8px' }}>
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
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#F3E8FF', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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
                  style={{ padding: '12px 32px', fontSize: '14px', borderRadius: '2px' }} 
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
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
                  ETAPA 2 DE 4 • SEUS DADOS
                </div>
                <h2 style={{ fontSize: '28px', fontWeight: 600, color: '#0F172A', letterSpacing: '-0.4px', marginBottom: '6px' }}>
                  Complete as informações do seu perfil
                </h2>
                <p style={{ fontSize: '14px', color: '#64748B' }}>
                  {selectedProfile === 'freelancer' 
                    ? 'Esses dados serão enviados aos gestores ao convocarem você para um turno.' 
                    : 'Identifique seu estabelecimento e cargo para gerenciar as escalas.'}
                </p>
              </div>

              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '2px', padding: '28px', boxShadow: 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
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
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
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
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
                          Estabelecimento / Empresa
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
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
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
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
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
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
                  ETAPA 3 DE 4 • {selectedProfile === 'freelancer' ? 'DISPONIBILIDADE' : 'CONFIGURAÇÕES'}
                </div>
                <h2 style={{ fontSize: '28px', fontWeight: 600, color: '#0F172A', letterSpacing: '-0.4px', marginBottom: '6px' }}>
                  {selectedProfile === 'freelancer' ? 'Dias e horários disponíveis' : 'Preferências operacionais'}
                </h2>
                <p style={{ fontSize: '14px', color: '#64748B' }}>
                  {selectedProfile === 'freelancer'
                    ? 'Informe os dias da semana e horários em que você tem disponibilidade para ser escalado.'
                    : 'Defina as preferências de disparo e alertas para as escalas do seu estabelecimento.'}
                </p>
              </div>

              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '2px', padding: '28px', boxShadow: 'none' }}>
                
                {/* FREELANCER: Seleção de Dias e Horários de Disponibilidade */}
                {selectedProfile === 'freelancer' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                    
                    {/* Dias da Semana */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <label style={{ fontSize: '13px', fontWeight: 500, color: '#0F172A' }}>
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

                      <div className="week-strip" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
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
                                borderRadius: '2px',
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
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#0F172A', marginBottom: '10px' }}>
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
                                borderRadius: '2px',
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
                                <div style={{ fontSize: '13px', fontWeight: 500, color: isSelected ? '#0066FF' : '#0F172A' }}>
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
                          <span style={{ fontSize: '13.5px', fontWeight: 500, color: '#0F172A' }}>Receber convites de escala via WhatsApp</span>
                          <span style={{ fontSize: '11px', background: '#EBF3FF', color: '#0066FF', fontWeight: 500, padding: '2px 8px', borderRadius: '2px' }}>Recomendado</span>
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
                          <span style={{ fontSize: '14px', fontWeight: 500, color: '#0F172A' }}>Convocação Oficial via WhatsApp</span>
                          <span style={{ fontSize: '11px', background: '#EBF3FF', color: '#0066FF', fontWeight: 500, padding: '2px 8px', borderRadius: '2px' }}>Recomendado</span>
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
                        <span style={{ fontSize: '14px', fontWeight: 500, color: '#0F172A', display: 'block', marginBottom: '4px' }}>
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
                boxShadow: 'none'
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

                <h2 style={{ fontSize: '28px', fontWeight: 600, color: '#0F172A', marginBottom: '8px' }}>
                  Tudo pronto para começar!
                </h2>
                <p style={{ fontSize: '14.5px', color: '#64748B', lineHeight: 1.5, marginBottom: '28px' }}>
                  Sua conta no Domu Staff foi configurada com sucesso. Agora você tem acesso completo à gestão de escalas.
                </p>

                {/* Summary Box */}
                <div style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '2px',
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
                      fontWeight: 500,
                      padding: '3px 10px',
                      borderRadius: '2px',
                      background: selectedProfile === 'gerencia' ? '#F0FDF4' : selectedProfile === 'rh' ? '#F3E8FF' : '#EBF3FF',
                      color: selectedProfile === 'gerencia' ? '#16A34A' : selectedProfile === 'rh' ? '#475569' : '#0066FF'
                    }}>
                      {selectedProfile === 'gerencia' ? 'Sou Gerencia' : selectedProfile === 'rh' ? 'Sou do RH' : 'Sou freelancer'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: '#64748B' }}>Responsável:</span>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#0F172A' }}>{onboardingData.name}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: '#64748B' }}>{selectedProfile === 'freelancer' ? 'Função Principal:' : 'Estabelecimento:'}</span>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#0F172A' }}>
                      {selectedProfile === 'freelancer' ? onboardingData.primaryRole : onboardingData.hotelOrRole}
                    </span>
                  </div>

                  {selectedProfile === 'freelancer' && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '13px', color: '#64748B' }}>Dias Disponíveis:</span>
                        <span style={{ fontSize: '13px', fontWeight: 500, color: '#0F172A' }}>
                          {(onboardingData.availableDays || []).join(', ') || 'A definir'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '13px', color: '#64748B' }}>Horários Preferidos:</span>
                        <span style={{ fontSize: '13px', fontWeight: 500, color: '#0F172A' }}>
                          {(onboardingData.availableTimes || []).join(', ') || 'Todos os turnos'}
                        </span>
                      </div>
                    </>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: '#64748B' }}>Canal de Convocação:</span>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#16A34A' }}>WhatsApp Ativo</span>
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
                    style={{ padding: '12px 36px', fontSize: '14px', borderRadius: '2px', opacity: busy ? 0.7 : 1 }}
                    onClick={handleFinishOnboarding}
                    disabled={busy}
                  >
                    <span>{busy ? 'Salvando…' : 'Acessar Plataforma'}</span>
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

import React from 'react';
import {
  Calendar, Users, CheckCircle2, MessageSquare, Clock, Settings, Search,
  Bell, ChevronLeft, ChevronRight, Phone, Plus, ArrowLeft,
  Check, Send, RotateCcw, AlertTriangle, Layers, LogOut,
  Utensils, Wine, ChefHat, Package, Bed, TrendingUp, X, FileText, Menu
} from 'lucide-react';
import { useApp } from '../../store/AppContext';
import {
  GERENCIA_DAYS, GERENCIA_SECTORS, SECTOR_SHIFT, RATE_KIND_LABEL,
  staffNeeded, formatBRL, dailyRateFor, rateKindForDay,
} from '../../lib/constants';

export default function Aprovacao() {
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
    onboardingStep, setOnboardingStep, handleFinishOnboarding,
  } = useApp();

const guests = guestCountByDay[rhDay] ?? 500;
            const needed = staffNeeded(guests);
            const rateKind = rateKindForDay(rhDay);
            const selectedPeople = freelancersList.filter(f => selectedIds.includes(f.id));
            const suggestions = freelancersList.filter(f => !selectedIds.includes(f.id));
            const visibleList = activeTab === 'sugestoes' ? suggestions : freelancersList;
            const estimated = selectedPeople.reduce((sum, f) => sum + dailyRateFor(f.role, rateKind, dailyRates), 0);
            const dayObj = GERENCIA_DAYS.find(d => d.id === rhDay) || GERENCIA_DAYS[4];

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <button
                  type="button"
                  onClick={() => setCurrentView('main_kanban')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, color: '#64748B', width: 'fit-content' }}
                >
                  <ArrowLeft size={15} /> Escalas da semana
                </button>

                <div>
                  <h1 className="page-title">Aprovar escala</h1>
                  <p className="page-sub">
                    {activeRequest.department} · {dayObj.fullDay} · diária de {RATE_KIND_LABEL[rateKind].toLowerCase()}
                  </p>
                </div>

                <div className="split-2" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '12px', alignItems: 'start' }}>
                  <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '2px' }}>
                    <div className="metrics-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid #E2E8F0' }}>
                      {[
                        { label: 'Hóspedes', value: guests },
                        { label: 'Meta', value: needed },
                        { label: 'Na lista', value: selectedIds.length },
                        { label: 'Custo', value: formatBRL(estimated) },
                      ].map((item) => (
                        <div key={item.label} style={{ padding: '14px 16px', borderRight: '1px solid #F1F5F9' }}>
                          <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.label}</div>
                          <div style={{ fontSize: '18px', fontWeight: 600, color: '#0F172A', marginTop: '4px' }}>{item.value}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '16px', padding: '0 16px', borderBottom: '1px solid #E2E8F0' }}>
                      <button
                        type="button"
                        onClick={() => setActiveTab('selecionados')}
                        style={{
                          fontSize: '13px',
                          fontWeight: 500,
                          color: activeTab === 'selecionados' ? '#0066FF' : '#64748B',
                          borderBottom: activeTab === 'selecionados' ? '2px solid #0066FF' : '2px solid transparent',
                          padding: '12px 0',
                          marginBottom: '-1px'
                        }}
                      >
                        Equipe ({selectedIds.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('sugestoes')}
                        style={{
                          fontSize: '13px',
                          fontWeight: 500,
                          color: activeTab === 'sugestoes' ? '#0066FF' : '#64748B',
                          borderBottom: activeTab === 'sugestoes' ? '2px solid #0066FF' : '2px solid transparent',
                          padding: '12px 0',
                          marginBottom: '-1px'
                        }}
                      >
                        Fora da escala ({suggestions.length})
                      </button>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                          <th style={{ padding: '8px 16px', width: '36px' }} />
                          <th style={{ padding: '8px 8px', fontSize: '11px', fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Nome</th>
                          <th style={{ padding: '8px 8px', fontSize: '11px', fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Função</th>
                          <th style={{ padding: '8px 8px', fontSize: '11px', fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Diária</th>
                          <th style={{ padding: '8px 16px 8px 8px', fontSize: '11px', fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Obs.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleList.map((f) => {
                          const isChecked = selectedIds.includes(f.id);
                          return (
                            <tr key={f.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                              <td style={{ padding: '10px 16px' }}>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleSelectOne(f.id)}
                                  style={{ cursor: 'pointer', accentColor: '#0066FF' }}
                                />
                              </td>
                              <td style={{ padding: '10px 8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <img src={f.avatar} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                                  <span style={{ fontWeight: 500, color: '#0F172A' }}>{f.name}</span>
                                </div>
                              </td>
                              <td style={{ padding: '10px 8px', color: '#64748B' }}>{f.role}</td>
                              <td style={{ padding: '10px 8px', fontWeight: 500, color: '#0F172A' }}>
                                {formatBRL(dailyRateFor(f.role, rateKind, dailyRates))}
                              </td>
                              <td style={{ padding: '10px 16px 10px 8px', color: '#64748B', fontSize: '12px' }}>
                                {f.notes || '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {visibleList.length === 0 && (
                      <div style={{ padding: '28px 16px', textAlign: 'center', fontSize: '13px', color: '#64748B' }}>
                        Ninguém nesta lista.
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '2px', padding: '16px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', marginBottom: '12px' }}>Aprovação</div>
                      {[
                        { label: 'Selecionados', value: `${selectedIds.length} de ${needed}` },
                        { label: 'Diária', value: RATE_KIND_LABEL[rateKind] },
                        { label: 'Custo', value: formatBRL(estimated) },
                      ].map((row) => (
                        <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #F1F5F9', fontSize: '13px' }}>
                          <span style={{ color: '#64748B' }}>{row.label}</span>
                          <span style={{ color: '#0F172A', fontWeight: 500 }}>{row.value}</span>
                        </div>
                      ))}
                      <p style={{ fontSize: '12px', color: '#64748B', margin: '12px 0 14px', lineHeight: 1.45 }}>
                        Ao aprovar, o WhatsApp leva os dias juntos — o freela aceita o pacote de uma vez.
                      </p>
                      <button type="button" onClick={handleApproveAndSend} className="btn-primary" style={{ width: '100%', padding: '11px' }}>
                        <Send size={15} /> Aprovar e enviar
                      </button>
                      <button
                        type="button"
                        onClick={handleReturnToMaitre}
                        className="btn-outline"
                        style={{ width: '100%', padding: '10px', marginTop: '8px', justifyContent: 'center' }}
                      >
                        <RotateCcw size={14} /> Devolver ao maître
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
}

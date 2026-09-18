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
  freelaInSector, freelancerSectors, sectorLabelFromId,
} from '../../lib/constants';
import Avatar from '../../components/Avatar';

export default function FreelancersList() {
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

const q = freelancerBaseQuery.trim().toLowerCase();
            const list = freelancersList.filter((f) => {
              if (freelancerBaseSector !== 'todos' && !freelaInSector(f, freelancerBaseSector)) return false;
              if (!q) return true;
              return (
                f.name.toLowerCase().includes(q) ||
                f.role.toLowerCase().includes(q) ||
                (f.notes || '').toLowerCase().includes(q)
              );
            });
            const showRates = selectedProfile === 'rh';
            const rateKind = rateKindForDay('sex');

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
                    {showRates ? 'Base de freelancers' : 'Freelancers'}
                  </h1>
                  <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0' }}>
                    {list.length} profissionais{hotel?.name ? ` · ${hotel.name}` : ''}
                  </p>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setFreelancerBaseSector('todos')}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '2px',
                      border: freelancerBaseSector === 'todos' ? '1px solid #0066FF' : '1px solid #E2E8F0',
                      background: freelancerBaseSector === 'todos' ? '#EBF3FF' : '#FFFFFF',
                      color: freelancerBaseSector === 'todos' ? '#0066FF' : '#64748B',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    Todos
                  </button>
                  {GERENCIA_SECTORS.map((s) => {
                    const active = freelancerBaseSector === s.id;
                    const Icon = s.icon;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setFreelancerBaseSector(s.id)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '2px',
                          border: active ? '1px solid #0066FF' : '1px solid #E2E8F0',
                          background: active ? '#EBF3FF' : '#FFFFFF',
                          color: active ? '#0066FF' : '#64748B',
                          fontSize: '12px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Icon size={13} strokeWidth={1.75} />
                        {s.label}
                      </button>
                    );
                  })}
                </div>

                <div style={{ position: 'relative', maxWidth: '360px' }}>
                  <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '9px' }} />
                  <input
                    type="text"
                    value={freelancerBaseQuery}
                    onChange={(e) => setFreelancerBaseQuery(e.target.value)}
                    placeholder="Buscar nome, função ou obs…"
                    style={{
                      width: '100%',
                      padding: '8px 10px 8px 32px',
                      borderRadius: '4px',
                      border: '1px solid #E2E8F0',
                      fontSize: '13px',
                      outline: 'none',
                      background: '#FFFFFF',
                    }}
                  />
                </div>

                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '2px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <th style={{ padding: '8px 16px', fontSize: '11px', fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Nome</th>
                        <th style={{ padding: '8px 8px', fontSize: '11px', fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Função</th>
                        <th style={{ padding: '8px 8px', fontSize: '11px', fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Setor</th>
                        {showRates && (
                          <th style={{ padding: '8px 8px', fontSize: '11px', fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Diária</th>
                        )}
                        <th style={{ padding: '8px 8px', fontSize: '11px', fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Obs.</th>
                        <th style={{ padding: '8px 16px', width: '1%' }} />
                      </tr>
                    </thead>
                    <tbody>
                      {list.map((f) => (
                        <tr key={f.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '10px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <Avatar src={f.avatar} name={f.name} size={28} />
                              <div>
                                <div style={{ fontWeight: 500, color: '#0F172A' }}>{f.name}</div>
                                <div style={{ fontSize: '11px', color: '#16A34A' }}>{f.status || 'Disponível'}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '10px 8px', color: '#64748B' }}>{f.role}</td>
                          <td style={{ padding: '10px 8px', color: '#64748B' }}>
                            {freelancerSectors(f).map(sectorLabelFromId).join(', ')}
                          </td>
                          {showRates && (
                            <td style={{ padding: '10px 8px', fontWeight: 500, color: '#0F172A' }}>
                              {formatBRL(dailyRateFor(f.role, rateKind, dailyRates))}
                            </td>
                          )}
                          <td style={{ padding: '10px 8px', color: '#64748B', fontSize: '12px' }}>{f.notes || '—'}</td>
                          <td style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}>
                            <button
                              type="button"
                              onClick={() => triggerToast(`WhatsApp: ${f.name} · ${f.phone}`)}
                              className="btn-outline"
                              style={{ padding: '5px 10px', fontSize: '12px' }}
                            >
                              WhatsApp
                            </button>
                            {selectedProfile === 'gerencia' && (
                              <button
                                type="button"
                                onClick={() => openDayPicker(f)}
                                className="btn-outline"
                                style={{ padding: '5px 10px', fontSize: '12px', marginLeft: '6px' }}
                              >
                                Incluir nos dias
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {list.length === 0 && (
                    <div style={{ padding: '28px 16px', textAlign: 'center', fontSize: '13px', color: '#64748B' }}>
                      Nenhum freelancer neste filtro.
                    </div>
                  )}
                </div>
              </div>
            );
}

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

export default function MontarEscala() {
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

const currentDayObj = GERENCIA_DAYS.find(d => d.id === selectedGerenciaDay) || GERENCIA_DAYS[4];
            const dayGuests = guestCountByDay[selectedGerenciaDay] ?? currentDayObj.guests;
            const dayNeeded = staffNeeded(dayGuests);
            const currentDaySelectedIds = selectedFreelancersByDay[selectedGerenciaDay] || [];
            const currentDaySelectedFreelancers = freelancersList.filter(f => currentDaySelectedIds.includes(f.id) && f.sector === selectedSector);
            const shift = SECTOR_SHIFT[selectedSector] || '15h – 23h';
            const selectedCount = currentDaySelectedFreelancers.length;
            const gap = Math.max(0, dayNeeded - selectedCount);
            const alreadySent = !!sentDays[selectedGerenciaDay];
            const dayReturned = returnedByDay[selectedGerenciaDay];

            const filteredFreelancers = freelancersList
              .filter(f => f.sector === selectedSector)
              .filter(f => {
                if (!gerenciaSearchQuery) return true;
                const q = gerenciaSearchQuery.toLowerCase();
                return f.name.toLowerCase().includes(q) || f.role.toLowerCase().includes(q) || (f.notes || '').toLowerCase().includes(q);
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <h1 className="page-title">Montar escala</h1>
                  <p className="page-sub">Monte o time do setor e envie ao RH.</p>
                </div>

                {dayReturned && (
                  <div style={{
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: '2px',
                    padding: '12px 14px',
                    fontSize: '13px',
                    color: '#7F1D1D',
                    lineHeight: 1.45,
                  }}>
                    <div style={{ fontWeight: 600, marginBottom: '2px' }}>
                      Devolvida pelo RH · {dayReturned.author}
                    </div>
                    {dayReturned.reason}
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => triggerToast('Semana anterior')}
                      style={{ width: '32px', height: '32px', borderRadius: '4px', border: '1px solid #E2E8F0', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 12px',
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '4px',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: '#0F172A'
                    }}>
                      <Calendar size={14} color="#64748B" />
                      <span>15 – 21 de setembro de 2025</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => triggerToast('Próxima semana')}
                      style={{ width: '32px', height: '32px', borderRadius: '4px', border: '1px solid #E2E8F0', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
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
                            gap: '6px',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            border: isSecActive ? '1px solid #0066FF' : '1px solid transparent',
                            background: isSecActive ? '#EBF3FF' : 'transparent',
                            color: isSecActive ? '#0066FF' : '#64748B',
                            fontSize: '13px',
                            fontWeight: isSecActive ? 600 : 500,
                            cursor: 'pointer'
                          }}
                        >
                          <SecIcon size={14} />
                          <span>{sec.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="week-strip" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                  {GERENCIA_DAYS.map(day => {
                    const isDayActive = selectedGerenciaDay === day.id;
                    const count = (selectedFreelancersByDay[day.id] || []).length;
                    const guests = guestCountByDay[day.id] ?? day.guests;
                    const needed = staffNeeded(guests);
                    const pct = Math.min(100, Math.round((count / needed) * 100));
                    const isSent = !!sentDays[day.id];

                    return (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => setSelectedGerenciaDay(day.id)}
                        style={{
                          background: isDayActive ? '#EBF3FF' : '#FFFFFF',
                          border: isDayActive ? '1px solid #0066FF' : '1px solid #E2E8F0',
                          borderRadius: '2px',
                          padding: '12px 8px 10px',
                          textAlign: 'left',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: isDayActive ? '#0066FF' : '#0F172A' }}>
                            {day.label} {day.date}
                          </span>
                          {isSent && <Check size={12} color="#16A34A" />}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '10px' }}>
                          {guests} hóspedes
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                          {count}/{needed}
                        </div>
                        <div style={{ height: '3px', background: '#E2E8F0', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            width: `${pct}%`,
                            background: count === 0 ? 'transparent' : (count >= needed ? '#16A34A' : '#0066FF')
                          }} />
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="split-2" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px', alignItems: 'start' }}>
                  <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #E2E8F0' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
                          Disponíveis
                        </h2>
                        <span style={{ fontSize: '12px', color: '#64748B' }}>{filteredFreelancers.length}</span>
                      </div>
                      <span style={{ fontSize: '12px', color: '#64748B' }}>
                        {GERENCIA_SECTORS.find(s => s.id === selectedSector)?.label} · {shift}
                      </span>
                    </div>

                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #E2E8F0' }}>
                      <div style={{ position: 'relative' }}>
                        <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '9px' }} />
                        <input
                          type="text"
                          value={gerenciaSearchQuery}
                          onChange={(e) => setGerenciaSearchQuery(e.target.value)}
                          placeholder="Buscar nome ou função…"
                          style={{
                            width: '100%',
                            padding: '8px 10px 8px 32px',
                            borderRadius: '4px',
                            border: '1px solid #E2E8F0',
                            fontSize: '13px',
                            outline: 'none',
                            background: '#F8FAFC'
                          }}
                        />
                      </div>
                    </div>

                    {filteredFreelancers.length === 0 ? (
                      <div style={{ padding: '36px 16px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                        Ninguém disponível neste setor para o filtro atual.
                      </div>
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                            <th style={{ width: '36px', padding: '8px 16px' }}>
                              <input
                                type="checkbox"
                                checked={isAllSelected}
                                onChange={handleToggleSelectAllDay}
                                style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: '#0066FF' }}
                              />
                            </th>
                            <th style={{ padding: '8px 8px', fontSize: '11px', fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Nome</th>
                            <th style={{ padding: '8px 8px', fontSize: '11px', fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Função</th>
                            <th style={{ width: '44px' }} />
                          </tr>
                        </thead>
                        <tbody>
                          {filteredFreelancers.map(f => {
                            const isSelected = currentDaySelectedIds.includes(f.id);
                            return (
                              <tr
                                key={f.id}
                                onClick={() => toggleGerenciaFreelancer(f.id)}
                                style={{
                                  borderBottom: '1px solid #F1F5F9',
                                  background: isSelected ? '#F8FAFC' : 'transparent',
                                  cursor: 'pointer'
                                }}
                              >
                                <td style={{ padding: '10px 16px' }} onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleGerenciaFreelancer(f.id)}
                                    style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: '#0066FF' }}
                                  />
                                </td>
                                <td style={{ padding: '10px 8px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <img
                                      src={f.avatar}
                                      alt={f.name}
                                      style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                                    />
                                    <div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ fontSize: '13px', fontWeight: 500, color: '#0F172A' }}>{f.name}</span>
                                      </div>
                                      {f.notes ? (
                                        <div style={{ fontSize: '11px', color: '#64748B' }}>{f.notes}</div>
                                      ) : null}
                                    </div>
                                  </div>
                                </td>
                                <td style={{ padding: '10px 8px', fontSize: '13px', color: '#64748B' }}>{f.role}</td>
                                <td style={{ padding: '10px 12px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                                  <button
                                    type="button"
                                    onClick={() => triggerToast(`WhatsApp: ${f.name} · ${f.phone}`)}
                                    style={{
                                      width: '28px',
                                      height: '28px',
                                      borderRadius: '4px',
                                      border: '1px solid #E2E8F0',
                                      background: '#FFFFFF',
                                      color: '#64748B',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      cursor: 'pointer'
                                    }}
                                    title="WhatsApp"
                                  >
                                    <Phone size={13} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #E2E8F0', gap: '8px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
                          Escala de {currentDayObj.fullDay}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {selectedCount > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                const ids = selectedFreelancersByDay[selectedGerenciaDay] || [];
                                openDayPicker({
                                  id: '__team__',
                                  name: 'equipe do dia',
                                  sector: selectedSector,
                                  _teamIds: ids,
                                });
                              }}
                              className="btn-outline"
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                            >
                              Replicar dias
                            </button>
                          )}
                          <span style={{ fontSize: '12px', color: gap === 0 ? '#16A34A' : '#0066FF', fontWeight: 600 }}>
                            {selectedCount}/{dayNeeded}
                          </span>
                        </div>
                      </div>

                      <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                        {currentDaySelectedFreelancers.length === 0 ? (
                          <div style={{ padding: '28px 16px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                            Marque na lista ao lado para montar a escala.
                          </div>
                        ) : (
                          currentDaySelectedFreelancers.map(f => (
                            <div
                              key={f.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '10px 16px',
                                borderBottom: '1px solid #F1F5F9'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <img src={f.avatar} alt={f.name} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                                <div>
                                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#0F172A' }}>{f.name}</div>
                                  <div style={{ fontSize: '11px', color: '#64748B' }}>{f.role}</div>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => toggleGerenciaFreelancer(f.id)}
                                style={{ color: '#94A3B8', padding: '4px', display: 'flex' }}
                                title="Remover"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '2px', padding: '16px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', marginBottom: '14px' }}>Resumo</div>
                      {[
                        { label: 'Ocupação', value: `${dayGuests} hóspedes` },
                        { label: 'Turno', value: shift },
                        { label: 'Meta', value: `${dayNeeded} pessoas` },
                        { label: 'Faltam', value: gap === 0 ? 'Completo' : `${gap} vaga${gap > 1 ? 's' : ''}` },
                      ].map((row) => (
                        <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #F1F5F9', fontSize: '13px' }}>
                          <span style={{ color: '#64748B' }}>{row.label}</span>
                          <span style={{ color: '#0F172A', fontWeight: 500 }}>{row.value}</span>
                        </div>
                      ))}
                    </div>

                    {dayReturned ? (
                      <div style={{ fontSize: '12px', color: '#DC2626', padding: '0 2px' }}>
                        Ajuste a equipe e reenvie ao RH.
                      </div>
                    ) : alreadySent ? (
                      <div style={{ fontSize: '12px', color: '#16A34A', padding: '0 2px' }}>
                        Esta escala já foi enviada ao RH.
                      </div>
                    ) : null}

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={handleCancelGerenciaSelection}
                        className="btn-outline"
                        style={{ flex: 1, padding: '10px', justifyContent: 'center' }}
                      >
                        Limpar
                      </button>
                      <button
                        type="button"
                        onClick={handleSendToRH}
                        className="btn-primary"
                        style={{ flex: 1.6, padding: '10px' }}
                      >
                        <Send size={14} /> {dayReturned ? 'Reenviar ao RH' : alreadySent ? 'Reenviar ao RH' : 'Enviar ao RH'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
}

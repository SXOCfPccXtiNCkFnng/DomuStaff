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

export default function Kanban() {
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

const rhDayObj = GERENCIA_DAYS.find(d => d.id === rhDay) || GERENCIA_DAYS[4];
            const rhKind = rateKindForDay(rhDay);
            const rhGuests = guestCountByDay[rhDay] ?? rhDayObj.guests;
            const kanbanColumns = [
              {
                id: 'solicitadas',
                title: 'Solicitadas',
                hint: 'Pelo maître',
                count: 2,
                cards: [
                  { sector: 'Restaurante', icon: Utensils, people: 14, role: 'Garçom', extra: 11 },
                  { sector: 'Bar', icon: Wine, people: 6, role: 'Bartender', extra: 3 },
                ],
              },
              {
                id: 'analise',
                title: 'Em análise',
                hint: 'Revisão do RH',
                count: 2,
                cards: [
                  { sector: 'Cozinha', icon: ChefHat, people: 8, role: 'Cozinheiro', extra: 5 },
                  { sector: 'Governança', icon: Bed, people: 10, role: 'Camareira', extra: 7 },
                ],
              },
              {
                id: 'enviadas',
                title: 'Enviadas',
                hint: 'Aguardando resposta',
                count: 2,
                cards: [
                  { sector: 'Restaurante', icon: Utensils, people: 14, role: 'Garçom', extra: 8, progress: '8/14 respostas' },
                  { sector: 'CDC', icon: Package, people: 6, role: 'Cumin', extra: 2, progress: '2/6 respostas' },
                ],
              },
              {
                id: 'confirmadas',
                title: 'Confirmadas',
                hint: 'Prontas para a escala',
                count: 1,
                cards: [
                  { sector: 'Bar', icon: Wine, people: 6, role: 'Bartender', extra: 6, progress: '6/6 confirmados', done: true },
                ],
              },
              {
                id: 'pendencias',
                title: 'Pendências',
                hint: 'Aguardando ação',
                count: 1,
                cards: [
                  { sector: 'Governança', icon: Bed, people: 10, role: 'Camareira', extra: 3, progress: '3 sem resposta', alert: true },
                ],
              },
            ];
            const weekCost = 14840;
            const weekendCost = 6240;
            const holidayCost = 0;

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                  <div>
                    <h1 className="page-title">Escalas da semana</h1>
                    <p className="page-sub">Aprove solicitações e acompanhe o custo com as diárias da casa.</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button type="button" style={{ width: '32px', height: '32px', borderRadius: '4px', border: '1px solid #E2E8F0', background: '#FFF', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ChevronLeft size={16} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '4px', fontSize: '13px', fontWeight: 500 }}>
                      <Calendar size={14} color="#64748B" />
                      15 – 21 de setembro de 2025
                    </div>
                    <button type="button" style={{ width: '32px', height: '32px', borderRadius: '4px', border: '1px solid #E2E8F0', background: '#FFF', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                <div className="week-strip" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                  {GERENCIA_DAYS.map((day) => {
                    const active = rhDay === day.id;
                    const kind = rateKindForDay(day.id);
                    const guests = guestCountByDay[day.id] ?? day.guests;
                    return (
                      <div
                        key={day.id}
                        onClick={() => setRhDay(day.id)}
                        style={{
                          background: active ? '#EBF3FF' : '#FFFFFF',
                          border: active ? '1px solid #0066FF' : '1px solid #E2E8F0',
                          borderRadius: '2px',
                          padding: '12px 8px',
                          textAlign: 'left',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ fontSize: '13px', fontWeight: 600, color: active ? '#0066FF' : '#0F172A' }}>
                          {day.label} {day.date}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B', marginTop: '6px' }}>
                          {guests} hóspedes
                        </div>
                        <div style={{ fontSize: '11px', color: active ? '#0066FF' : '#94A3B8', marginTop: '6px' }}>
                          {RATE_KIND_LABEL[kind]}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="kanban-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', alignItems: 'start' }}>
                  {kanbanColumns.map((col) => (
                    <div key={col.id} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '2px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 12px 10px', borderBottom: '1px solid #E2E8F0' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>{col.title}</div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>{col.hint}</div>
                        </div>
                        <span style={{ fontSize: '12px', color: '#64748B', background: '#F1F5F9', padding: '1px 7px', borderRadius: '4px' }}>{col.count}</span>
                      </div>
                      <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {col.cards.map((card) => {
                          const cost = card.people * dailyRateFor(card.role, rhKind, dailyRates);
                          return (
                            <button
                              key={`${col.id}-${card.sector}`}
                              type="button"
                              onClick={() => setCurrentView('approval_details')}
                              style={{
                                background: '#FFFFFF',
                                border: '1px solid #E2E8F0',
                                borderRadius: '2px',
                                padding: '12px',
                                textAlign: 'left',
                                cursor: 'pointer'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <card.icon size={14} color="#64748B" />
                                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>{card.sector}</span>
                                </div>
                                {card.alert ? <AlertTriangle size={14} color="#DC2626" /> : <ChevronRight size={14} color="#94A3B8" />}
                              </div>
                              <div style={{ fontSize: '12px', color: '#64748B' }}>
                                {rhDayObj.label}, {rhDayObj.date} · {card.people} pessoas
                              </div>
                              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', marginTop: '8px' }}>
                                {formatBRL(cost)}
                              </div>
                              <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                                {card.people} × {formatBRL(dailyRateFor(card.role, rhKind, dailyRates))} · {RATE_KIND_LABEL[rhKind]}
                              </div>
                              {card.progress && (
                                <div style={{ fontSize: '11px', color: card.alert ? '#DC2626' : '#64748B', marginTop: '8px' }}>
                                  {card.progress}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '2px', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>Custo da semana</div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                      {rhGuests} hóspedes · nenhum feriado nesta semana
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '24px' }}>
                    {[
                      { label: 'Semana', value: weekCost },
                      { label: 'Fim de semana', value: weekendCost },
                      { label: 'Feriados', value: holidayCost },
                    ].map((item) => (
                      <div key={item.label}>
                        <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.label}</div>
                        <div style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>{formatBRL(item.value)}</div>
                      </div>
                    ))}
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total</div>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: '#0066FF', marginTop: '2px' }}>{formatBRL(weekCost + weekendCost + holidayCost)}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
}

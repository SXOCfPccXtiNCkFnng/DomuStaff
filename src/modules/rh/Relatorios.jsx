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

export default function Relatorios() {
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

const weekGuests = GERENCIA_DAYS.reduce(
              (sum, d) => sum + (guestCountByDay[d.id] ?? d.guests),
              0
            );

            const bySector = [
              { sector: 'Restaurante', people: 48, role: 'Garçom', days: 5 },
              { sector: 'Bar', people: 18, role: 'Bartender', days: 4 },
              { sector: 'Cozinha', people: 22, role: 'Cozinheiro', days: 4 },
              { sector: 'Governança', people: 28, role: 'Camareira', days: 5 },
              { sector: 'Recepção', people: 14, role: 'Recepcionista', days: 5 },
              { sector: 'CDC', people: 12, role: 'Cumin', days: 4 },
            ].map((row) => {
              const weekPart = Math.round(row.people * 0.7);
              const weekendPart = row.people - weekPart;
              const cost =
                weekPart * dailyRateFor(row.role, 'week', dailyRates) +
                weekendPart * dailyRateFor(row.role, 'weekend', dailyRates);
              return { ...row, cost };
            });

            const totalCost = bySector.reduce((s, r) => s + r.cost, 0);
            const maxCost = Math.max(...bySector.map((r) => r.cost), 1);
            const costPerGuest = weekGuests > 0 ? totalCost / weekGuests : 0;

            const funnel = [
              { label: 'Convites enviados', value: 86 },
              { label: 'Aceitos', value: 71 },
              { label: 'Sem resposta', value: 9 },
              { label: 'Recusados', value: 6 },
            ];
            const acceptRate = Math.round((71 / 86) * 100);
            const noShow = 3;
            const present = 68;
            const presenceRate = Math.round((present / (present + noShow)) * 100);

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                  <div>
                    <h1 className="page-title">Relatórios</h1>
                    <p className="page-sub">Custo por setor, conversão de convites e presença da semana.</p>
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

                <div style={{ fontSize: '13px', color: '#64748B' }}>
                  <span style={{ color: '#0F172A', fontWeight: 600 }}>{formatBRL(totalCost)}</span> total
                  <span style={{ margin: '0 8px', color: '#CBD5E1' }}>·</span>
                  <span style={{ color: '#0F172A', fontWeight: 600 }}>{formatBRL(costPerGuest)}</span> / hóspede
                  <span style={{ margin: '0 8px', color: '#CBD5E1' }}>·</span>
                  <span style={{ color: '#0F172A', fontWeight: 600 }}>{weekGuests}</span> hóspedes na semana
                  <span style={{ margin: '0 8px', color: '#CBD5E1' }}>·</span>
                  <span style={{ color: '#16A34A', fontWeight: 600 }}>{acceptRate}%</span> aceite
                  <span style={{ margin: '0 8px', color: '#CBD5E1' }}>·</span>
                  <span style={{ color: '#16A34A', fontWeight: 600 }}>{presenceRate}%</span> presença
                </div>

                <div className="split-2" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px', alignItems: 'start' }}>
                  <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '2px' }}>
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>Custo por setor</div>
                      <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                        Diárias da casa · semana + fim de semana
                      </div>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                          <th style={{ padding: '8px 16px', fontSize: '11px', fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Setor</th>
                          <th style={{ padding: '8px 8px', fontSize: '11px', fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Diárias</th>
                          <th style={{ padding: '8px 8px', fontSize: '11px', fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Custo</th>
                          <th style={{ padding: '8px 16px 8px 8px', fontSize: '11px', fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', width: '28%' }}>Share</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bySector.map((row) => {
                          const pct = Math.round((row.cost / totalCost) * 100);
                          const bar = Math.round((row.cost / maxCost) * 100);
                          return (
                            <tr key={row.sector} style={{ borderBottom: '1px solid #F1F5F9' }}>
                              <td style={{ padding: '12px 16px', fontWeight: 500, color: '#0F172A' }}>{row.sector}</td>
                              <td style={{ padding: '12px 8px', color: '#64748B' }}>{row.people}</td>
                              <td style={{ padding: '12px 8px', fontWeight: 500, color: '#0F172A' }}>{formatBRL(row.cost)}</td>
                              <td style={{ padding: '12px 16px 12px 8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div style={{ flex: 1, height: '4px', background: '#E2E8F0', overflow: 'hidden' }}>
                                    <div style={{ width: `${bar}%`, height: '100%', background: '#0066FF' }} />
                                  </div>
                                  <span style={{ fontSize: '12px', color: '#64748B', width: '32px', textAlign: 'right' }}>{pct}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '2px', padding: '16px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', marginBottom: '4px' }}>Convites</div>
                      <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '14px' }}>
                        Taxa de aceite {acceptRate}%
                      </div>
                      {funnel.map((row, idx) => (
                        <div
                          key={row.label}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '8px 0',
                            borderBottom: idx < funnel.length - 1 ? '1px solid #F1F5F9' : 'none',
                            fontSize: '13px',
                          }}
                        >
                          <span style={{ color: '#64748B' }}>{row.label}</span>
                          <span style={{ fontWeight: 600, color: '#0F172A' }}>{row.value}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '2px', padding: '16px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', marginBottom: '4px' }}>Presença no turno</div>
                      <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '14px' }}>
                        Confirmados pelo maître no salão
                      </div>
                      {[
                        { label: 'Presentes', value: present, color: '#16A34A' },
                        { label: 'Faltas / no-show', value: noShow, color: '#DC2626' },
                        { label: 'Taxa de presença', value: `${presenceRate}%`, color: '#0F172A' },
                      ].map((row, idx, arr) => (
                        <div
                          key={row.label}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '8px 0',
                            borderBottom: idx < arr.length - 1 ? '1px solid #F1F5F9' : 'none',
                            fontSize: '13px',
                          }}
                        >
                          <span style={{ color: '#64748B' }}>{row.label}</span>
                          <span style={{ fontWeight: 600, color: row.color }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '2px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '13px', color: '#64748B' }}>
                    Exportação para diretoria ainda é demo — os números usam as diárias configuradas.
                  </div>
                  <button
                    type="button"
                    className="btn-outline"
                    style={{ padding: '8px 14px' }}
                    onClick={() => triggerToast('Relatório exportado (demo)')}
                  >
                    Exportar resumo
                  </button>
                </div>
              </div>
            );
}

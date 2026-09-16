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

export default function TurnoHoje() {
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

const dayIds = selectedFreelancersByDay.sex?.length
              ? selectedFreelancersByDay.sex
              : ['1', '2', '3'];

            const byId = (id) =>
              freelancersList.find((x) => x.id === id) ||
              freelancersList.find((x) => x.id === id);

            // Escala do dia + 2 confirmados pelo RH ainda a chegar (demo)
            const extras = freelancersList.filter(
              (f) => !dayIds.includes(f.id) && (f.sector === 'restaurante' || f.sector === 'bar')
            ).slice(0, 2);

            const people = [...dayIds.map(byId).filter(Boolean), ...extras].map((f) => {
              const isIn = checkedInIds.includes(f.id);
              return {
                ...f,
                present: isIn,
                state: isIn
                  ? { label: 'Presente', color: '#16A34A', bg: '#F0FDF4' }
                  : { label: 'Não chegou', color: '#CA8A04', bg: '#FEFCE8' },
              };
            });

            const present = people.filter((p) => p.present).length;
            const waiting = people.length - present;
            const guests = guestCountByDay.sex ?? 500;

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                  <div>
                    <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
                      Turno de hoje
                    </h1>
                    <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0' }}>
                      Você confirma a presença no salão · Sexta, 19/09 · 15h–23h · {guests} hóspedes
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      background: '#F0FDF4',
                      color: '#16A34A',
                      padding: '4px 10px',
                      borderRadius: '2px',
                      fontWeight: 500,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      flexShrink: 0,
                    }}
                  >
                    <span className="live-dot" /> Em andamento
                  </span>
                </div>

                <div style={{ fontSize: '13px', color: '#64748B' }}>
                  <span style={{ color: '#16A34A', fontWeight: 600 }}>{present}</span> presentes
                  <span style={{ margin: '0 8px', color: '#CBD5E1' }}>·</span>
                  <span style={{ color: waiting ? '#CA8A04' : '#64748B', fontWeight: 600 }}>{waiting}</span> aguardando
                  <span style={{ margin: '0 8px', color: '#CBD5E1' }}>·</span>
                  {people.length} na escala
                </div>

                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '2px' }}>
                  {people.map((f, idx) => (
                    <div
                      key={f.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        padding: '12px 16px',
                        borderBottom: idx < people.length - 1 ? '1px solid #F1F5F9' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <img src={f.avatar} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '13.5px', fontWeight: 500, color: '#0F172A' }}>{f.name}</div>
                          <div style={{ fontSize: '12px', color: '#64748B' }}>{f.role}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 500,
                            padding: '3px 8px',
                            borderRadius: '2px',
                            background: f.state.bg,
                            color: f.state.color,
                          }}
                        >
                          {f.state.label}
                        </span>
                        {f.present ? (
                          <button
                            type="button"
                            onClick={() => undoPresence(f)}
                            className="btn-outline"
                            style={{ padding: '5px 10px', fontSize: '12px', color: '#64748B', borderColor: '#E2E8F0' }}
                          >
                            Desfazer
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => confirmPresence(f)}
                            className="btn-primary"
                            style={{ padding: '5px 12px', fontSize: '12px' }}
                          >
                            Confirmar presença
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
}

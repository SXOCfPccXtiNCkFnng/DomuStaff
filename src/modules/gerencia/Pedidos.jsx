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

export default function Pedidos() {
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

const sexGuests = guestCountByDay.sex ?? 500;
            const sexNeeded = staffNeeded(sexGuests);
            const sexCount = (selectedFreelancersByDay.sex || []).length;
            const sexSent = !!sentDays.sex;
            const sexReturned = returnedByDay.sex;

            const orders = [
              {
                day: 'sex',
                title: 'Sexta, 19/09 · Restaurante · Jantar',
                meta: sexReturned
                  ? `Motivo do RH: ${sexReturned.reason}`
                  : `${sexCount}/${sexNeeded} na lista · ${sexGuests} hóspedes`,
                status: sexReturned ? 'Devolvida' : sexSent ? 'No RH' : 'Rascunho',
                statusColor: sexReturned ? '#DC2626' : sexSent ? '#CA8A04' : '#64748B',
                statusBg: sexReturned ? '#FEF2F2' : sexSent ? '#FEFCE8' : '#F1F5F9',
                actionLabel: sexReturned ? 'Ajustar' : sexSent ? 'Abrir' : 'Continuar',
              },
              {
                day: 'qui',
                title: 'Quinta, 18/09 · Restaurante · Almoço & jantar',
                meta: '9/12 aceitaram · 420 hóspedes',
                status: 'Convocando',
                statusColor: '#0066FF',
                statusBg: '#EBF3FF',
                actionLabel: 'Abrir',
              },
              {
                day: 'qua',
                title: 'Quarta, 17/09 · Restaurante · Jantar',
                meta: '10/10 confirmados · 310 hóspedes',
                status: 'Confirmada',
                statusColor: '#16A34A',
                statusBg: '#F0FDF4',
                actionLabel: 'Abrir',
              },
              {
                day: 'ter',
                title: 'Terça, 16/09 · Restaurante · Almoço',
                meta: '8 presentes · 280 hóspedes',
                status: 'Concluída',
                statusColor: '#475569',
                statusBg: '#F8FAFC',
                actionLabel: 'Abrir',
              },
            ];

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                  <div>
                    <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
                      Meus pedidos
                    </h1>
                    <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0' }}>
                      15 a 21 de setembro · Restaurante
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentView('gerencia_montar_escala')}
                    className="btn-primary"
                    style={{ padding: '10px 16px' }}
                  >
                    <Plus size={15} /> Nova escala
                  </button>
                </div>

                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '2px' }}>
                  {orders.map((order, idx) => (
                    <div
                      key={order.day}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px',
                        padding: '14px 16px',
                        borderBottom: idx < orders.length - 1 ? '1px solid #F1F5F9' : 'none',
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
                          {order.title}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748B', marginTop: '3px' }}>
                          {order.meta}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '2px',
                            fontSize: '11px',
                            fontWeight: 500,
                            color: order.statusColor,
                            background: order.statusBg,
                          }}
                        >
                          {order.status}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedGerenciaDay(order.day);
                            setCurrentView('gerencia_montar_escala');
                          }}
                          className="btn-outline"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          {order.actionLabel}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
}

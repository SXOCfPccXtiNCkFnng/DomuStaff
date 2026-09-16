import React from 'react';
import { AppProvider, useApp } from './store/AppContext';
import AppShell from './layout/AppShell';
import AuthView from './modules/auth/AuthView';
import OnboardingView from './modules/auth/OnboardingView';
import MontarEscala from './modules/gerencia/MontarEscala';
import Pedidos from './modules/gerencia/Pedidos';
import TurnoHoje from './modules/gerencia/TurnoHoje';
import FreelancersList from './modules/gerencia/FreelancersList';
import Kanban from './modules/rh/Kanban';
import Relatorios from './modules/rh/Relatorios';
import Aprovacao from './modules/rh/Aprovacao';
import FreelancerDashboard from './modules/freelancer/FreelancerDashboard';
import SettingsView from './modules/settings/SettingsView';
import { GERENCIA_DAYS, RATE_KIND_LABEL, rateKindForDay } from './lib/constants';

function Router() {
  const {
    bootstrapping, currentView,
    freelancerInvites, handleAcceptInvite, handleDeclineInvite, freelancerAgenda,
    onboardingData, toggleAvailableDay, toggleAvailableTime, setOnboardingData,
    saveAvailability, activeUser, selectedProfile, dailyRates, updateDailyRate,
    guestCountByDay, updateGuestCount, changeAccountField, techSettings, setTechSettings,
    saveSettings, selectedSector,
  } = useApp();

  if (bootstrapping) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: '14px' }}>
        Carregando…
      </div>
    );
  }

  if (currentView === 'login' || currentView === 'register') return <AuthView />;
  if (currentView === 'onboarding') return <OnboardingView />;

  return (
    <AppShell>
      {currentView.startsWith('freelancer_') && (
        <FreelancerDashboard
          view={currentView}
          invites={freelancerInvites}
          onAccept={handleAcceptInvite}
          onDecline={handleDeclineInvite}
          agenda={freelancerAgenda}
          availableDays={onboardingData.availableDays}
          availableTimes={onboardingData.availableTimes}
          onToggleDay={toggleAvailableDay}
          onToggleTime={toggleAvailableTime}
          onSelectAllDays={() => setOnboardingData((prev) => ({ ...prev, availableDays: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'] }))}
          onSelectWeekends={() => setOnboardingData((prev) => ({ ...prev, availableDays: ['Sáb', 'Dom'] }))}
          onSaveAvailability={saveAvailability}
          userName={activeUser.name}
        />
      )}
      {currentView === 'configuracoes' && (
        <SettingsView
          profile={selectedProfile}
          rates={dailyRates}
          onChangeRate={updateDailyRate}
          days={GERENCIA_DAYS}
          guestCountByDay={guestCountByDay}
          onChangeGuests={updateGuestCount}
          rateKindForDay={rateKindForDay}
          rateKindLabel={RATE_KIND_LABEL}
          account={onboardingData}
          onChangeAccount={changeAccountField}
          userName={activeUser.name}
          userRole={activeUser.role}
          defaultSector={selectedSector}
          tech={{
            ...techSettings,
            whatsappNotifications: onboardingData.whatsappNotifications,
            emergencyAlerts: onboardingData.emergencyAlerts,
          }}
          onChangeTech={(key, value) => {
            if (key === 'whatsappNotifications' || key === 'emergencyAlerts') {
              setOnboardingData((prev) => ({ ...prev, [key]: value }));
              return;
            }
            setTechSettings((prev) => ({ ...prev, [key]: value }));
          }}
          onSave={saveSettings}
        />
      )}
      {currentView === 'gerencia_montar_escala' && <MontarEscala />}
      {currentView === 'gerencia_pedidos' && <Pedidos />}
      {currentView === 'gerencia_turno_hoje' && <TurnoHoje />}
      {currentView === 'gerencia_freelancers' && <FreelancersList />}
      {currentView === 'main_kanban' && <Kanban />}
      {currentView === 'rh_relatorios' && <Relatorios />}
      {currentView === 'approval_details' && <Aprovacao />}
    </AppShell>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}

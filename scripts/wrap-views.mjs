import fs from 'fs';

const DESTRUCT = `  const {
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
  } = useApp();`;

const HEADER = `import React from 'react';
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

`;

function unwrapIife(raw) {
  let s = raw.trim();
  s = s.replace(/^\{currentView === [^&]+&& \(\(\) => \{/, '');
  s = s.replace(/\}\)\(\)\}\s*$/, '');
  s = s.replace(/INITIAL_SELECTED_FREELANCERS/g, 'freelancersList');
  return s.trim();
}

function writeView(file, name, body) {
  const content = `${HEADER}export default function ${name}() {
${DESTRUCT}

${body}
}
`;
  fs.writeFileSync(file, content);
}

writeView('src/modules/gerencia/MontarEscala.jsx', 'MontarEscala', unwrapIife(fs.readFileSync('tmp_montar.jsx', 'utf8')));
writeView('src/modules/gerencia/Pedidos.jsx', 'Pedidos', unwrapIife(fs.readFileSync('tmp_pedidos.jsx', 'utf8')));
writeView('src/modules/gerencia/TurnoHoje.jsx', 'TurnoHoje', unwrapIife(fs.readFileSync('tmp_turno.jsx', 'utf8')));
writeView('src/modules/gerencia/FreelancersList.jsx', 'FreelancersList', unwrapIife(fs.readFileSync('tmp_freelas.jsx', 'utf8')));
writeView('src/modules/rh/Kanban.jsx', 'Kanban', unwrapIife(fs.readFileSync('tmp_kanban.jsx', 'utf8')));
writeView('src/modules/rh/Relatorios.jsx', 'Relatorios', unwrapIife(fs.readFileSync('tmp_relatorios.jsx', 'utf8')));
writeView('src/modules/rh/Aprovacao.jsx', 'Aprovacao', unwrapIife(fs.readFileSync('tmp_aprovacao.jsx', 'utf8')));

const onb = fs.readFileSync('tmp_onboarding.jsx', 'utf8');
fs.writeFileSync('src/modules/auth/OnboardingView.jsx', `import React from 'react';
import {
  Check, ArrowLeft, ArrowRight, Info, User, Users, ChefHat, Building2, Phone, CheckCircle2, MessageSquare
} from 'lucide-react';
import { useApp } from '../../store/AppContext';

export default function OnboardingView() {
${DESTRUCT}

${onb}
}
`);

console.log('wrapped');

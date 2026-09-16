import React, { useMemo } from 'react';
import {
  Calendar, Users, CheckCircle2, Clock, Settings, Search,
  Bell, Layers, LogOut, TrendingUp, FileText, Menu, X,
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { GERENCIA_DAYS } from '../lib/constants';
import { isSupabaseConfigured } from '../lib/supabase';

export default function AppShell({ children }) {
  const {
    toast, navOpen, setNavOpen, currentView, setCurrentView,
    selectedProfile, onboardingData, activeUser, pendingInviteCount,
    dayPickerFor, setDayPickerFor, dayPickerSelected, setDayPickerSelected,
    toggleDayPickerDay, confirmDayPicker,
    returnModalOpen, setReturnModalOpen, returnReason, setReturnReason,
    confirmReturnToMaitre, goHome, handleLogout, triggerToast,
  } = useApp();

  const navItems = useMemo(() => {
    if (selectedProfile === 'freelancer') {
      return [
        { id: 'convites', icon: Bell, label: 'Convites', view: 'freelancer_convites', badge: pendingInviteCount > 0 ? String(pendingInviteCount) : null },
        { id: 'agenda', icon: Calendar, label: 'Minha agenda', view: 'freelancer_agenda' },
        { id: 'disponibilidade', icon: Clock, label: 'Disponibilidade', view: 'freelancer_disponibilidade' },
        { id: 'configuracoes', icon: Settings, label: 'Configurações', view: 'configuracoes' },
      ];
    }
    if (selectedProfile === 'rh') {
      return [
        { id: 'escalas', icon: Layers, label: 'Escalas da semana', view: 'main_kanban' },
        { id: 'aprovacoes', icon: FileText, label: 'Aprovações', view: 'approval_details', badge: '1' },
        { id: 'freelancers', icon: Users, label: 'Base de freelancers', view: 'gerencia_freelancers' },
        { id: 'relatorios', icon: TrendingUp, label: 'Relatórios', view: 'rh_relatorios' },
        { id: 'configuracoes', icon: Settings, label: 'Configurações', view: 'configuracoes' },
      ];
    }
    return [
      { id: 'escalas', icon: Calendar, label: 'Montar escala', view: 'gerencia_montar_escala' },
      { id: 'pedidos', icon: FileText, label: 'Meus pedidos', view: 'gerencia_pedidos', badge: '3' },
      { id: 'turno_hoje', icon: CheckCircle2, label: 'Turno de hoje', view: 'gerencia_turno_hoje' },
      { id: 'freelancers', icon: Users, label: 'Freelancers', view: 'gerencia_freelancers' },
      { id: 'configuracoes', icon: Settings, label: 'Configurações', view: 'configuracoes' },
    ];
  }, [selectedProfile, pendingInviteCount]);

  return (
    <div className="app-shell">
      {toast && <div className="toast">{toast}</div>}

      {!isSupabaseConfigured && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 90,
          background: '#0F172A', color: '#E2E8F0', fontSize: '12px',
          padding: '6px 16px', textAlign: 'center',
        }}>
          Sem chaves do Supabase — os dados ficam neste navegador. Copie <code>.env.example</code> para <code>.env.local</code> e rode o SQL em supabase/.
        </div>
      )}

      {dayPickerFor && (
        <div
          role="dialog"
          aria-modal="true"
          style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.35)', zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
          onClick={() => setDayPickerFor(null)}
        >
          <div
            style={{ width: '100%', maxWidth: '420px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '2px', padding: '20px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>
              {dayPickerFor.id === '__team__' ? 'Replicar equipe' : `Incluir ${dayPickerFor.name}`}
            </div>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '6px 0 16px' }}>
              {dayPickerFor.id === '__team__'
                ? 'A mesma equipe entra nos dias marcados. No WhatsApp, cada freela recebe o pacote completo.'
                : 'Escolha um ou mais dias. No envio do RH, o freelancer recebe todos juntos no WhatsApp.'}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
              <button type="button" onClick={() => setDayPickerSelected(GERENCIA_DAYS.map((d) => d.id))} className="btn-outline" style={{ padding: '5px 10px', fontSize: '12px' }}>Semana toda</button>
              <button type="button" onClick={() => setDayPickerSelected(['sex', 'sab', 'dom'])} className="btn-outline" style={{ padding: '5px 10px', fontSize: '12px' }}>Sex–Dom</button>
            </div>
            <div className="week-strip" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
              {GERENCIA_DAYS.map((d) => {
                const on = dayPickerSelected.includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggleDayPickerDay(d.id)}
                    style={{
                      padding: '10px 4px', borderRadius: '2px',
                      border: on ? '1px solid #0066FF' : '1px solid #E2E8F0',
                      background: on ? '#EBF3FF' : '#FFFFFF', color: on ? '#0066FF' : '#64748B',
                      cursor: 'pointer', fontSize: '11px', fontWeight: 500,
                    }}
                  >
                    <div>{d.label}</div>
                    <div style={{ marginTop: '2px', opacity: 0.85 }}>{d.date}</div>
                  </button>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '18px' }}>
              <button type="button" onClick={() => setDayPickerFor(null)} className="btn-outline" style={{ flex: 1, justifyContent: 'center', padding: '10px' }}>Cancelar</button>
              <button type="button" onClick={confirmDayPicker} className="btn-primary" style={{ flex: 1, padding: '10px' }}>
                Confirmar · {dayPickerSelected.length} dia{dayPickerSelected.length > 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}

      {returnModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.35)', zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
          onClick={() => setReturnModalOpen(false)}
        >
          <div
            style={{ width: '100%', maxWidth: '420px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '2px', padding: '20px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>Devolver ao maître</div>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '6px 0 14px' }}>O motivo fica no pedido — sem chat. O maître vê e ajusta a escala.</p>
            <textarea
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              rows={4}
              placeholder="Ex.: custo acima do teto — reduzir 2 pessoas ou trocar diária…"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: '16px' }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={() => setReturnModalOpen(false)} className="btn-outline" style={{ flex: 1, justifyContent: 'center', padding: '10px' }}>Cancelar</button>
              <button type="button" onClick={confirmReturnToMaitre} className="btn-primary" style={{ flex: 1, padding: '10px' }}>Devolver</button>
            </div>
          </div>
        </div>
      )}

      {navOpen && (
        <button type="button" className="nav-scrim" aria-label="Fechar menu" onClick={() => setNavOpen(false)} />
      )}

      <aside className={`app-sidebar${navOpen ? ' open' : ''}`} style={!isSupabaseConfigured ? { paddingTop: '36px' } : undefined}>
        <div>
          <div
            onClick={goHome}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px', padding: '0 4px', cursor: 'pointer' }}
          >
            <img src="/logo.png" alt="Domu Staff" style={{ height: '32px', width: 'auto', objectFit: 'contain', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', letterSpacing: '-0.02em' }}>Domu Staff</div>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 400 }}>
                {selectedProfile === 'freelancer' ? 'Painel profissional' : 'Hotel Atlântico'}
              </div>
            </div>
            <button type="button" className="menu-btn" aria-label="Fechar menu" onClick={(e) => { e.stopPropagation(); setNavOpen(false); }}>
              <X size={18} />
            </button>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {navItems.map((item) => {
              const isActive = item.view && currentView === item.view;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`app-nav-btn${isActive ? ' active' : ''}`}
                  onClick={() => {
                    if (item.view) { setCurrentView(item.view); setNavOpen(false); }
                    else triggerToast(`${item.label} em breve.`);
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <item.icon size={16} strokeWidth={1.75} />
                    {item.label}
                  </span>
                  {item.badge && (
                    <span style={{
                      fontSize: '11px', fontWeight: 500, color: '#64748B',
                      background: '#F1F5F9', minWidth: '18px', height: '18px',
                      borderRadius: '4px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      padding: '0 5px',
                    }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div style={{ paddingTop: '14px', borderTop: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '4px', background: '#F1F5F9',
              color: '#0F172A', fontWeight: 600, fontSize: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', flexShrink: 0,
            }}>
              {onboardingData.photoUrl ? (
                <img src={onboardingData.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : activeUser.initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 500, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {onboardingData.name || activeUser.name}
              </div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>{activeUser.role}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 4px', color: '#64748B', fontSize: '12px', fontWeight: 500, marginTop: '2px' }}
          >
            <LogOut size={14} /> Sair
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header className="app-header" style={!isSupabaseConfigured ? { marginTop: '28px' } : undefined}>
          <button type="button" className="menu-btn" aria-label="Abrir menu" onClick={() => setNavOpen(true)}>
            <Menu size={20} strokeWidth={1.75} />
          </button>
          <div style={{ position: 'relative', flex: 1, maxWidth: '340px' }}>
            <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: '11px', top: '9px' }} />
            <input
              className="app-search"
              type="text"
              placeholder={selectedProfile === 'freelancer' ? 'Buscar convites ou turnos…' : 'Buscar nome, setor ou dia…'}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <button type="button" style={{ position: 'relative', color: '#64748B', padding: '4px' }} aria-label="Notificações">
              <Bell size={17} strokeWidth={1.75} />
            </button>
            {selectedProfile !== 'freelancer' && (
              <div className="hide-sm" style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', fontWeight: 500, color: '#0F172A' }}>Hotel Atlântico</div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>Copacabana, RJ</div>
              </div>
            )}
          </div>
        </header>
        <div className="app-content">{children}</div>
      </div>
    </div>
  );
}

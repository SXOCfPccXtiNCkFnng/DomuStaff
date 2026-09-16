import React from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, Building2, Phone } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { DEMO_ACCOUNTS } from '../../lib/constants';
import { isSupabaseConfigured } from '../../lib/supabase';

export default function AuthView() {
  const {
    currentView, setCurrentView, toast,
    showPassword, setShowPassword,
    loginEmail, setLoginEmail, loginPassword, setLoginPassword,
    rememberMe, setRememberMe,
    registerName, setRegisterName, registerHotel, setRegisterHotel,
    registerEmail, setRegisterEmail, registerPhone, setRegisterPhone,
    registerPassword, setRegisterPassword,
    handleLoginSubmit, signInWith, handleRegisterSubmit, authError, busy,
  } = useApp();

  const isLogin = currentView === 'login';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', background: '#F8FAFC', fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif" }}>
      {toast && <div className="toast">{toast}</div>}

      <div className="auth-left-showcase" style={{
        flex: '1 1 48%', background: '#070D1F', color: '#FFFFFF', padding: '56px 64px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logobranca.png" alt="Domu Staff" style={{ height: '34px', width: 'auto', objectFit: 'contain' }} />
          <span style={{ fontSize: '22px', fontWeight: 600, color: '#FFFFFF', letterSpacing: '-0.02em' }}>Domu Staff</span>
        </div>
        <div style={{ maxWidth: '500px', margin: '48px 0' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 600, lineHeight: 1.25, letterSpacing: '-0.6px', color: '#FFFFFF', marginBottom: '18px' }}>
            Tecnologia para gestão e convocação de escalas.
          </h1>
          <p style={{ fontSize: '15px', lineHeight: 1.6, color: '#94A3B8', marginBottom: '36px' }}>
            Organize escalas flexíveis, automatize o contato com freelancers e centralize aprovações operacionais para hotéis, bares e restaurantes.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            {[
              { t: 'Convocação via WhatsApp', d: 'Disparo direto para profissionais com confirmação ágil.' },
              { t: 'Dimensionamento por demanda', d: 'Contingente alinhado à ocupação e aos eventos do hotel.' },
              { t: 'Fluxo Gerência → RH → Freelancer', d: 'Aprovação orçamentária e convocação em um só lugar.' },
            ].map((item) => (
              <div key={item.t} style={{ padding: '18px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', marginBottom: '4px' }}>{item.t}</div>
                <div style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.5 }}>{item.d}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ fontSize: '12px', color: '#64748B' }}>© 2026 Domu Staff • domustaff.app</div>
      </div>

      <div className="auth-right-container" style={{
        flex: '1 1 48%', background: '#F8FAFC', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '48px 40px', position: 'relative',
      }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <div className="auth-mobile-logo" style={{ display: 'none', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '24px' }}>
            <img src="/logo.png" alt="Domu Staff" style={{ height: '32px', width: 'auto' }} />
            <span style={{ fontSize: '22px', fontWeight: 600, color: '#0F172A', letterSpacing: '-0.02em' }}>Domu Staff</span>
          </div>

          <div style={{ display: 'flex', background: '#F1F5F9', padding: '3px', borderRadius: '4px', marginBottom: '20px', border: '1px solid #E2E8F0' }}>
            <button type="button" onClick={() => setCurrentView('login')} style={{
              flex: 1, padding: '9px 0', fontSize: '13px',
              fontWeight: isLogin ? 600 : 500, color: isLogin ? '#0F172A' : '#64748B',
              background: isLogin ? '#FFFFFF' : 'transparent', borderRadius: '4px',
              border: isLogin ? '1px solid #E2E8F0' : '1px solid transparent', cursor: 'pointer',
            }}>Entrar</button>
            <button type="button" onClick={() => setCurrentView('register')} style={{
              flex: 1, padding: '9px 0', fontSize: '13px',
              fontWeight: !isLogin ? 600 : 500, color: !isLogin ? '#0F172A' : '#64748B',
              background: !isLogin ? '#FFFFFF' : 'transparent', borderRadius: '4px',
              border: !isLogin ? '1px solid #E2E8F0' : '1px solid transparent', cursor: 'pointer',
            }}>Criar conta</button>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '2px', padding: '32px 28px' }}>
            <div style={{ marginBottom: '18px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#0F172A', letterSpacing: '-0.4px', marginBottom: '6px' }}>
                {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
              </h2>
              <p style={{ fontSize: '13.5px', color: '#64748B', lineHeight: 1.5 }}>
                {isLogin ? 'Informe suas credenciais para acessar o painel de escalas.' : 'Cadastre seu estabelecimento para começar a gerenciar sua equipe.'}
              </p>
            </div>

            {authError && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', fontSize: '13px', padding: '10px 12px', marginBottom: '14px' }}>
                {authError}
              </div>
            )}

            {isLogin && (
              <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>E-mail Corporativo</label>
                  <div className="auth-input-container">
                    <Mail size={16} className="auth-input-icon" />
                    <input type="email" required className="auth-input" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="seu@hotel.com.br" />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 500, color: '#334155' }}>Senha de Acesso</label>
                  </div>
                  <div className="auth-input-container">
                    <Lock size={16} className="auth-input-icon" />
                    <input type={showPassword ? 'text' : 'password'} required className="auth-input" style={{ paddingRight: '42px' }} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Sua senha" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer' }}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" id="rememberMe" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#0066FF' }} />
                  <label htmlFor="rememberMe" style={{ fontSize: '12.5px', color: '#475569', cursor: 'pointer' }}>Manter conectado neste dispositivo</label>
                </div>
                <button type="submit" className="auth-btn-primary" style={{ width: '100%' }} disabled={busy}>
                  <span>{busy ? 'Entrando…' : 'Acessar plataforma'}</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            )}

            {!isLogin && (
              <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>Nome Completo do Responsável</label>
                  <div className="auth-input-container">
                    <User size={16} className="auth-input-icon" />
                    <input type="text" required className="auth-input" placeholder="Ex: Renata Prado" value={registerName} onChange={(e) => setRegisterName(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>Hotel ou Restaurante</label>
                  <div className="auth-input-container">
                    <Building2 size={16} className="auth-input-icon" />
                    <input type="text" required className="auth-input" placeholder="Ex: Hotel Atlântico Copacabana" value={registerHotel} onChange={(e) => setRegisterHotel(e.target.value)} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>E-mail Corporativo</label>
                    <div className="auth-input-container">
                      <Mail size={16} className="auth-input-icon" />
                      <input type="email" required className="auth-input" placeholder="renata@hotel.com" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>WhatsApp Convocação</label>
                    <div className="auth-input-container">
                      <Phone size={16} className="auth-input-icon" />
                      <input type="tel" required className="auth-input" placeholder="(21) 99999-9999" value={registerPhone} onChange={(e) => setRegisterPhone(e.target.value)} />
                    </div>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>Senha</label>
                  <div className="auth-input-container">
                    <Lock size={16} className="auth-input-icon" />
                    <input type="password" required className="auth-input" placeholder="Mínimo 8 caracteres" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} />
                  </div>
                </div>
                <button type="submit" className="auth-btn-primary" style={{ width: '100%' }} disabled={busy}>
                  <span>{busy ? 'Criando…' : 'Criar conta'}</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            )}
          </div>

          {isLogin && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 500, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                Entrar como demo
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    className="btn-outline"
                    style={{ justifyContent: 'space-between', padding: '10px 12px', fontSize: '13px' }}
                    onClick={() => { setLoginEmail(acc.email); setLoginPassword(acc.password); signInWith(acc.email, acc.password); }}
                  >
                    <span style={{ fontWeight: 500, color: '#0F172A' }}>{acc.name}</span>
                    <span style={{ color: '#64748B', fontSize: '12px' }}>{acc.role}</span>
                  </button>
                ))}
              </div>
              <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '8px' }}>
                Senha: <strong>domu123</strong>
                {!isSupabaseConfigured ? ' · dados locais neste navegador' : ''}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

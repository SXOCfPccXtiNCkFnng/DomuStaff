import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, Phone, Check, ShieldCheck, AlertCircle } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { DEMO_ACCOUNTS } from '../../lib/constants';

export default function AuthView() {
  const {
    currentView, setCurrentView, toast,
    showPassword, setShowPassword,
    loginEmail, setLoginEmail, loginPassword, setLoginPassword,
    rememberMe, setRememberMe,
    registerName, setRegisterName,
    registerEmail, setRegisterEmail, registerPhone, setRegisterPhone,
    registerPassword, setRegisterPassword,
    registerConfirmPassword, setRegisterConfirmPassword,
    handleLoginSubmit, signInWith, handleRegisterSubmit, authError, setAuthError, busy,
  } = useApp();

  const [authMode, setAuthMode] = useState(currentView === 'register' ? 'register' : 'login');
  const isLogin = authMode === 'login';
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const switchMode = (mode) => {
    if (setAuthError) setAuthError('');
    setAuthMode(mode);
    if (setCurrentView) setCurrentView(mode);
  };

  // Real-time phone mask helper
  const handlePhoneChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    
    let formatted = val;
    if (val.length > 2) {
      formatted = `(${val.slice(0, 2)}) ${val.slice(2)}`;
    }
    if (val.length > 7) {
      formatted = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`;
    }
    setRegisterPhone(formatted);
  };

  // Password criteria checker
  const hasMinLength = registerPassword.length >= 8;
  const hasUpperCase = /[A-Z]/.test(registerPassword);
  const hasLowerCase = /[a-z]/.test(registerPassword);
  const hasNumber = /[0-9]/.test(registerPassword);

  const passwordScore = [hasMinLength, hasUpperCase, hasLowerCase, hasNumber].filter(Boolean).length;
  const getPasswordStrengthLabel = () => {
    if (!registerPassword) return { label: '', color: '#94A3B8', width: '0%' };
    if (passwordScore <= 2) return { label: 'Fraca', color: '#EF4444', width: '33%' };
    if (passwordScore === 3) return { label: 'Média', color: '#F59E0B', width: '66%' };
    return { label: 'Forte & Segura', color: '#10B981', width: '100%' };
  };

  const strength = getPasswordStrengthLabel();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', background: '#F8FAFC', fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif" }}>
      {toast && <div className="toast">{toast}</div>}

      {/* Left Showcase Banner */}
      <div className="auth-left-showcase" style={{
        flex: '1 1 48%', background: '#070D1F', color: '#FFFFFF', padding: '56px 64px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logobranca.png" alt="Domu Staff" style={{ height: '34px', width: 'auto', objectFit: 'contain' }} />
          <span style={{ fontSize: '22px', fontWeight: 600, color: '#FFFFFF', letterSpacing: '-0.02em' }}>Domu Staff</span>
        </div>

        <div style={{ maxWidth: '440px', my: 'auto' }}>
          <span style={{
            display: 'inline-block', fontSize: '11.5px', fontWeight: 600, color: '#3B82F6',
            background: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.3)',
            padding: '4px 10px', borderRadius: '100px', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '18px'
          }}>
            Gestão & Escala Inteligente
          </span>
          <h1 style={{ fontSize: '38px', fontWeight: 600, color: '#FFFFFF', lineHeight: 1.15, letterSpacing: '-0.8px', marginBottom: '16px' }}>
            A plataforma oficial para escalas e diárias.
          </h1>
          <p style={{ fontSize: '15px', color: '#94A3B8', lineHeight: 1.6, marginBottom: '32px' }}>
            Conectamos estabelecimentos, gerências e profissionais com agilidade, controle operacional e total segurança.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px' }}>
            {[
              { t: 'Convocação via WhatsApp', d: 'Disparo direto para profissionais com confirmação ágil.' },
              { t: 'Dimensionamento por demanda', d: 'Contingente alinhado à ocupação e aos eventos da casa.' },
              { t: 'Fluxo Gerência -> RH -> Freelancer', d: 'Aprovação orçamentária e convocação em um só lugar.' },
            ].map((item) => (
              <div key={item.t} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.2)',
                  color: '#60A5FA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px',
                  fontWeight: 700, flexShrink: 0, marginTop: '2px',
                }}>✓</div>
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 500, color: '#F1F5F9' }}>{item.t}</div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>{item.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: '12px', color: '#475569' }}>
          Domu Staff v2.0 - Conexão e Gestão de Escalas
        </div>
      </div>

      {/* Right Form Card */}
      <div style={{ flex: '1 1 52%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', background: '#F8FAFC' }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <div className="auth-mobile-logo" style={{ display: 'none', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '24px' }}>
            <img src="/logo.png" alt="Domu Staff" style={{ height: '32px', width: 'auto' }} />
            <span style={{ fontSize: '22px', fontWeight: 600, color: '#0F172A', letterSpacing: '-0.02em' }}>Domu Staff</span>
          </div>

          {/* Tab Switcher */}
          <div style={{ display: 'flex', background: '#F1F5F9', padding: '3px', borderRadius: '4px', marginBottom: '20px', border: '1px solid #E2E8F0' }}>
            <button 
              type="button" 
              onClick={() => switchMode('login')} 
              style={{
                flex: 1, padding: '9px 0', fontSize: '13px',
                fontWeight: isLogin ? 600 : 500, color: isLogin ? '#0F172A' : '#64748B',
                background: isLogin ? '#FFFFFF' : 'transparent', borderRadius: '4px',
                border: isLogin ? '1px solid #E2E8F0' : '1px solid transparent', cursor: 'pointer',
              }}
            >
              Entrar
            </button>
            <button 
              type="button" 
              onClick={() => switchMode('register')} 
              style={{
                flex: 1, padding: '9px 0', fontSize: '13px',
                fontWeight: !isLogin ? 600 : 500, color: !isLogin ? '#0F172A' : '#64748B',
                background: !isLogin ? '#FFFFFF' : 'transparent', borderRadius: '4px',
                border: !isLogin ? '1px solid #E2E8F0' : '1px solid transparent', cursor: 'pointer',
              }}
            >
              Criar conta
            </button>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '4px', padding: '32px 28px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#0F172A', letterSpacing: '-0.4px', marginBottom: '6px' }}>
                {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
              </h2>
              <p style={{ fontSize: '13.5px', color: '#64748B', lineHeight: 1.5 }}>
                {isLogin 
                  ? 'Informe suas credenciais para acessar a plataforma.' 
                  : 'Preencha seus dados para criar sua conta no Domu Staff.'}
              </p>
            </div>

            {authError && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', fontSize: '13px', padding: '10px 12px', marginBottom: '16px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} className="shrink-0 text-red-600" />
                <span>{authError}</span>
              </div>
            )}

            {/* LOGIN FORM */}
            {isLogin && (
              <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>E-mail</label>
                  <div className="auth-input-container">
                    <Mail size={16} className="auth-input-icon" />
                    <input 
                      type="email" 
                      required 
                      className="auth-input" 
                      value={loginEmail} 
                      onChange={(e) => setLoginEmail(e.target.value)} 
                      placeholder="seu.email@exemplo.com" 
                    />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 500, color: '#334155' }}>Senha de Acesso</label>
                  </div>
                  <div className="auth-input-container">
                    <Lock size={16} className="auth-input-icon" />
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      required 
                      className="auth-input" 
                      style={{ paddingRight: '42px' }} 
                      value={loginPassword} 
                      onChange={(e) => setLoginPassword(e.target.value)} 
                      placeholder="Sua senha" 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      style={{ position: 'absolute', right: '14px', color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="checkbox" 
                    id="rememberMe" 
                    checked={rememberMe} 
                    onChange={(e) => setRememberMe(e.target.checked)} 
                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#0066FF' }} 
                  />
                  <label htmlFor="rememberMe" style={{ fontSize: '12.5px', color: '#475569', cursor: 'pointer' }}>Manter conectado neste dispositivo</label>
                </div>
                <button type="submit" className="auth-btn-primary" style={{ width: '100%' }} disabled={busy}>
                  <span>{busy ? 'Entrando...' : 'Acessar plataforma'}</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            )}

            {/* REGISTER FORM */}
            {!isLogin && (
              <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
                    Nome Completo <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <div className="auth-input-container">
                    <User size={16} className="auth-input-icon" />
                    <input 
                      type="text" 
                      required 
                      className="auth-input" 
                      placeholder="Ex: Renata Prado ou João Silva" 
                      value={registerName} 
                      onChange={(e) => setRegisterName(e.target.value)} 
                    />
                  </div>
                  <span style={{ fontSize: '11px', color: '#94A3B8', marginTop: '3px', display: 'block' }}>
                    Insira nome e sobrenome
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
                      E-mail <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <div className="auth-input-container">
                      <Mail size={16} className="auth-input-icon" />
                      <input 
                        type="email" 
                        required 
                        className="auth-input" 
                        placeholder="seu@email.com" 
                        value={registerEmail} 
                        onChange={(e) => setRegisterEmail(e.target.value)} 
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
                      WhatsApp <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <div className="auth-input-container">
                      <Phone size={16} className="auth-input-icon" />
                      <input 
                        type="tel" 
                        required 
                        className="auth-input" 
                        placeholder="(21) 99999-9999" 
                        value={registerPhone} 
                        onChange={handlePhoneChange} 
                        maxLength={15}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 500, color: '#334155' }}>
                      Senha de Acesso <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    {registerPassword && (
                      <span style={{ fontSize: '11px', fontWeight: 600, color: strength.color }}>
                        {strength.label}
                      </span>
                    )}
                  </div>
                  <div className="auth-input-container">
                    <Lock size={16} className="auth-input-icon" />
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      required 
                      className="auth-input" 
                      style={{ paddingRight: '42px' }} 
                      placeholder="Mínimo 8 caracteres" 
                      value={registerPassword} 
                      onChange={(e) => setRegisterPassword(e.target.value)} 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      style={{ position: 'absolute', right: '14px', color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Password Strength Progress Bar */}
                  {registerPassword && (
                    <div style={{ width: '100%', height: '4px', background: '#E2E8F0', borderRadius: '2px', marginTop: '6px', overflow: 'hidden' }}>
                      <div style={{ width: strength.width, height: '100%', background: strength.color, transition: 'all 0.2s' }} />
                    </div>
                  )}

                  {/* Password Requirements Checklist */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginTop: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: hasMinLength ? '#10B981' : '#94A3B8' }}>
                      <Check size={12} color={hasMinLength ? '#10B981' : '#CBD5E1'} /> Mínimo 8 dígitos
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: hasUpperCase ? '#10B981' : '#94A3B8' }}>
                      <Check size={12} color={hasUpperCase ? '#10B981' : '#CBD5E1'} /> 1 Letra maiúscula
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: hasLowerCase ? '#10B981' : '#94A3B8' }}>
                      <Check size={12} color={hasLowerCase ? '#10B981' : '#CBD5E1'} /> 1 Letra minúscula
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: hasNumber ? '#10B981' : '#94A3B8' }}>
                      <Check size={12} color={hasNumber ? '#10B981' : '#CBD5E1'} /> 1 Número
                    </div>
                  </div>
                </div>

                {/* Confirmar Senha */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 500, color: '#334155' }}>
                      Confirmar Senha <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    {registerConfirmPassword && (
                      <span style={{ 
                        fontSize: '11px', 
                        fontWeight: 600, 
                        color: registerPassword === registerConfirmPassword ? '#10B981' : '#EF4444' 
                      }}>
                        {registerPassword === registerConfirmPassword ? '✓ Senhas coincidem' : '✕ As senhas não coincidem'}
                      </span>
                    )}
                  </div>
                  <div className="auth-input-container">
                    <Lock size={16} className="auth-input-icon" />
                    <input 
                      type={showConfirmPassword ? 'text' : 'password'} 
                      required 
                      className="auth-input" 
                      style={{ 
                        paddingRight: '42px',
                        borderColor: registerConfirmPassword 
                          ? (registerPassword === registerConfirmPassword ? '#10B981' : '#FCA5A5') 
                          : undefined 
                      }} 
                      placeholder="Digite a mesma senha novamente" 
                      value={registerConfirmPassword} 
                      onChange={(e) => setRegisterConfirmPassword(e.target.value)} 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                      style={{ position: 'absolute', right: '14px', color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="auth-btn-primary" style={{ width: '100%', marginTop: '4px' }} disabled={busy}>
                  <span>{busy ? 'Criando conta...' : 'Criar conta'}</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            )}
          </div>

          {/* Demo Logins */}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

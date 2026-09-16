import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  Users, 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  MessageCircle, 
  Sparkles,
  Store
} from 'lucide-react';

const RATE_FIELDS = [
  { key: 'week', label: 'Semana (seg-sex)' },
  { key: 'weekend', label: 'Fim de semana' },
  { key: 'holiday', label: 'Feriado' },
];

const SECTOR_LABELS = {
  restaurante: 'Restaurante',
  recepcao: 'Recepcao',
  bar: 'Bar',
  cozinha: 'Cozinha',
  governanca: 'Governanca',
  cdc: 'CDC',
};

const inputStyle = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid #E2E8F0',
  borderRadius: '4px',
  fontSize: '13px',
  color: '#0F172A',
  background: '#FFFFFF',
  boxSizing: 'border-box',
};

function Field({ label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748B' }}>{label}</span>
      {children}
    </label>
  );
}

function Card({ title, hint, children }) {
  return (
    <section style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>{title}</div>
        {hint && <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{hint}</div>}
      </div>
      <div style={{ padding: '16px' }}>{children}</div>
    </section>
  );
}

function ToggleRow({ title, hint, checked, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
      <div>
        <div style={{ fontSize: '13px', fontWeight: 500, color: '#0F172A' }}>{title}</div>
        <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{hint}</div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        aria-label={title}
        style={{
          width: '40px',
          height: '24px',
          borderRadius: '12px',
          border: 'none',
          cursor: 'pointer',
          background: checked ? '#0066FF' : '#CBD5E1',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        <span style={{
          position: 'absolute',
          top: '3px',
          left: checked ? '19px' : '3px',
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          background: '#FFF',
          transition: 'left 0.15s',
        }} />
      </button>
    </div>
  );
}

function tabsForProfile(profile) {
  if (profile === 'rh') {
    return [
      { id: 'perfil', label: 'Perfil' },
      { id: 'convites', label: 'Codigo e Convites' },
      { id: 'operacao', label: 'Operacao' },
      { id: 'diarias', label: 'Diarias' },
      { id: 'convocacao', label: 'Convocacao' },
    ];
  }
  if (profile === 'gerencia') {
    return [
      { id: 'perfil', label: 'Perfil' },
      { id: 'estabelecimentos', label: 'Estabelecimentos & Unidades' },
      { id: 'setor', label: 'Ocupacao' },
      { id: 'alertas', label: 'Alertas' },
    ];
  }
  return [
    { id: 'perfil', label: 'Perfil' },
    { id: 'estabelecimentos', label: 'Meus Estabelecimentos' },
    { id: 'avisos', label: 'Avisos & Notificacoes' },
  ];
}
export default function SettingsView({
  profile,
  rates,
  onChangeRate,
  days = [],
  guestCountByDay = {},
  onChangeGuests,
  rateKindForDay,
  rateKindLabel,
  account = {},
  onChangeAccount,
  tech = {},
  onChangeTech,
  defaultSector,
  userName,
  userRole,
  hotel,
  freelancersCount = 14,
  onSave,
}) {
  const tabs = tabsForProfile(profile);
  const [tab, setTab] = useState(tabs[0].id);

  useEffect(() => {
    setTab(tabsForProfile(profile)[0].id);
  }, [profile]);

  const activeTab = tabs.some((t) => t.id === tab) ? tab : tabs[0].id;
  const sectorLabel = SECTOR_LABELS[defaultSector] || 'Restaurante';
  const photoInputRef = useRef(null);
  const [photoError, setPhotoError] = useState('');
  const displayName = account.name || userName || '';
  const initials = displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || '?';

  const establishmentCode = hotel?.code || 'ATL-COPA';
  const establishmentName = hotel?.name || account.hotelOrRole || 'Hotel & Restaurante Atlantico';
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://domustaff.app';
  const inviteLinkFreelancer = baseUrl + '/join?code=' + establishmentCode + '&role=freelancer';
  const inviteLinkGerencia = baseUrl + '/join?code=' + establishmentCode + '&role=gerencia';

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedFreelancerLink, setCopiedFreelancerLink] = useState(false);
  const [copiedGerenciaLink, setCopiedGerenciaLink] = useState(false);
  const [newEstablishmentCodeInput, setNewEstablishmentCodeInput] = useState('');

  const [connectedEstablishments, setConnectedEstablishments] = useState([
    {
      id: '1',
      code: 'ATL-COPA',
      name: 'Hotel & Restaurante Atlantico',
      category: 'Hotelaria & A&B',
      role: profile === 'gerencia' ? 'Gerencia A&B' : 'Garcom / Barman',
      status: 'Ativo',
      joinedAt: '10/01/2026',
      totalShifts: 18,
      rating: 4.9,
      isPrimary: true
    },
    {
      id: '2',
      code: 'MAR-LEB',
      name: 'Marina Gourmet Leblon',
      category: 'Restaurante / Bar',
      role: 'Garcom',
      status: 'Ativo',
      joinedAt: '15/02/2026',
      totalShifts: 6,
      rating: 5.0,
      isPrimary: false
    }
  ]);

  const copyText = (text, type) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else if (type === 'freelancer') {
      setCopiedFreelancerLink(true);
      setTimeout(() => setCopiedFreelancerLink(false), 2000);
    } else if (type === 'gerencia') {
      setCopiedGerenciaLink(true);
      setTimeout(() => setCopiedGerenciaLink(false), 2000);
    }
  };

  const shareWhatsApp = (type) => {
    const msg = type === 'freelancer'
      ? ('Ola! Faca seu cadastro na nossa equipe de freelancers do *' + establishmentName + '* pelo link oficial da Domu Staff: ' + inviteLinkFreelancer)
      : ('Ola! Acesse o painel de Gerencia do *' + establishmentName + '* pelo link de convite: ' + inviteLinkGerencia);
    window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(msg), '_blank');
  };

  const handleConnectEstablishment = (e) => {
    e.preventDefault();
    if (!newEstablishmentCodeInput.trim()) return;
    const formatted = newEstablishmentCodeInput.trim().toUpperCase();

    if (connectedEstablishments.some(h => h.code === formatted)) {
      alert('Voce ja esta vinculado a este estabelecimento.');
      return;
    }

    const catalog = {
      'HIL-COPA': 'Hilton Copacabana & Rooftop',
      'WIN-BARRA': 'Windsor Eventos & Gastronomia',
      'FAS-IPAN': 'Restaurante Fasano Al Mare',
      'SHER-RIO': 'Sheraton Resort & Clube',
      'BAR-LEB': 'Bar do Leblon & Gastrobar'
    };

    const foundName = catalog[formatted] || ('Estabelecimento ' + formatted);

    const newEst = {
      id: String(Date.now()),
      code: formatted,
      name: foundName,
      category: 'Restaurante / Eventos',
      role: profile === 'gerencia' ? 'Gerencia Operacional' : 'Freelancer Polivalente',
      status: 'Ativo',
      joinedAt: new Date().toLocaleDateString('pt-BR'),
      totalShifts: 0,
      rating: 5.0,
      isPrimary: false
    };

    setConnectedEstablishments(prev => [...prev, newEst]);
    setNewEstablishmentCodeInput('');
  };

  const handleDisconnectEstablishment = (id, name) => {
    if (connectedEstablishments.length === 1) {
      alert('Voce precisa manter pelo menos 1 estabelecimento conectado.');
      return;
    }
    if (confirm('Deseja desvincular sua conta de ' + name + '?')) {
      setConnectedEstablishments(prev => prev.filter(h => h.id !== id));
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setPhotoError('Use JPG, PNG ou WEBP.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setPhotoError('A foto precisa ter ate 2 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoError('');
      onChangeAccount('photoUrl', reader.result);
    };
    reader.readAsDataURL(file);
  };

  const subtitle =
    profile === 'rh'
      ? 'Ocupacao do estabelecimento, diarias, codigos de vinculo e regras oficiais de convocacao.'
      : profile === 'gerencia'
        ? 'Seu perfil, estabelecimentos vinculados, ocupacao da semana e alertas do salao.'
        : 'Seus dados de recebimento, conexao multi-estabelecimentos e preferencias de escala.';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '880px', width: '100%' }}>
      <div>
        <h1 className="page-title">Configuracoes</h1>
        <p className="page-sub">{subtitle}</p>
      </div>

      <div
        className="week-strip"
        style={{
          display: 'flex',
          gap: '4px',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        {tabs.map((item) => {
          const on = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              style={{
                padding: '10px 14px',
                marginBottom: '-1px',
                fontSize: '13px',
                fontWeight: on ? 600 : 500,
                color: on ? '#0066FF' : '#64748B',
                background: 'transparent',
                border: 'none',
                borderBottom: on ? '2px solid #0066FF' : '2px solid transparent',
                borderRadius: 0,
                boxShadow: 'none',
                cursor: 'pointer',
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* PERFIL */}
      {activeTab === 'perfil' && (
        <Card
          title="Dados da conta"
          hint={
            profile === 'gerencia'
              ? 'Aparece no painel operacional da gerencia.'
              : profile === 'rh'
                ? 'Aparece nas aprovacoes e convocacoes de equipe.'
                : 'Nome e funcao que o estabelecimento ve nos convites.'
          }
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px', flexWrap: 'wrap' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '4px',
                background: '#F1F5F9',
                color: '#0F172A',
                fontWeight: 600,
                fontSize: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
                border: '1px solid #E2E8F0',
              }}
            >
              {account.photoUrl ? (
                <img src={account.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                initials
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button type="button" className="btn-outline" onClick={() => photoInputRef.current?.click()}>
                  {account.photoUrl ? 'Trocar foto' : 'Enviar foto'}
                </button>
                {account.photoUrl && (
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => { setPhotoError(''); onChangeAccount('photoUrl', ''); }}
                  >
                    Remover
                  </button>
                )}
              </div>
              <span style={{ fontSize: '11px', color: '#64748B' }}>
                JPG ou PNG, ate 2 MB. Aparece na barra, ao lado do seu nome.
              </span>
              {photoError && <span style={{ fontSize: '12px', color: '#DC2626' }}>{photoError}</span>}
              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={handlePhotoChange}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            <Field label="Nome">
              <input
                style={inputStyle}
                value={account.name || ''}
                onChange={(e) => onChangeAccount('name', e.target.value)}
                placeholder="Seu nome"
              />
            </Field>
            <Field label="WhatsApp">
              <input
                style={inputStyle}
                value={account.whatsapp || ''}
                onChange={(e) => onChangeAccount('whatsapp', e.target.value)}
                placeholder="(21) 99999-9999"
              />
            </Field>
            <Field label="Estabelecimento / Empresa principal">
              <input
                style={{ ...inputStyle, background: '#F8FAFC', color: '#64748B' }}
                value={establishmentName}
                disabled
              />
            </Field>
            <Field label="Departamento">
              <input
                style={{ ...inputStyle, background: '#F8FAFC', color: '#64748B' }}
                value={profile === 'rh' ? 'RH / Controladoria' : profile === 'gerencia' ? 'Gerencia Operacional' : 'Base de Freelancers'}
                disabled
              />
            </Field>
          </div>
        </Card>
      )}

      {/* RH: CODIGO E CONVITES */}
      {activeTab === 'convites' && profile === 'rh' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)',
            color: '#FFFFFF',
            borderRadius: '8px',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(59, 130, 246, 0.25)', border: '1px solid rgba(147, 197, 253, 0.3)', padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 600, color: '#93C5FD', marginBottom: '8px' }}>
                  <Building2 size={13} /> CODIGO DE CONEXAO DO ESTABELECIMENTO
                </div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF' }}>{establishmentName}</div>
                <div style={{ fontSize: '13px', color: '#CBD5E1', marginTop: '4px', maxWidth: '540px' }}>
                  Compartilhe este identificador com sua gerencia e equipe de freelancers para que eles se vinculem a este estabelecimento.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255, 255, 255, 0.1)', padding: '10px 16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>ID:</span>
                <span style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'monospace', color: '#FBBF24', letterSpacing: '1px' }}>{establishmentCode}</span>
                <button
                  type="button"
                  onClick={() => copyText(establishmentCode, 'code')}
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    color: '#FFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                >
                  {copiedCode ? <Check size={14} color="#34D399" /> : <Copy size={14} />}
                  {copiedCode ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            <Card title="Link Direto para Freelancers" hint="Para novos profissionais se cadastrarem e entrarem na sua base de convocacao.">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{
                  padding: '8px 12px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  color: '#334155',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {inviteLinkFreelancer}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => copyText(inviteLinkFreelancer, 'freelancer')}
                    className="btn-outline"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', padding: '8px' }}
                  >
                    {copiedFreelancerLink ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                    {copiedFreelancerLink ? 'Link Copiado!' : 'Copiar Link'}
                  </button>
                  <button
                    type="button"
                    onClick={() => shareWhatsApp('freelancer')}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      background: '#16A34A',
                      color: '#FFF',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: '8px'
                    }}
                  >
                    <MessageCircle size={14} /> Enviar WhatsApp
                  </button>
                </div>
              </div>
            </Card>

            <Card title="Link de Acesso para Gerencia" hint="Para Gerentes, Maitres, Governanca e Chefes de Cozinha gerenciarem turnos e extras.">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{
                  padding: '8px 12px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  color: '#334155',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {inviteLinkGerencia}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => copyText(inviteLinkGerencia, 'gerencia')}
                    className="btn-outline"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', padding: '8px' }}
                  >
                    {copiedGerenciaLink ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                    {copiedGerenciaLink ? 'Link Copiado!' : 'Copiar Link'}
                  </button>
                  <button
                    type="button"
                    onClick={() => shareWhatsApp('gerencia')}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      background: '#0066FF',
                      color: '#FFF',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: '8px'
                    }}
                  >
                    <MessageCircle size={14} /> Enviar WhatsApp
                  </button>
                </div>
              </div>
            </Card>
          </div>

          <div style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '4px',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#EFF6FF', color: '#0066FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={16} />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>Equipe Sincronizada</div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>{freelancersCount} profissionais ativos na base deste estabelecimento.</div>
              </div>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: '#16A34A', background: '#DCFCE7', padding: '4px 10px', borderRadius: '100px' }}>
              <Check size={12} /> Sincronizacao em tempo real ativa
            </div>
          </div>
        </div>
      )}

      {/* GERENCIA: ESTABELECIMENTOS & UNIDADES */}
      {activeTab === 'estabelecimentos' && profile === 'gerencia' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Card title="Estabelecimentos e Unidades Conectadas" hint="Como gerente de setor, voce pode acompanhar e gerenciar turnos das suas casas e filiais vinculadas.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {connectedEstablishments.map((h) => (
                <div key={h.id} style={{
                  padding: '12px 14px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '4px',
                  background: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '4px', background: '#EFF6FF', color: '#0066FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Store size={18} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>{h.name}</span>
                        <span style={{ fontSize: '10px', fontWeight: 700, fontFamily: 'monospace', background: '#FEF3C7', color: '#92400E', padding: '2px 6px', borderRadius: '3px' }}>{h.code}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                        Segmento: <strong style={{ color: '#334155' }}>{h.category}</strong> • Funcao: <strong style={{ color: '#334155' }}>{h.role}</strong> • Vinculado desde {h.joinedAt}
                      </div>
                    </div>
                  </div>

                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#16A34A', background: '#DCFCE7', padding: '3px 8px', borderRadius: '100px' }}>
                    Ativo
                  </span>
                </div>
              ))}

              <form onSubmit={handleConnectEstablishment} style={{ display: 'flex', gap: '8px', marginTop: '8px', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
                <input
                  style={{ ...inputStyle, flex: 1, fontFamily: 'monospace', textTransform: 'uppercase' }}
                  placeholder="Digite o Codigo de outro estabelecimento ou filial (Ex: FAS-IPAN)"
                  value={newEstablishmentCodeInput}
                  onChange={(e) => setNewEstablishmentCodeInput(e.target.value)}
                />
                <button
                  type="submit"
                  style={{
                    background: '#0066FF',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '8px 14px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Plus size={14} /> Vincular Unidade
                </button>
              </form>
            </div>
          </Card>
        </div>
      )}

      {/* FREELANCER: MEUS ESTABELECIMENTOS (MULTI-ESTABELECIMENTOS) */}
      {activeTab === 'estabelecimentos' && profile === 'freelancer' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: '6px',
            padding: '14px 16px',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start'
          }}>
            <Sparkles size={20} color="#2563EB" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E3A8A' }}>Multi-Estabelecimentos Inteligente & Unificado</div>
              <div style={{ fontSize: '12px', color: '#1E40AF', marginTop: '2px', lineHeight: '1.4' }}>
                Voce pode conectar-se a varios restaurantes, hoteis, bares e buffets parceiros! Ao aceitar um plantao no <strong>Estabelecimento A</strong> para determinado turno, o sistema bloqueia automaticamente sua agenda no <strong>Estabelecimento B</strong>, evitando choque de horarios e preservando sua reputacao.
              </div>
            </div>
          </div>

          <Card title="Estabelecimentos Vinculados a Sua Conta" hint="Voce recebe convites de diarias de todos os restaurantes, hoteis e casas parceiras abaixo.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {connectedEstablishments.map((h) => (
                <div key={h.id} style={{
                  padding: '12px 14px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '4px',
                  background: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '4px', background: '#F8FAFC', color: '#0066FF', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E2E8F0' }}>
                      <Building2 size={18} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>{h.name}</span>
                        <span style={{ fontSize: '10px', fontWeight: 700, fontFamily: 'monospace', background: '#FEF3C7', color: '#92400E', padding: '2px 6px', borderRadius: '3px' }}>{h.code}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                        Tipo: <strong style={{ color: '#334155' }}>{h.category}</strong> • Setor: <strong style={{ color: '#334155' }}>{h.role}</strong> • Plantoes realizados: <strong style={{ color: '#334155' }}>{h.totalShifts}</strong> • Avaliacao: <strong style={{ color: '#D97706' }}>★ {h.rating}</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#16A34A', background: '#DCFCE7', padding: '3px 8px', borderRadius: '100px' }}>
                      Conectado
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDisconnectEstablishment(h.id, h.name)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#94A3B8',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Desvincular deste estabelecimento"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}

              <form onSubmit={handleConnectEstablishment} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Conectar a um Novo Restaurante, Hotel ou Casa de Eventos:</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    style={{ ...inputStyle, flex: 1, fontFamily: 'monospace', textTransform: 'uppercase' }}
                    placeholder="Insira o Codigo do Estabelecimento (Ex: ATL-COPA, FAS-IPAN, BAR-LEB)"
                    value={newEstablishmentCodeInput}
                    onChange={(e) => setNewEstablishmentCodeInput(e.target.value)}
                  />
                  <button
                    type="submit"
                    style={{
                      background: '#0066FF',
                      color: '#FFF',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '8px 14px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <Plus size={14} /> Conectar
                  </button>
                </div>
                <span style={{ fontSize: '11px', color: '#64748B' }}>Peca o Codigo de Conexao ou Link direto ao RH ou Gerente do estabelecimento parceiro.</span>
              </form>
            </div>
          </Card>
        </div>
      )}
      {/* RH: OPERACAO */}
      {activeTab === 'operacao' && profile === 'rh' && (
        <Card title="Gatilhos de ocupacao & demanda" hint="Controle quando o sistema sugere vagas extras para a gerencia.">
          <ToggleRow
            title="Sugerir extras em alta ocupacao e movimento"
            hint="Avisa a governanca, salao e cozinha quando a ocupacao ou reservas passarem da meta do dia."
            checked={!!tech.suggestOnHighOccupancy}
            onChange={(v) => onChangeTech('suggestOnHighOccupancy', v)}
          />
          <ToggleRow
            title="Auto-ajuste por historico"
            hint="Usa os ultimos 30 dias para calibrar a quantidade recomendada por setor."
            checked={!!tech.autoScaleHistory}
            onChange={(v) => onChangeTech('autoScaleHistory', v)}
          />
        </Card>
      )}

      {/* RH: DIARIAS */}
      {activeTab === 'diarias' && profile === 'rh' && (
        <Card title="Valores de diaria" hint="Tabela padrao aplicada nas convocacoes automaticas e manuais.">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            {RATE_FIELDS.map((rf) => (
              <Field key={rf.key} label={rf.label}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>R$</span>
                  <input
                    type="number"
                    style={inputStyle}
                    value={rates[rf.key] ?? ''}
                    onChange={(e) => onChangeRate(rf.key, Number(e.target.value) || 0)}
                  />
                </div>
              </Field>
            ))}
          </div>
        </Card>
      )}

      {/* RH: CONVOCACAO */}
      {activeTab === 'convocacao' && profile === 'rh' && (
        <Card title="Regras de convocacao" hint="Tempo de resposta do profissional e prioridade de lista.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Field label="Tempo maximo de aceite (minutos)">
              <input
                type="number"
                style={{ ...inputStyle, maxWidth: '160px' }}
                value={tech.timeoutMinutes || 30}
                onChange={(e) => onChangeTech('timeoutMinutes', Number(e.target.value) || 30)}
              />
            </Field>
            <ToggleRow
              title="Disparo automatico via WhatsApp"
              hint="Envia mensagem para o proximo da fila se o primeiro nao responder no prazo."
              checked={!!tech.autoWhatsapp}
              onChange={(v) => onChangeTech('autoWhatsapp', v)}
            />
          </div>
        </Card>
      )}

      {/* GERENCIA: OCUPACAO */}
      {activeTab === 'setor' && profile === 'gerencia' && (
        <Card title={'Ocupacao & Demanda da semana  ' + sectorLabel} hint="Previsao de clientes ou hospedes por dia para calibrar a escala da operacao.">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px' }}>
            {days.map((d) => (
              <Field key={d.key} label={d.short + ' (' + rateKindLabel(rateKindForDay(d.key)) + ')'}>
                <input
                  type="number"
                  style={inputStyle}
                  value={guestCountByDay[d.key] ?? 0}
                  onChange={(e) => onChangeGuests(d.key, Number(e.target.value) || 0)}
                />
              </Field>
            ))}
          </div>
        </Card>
      )}

      {/* GERENCIA: ALERTAS */}
      {activeTab === 'alertas' && profile === 'gerencia' && (
        <Card title="Alertas operacionais" hint="Avisos no painel da gerencia durante o turno.">
          <ToggleRow
            title="Alerta de pico de atendimento"
            hint="Notifica quando a contagem de clientes ou reservas exceder a capacidade normal do turno."
            checked={!!tech.alertPeak}
            onChange={(v) => onChangeTech('alertPeak', v)}
          />
          <ToggleRow
            title="Lembrete de confirmacao de extras"
            hint="Avisa 2h antes do turno se todos os profissionais convocados confirmaram presenca."
            checked={!!tech.alertConfirmations}
            onChange={(v) => onChangeTech('alertConfirmations', v)}
          />
        </Card>
      )}

      {/* FREELANCER: AVISOS */}
      {activeTab === 'avisos' && profile === 'freelancer' && (
        <Card title="Canais de aviso" hint="Como voce quer receber chamados de plantao.">
          <ToggleRow
            title="Notificacao no WhatsApp"
            hint="Receber mensagem direta quando um estabelecimento parceiro convocar seu perfil."
            checked={tech.notifyWhatsapp !== false}
            onChange={(v) => onChangeTech('notifyWhatsapp', v)}
          />
          <ToggleRow
            title="Avisos de novas vagas abertas"
            hint="Receber lista de plantoes extras nos fins de semana e feriados."
            checked={tech.notifyOpenSlots !== false}
            onChange={(v) => onChangeTech('notifyOpenSlots', v)}
          />
        </Card>
      )}

      {onSave && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}>
          <button type="button" className="btn-primary" onClick={onSave}>
            Salvar configuracoes
          </button>
        </div>
      )}
    </div>
  );
}

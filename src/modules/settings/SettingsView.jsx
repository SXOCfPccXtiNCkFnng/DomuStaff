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
  Store
} from 'lucide-react';
import { findHotelByCode } from '../../lib/api';
import Avatar from '../../components/Avatar';

const RATE_FIELDS = [
  { key: 'week', label: 'Semana' },
  { key: 'weekend', label: 'Fim de semana' },
  { key: 'holiday', label: 'Feriado' },
];

function softNumberValue(v) {
  return v === '' || v == null ? '' : String(v);
}

const SECTOR_LABELS = {
  restaurante: 'Restaurante',
  recepcao: 'Recepção',
  bar: 'Bar',
  cozinha: 'Cozinha',
  governanca: 'Governança',
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

function formatCnpjDisplay(value) {
  const d = String(value || '').replace(/\D/g, '').slice(0, 14);
  if (d.length !== 14) return value || '';
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
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
      { id: 'convites', label: 'Código e Convites' },
      { id: 'operacao', label: 'Operação' },
      { id: 'diarias', label: 'Diárias' },
      { id: 'convocacao', label: 'Convocação' },
    ];
  }
  if (profile === 'gerencia') {
    return [
      { id: 'perfil', label: 'Perfil' },
      { id: 'estabelecimentos', label: 'Estabelecimentos e Unidades' },
      { id: 'setor', label: 'Demanda' },
      { id: 'alertas', label: 'Alertas' },
    ];
  }
  return [
    { id: 'perfil', label: 'Perfil' },
    { id: 'estabelecimentos', label: 'Meus Estabelecimentos' },
    { id: 'avisos', label: 'Avisos e Notificações' },
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
  freelancersCount = 0,
  managementTeam = [],
  onSave,
  saving = false,
  triggerToast,
  onLinkEstablishment,
  onUnlinkEstablishment,
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
  const timeoutTotal = Number(tech.timeoutMinutes) || 30;
  const [acceptHours, setAcceptHours] = useState(String(Math.floor(timeoutTotal / 60)));
  const [acceptMins, setAcceptMins] = useState(String(timeoutTotal % 60));

  useEffect(() => {
    const t = Number(tech.timeoutMinutes) || 30;
    setAcceptHours(String(Math.floor(t / 60)));
    setAcceptMins(String(t % 60));
  }, [tech.timeoutMinutes]);

  const commitAcceptTimeout = (hStr, mStr) => {
    const h = hStr === '' ? 0 : Math.max(0, parseInt(hStr, 10) || 0);
    let m = mStr === '' ? 0 : Math.max(0, parseInt(mStr, 10) || 0);
    if (m > 59) m = 59;
    onChangeTech('timeoutMinutes', Math.max(1, h * 60 + m));
  };
  const displayName = account.name || userName || '';

  const establishmentCode = hotel?.code || account.hotelCode || account.settings?.hotelCode || '';
  const establishmentName = hotel?.name || account.hotelOrRole || '';
  const establishmentCnpj = hotel?.cnpj || account.hotelCnpj || account.settings?.hotelCnpj || '';
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://domustaff.app';
  const inviteLinkFreelancer = establishmentCode
    ? `${baseUrl}/join?code=${establishmentCode}&role=freelancer`
    : '';
  const inviteLinkGerencia = establishmentCode
    ? `${baseUrl}/join?code=${establishmentCode}&role=gerencia`
    : '';

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedFreelancerLink, setCopiedFreelancerLink] = useState(false);
  const [copiedGerenciaLink, setCopiedGerenciaLink] = useState(false);
  const [newEstablishmentCodeInput, setNewEstablishmentCodeInput] = useState('');
  const [linkingEstablishment, setLinkingEstablishment] = useState(false);
  const [disconnectTarget, setDisconnectTarget] = useState(null);

  const [connectedEstablishments, setConnectedEstablishments] = useState(() => {
    const saved = tech?.connectedEstablishments;
    return Array.isArray(saved) ? saved : [];
  });

  useEffect(() => {
    const saved = Array.isArray(tech?.connectedEstablishments) ? tech.connectedEstablishments : [];

    // Freelancer: só o que a pessoa vinculou (sem hotel “padrão” automático)
    if (profile === 'freelancer') {
      const real = saved.filter((h) => h && h.joinedAt !== 'Vinculado');
      setConnectedEstablishments(real);
      if (real.length !== saved.length && typeof onChangeTech === 'function') {
        onChangeTech('connectedEstablishments', real);
      }
      return;
    }

    if (saved.length) {
      setConnectedEstablishments(saved);
      return;
    }
    if (establishmentCode || establishmentName) {
      setConnectedEstablishments((prev) => {
        if (prev.some((h) => h.code === establishmentCode || h.name === establishmentName)) return prev;
        return [{
          id: hotel?.id || 'primary',
          code: establishmentCode || '—',
          name: establishmentName || 'Estabelecimento vinculado',
          category: 'Principal',
          role: profile === 'gerencia'
            ? 'Gerência Operacional'
            : 'RH / Controladoria',
          status: 'Ativo',
          joinedAt: 'Vinculado',
          totalShifts: 0,
          rating: null,
          isPrimary: true,
        }, ...prev];
      });
    }
  }, [tech?.connectedEstablishments, establishmentCode, establishmentName, hotel?.id, profile, account.primaryRole]);

  const displayedEstablishments = (() => {
    if (profile === 'freelancer') return connectedEstablishments;
    if (connectedEstablishments.length) return connectedEstablishments;
    if (!establishmentCode && !establishmentName) return [];
    return [{
      id: hotel?.id || 'primary',
      code: establishmentCode || '—',
      name: establishmentName || 'Estabelecimento vinculado',
      category: 'Principal',
      role: profile === 'gerencia'
        ? 'Gerência Operacional'
        : profile === 'rh'
          ? 'RH / Controladoria'
          : (account.primaryRole || 'Freelancer'),
      status: 'Ativo',
      joinedAt: 'Vinculado',
      totalShifts: 0,
      rating: null,
      isPrimary: true,
    }];
  })();

  const syncConnected = (next) => {
    setConnectedEstablishments(next);
    if (typeof onChangeTech === 'function') onChangeTech('connectedEstablishments', next);
  };

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
      ? ('Olá! Faça seu cadastro na nossa equipe de freelancers do *' + establishmentName + '* pelo link oficial da Domu Staff: ' + inviteLinkFreelancer)
      : ('Olá! Acesse o painel de Gerência do *' + establishmentName + '* pelo link de convite: ' + inviteLinkGerencia);
    window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(msg), '_blank');
  };

  const handleConnectEstablishment = async (e, codeOverride) => {
    if (e?.preventDefault) e.preventDefault();
    const formatted = String(codeOverride ?? newEstablishmentCodeInput).trim().toUpperCase();
    if (!formatted || linkingEstablishment) return;

    if (connectedEstablishments.some((h) => String(h.code || '').toUpperCase() === formatted)) {
      triggerToast?.('Você já está vinculado a este estabelecimento.', 'err');
      return;
    }

    setLinkingEstablishment(true);
    try {
      if (typeof onLinkEstablishment === 'function') {
        const result = await onLinkEstablishment(formatted);
        const list = Array.isArray(result?.connectedEstablishments)
          ? result.connectedEstablishments
          : [];
        setConnectedEstablishments(list);
        setNewEstablishmentCodeInput('');
        triggerToast?.(
          profile === 'freelancer'
            ? 'Estabelecimento vinculado e salvo. Você já aparece na base do local.'
            : 'Estabelecimento vinculado e salvo.',
          'ok'
        );
      } else {
        const found = await findHotelByCode(formatted);
        const newEst = {
          id: found.id,
          code: found.code,
          name: found.name,
          category: found.city ? `Unidade · ${found.city}` : 'Unidade vinculada',
          role: profile === 'gerencia'
            ? (account.department || 'Gerência Operacional')
            : (account.primaryRole || 'Freelancer'),
          status: 'Ativo',
          joinedAt: new Date().toLocaleDateString('pt-BR'),
          totalShifts: 0,
          rating: null,
          isPrimary: connectedEstablishments.length === 0,
        };
        syncConnected([...connectedEstablishments, newEst]);
        setNewEstablishmentCodeInput('');
        triggerToast?.('Estabelecimento vinculado. Clique em Salvar configurações para gravar.', 'ok');
      }
    } catch (err) {
      triggerToast?.(err.message || 'Não foi possível vincular o estabelecimento.', 'err');
    } finally {
      setLinkingEstablishment(false);
    }
  };

  const tryAutoConnectFromPaste = (raw) => {
    const formatted = String(raw || '').trim().toUpperCase();
    if (!formatted || linkingEstablishment) return;
    if (!/^[A-Z0-9]{2,}(-[A-Z0-9]{2,})*$/.test(formatted)) return;
    setNewEstablishmentCodeInput(formatted);
    handleConnectEstablishment(null, formatted);
  };

  const handleDisconnectEstablishment = (id, name) => {
    setDisconnectTarget({ id, name });
  };

  const confirmDisconnectEstablishment = async () => {
    if (!disconnectTarget) return;
    const target = disconnectTarget;
    setDisconnectTarget(null);
    try {
      if (typeof onUnlinkEstablishment === 'function') {
        const result = await onUnlinkEstablishment(target.id);
        setConnectedEstablishments(Array.isArray(result?.connectedEstablishments) ? result.connectedEstablishments : []);
        triggerToast?.(`Conta desvinculada de ${target.name}.`, 'ok');
      } else {
        syncConnected(connectedEstablishments.filter((h) => h.id !== target.id));
        triggerToast?.(`Conta desvinculada de ${target.name}. Salve para gravar.`, 'ok');
      }
    } catch (err) {
      triggerToast?.(err.message || 'Não foi possível desvincular.', 'err');
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
      setPhotoError('A foto precisa ter até 2 MB.');
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
      ? 'Demanda do estabelecimento, diárias, códigos de vínculo e regras oficiais de convocação.'
      : profile === 'gerencia'
        ? 'Seu perfil, estabelecimentos vinculados, ocupação da semana e alertas do salão.'
        : 'Seus dados de recebimento, conexão multi-estabelecimentos e preferências de escala.';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '880px', width: '100%' }}>
      <div>
        <h1 className="page-title">Configurações</h1>
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
              ? 'Aparece no painel operacional da gerência.'
              : profile === 'rh'
                ? 'Aparece nas aprovações e convocações de equipe.'
                : 'Nome e função que o estabelecimento vê nos convites.'
          }
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px', flexWrap: 'wrap' }}>
            <Avatar
              src={account.photoUrl}
              name={account.name || displayName}
              size={72}
              radius="4px"
              fontSize={20}
              style={{ background: '#F1F5F9', color: '#0F172A', border: '1px solid #E2E8F0' }}
            />
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
                JPG ou PNG, até 2 MB. Aparece na barra lateral e no seu perfil. Não altera as fotos da base de freelancers.
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
                value={account.phone || ''}
                onChange={(e) => onChangeAccount('phone', e.target.value)}
                placeholder="(21) 99999-9999"
              />
            </Field>
            {profile === 'freelancer' ? (
              <>
                <Field label="Função principal">
                  <select
                    style={inputStyle}
                    value={account.primaryRole || 'Garçom'}
                    onChange={(e) => onChangeAccount('primaryRole', e.target.value)}
                  >
                    {['Garçom', 'Bartender', 'Recepcionista', 'Cozinheiro', 'Camareira', 'Cumin'].map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Cidade / região">
                  <input
                    style={inputStyle}
                    value={account.city || ''}
                    onChange={(e) => onChangeAccount('city', e.target.value)}
                    placeholder="Ex.: Rio de Janeiro"
                  />
                </Field>
              </>
            ) : (
              <>
                <Field label="Estabelecimento vinculado">
                  <input
                    style={{ ...inputStyle, background: '#F8FAFC' }}
                    value={establishmentName || account.hotelOrRole || ''}
                    readOnly
                    title="Vínculo definido no cadastro / código do RH"
                  />
                </Field>
                {profile === 'rh' && (
                  <>
                    <Field label="CNPJ">
                      <input
                        style={{ ...inputStyle, background: '#F8FAFC' }}
                        value={establishmentCnpj ? formatCnpjDisplay(establishmentCnpj) : '—'}
                        readOnly
                      />
                    </Field>
                    <Field label="Código do estabelecimento">
                      <input
                        style={{ ...inputStyle, background: '#F8FAFC', fontFamily: 'monospace', fontWeight: 700 }}
                        value={establishmentCode || 'Gere ao concluir o onboarding'}
                        readOnly
                      />
                    </Field>
                  </>
                )}
                {profile === 'gerencia' && establishmentCode && (
                  <Field label="Código do estabelecimento">
                    <input
                      style={{ ...inputStyle, background: '#F8FAFC', fontFamily: 'monospace', fontWeight: 700 }}
                      value={establishmentCode}
                      readOnly
                    />
                  </Field>
                )}
                <Field label={profile === 'rh' ? 'Departamento' : 'Cargo'}>
                  <input
                    style={inputStyle}
                    value={account.department || ''}
                    onChange={(e) => onChangeAccount('department', e.target.value)}
                    placeholder={profile === 'rh' ? 'RH / Controladoria' : 'Gerência Operacional'}
                  />
                </Field>
              </>
            )}
          </div>
          {profile === 'freelancer' && (
            <div style={{ marginTop: '12px', fontSize: '12px', color: '#64748B' }}>
              Estabelecimentos vinculados ficam na aba <strong>Meus Estabelecimentos</strong> — começam vazios até você conectar com um código.
            </div>
          )}
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
                  Compartilhe este identificador com sua gerência e equipe de freelancers para que eles se vinculem a este estabelecimento.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255, 255, 255, 0.1)', padding: '10px 16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>ID:</span>
                <span style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'monospace', color: '#FBBF24', letterSpacing: '1px' }}>
                  {establishmentCode || '—'}
                </span>
                <button
                  type="button"
                  onClick={() => establishmentCode && copyText(establishmentCode, 'code')}
                  disabled={!establishmentCode}
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    color: '#FFF',
                    cursor: establishmentCode ? 'pointer' : 'not-allowed',
                    opacity: establishmentCode ? 1 : 0.5,
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
            <Card title="Link Direto para Freelancers" hint="Para novos profissionais se cadastrarem e entrarem na sua base de convocação.">
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

            <Card title="Link de Acesso para Gerência" hint="Para Gerentes, Maîtres, Governança e Chefes de Cozinha gerenciarem turnos e extras.">
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
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '4px',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#EFF6FF', color: '#0066FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>Equipe sincronizada</div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    {managementTeam.filter((m) => m.role === 'gerencia').length} na Gerência
                    {' · '}
                    {freelancersCount} freelancers na base
                  </div>
                </div>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: '#16A34A', background: '#DCFCE7', padding: '4px 10px', borderRadius: '100px' }}>
                <Check size={12} /> Sincronização em tempo real ativa
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                Gerência vinculada
              </div>
              {managementTeam.filter((m) => m.role === 'gerencia').length === 0 ? (
                <div style={{
                  padding: '12px 14px',
                  border: '1px dashed #CBD5E1',
                  borderRadius: '4px',
                  background: '#F8FAFC',
                  fontSize: '13px',
                  color: '#64748B',
                }}>
                  Nenhuma gerência vinculada ainda. Compartilhe o link de Gerência acima.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {managementTeam.filter((m) => m.role === 'gerencia').map((member) => (
                      <div
                        key={member.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                          padding: '10px 12px',
                          border: '1px solid #E2E8F0',
                          borderRadius: '4px',
                          background: '#F8FAFC',
                        }}
                      >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                          <Avatar
                            src={member.photoUrl}
                            name={member.name}
                            size={34}
                            style={{ background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0' }}
                          />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {member.name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748B' }}>
                              {member.department || 'Gerência Operacional'}
                              {member.phone ? ` · ${member.phone}` : ''}
                            </div>
                          </div>
                        </div>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#15803D',
                          background: '#DCFCE7',
                          padding: '3px 8px',
                          borderRadius: '100px',
                          flexShrink: 0,
                        }}>
                          Gerência
                        </span>
                      </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ fontSize: '12px', color: '#94A3B8' }}>
              Freelancers ficam na <strong style={{ color: '#64748B' }}>Base de freelancers</strong> ({freelancersCount}).
            </div>
          </div>
        </div>
      )}

      {/* GERENCIA: ESTABELECIMENTOS E UNIDADES */}
      {activeTab === 'estabelecimentos' && profile === 'gerencia' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Card title="Estabelecimentos e Unidades Conectadas" hint="Como gerente de setor, você pode acompanhar e gerenciar turnos das suas casas e filiais vinculadas.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {displayedEstablishments.length === 0 && (
                <div style={{
                  padding: '16px',
                  border: '1px dashed #CBD5E1',
                  borderRadius: '4px',
                  background: '#F8FAFC',
                  fontSize: '13px',
                  color: '#64748B',
                  textAlign: 'center',
                }}>
                  Nenhum estabelecimento vinculado ainda. Use o código do convite ou vincule abaixo.
                </div>
              )}
              {displayedEstablishments.map((h) => (
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
                        Segmento: <strong style={{ color: '#334155' }}>{h.category}</strong> • Função: <strong style={{ color: '#334155' }}>{h.role}</strong> • Vinculado desde {h.joinedAt}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#16A34A', background: '#DCFCE7', padding: '3px 8px', borderRadius: '100px' }}>
                      Ativo
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
                        alignItems: 'center',
                      }}
                      title="Desvincular deste estabelecimento"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}

              <form onSubmit={handleConnectEstablishment} style={{ display: 'flex', gap: '8px', marginTop: '8px', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
                <input
                  style={{ ...inputStyle, flex: 1, fontFamily: 'monospace', textTransform: 'uppercase' }}
                  placeholder="Digite o Código de outro estabelecimento ou filial (Ex: HOT-TEST)"
                  value={newEstablishmentCodeInput}
                  onChange={(e) => setNewEstablishmentCodeInput(e.target.value)}
                  onPaste={(e) => {
                    const text = e.clipboardData?.getData('text');
                    if (text) {
                      e.preventDefault();
                      tryAutoConnectFromPaste(text);
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={linkingEstablishment}
                  style={{
                    background: '#0066FF',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '8px 14px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: linkingEstablishment ? 'wait' : 'pointer',
                    opacity: linkingEstablishment ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Plus size={14} /> {linkingEstablishment ? 'Vinculando...' : 'Vincular Unidade'}
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
          }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E3A8A' }}>Multi-Estabelecimentos Inteligente e Unificado</div>
            <div style={{ fontSize: '12px', color: '#1E40AF', marginTop: '2px', lineHeight: '1.4' }}>
              Você pode conectar-se a vários restaurantes, hotéis, bares e buffets parceiros! Ao aceitar um plantão no <strong>Estabelecimento A</strong> para determinado turno, o sistema bloqueia automaticamente sua agenda no <strong>Estabelecimento B</strong>, evitando choque de horários e preservando sua reputação.
            </div>
          </div>

          <Card title="Estabelecimentos Vinculados a Sua Conta" hint="Você recebe convites só dos estabelecimentos que conectar abaixo.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {displayedEstablishments.length === 0 && (
                <div style={{
                  padding: '16px',
                  border: '1px dashed #CBD5E1',
                  borderRadius: '4px',
                  background: '#F8FAFC',
                  fontSize: '13px',
                  color: '#64748B',
                  textAlign: 'center',
                }}>
                  Nenhum estabelecimento vinculado ainda. Use o código do convite ou vincule abaixo.
                </div>
              )}
              {displayedEstablishments.map((h) => (
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
                        Tipo: <strong style={{ color: '#334155' }}>{h.category}</strong> • Função: <strong style={{ color: '#334155' }}>{h.role}</strong>
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
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Conectar a um novo estabelecimento:</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    style={{ ...inputStyle, flex: 1, fontFamily: 'monospace', textTransform: 'uppercase' }}
                    placeholder="Cole o código (Ex: HOT-TEST)"
                    value={newEstablishmentCodeInput}
                    onChange={(e) => setNewEstablishmentCodeInput(e.target.value)}
                    onPaste={(e) => {
                      const text = e.clipboardData?.getData('text');
                      if (text) {
                        e.preventDefault();
                        tryAutoConnectFromPaste(text);
                      }
                    }}
                  />
                  <button
                    type="submit"
                    disabled={linkingEstablishment}
                    style={{
                      background: '#0066FF',
                      color: '#FFF',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '8px 14px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: linkingEstablishment ? 'wait' : 'pointer',
                      opacity: linkingEstablishment ? 0.7 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <Plus size={14} /> {linkingEstablishment ? 'Conectando...' : 'Conectar'}
                  </button>
                </div>
                <span style={{ fontSize: '11px', color: '#64748B' }}>
                  Cole o código do RH — o vínculo é salvo na hora, sem precisar clicar em Salvar configurações.
                </span>
              </form>
            </div>
          </Card>
        </div>
      )}
      {/* RH: OPERACAO */}
      {activeTab === 'operacao' && profile === 'rh' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Card title="Pessoas por dia" hint="Previsão de pessoas (clientes, hóspedes, movimento) da semana atual. Clique em Salvar configurações para gravar.">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px' }}>
              {days.map((d) => (
                <Field key={d.id || d.key} label={`${d.label || d.short} ${d.date || ''}`}>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    style={inputStyle}
                    value={softNumberValue(guestCountByDay[d.id || d.key])}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw !== '' && !/^\d+$/.test(raw)) return;
                      onChangeGuests(d.id || d.key, raw);
                    }}
                  />
                </Field>
              ))}
            </div>
          </Card>
          <Card title="Meta de freelancers" hint="Regra usada para aconselhar quantos profissionais montar na escala. Salve para gravar.">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <Field label="1 profissional a cada (pessoas)">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  style={inputStyle}
                  value={softNumberValue(tech.peoplePerStaff ?? 25)}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw !== '' && !/^\d+$/.test(raw)) return;
                    onChangeTech('peoplePerStaff', raw === '' ? '' : Math.max(1, parseInt(raw, 10) || 1));
                  }}
                />
              </Field>
              <Field label="Mínimo por dia">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  style={inputStyle}
                  value={softNumberValue(tech.minStaff ?? 6)}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw !== '' && !/^\d+$/.test(raw)) return;
                    onChangeTech('minStaff', raw === '' ? '' : Math.max(1, parseInt(raw, 10) || 1));
                  }}
                />
              </Field>
            </div>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '12px 0 0', lineHeight: 1.45 }}>
              Ex.: com 100 pessoas e 1 a cada 25, a meta sugerida é 4 (ou o mínimo, o que for maior).
            </p>
          </Card>
          <Card title="Gatilhos de ocupação e demanda" hint="Controle quando o sistema sugere vagas extras para a gerência.">
            <ToggleRow
              title="Sugerir extras em alta ocupação e movimento"
              hint="Aumenta a meta de equipe e avisa nas Escalas quando a ocupação do dia passa de 85% da capacidade estimada."
              checked={!!tech.suggestOnHighOccupancy}
              onChange={(v) => onChangeTech('suggestOnHighOccupancy', v)}
            />
            <ToggleRow
              title="Auto-ajuste por histórico"
              hint="Usa a média de pessoas da semana atual para calibrar a quantidade recomendada por dia."
              checked={!!tech.autoScaleHistory}
              onChange={(v) => onChangeTech('autoScaleHistory', v)}
            />
          </Card>
        </div>
      )}

      {/* RH: DIARIAS */}
      {activeTab === 'diarias' && profile === 'rh' && (
        <Card title="Valores de diária" hint="Tabela padrão aplicada nas convocações automáticas e manuais. Salve para gravar.">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px', fontSize: '11px', fontWeight: 500, color: '#64748B', textTransform: 'uppercase' }}>Função</th>
                  {RATE_FIELDS.map((rf) => (
                    <th key={rf.key} style={{ padding: '8px 10px', fontSize: '11px', fontWeight: 500, color: '#64748B', textTransform: 'uppercase' }}>{rf.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(rates) && rates.length ? rates : []).map((row) => (
                  <tr key={row.role} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '10px', fontWeight: 500, color: '#0F172A' }}>{row.role}</td>
                    {RATE_FIELDS.map((rf) => (
                      <td key={rf.key} style={{ padding: '8px 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '12px', color: '#64748B' }}>R$</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            style={{ ...inputStyle, maxWidth: '100px' }}
                            value={softNumberValue(row[rf.key])}
                            onChange={(e) => {
                              const raw = e.target.value;
                              if (raw !== '' && !/^\d+$/.test(raw)) return;
                              onChangeRate(row.role, rf.key, raw);
                            }}
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
                {(!Array.isArray(rates) || rates.length === 0) && (
                  <tr>
                    <td colSpan={4} style={{ padding: '16px 10px', color: '#94A3B8', textAlign: 'center' }}>
                      Nenhuma tabela de diárias carregada ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* RH: CONVOCACAO */}
      {activeTab === 'convocacao' && profile === 'rh' && (
        <Card title="Regras de convocação" hint="Tempo de resposta do profissional e prioridade de lista.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Field label="Tempo máximo de aceite">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    style={{ ...inputStyle, maxWidth: '72px' }}
                    value={acceptHours}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw !== '' && !/^\d+$/.test(raw)) return;
                      setAcceptHours(raw);
                      if (raw !== '') commitAcceptTimeout(raw, acceptMins === '' ? '0' : acceptMins);
                    }}
                    onBlur={() => {
                      const h = acceptHours === '' ? '0' : acceptHours;
                      const m = acceptMins === '' ? '0' : acceptMins;
                      setAcceptHours(h);
                      setAcceptMins(m);
                      commitAcceptTimeout(h, m);
                    }}
                  />
                  <span style={{ fontSize: '13px', color: '#64748B' }}>h</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    style={{ ...inputStyle, maxWidth: '72px' }}
                    value={acceptMins}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw !== '' && !/^\d+$/.test(raw)) return;
                      setAcceptMins(raw);
                      if (raw !== '') commitAcceptTimeout(acceptHours === '' ? '0' : acceptHours, raw);
                    }}
                    onBlur={() => {
                      const h = acceptHours === '' ? '0' : acceptHours;
                      const m = acceptMins === '' ? '0' : acceptMins;
                      setAcceptHours(h);
                      setAcceptMins(m);
                      commitAcceptTimeout(h, m);
                    }}
                  />
                  <span style={{ fontSize: '13px', color: '#64748B' }}>min</span>
                </div>
              </div>
            </Field>
            <ToggleRow
              title="Disparo automático via WhatsApp"
              hint="Quando ativo, a próxima convocação sugere enviar ao seguinte da fila se ninguém responder no prazo (regra salva nas configurações)."
              checked={!!tech.autoWhatsapp}
              onChange={(v) => onChangeTech('autoWhatsapp', v)}
            />
          </div>
        </Card>
      )}

      {/* GERENCIA: OCUPACAO */}
      {activeTab === 'setor' && profile === 'gerencia' && (
        <>
        <Card title="Meta de freelancers" hint="Mesma regra do RH: aconselha quantos profissionais montar na escala. Salve para gravar.">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <Field label="1 profissional a cada (pessoas)">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                style={inputStyle}
                value={softNumberValue(tech.peoplePerStaff ?? 25)}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw !== '' && !/^\d+$/.test(raw)) return;
                  onChangeTech('peoplePerStaff', raw === '' ? '' : Math.max(1, parseInt(raw, 10) || 1));
                }}
              />
            </Field>
            <Field label="Mínimo por dia">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                style={inputStyle}
                value={softNumberValue(tech.minStaff ?? 6)}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw !== '' && !/^\d+$/.test(raw)) return;
                  onChangeTech('minStaff', raw === '' ? '' : Math.max(1, parseInt(raw, 10) || 1));
                }}
              />
            </Field>
          </div>
        </Card>
        <Card title={'Demanda da semana  ' + sectorLabel} hint="Previsão de pessoas por dia (clientes, hóspedes, convidados…). Clique em Salvar configurações para gravar.">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px' }}>
            {days.map((d) => {
              const kind = typeof rateKindForDay === 'function' ? rateKindForDay(d) : 'week';
              const kindLabel = typeof rateKindLabel === 'function'
                ? rateKindLabel(kind)
                : (rateKindLabel?.[kind] || kind);
              return (
                <Field key={d.id || d.key} label={`${d.label || d.short} (${kindLabel})`}>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    style={inputStyle}
                    value={softNumberValue(guestCountByDay[d.id || d.key])}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw !== '' && !/^\d+$/.test(raw)) return;
                      onChangeGuests(d.id || d.key, raw);
                    }}
                  />
                </Field>
              );
            })}
          </div>
        </Card>
        </>
      )}

      {/* GERENCIA: ALERTAS */}
      {activeTab === 'alertas' && profile === 'gerencia' && (
        <Card title="Alertas operacionais" hint="Avisos no painel da gerência durante o turno.">
          <ToggleRow
            title="Alerta de pico de atendimento"
            hint="Notifica quando a contagem de clientes ou reservas exceder a capacidade normal do turno."
            checked={!!tech.alertPeak}
            onChange={(v) => onChangeTech('alertPeak', v)}
          />
          <ToggleRow
            title="Lembrete de confirmação de extras"
            hint="Avisa 2h antes do turno se todos os profissionais convocados confirmaram presença."
            checked={!!tech.alertConfirmations}
            onChange={(v) => onChangeTech('alertConfirmations', v)}
          />
        </Card>
      )}

      {/* FREELANCER: AVISOS */}
      {activeTab === 'avisos' && profile === 'freelancer' && (
        <Card title="Canais de aviso" hint="Como você quer receber chamados de plantão.">
          <ToggleRow
            title="Notificação no WhatsApp"
            hint="Receber mensagem direta quando um estabelecimento parceiro convocar seu perfil."
            checked={tech.notifyWhatsapp !== false}
            onChange={(v) => onChangeTech('notifyWhatsapp', v)}
          />
          <ToggleRow
            title="Avisos de novas vagas abertas"
            hint="Receber lista de plantões extras nos fins de semana e feriados."
            checked={tech.notifyOpenSlots !== false}
            onChange={(v) => onChangeTech('notifyOpenSlots', v)}
          />
        </Card>
      )}

      {onSave && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}>
          <button
            type="button"
            className="btn-primary"
            disabled={saving}
            onClick={() => onSave()}
            style={{ opacity: saving ? 0.7 : 1, cursor: saving ? 'wait' : 'pointer' }}
          >
            {saving ? 'Salvando…' : 'Salvar configurações'}
          </button>
        </div>
      )}

      {disconnectTarget && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.4)',
            zIndex: 90,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
          onClick={() => setDisconnectTarget(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '420px',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '4px',
              padding: '22px',
              boxShadow: '0 12px 40px rgba(15, 23, 42, 0.12)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>
              Sair deste estabelecimento?
            </div>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '8px 0 0', lineHeight: 1.5 }}>
              Você vai desvincular <strong style={{ color: '#0F172A' }}>{disconnectTarget.name}</strong> da sua conta.
              Deixa de receber convites e plantões deste local.
            </p>
            <div style={{
              marginTop: '14px',
              padding: '10px 12px',
              background: '#FFF7ED',
              border: '1px solid #FED7AA',
              borderRadius: '4px',
              fontSize: '12px',
              color: '#9A3412',
              lineHeight: 1.45,
            }}>
              Isso não apaga seu histórico. Você pode conectar de novo depois com o código do RH.
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '18px' }}>
              <button
                type="button"
                onClick={() => setDisconnectTarget(null)}
                className="btn-outline"
                style={{ flex: 1, justifyContent: 'center', padding: '10px' }}
              >
                Manter vínculo
              </button>
              <button
                type="button"
                onClick={confirmDisconnectEstablishment}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: 'none',
                  borderRadius: '4px',
                  background: '#DC2626',
                  color: '#FFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Desvincular
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

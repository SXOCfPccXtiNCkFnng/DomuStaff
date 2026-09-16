import React, { useState, useEffect, useRef } from 'react';

const RATE_FIELDS = [
  { key: 'week', label: 'Semana (seg–sex)' },
  { key: 'weekend', label: 'Fim de semana' },
  { key: 'holiday', label: 'Feriado' },
];

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

function Card({ title, hint, children }) {
  return (
    <section style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '2px' }}>
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
      { id: 'operacao', label: 'Operação' },
      { id: 'diarias', label: 'Diárias' },
      { id: 'convocacao', label: 'Convocação' },
    ];
  }
  if (profile === 'gerencia') {
    return [
      { id: 'perfil', label: 'Perfil' },
      { id: 'setor', label: 'Ocupação' },
      { id: 'alertas', label: 'Alertas' },
    ];
  }
  return [
    { id: 'perfil', label: 'Perfil' },
    { id: 'avisos', label: 'Avisos' },
  ];
}

export default function SettingsView({
  profile,
  rates,
  onChangeRate,
  days,
  guestCountByDay,
  onChangeGuests,
  rateKindForDay,
  rateKindLabel,
  account,
  onChangeAccount,
  tech,
  onChangeTech,
  defaultSector,
  userName,
  userRole,
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
      ? 'Ocupação do hotel, diárias e regras oficiais de convocação.'
      : profile === 'gerencia'
        ? 'Seu perfil, ocupação da semana e alertas do salão — sem diárias.'
        : 'Seus dados e como você recebe convites de escala.';

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

      {activeTab === 'perfil' && (
        <Card
          title="Dados da conta"
          hint={
            profile === 'gerencia'
              ? 'Aparece no painel do maître.'
              : profile === 'rh'
                ? 'Aparece nas aprovações e convocações.'
                : 'Nome e função que o hotel vê nos convites.'
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
              <div style={{ fontSize: '12px', color: '#64748B' }}>
                JPG ou PNG, até 2 MB. Aparece na barra, ao lado do seu nome.
              </div>
              {photoError && <div style={{ fontSize: '12px', color: '#DC2626' }}>{photoError}</div>}
              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>
          <div className="form-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Field label="Nome">
              <input
                style={inputStyle}
                value={account.name || userName || ''}
                onChange={(e) => onChangeAccount('name', e.target.value)}
              />
            </Field>
            <Field label="WhatsApp">
              <input style={inputStyle} value={account.phone} onChange={(e) => onChangeAccount('phone', e.target.value)} />
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
                    value={account.city || 'Rio de Janeiro'}
                    onChange={(e) => onChangeAccount('city', e.target.value)}
                    placeholder="Ex.: Rio de Janeiro"
                  />
                </Field>
              </>
            ) : (
              <>
                <Field label="Hotel / unidade">
                  <input style={inputStyle} value={account.hotelOrRole} onChange={(e) => onChangeAccount('hotelOrRole', e.target.value)} />
                </Field>
                <Field label={profile === 'gerencia' ? 'Cargo' : 'Departamento'}>
                  <input
                    style={inputStyle}
                    value={account.department || userRole || ''}
                    onChange={(e) => onChangeAccount('department', e.target.value)}
                    placeholder={profile === 'gerencia' ? 'Maître' : 'RH / Controladoria'}
                  />
                </Field>
              </>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'avisos' && profile === 'freelancer' && (
        <Card title="Avisos" hint="Como o Domu te avisa sobre escalas.">
          <ToggleRow
            title="Convites no WhatsApp"
            hint="Receber pacotes de turnos pelo WhatsApp (aceitar todos de uma vez)."
            checked={tech.whatsappNotifications}
            onChange={(v) => onChangeTech('whatsappNotifications', v)}
          />
          <ToggleRow
            title="Lembrete antes do turno"
            hint="Aviso no dia, algumas horas antes do horário."
            checked={tech.shiftReminder !== false}
            onChange={(v) => onChangeTech('shiftReminder', v)}
          />
          <ToggleRow
            title="Confirmação de presença"
            hint="Quando o maître marcar você como presente no salão."
            checked={tech.presenceNotify !== false}
            onChange={(v) => onChangeTech('presenceNotify', v)}
          />
        </Card>
      )}

      {activeTab === 'setor' && profile === 'gerencia' && (
        <Card
          title="Hóspedes da semana"
          hint={`Setor: ${sectorLabel}. Esses números definem a meta de pessoas ao montar a escala.`}
        >
          <div className="week-strip" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
            {days.map((day) => (
              <label key={day.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>
                  {day.label} {day.date}
                </span>
                <input
                  type="number"
                  min="0"
                  value={guestCountByDay[day.id]}
                  onChange={(e) => onChangeGuests(day.id, e.target.value)}
                  style={{ ...inputStyle, fontWeight: 600, fontSize: '14px' }}
                />
                <span style={{ fontSize: '11px', color: '#64748B' }}>hóspedes</span>
              </label>
            ))}
          </div>
        </Card>
      )}

      {/* RH: ocupação do hotel */}
      {activeTab === 'operacao' && profile === 'rh' && (
        <Card
          title="Ocupação da semana"
          hint="Base do hotel. A meta de equipe nas escalas acompanha esse número."
        >
          <div className="week-strip" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
            {days.map((day) => (
              <label key={day.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>
                  {day.label} {day.date}
                </span>
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>{rateKindLabel[rateKindForDay(day.id)]}</span>
                <input
                  type="number"
                  min="0"
                  value={guestCountByDay[day.id]}
                  onChange={(e) => onChangeGuests(day.id, e.target.value)}
                  style={{ ...inputStyle, fontWeight: 600, fontSize: '14px' }}
                />
                <span style={{ fontSize: '11px', color: '#64748B' }}>hóspedes</span>
              </label>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'diarias' && profile === 'rh' && (
        <Card
          title="Tabela de diárias"
          hint="Só o RH edita e vê. Semana, fim de semana e feriado por função."
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '0 12px 8px 0', fontSize: '11px', fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Função</th>
                {RATE_FIELDS.map((field) => (
                  <th key={field.key} style={{ padding: '0 8px 8px', fontSize: '11px', fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {field.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rates.map((row) => (
                <tr key={row.role} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '10px 12px 10px 0', fontSize: '13px', fontWeight: 500, color: '#0F172A' }}>{row.role}</td>
                  {RATE_FIELDS.map((field) => (
                    <td key={field.key} style={{ padding: '8px' }}>
                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={row[field.key]}
                        onChange={(e) => onChangeRate(row.role, field.key, e.target.value)}
                        style={inputStyle}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* RH: regras oficiais */}
      {activeTab === 'convocacao' && profile === 'rh' && (
        <>
          <Card title="Canais oficiais" hint="Só o RH dispara convite oficial.">
            <ToggleRow
              title="Convocação via WhatsApp"
              hint="Enviar convites (e pacotes de dias) no celular do freelancer."
              checked={tech.whatsappNotifications}
              onChange={(v) => onChangeTech('whatsappNotifications', v)}
            />
            <ToggleRow
              title="E-mail de resumo diário"
              hint="Um e-mail pela manhã com custo e status das escalas."
              checked={tech.dailyEmail}
              onChange={(v) => onChangeTech('dailyEmail', v)}
            />
          </Card>
          <Card title="Regras de convocação">
            <div className="form-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <Field label="Prazo para responder (horas)">
                <input
                  type="number"
                  min="1"
                  style={inputStyle}
                  value={tech.inviteTimeoutHours}
                  onChange={(e) => onChangeTech('inviteTimeoutHours', e.target.value)}
                />
              </Field>
              <Field label="Fuso horário">
                <select
                  style={inputStyle}
                  value={tech.timezone}
                  onChange={(e) => onChangeTech('timezone', e.target.value)}
                >
                  <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
                  <option value="America/Manaus">Manaus (GMT-4)</option>
                  <option value="America/Noronha">Fernando de Noronha (GMT-2)</option>
                </select>
              </Field>
            </div>
            <div style={{ marginTop: '4px' }}>
              <ToggleRow
                title="Sugestão automática de substituto"
                hint="Se o convite expirar, indicar o próximo da lista com o mesmo perfil."
                checked={tech.autoSubstitute}
                onChange={(v) => onChangeTech('autoSubstitute', v)}
              />
            </div>
          </Card>
        </>
      )}

      {activeTab === 'alertas' && profile === 'gerencia' && (
        <Card
          title="Alertas do setor"
          hint="Avisos operacionais. Convite oficial e diárias ficam com o RH."
        >
          <ToggleRow
            title="Cancelamento de última hora"
            hint="Avisar se alguém do seu setor recusar ou faltar com menos de 4h."
            checked={tech.emergencyAlerts}
            onChange={(v) => onChangeTech('emergencyAlerts', v)}
          />
          <ToggleRow
            title="Escala devolvida pelo RH"
            hint="Notificar quando o RH devolver um pedido com motivo."
            checked={tech.returnAlerts !== false}
            onChange={(v) => onChangeTech('returnAlerts', v)}
          />
          <ToggleRow
            title="Lembrete do turno de hoje"
            hint="Antes do início do turno, lembrar de confirmar presença no salão."
            checked={tech.shiftReminder !== false}
            onChange={(v) => onChangeTech('shiftReminder', v)}
          />
        </Card>
      )}

      <div>
        <button type="button" className="btn-primary" onClick={onSave}>
          Salvar configurações
        </button>
      </div>
    </div>
  );
}

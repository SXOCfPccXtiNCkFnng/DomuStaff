import React from 'react';
import {
  Calendar, Clock, MapPin, Check, X, Bell
} from 'lucide-react';

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const SHIFTS = [
  { id: 'manha', label: '07h – 15h', hint: 'Manhã' },
  { id: 'comercial', label: '09h – 17h', hint: 'Intermediário' },
  { id: 'tarde', label: '15h – 23h', hint: 'Tarde / Noite' },
  { id: 'noturno', label: '23h – 07h', hint: 'Noturno' },
];

function InviteCard({ invite, onAccept, onDecline }) {
  const isPending = invite.status === 'pending';
  const statusLabel = isPending ? 'Pendente' : invite.status === 'accepted' ? 'Aceito' : 'Recusado';
  const statusClass = isPending ? 'warn' : invite.status === 'accepted' ? 'ok' : '';
  const dayCount = invite.days?.length || 1;
  const isPackage = dayCount > 1;

  return (
    <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.01em' }}>
            {invite.hotel}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '3px' }}>
            {invite.sector} · {invite.role}
            {isPackage ? ` · ${dayCount} turnos` : ''}
          </div>
        </div>
        <span className={`status-tag ${statusClass}`}>{statusLabel}</span>
      </div>

      {isPackage && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          padding: '12px',
          background: '#F8FAFC',
          border: '1px solid var(--border)',
          borderRadius: '2px',
        }}>
          {invite.days.map((d) => (
            <span
              key={d.id || `${d.dayLabel}-${d.dayNum}`}
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--ink)',
                background: '#FFFFFF',
                border: '1px solid var(--border)',
                borderRadius: '2px',
                padding: '4px 8px',
              }}
            >
              {d.label || d.dayLabel} {d.date || d.dayNum}
            </span>
          ))}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '14px 20px',
        borderTop: '1px solid var(--border)',
        paddingTop: '16px'
      }}>
        {[
          { icon: Calendar, label: isPackage ? 'Datas' : 'Data', value: invite.date },
          { icon: Clock, label: 'Horário', value: invite.time },
          { icon: MapPin, label: 'Local', value: invite.location },
        ].map((row) => (
          <div key={row.label} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <row.icon size={15} color="#94A3B8" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '11px', color: 'var(--muted-2)', fontWeight: 500 }}>{row.label}</div>
              <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink)', marginTop: '1px' }}>
                {row.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {invite.notes && (
        <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>
          {invite.notes}
        </p>
      )}

      {isPending && (
        <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
          <button type="button" onClick={() => onAccept(invite.id)} className="btn-primary" style={{ flex: 1 }}>
            <Check size={15} /> {isPackage ? 'Aceitar todos' : 'Aceitar'}
          </button>
          <button
            type="button"
            onClick={() => onDecline(invite.id)}
            className="btn-outline"
            style={{ flex: 1, color: 'var(--danger)', borderColor: '#FECACA' }}
          >
            <X size={15} /> Recusar
          </button>
        </div>
      )}
    </div>
  );
}

export default function FreelancerDashboard({
  view,
  invites,
  onAccept,
  onDecline,
  agenda,
  availableDays,
  availableTimes,
  onToggleDay,
  onToggleTime,
  onSelectAllDays,
  onSelectWeekends,
  onSaveAvailability,
  userName,
}) {
  const pending = invites.filter((i) => i.status === 'pending');
  const accepted = invites.filter((i) => i.status === 'accepted');
  const firstName = (userName || 'Profissional').split(' ')[0];

  if (view === 'freelancer_convites') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h1 className="page-title">Olá, {firstName}</h1>
            <p className="page-sub">
              Convites de escala. Pacotes de vários dias aceitam-se de uma vez.
              {pending.length > 0 ? ` · ${pending.length} pendente${pending.length > 1 ? 's' : ''}` : ''}
            </p>
          </div>
          {pending.length > 0 && (
            <span className="status-tag warn">
              <Bell size={12} /> {pending.length}
            </span>
          )}
        </div>

        {invites.length === 0 ? (
          <div className="card" style={{ padding: '48px 24px', textAlign: 'center', borderStyle: 'dashed' }}>
            <div style={{ fontWeight: 500, color: 'var(--ink)', marginBottom: '4px' }}>Nenhum convite</div>
            <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
              Quando o RH enviar uma escala, ela aparece aqui.
            </div>
          </div>
        ) : (
          <div className="invite-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '12px' }}>
            {[...pending, ...invites.filter((i) => i.status !== 'pending')].map((inv) => (
              <InviteCard key={inv.id} invite={inv} onAccept={onAccept} onDecline={onDecline} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (view === 'freelancer_agenda') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h1 className="page-title">Agenda</h1>
          <p className="page-sub">
            Turnos confirmados · {accepted.length} escala{accepted.length !== 1 ? 's' : ''} aceita{accepted.length !== 1 ? 's' : ''}
          </p>
        </div>

        {agenda.length === 0 ? (
          <div className="card" style={{ padding: '48px 24px', textAlign: 'center', borderStyle: 'dashed' }}>
            <Calendar size={22} color="#94A3B8" style={{ marginBottom: '10px' }} />
            <div style={{ fontWeight: 500, color: 'var(--ink)' }}>Nenhum turno confirmado</div>
            <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
              Aceite um convite para vê-lo aqui.
            </div>
          </div>
        ) : (
          <div className="card" style={{ overflow: 'hidden' }}>
            {agenda.map((shift, idx) => (
              <div
                key={shift.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  padding: '16px 20px',
                  borderBottom: idx < agenda.length - 1 ? '1px solid var(--border)' : 'none',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    minWidth: '52px',
                    textAlign: 'center',
                    borderRight: '1px solid var(--border)',
                    paddingRight: '16px',
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 500, color: 'var(--muted)', textTransform: 'uppercase' }}>
                      {shift.dayLabel}
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--ink)' }}>
                      {shift.dayNum}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--ink)' }}>{shift.hotel}</div>
                    <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>
                      {shift.sector} · {shift.time}
                    </div>
                  </div>
                </div>
                <span className={`status-tag ${shift.checkIn ? 'ok' : 'info'}`}>
                  {shift.checkIn ? 'Presente · maître' : 'Aguardando maître'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (view === 'freelancer_disponibilidade') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h1 className="page-title">Disponibilidade</h1>
            <p className="page-sub">Dias e turnos em que você aceita convites de escala.</p>
          </div>
          <button
            type="button"
            className="btn-primary"
            style={{ padding: '10px 16px' }}
            onClick={onSaveAvailability}
          >
            Salvar disponibilidade
          </button>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>Dias da semana</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button type="button" className="btn-outline" style={{ padding: '5px 10px', fontSize: '12px' }} onClick={onSelectAllDays}>
                Todos
              </button>
              <button type="button" className="btn-outline" style={{ padding: '5px 10px', fontSize: '12px' }} onClick={onSelectWeekends}>
                Fins de semana
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {DAYS.map((d) => {
              const on = availableDays?.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => onToggleDay(d)}
                  style={{
                    minWidth: '44px',
                    padding: '8px 10px',
                    borderRadius: '2px',
                    border: on ? '1px solid #0066FF' : '1px solid var(--border)',
                    background: on ? '#EBF3FF' : '#FFFFFF',
                    color: on ? '#0066FF' : 'var(--muted)',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', marginBottom: '14px' }}>Turnos</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {SHIFTS.map((s) => {
              const on = availableTimes?.includes(s.label) || availableTimes?.includes(s.hint);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onToggleTime(s.label)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 14px',
                    borderRadius: '2px',
                    border: on ? '1px solid #0066FF' : '1px solid var(--border)',
                    background: on ? '#EBF3FF' : '#FFFFFF',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: on ? '#0066FF' : 'var(--ink)' }}>{s.label}</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{s.hint}</div>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 500, color: on ? '#0066FF' : 'var(--muted)' }}>
                    {on ? 'Ativo' : 'Off'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn-primary"
            style={{ padding: '10px 16px' }}
            onClick={onSaveAvailability}
          >
            Salvar disponibilidade
          </button>
        </div>
      </div>
    );
  }

  return null;
}

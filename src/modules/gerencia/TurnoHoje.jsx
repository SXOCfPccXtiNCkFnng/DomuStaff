import React, { useMemo, useState } from 'react';
import { Clock } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import {
  GERENCIA_DAYS, SECTOR_SHIFT, SHIFT_OPTIONS,
  staffNeeded, staffingOptionsFromTech, shiftTimesMatch,
} from '../../lib/constants';
import Avatar from '../../components/Avatar';

export default function TurnoHoje() {
  const {
    selectedSector, guestCountByDay, freelancersList,
    checkedInIds, confirmPresence, undoPresence,
    getShiftForDay, GERENCIA_DAYS: weekDays,
    invitedByDay, freelancerInvites, techSettings,
  } = useApp();

  const days = weekDays?.length ? weekDays : GERENCIA_DAYS;
  const today = days.find((d) => d.isToday) || days.find((d) => !d.isPast) || days[0];
  const dayId = today?.id;
  const dayIso = today?.iso;

  const defaultShift = getShiftForDay?.(dayId, selectedSector)
    || SECTOR_SHIFT[selectedSector]
    || '15h – 23h';
  const [shiftFilter, setShiftFilter] = useState('current');

  const activeShift = shiftFilter === 'all'
    ? null
    : shiftFilter === 'current'
      ? defaultShift
      : (SHIFT_OPTIONS.find((s) => s.id === shiftFilter)?.time || defaultShift);

  const dayEntries = useMemo(() => {
    const map = new Map();
    (invitedByDay?.[dayId] || []).forEach((e) => {
      const code = typeof e === 'string' ? e : e.code;
      if (!code) return;
      map.set(code, {
        code,
        time: typeof e === 'string' ? defaultShift : (e.time || defaultShift),
        status: typeof e === 'string' ? 'pending' : (e.status || 'pending'),
      });
    });
    (freelancerInvites || []).forEach((inv) => {
      const covers = (inv.days || []).some((d) => {
        const iso = typeof d === 'string' ? d.slice(0, 10) : (d?.iso || '').slice(0, 10);
        return iso && dayIso && iso === dayIso;
      });
      if (!covers || !inv.professionalId) return;
      const st = inv.status || 'pending';
      map.set(inv.professionalId, {
        code: inv.professionalId,
        time: inv.time || defaultShift,
        status: st,
      });
    });
    return [...map.values()];
  }, [invitedByDay, dayId, freelancerInvites, dayIso, defaultShift]);

  // No salão: quem aceitou (ou ainda pendente). Recusas ficam à parte.
  const onFloor = dayEntries.filter((e) => {
    if (e.status === 'declined') return false;
    if (activeShift && e.time && !shiftTimesMatch(e.time, activeShift)) return false;
    return e.status === 'accepted' || e.status === 'confirmed' || e.status === 'pending';
  });
  const declined = dayEntries.filter((e) => {
    if (e.status !== 'declined') return false;
    if (activeShift && e.time && !shiftTimesMatch(e.time, activeShift)) return false;
    return true;
  });

  const people = onFloor.map((e) => {
    const f = freelancersList.find((p) => p.id === e.code);
    if (!f) return null;
    const isIn = checkedInIds.includes(f.id);
    return {
      ...f,
      inviteStatus: e.status,
      time: e.time,
      present: isIn,
    };
  }).filter(Boolean);

  const present = people.filter((p) => p.present).length;
  const waiting = people.length - present;
  const guests = Number(guestCountByDay[dayId]) || 0;
  const weekGuestCounts = days.map((d) => Number(guestCountByDay[d.id]) || 0);
  const needed = staffNeeded(guests, staffingOptionsFromTech(techSettings, weekGuestCounts));
  const shiftLabel = activeShift || 'Todos os turnos';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
            Turno de hoje
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0' }}>
            Confirme a presença · {today?.fullDay || 'hoje'}
            {today?.date ? `, ${today.date}` : ''} · {shiftLabel} · {guests} pessoas (meta {needed})
          </p>
        </div>
        <span
          style={{
            fontSize: '11px',
            background: '#F0FDF4',
            color: '#16A34A',
            padding: '4px 10px',
            borderRadius: '2px',
            fontWeight: 500,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            flexShrink: 0,
          }}
        >
          <span className="live-dot" /> Em andamento
        </span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '12px', color: '#64748B', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Clock size={13} /> Horário
        </span>
        <button
          type="button"
          onClick={() => setShiftFilter('all')}
          style={{
            padding: '5px 10px', borderRadius: 4, fontSize: 12, cursor: 'pointer', outline: 'none',
            border: shiftFilter === 'all' ? '1px solid #0066FF' : '1px solid #E2E8F0',
            background: shiftFilter === 'all' ? '#0066FF' : '#FFF',
            color: shiftFilter === 'all' ? '#FFF' : '#64748B',
            fontWeight: shiftFilter === 'all' ? 600 : 500,
          }}
        >
          Todos
        </button>
        <button
          type="button"
          onClick={() => setShiftFilter('current')}
          style={{
            padding: '5px 10px', borderRadius: 4, fontSize: 12, cursor: 'pointer', outline: 'none',
            border: shiftFilter === 'current' ? '1px solid #0066FF' : '1px solid #E2E8F0',
            background: shiftFilter === 'current' ? '#0066FF' : '#FFF',
            color: shiftFilter === 'current' ? '#FFF' : '#64748B',
            fontWeight: shiftFilter === 'current' ? 600 : 500,
          }}
        >
          Turno da escala · {defaultShift}
        </button>
        {SHIFT_OPTIONS.map((opt) => {
          const on = shiftFilter === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setShiftFilter(opt.id)}
              style={{
                padding: '5px 10px', borderRadius: 4, fontSize: 12, cursor: 'pointer', outline: 'none',
                border: on ? '1px solid #0066FF' : '1px solid #E2E8F0',
                background: on ? '#0066FF' : '#FFF',
                color: on ? '#FFF' : '#64748B',
                fontWeight: on ? 600 : 500,
              }}
            >
              {opt.label} · {opt.time}
            </button>
          );
        })}
      </div>

      <div style={{ fontSize: '13px', color: '#64748B' }}>
        <span style={{ color: '#16A34A', fontWeight: 600 }}>{present}</span> presentes
        <span style={{ margin: '0 8px', color: '#CBD5E1' }}>·</span>
        <span style={{ color: waiting ? '#CA8A04' : '#64748B', fontWeight: 600 }}>{waiting}</span> aguardando
        <span style={{ margin: '0 8px', color: '#CBD5E1' }}>·</span>
        {people.length} na escala
        {declined.length > 0 && (
          <>
            <span style={{ margin: '0 8px', color: '#CBD5E1' }}>·</span>
            <span style={{ color: '#DC2626', fontWeight: 600 }}>{declined.length}</span> recusou
          </>
        )}
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '2px' }}>
        {people.length === 0 ? (
          <div style={{ padding: '28px 16px', textAlign: 'center', fontSize: 13, color: '#64748B' }}>
            Ninguém confirmado neste horário. Quem recusou não entra na lista do salão.
          </div>
        ) : people.map((f, idx) => (
          <div
            key={f.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              padding: '12px 16px',
              borderBottom: idx < people.length - 1 ? '1px solid #F1F5F9' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <Avatar src={f.avatar} name={f.name} size={32} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '13.5px', fontWeight: 500, color: '#0F172A' }}>{f.name}</div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  {f.role} · {f.time}
                  {f.inviteStatus === 'pending' ? ' · aguardando resposta' : ''}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              {f.present ? (
                <button
                  type="button"
                  className="btn-outline"
                  style={{ padding: '6px 10px', fontSize: 12 }}
                  onClick={() => undoPresence(f)}
                >
                  Desfazer
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    style={{
                      padding: '6px 10px', fontSize: 12, border: 'none', background: 'transparent',
                      color: '#64748B', cursor: 'pointer', fontWeight: 500,
                    }}
                    onClick={() => { /* marca só visualmente como não chegou — mantém aguardando */ }}
                  >
                    Não chegou
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ padding: '6px 10px', fontSize: 12 }}
                    onClick={() => confirmPresence(f)}
                  >
                    Confirmar presença
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {declined.length > 0 && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 2, padding: '12px 14px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#991B1B', marginBottom: 8 }}>
            Recusaram — chame substituto na Montar escala
          </div>
          {declined.map((e) => {
            const f = freelancersList.find((p) => p.id === e.code);
            return (
              <div key={e.code} style={{ fontSize: 12, color: '#7F1D1D', padding: '4px 0' }}>
                {f?.name || e.code} · {e.time}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import React, { useMemo } from 'react';
import {
  Calendar, Users, ChevronLeft, ChevronRight, AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../store/AppContext';
import {
  GERENCIA_DAYS, GERENCIA_SECTORS, RATE_KIND_LABEL,
  formatBRL, dailyRateFor, rateKindForDay, staffNeeded, dayMapTone,
  staffingOptionsFromTech,
} from '../../lib/constants';

function inviteCoversDay(inv, day) {
  if (!inv || !day) return false;
  const dayIso = day.iso;
  return (inv.days || []).some((d) => {
    const iso = typeof d === 'string' ? d.slice(0, 10) : (d?.iso || '').slice(0, 10);
    return iso && dayIso && iso === dayIso;
  });
}

function sectorIdFromLabel(sector) {
  if (!sector) return 'restaurante';
  const found = GERENCIA_SECTORS.find(
    (s) => s.id === sector || s.label.toLowerCase() === String(sector).toLowerCase(),
  );
  return found?.id || 'restaurante';
}

export default function Kanban() {
  const {
    setCurrentView, GERENCIA_DAYS: weekDays, weekLabel, shiftWeek,
    guestCountByDay, dailyRates, rhDay, setRhDay,
    selectedFreelancersByDay, freelancersList, sentDays, returnedByDay,
    techSettings, getShiftForDay, setActiveRequest, requestStatusByDay,
    invitedByDay, freelancerInvites,
    rhSectorFilter, setRhSectorFilter,
  } = useApp();

  const days = weekDays?.length ? weekDays : GERENCIA_DAYS;
  const rhDayObj = days.find((d) => d.id === rhDay) || days[0];
  const rhKind = rateKindForDay(rhDayObj || rhDay);
  const rhGuests = Number(guestCountByDay[rhDay]) || 0;
  const weekGuestCounts = days.map((d) => Number(guestCountByDay[d.id]) || 0);
  const staffingOpts = staffingOptionsFromTech(techSettings, weekGuestCounts);
  const suggestedStaff = staffNeeded(rhGuests, staffingOpts);
  const baseStaff = staffNeeded(rhGuests, {
    peoplePerStaff: staffingOpts.peoplePerStaff,
    minStaff: staffingOpts.minStaff,
  });
  const showOccupancyAlert = !!techSettings.suggestOnHighOccupancy && suggestedStaff > baseStaff;

  const dayInvites = useMemo(
    () => (freelancerInvites || []).filter((inv) => inviteCoversDay(inv, rhDayObj)),
    [freelancerInvites, rhDayObj],
  );

  const invitedEntries = invitedByDay?.[rhDay] || [];

  const sectorCards = useMemo(() => {
    const map = {};

    const ensure = (secId, opts = {}) => {
      const sectorMeta = GERENCIA_SECTORS.find((s) => s.id === secId) || { id: secId, label: secId, icon: Users };
      if (!map[secId]) {
        map[secId] = {
          sectorId: secId,
          sector: sectorMeta.label,
          icon: sectorMeta.icon || Users,
          people: 0,
          accepted: 0,
          pending: 0,
          declined: 0,
          role: opts.role || '—',
          shift: opts.shift || getShiftForDay?.(rhDay, secId) || '—',
          codes: new Set(),
        };
      }
      return map[secId];
    };

    // Escala montada (ainda sem convite ou com gente na lista)
    (selectedFreelancersByDay[rhDay] || []).forEach((code) => {
      const f = freelancersList.find((p) => p.id === code);
      if (!f) return;
      const card = ensure(f.sector || 'restaurante', { role: f.role });
      if (!card.codes.has(code)) {
        card.codes.add(code);
        card.people += 1;
        if (card.role === '—') card.role = f.role;
      }
    });

    // Convites do dia (fonte de verdade p/ aceite/recusa)
    dayInvites.forEach((inv) => {
      const secId = sectorIdFromLabel(inv.sector);
      const code = inv.professionalId;
      const f = freelancersList.find((p) => p.id === code);
      const card = ensure(secId, {
        role: inv.role || f?.role,
        shift: inv.time || getShiftForDay?.(rhDay, secId),
      });
      if (inv.time) card.shift = inv.time;
      if (code && !card.codes.has(code)) {
        card.codes.add(code);
        card.people += 1;
      }
      const st = inv.status || 'pending';
      if (st === 'accepted' || st === 'confirmed') card.accepted += 1;
      else if (st === 'declined') card.declined += 1;
      else card.pending += 1;
    });

    // Fallback: invitedByDay com status (quando invite list ainda não mapeou)
    invitedEntries.forEach((e) => {
      const code = typeof e === 'string' ? e : e.code;
      const st = typeof e === 'string' ? 'pending' : (e.status || 'pending');
      const f = freelancersList.find((p) => p.id === code);
      if (!f && !code) return;
      if (dayInvites.some((inv) => inv.professionalId === code)) return;
      const secId = sectorIdFromLabel(typeof e === 'object' ? e.sector : '')
        || f?.sector
        || 'restaurante';
      const card = ensure(secId, {
        role: f?.role,
        shift: (typeof e === 'object' && e.time) || getShiftForDay?.(rhDay, secId),
      });
      if (code && !card.codes.has(code)) {
        card.codes.add(code);
        card.people += 1;
      }
      if (st === 'accepted' || st === 'confirmed') card.accepted += 1;
      else if (st === 'declined') card.declined += 1;
      else card.pending += 1;
    });

    return Object.values(map)
      .filter((c) => c.people > 0)
      .map((c) => ({
        ...c,
        codes: [...c.codes],
        cost: [...c.codes].reduce((sum, code) => {
          const f = freelancersList.find((p) => p.id === code);
          return sum + dailyRateFor(f?.role || c.role, rhKind, dailyRates);
        }, 0),
      }));
  }, [
    selectedFreelancersByDay, rhDay, freelancersList, dayInvites, invitedEntries,
    getShiftForDay, rhKind, dailyRates,
  ]);

  const matchSector = (card) => rhSectorFilter === 'all' || card.sectorId === rhSectorFilter;

  const status = requestStatusByDay?.[rhDay];
  const isReturned = Boolean(returnedByDay[rhDay]);
  const hasInvites = dayInvites.length > 0 || invitedEntries.length > 0;
  const isRequested = !isReturned && (status === 'requested' || (!status && sectorCards.length > 0 && !sentDays[rhDay] && !hasInvites));
  const isSentToFreelas = status === 'sent' || status === 'confirmed' || hasInvites || (!!sentDays[rhDay] && !isReturned && status !== 'requested');

  const solicitadas = (isRequested && !isReturned ? sectorCards : []).filter(matchSector);

  // Enviadas: ainda há pendente de resposta
  const enviadas = ((!isReturned && isSentToFreelas)
    ? sectorCards
      .filter((c) => c.pending > 0 || (c.accepted === 0 && c.declined === 0 && status === 'sent'))
      .map((c) => ({
        ...c,
        progress: c.pending
          ? `${c.pending} aguardando · ${c.accepted} aceito${c.accepted === 1 ? '' : 's'}`
          : `${c.people} na lista`,
      }))
    : []).filter(matchSector);

  // Confirmadas: aceitos sem pendência e sem recusa no mesmo card
  const confirmadas = sectorCards
    .filter((c) => c.accepted > 0 && c.pending === 0 && c.declined === 0)
    .filter(matchSector)
    .map((c) => ({
      ...c,
      progress: `${c.accepted} confirmado${c.accepted === 1 ? '' : 's'}`,
    }));

  // Pendências: devolvida OU recusas precisando substituto
  const pendenciasFromDecline = sectorCards
    .filter((c) => c.declined > 0)
    .filter(matchSector)
    .map((c) => ({
      ...c,
      progress: c.accepted
        ? `${c.declined} recusou · ${c.accepted} ok — chame substituto`
        : `${c.declined} recusou — chame substituto`,
      alert: true,
    }));
  const pendenciasFromReturn = isReturned
    ? sectorCards.filter(matchSector).map((c) => ({
      ...c,
      progress: returnedByDay[rhDay]?.reason || 'Devolvida',
      alert: true,
    }))
    : [];
  const pendencias = [...pendenciasFromReturn, ...pendenciasFromDecline.filter(
    (c) => !pendenciasFromReturn.some((p) => p.sectorId === c.sectorId),
  )];

  // Evita o mesmo card em Enviadas se já está só em Confirmadas (sem pendentes)
  const enviadasClean = enviadas.filter(
    (c) => !confirmadas.some((ok) => ok.sectorId === c.sectorId && c.pending === 0 && c.declined === 0),
  );

  const kanbanColumns = [
    { id: 'solicitadas', title: 'Solicitadas', hint: 'Pela gerência', count: solicitadas.length, cards: solicitadas },
    { id: 'analise', title: 'Em análise', hint: 'Revisão do RH', count: 0, cards: [] },
    { id: 'enviadas', title: 'Enviadas', hint: 'Aguardando resposta', count: enviadasClean.length, cards: enviadasClean },
    { id: 'confirmadas', title: 'Confirmadas', hint: 'Aceitas pelo freela', count: confirmadas.length, cards: confirmadas },
    { id: 'pendencias', title: 'Pendências', hint: 'Recusas / devoluções', count: pendencias.length, cards: pendencias },
  ];

  let weekCost = 0;
  let weekendCost = 0;
  days.forEach((day) => {
    const kind = rateKindForDay(day);
    const codes = new Set(selectedFreelancersByDay[day.id] || []);
    (invitedByDay?.[day.id] || []).forEach((e) => {
      const code = typeof e === 'string' ? e : e.code;
      if (code) codes.add(code);
    });
    codes.forEach((code) => {
      const f = freelancersList.find((p) => p.id === code);
      if (!f) return;
      const rate = dailyRateFor(f.role, kind, dailyRates);
      if (kind === 'weekend') weekendCost += rate;
      else weekCost += rate;
    });
  });

  const scaleCountForDay = (dayId) => {
    const fromScale = selectedFreelancersByDay[dayId] || [];
    const fromInvites = invitedByDay?.[dayId] || [];
    const set = new Set([
      ...fromScale,
      ...fromInvites.map((e) => (typeof e === 'string' ? e : e.code)).filter(Boolean),
    ]);
    return set.size;
  };

  const dayLabelStatus = (dayId) => {
    const st = requestStatusByDay?.[dayId];
    const invs = invitedByDay?.[dayId] || [];
    const anyAccepted = invs.some((e) => (typeof e === 'object' ? e.status : '') === 'accepted' || e.status === 'confirmed');
    const anyDeclined = invs.some((e) => (typeof e === 'object' ? e.status : '') === 'declined');
    const anyPending = invs.some((e) => !e.status || e.status === 'pending');
    if (returnedByDay?.[dayId]) return 'Devolvida';
    if (anyDeclined && !anyPending) return 'Recusa';
    if (anyAccepted && !anyPending) return 'Confirmada';
    if (anyPending || st === 'sent') return 'Enviada';
    if (st === 'requested') return 'Aguardando';
    if (st === 'confirmed') return 'Confirmada';
    return RATE_KIND_LABEL[rateKindForDay(days.find((d) => d.id === dayId) || dayId)];
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 className="page-title">Escalas da semana</h1>
          <p className="page-sub">Aprove solicitações e acompanhe o custo. A previsão de pessoas fica em Configurações.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button type="button" onClick={() => shiftWeek(-1)} aria-label="Semana anterior" style={{ width: '32px', height: '32px', borderRadius: '4px', border: '1px solid #E2E8F0', background: '#FFF', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ChevronLeft size={16} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '4px', fontSize: '13px', fontWeight: 500 }}>
            <Calendar size={14} color="#64748B" />
            {weekLabel || 'Esta semana'}
          </div>
          <button type="button" onClick={() => shiftWeek(1)} aria-label="Próxima semana" style={{ width: '32px', height: '32px', borderRadius: '4px', border: '1px solid #E2E8F0', background: '#FFF', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {showOccupancyAlert && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '10px',
          padding: '12px 14px', background: '#FFFBEB', border: '1px solid #F59E0B', borderRadius: '2px',
        }}>
          <AlertTriangle size={16} color="#D97706" style={{ marginTop: 2, flexShrink: 0 }} />
          <div style={{ fontSize: '13px', color: '#92400E', lineHeight: 1.45 }}>
            Alta ocupação em {rhDayObj?.label} {rhDayObj?.date}: meta sugerida de <strong>{suggestedStaff}</strong> profissionais
            {techSettings.autoScaleHistory ? ' (com ajuste pelo histórico da semana)' : ''}.
          </div>
        </div>
      )}

      <div className="week-strip" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
        {days.map((day) => {
          const active = rhDay === day.id;
          const kind = rateKindForDay(day);
          const guests = Number(guestCountByDay[day.id]) || 0;
          const scaleCount = scaleCountForDay(day.id);
          const label = dayLabelStatus(day.id);
          const tone = dayMapTone(kind, { active, isToday: day.isToday });
          const highlight = label === 'Confirmada' || label === 'Recusa' || label === 'Aguardando' || label === 'Enviada';
          return (
            <div
              key={day.iso || day.id}
              onClick={() => setRhDay(day.id)}
              style={{
                background: tone.background,
                border: tone.border,
                borderRadius: '2px',
                padding: '12px 8px',
                textAlign: 'left',
                cursor: 'pointer',
                position: 'relative',
                boxShadow: kind !== 'week' && !active ? `inset 0 2px 0 0 ${tone.bar}` : 'none',
              }}
            >
              {day.isToday && (
                <div style={{ position: 'absolute', top: '6px', right: '6px', fontSize: '9px', fontWeight: 700, color: '#16A34A' }}>HOJE</div>
              )}
              <div style={{ fontSize: '13px', fontWeight: 600, color: tone.title }}>
                {day.label} {day.date}
              </div>
              <div style={{ marginTop: '10px' }}>
                <div style={{ fontSize: '20px', fontWeight: 600, color: '#0F172A', lineHeight: 1 }}>{scaleCount}</div>
                <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '4px' }}>
                  na escala{guests ? ` · ${guests} prev.` : ''}
                </div>
              </div>
              <div style={{
                fontSize: '11px',
                color: label === 'Confirmada' ? '#16A34A' : label === 'Recusa' ? '#DC2626' : highlight ? '#0066FF' : tone.meta,
                marginTop: '6px',
                fontWeight: highlight || kind === 'weekend' || kind === 'holiday' ? 600 : 500,
              }}>
                {label}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setRhSectorFilter('all')}
          style={{
            padding: '6px 12px',
            borderRadius: '4px',
            border: rhSectorFilter === 'all' ? '1px solid #0066FF' : '1px solid #E2E8F0',
            background: rhSectorFilter === 'all' ? '#EBF3FF' : '#FFFFFF',
            color: rhSectorFilter === 'all' ? '#0066FF' : '#64748B',
            fontSize: '12px',
            fontWeight: rhSectorFilter === 'all' ? 600 : 500,
            cursor: 'pointer',
          }}
        >
          Todos os setores
        </button>
        {GERENCIA_SECTORS.map((sec) => {
          const on = rhSectorFilter === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => setRhSectorFilter(sec.id)}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border: on ? '1px solid #0066FF' : '1px solid #E2E8F0',
                background: on ? '#EBF3FF' : '#FFFFFF',
                color: on ? '#0066FF' : '#64748B',
                fontSize: '12px',
                fontWeight: on ? 600 : 500,
                cursor: 'pointer',
              }}
            >
              {sec.label}
            </button>
          );
        })}
      </div>

      <div className="kanban-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', alignItems: 'start' }}>
        {kanbanColumns.map((col) => (
          <div key={col.id} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '2px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 12px 10px', borderBottom: '1px solid #E2E8F0' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>{col.title}</div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>{col.hint}</div>
              </div>
              <span style={{ fontSize: '12px', color: '#64748B', background: '#F1F5F9', padding: '1px 7px', borderRadius: '4px' }}>{col.count}</span>
            </div>
            <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {col.cards.length === 0 && (
                <div style={{ padding: '14px 10px', fontSize: '12px', color: '#94A3B8', textAlign: 'center' }}>Vazio</div>
              )}
              {col.cards.map((card) => {
                const cost = card.people * dailyRateFor(card.role, rhKind, dailyRates);
                const Icon = card.icon || Users;
                return (
                  <button
                    key={`${col.id}-${card.sector}`}
                    type="button"
                    onClick={() => {
                      setActiveRequest?.((prev) => ({
                        ...(prev || {}),
                        department: card.sector,
                        shift: card.shift,
                      }));
                      setCurrentView('approval_details');
                    }}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '2px',
                      padding: '12px',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Icon size={14} color="#64748B" />
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>{card.sector}</span>
                      </div>
                      {card.alert ? <AlertTriangle size={14} color="#DC2626" /> : null}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>
                      {rhDayObj?.label}, {rhDayObj?.date} · turno {card.shift}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                      {card.people} na lista
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', marginTop: '8px' }}>{formatBRL(cost)}</div>
                    {card.progress && (
                      <div style={{ fontSize: '11px', color: card.alert ? '#DC2626' : '#64748B', marginTop: '8px' }}>{card.progress}</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '2px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>Custo da semana</div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
            {rhGuests} total de pessoas · meta {suggestedStaff}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {[
            { label: 'Semana', value: weekCost },
            { label: 'Fim de semana', value: weekendCost },
            { label: 'Feriados', value: 0 },
            { label: 'Total', value: weekCost + weekendCost },
          ].map((item) => (
            <div key={item.label} style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.label}</div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A' }}>{formatBRL(item.value)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

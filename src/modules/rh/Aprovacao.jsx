import React, { useEffect, useMemo, useState } from 'react';
import {
  Calendar, ChevronLeft, ChevronRight, ArrowLeft, Send, RotateCcw, Clock,
} from 'lucide-react';
import { useApp } from '../../store/AppContext';
import {
  GERENCIA_DAYS, GERENCIA_SECTORS, SECTOR_SHIFT, RATE_KIND_LABEL, SHIFT_OPTIONS,
  staffNeeded, formatBRL, dailyRateFor, rateKindForDay,
  staffingOptionsFromTech, shiftTimesMatch, freelaInSector, sectorLabelFromId,
  flattenSelectionCodes, selectionEntries,
} from '../../lib/constants';
import Avatar from '../../components/Avatar';

export default function Aprovacao() {
  const {
    setCurrentView, activeRequest,
    selectedFreelancersByDay, setSelectedFreelancersByDay,
    guestCountByDay, dailyRates, rhDay, setRhDay,
    freelancersList, selectedIds, setSelectedIds, activeTab, setActiveTab,
    handleApproveAndSend, handleReturnToMaitre, toggleSelectOne,
    GERENCIA_DAYS: weekDays, weekLabel, shiftWeek, techSettings,
    getShiftForDay, selectedSector,
    invitedByDay, requestStatusByDay, freelancerInvites,
  } = useApp();

  const [shiftFilter, setShiftFilter] = useState('all');

  const days = weekDays?.length ? weekDays : GERENCIA_DAYS;
  const dayObj = days.find((d) => d.id === rhDay) || days[0];
  const guests = Number(guestCountByDay[rhDay]) || 0;
  const weekGuestCounts = days.map((d) => Number(guestCountByDay[d.id]) || 0);
  const needed = staffNeeded(guests, staffingOptionsFromTech(techSettings, weekGuestCounts));
  const rateKind = rateKindForDay(dayObj || rhDay);
  const dayCodes = flattenSelectionCodes(selectedFreelancersByDay[rhDay] || []);

  const sectorId = GERENCIA_SECTORS.find((s) => s.label === activeRequest?.department)?.id
    || freelancersList.find((f) => dayCodes.includes(f.id))?.sector
    || selectedSector;
  const sectorTitle = sectorLabelFromId(sectorId) || activeRequest?.department || 'Restaurante';
  const shift = activeRequest?.shift
    || getShiftForDay?.(rhDay, sectorId)
    || SECTOR_SHIFT[sectorId]
    || '—';

  const invitedEntries = useMemo(() => {
    const fallback = shift && shift !== '—' ? shift : '';
    const byCode = new Map();

    const upsert = (code, time, status = 'pending') => {
      if (!code) return;
      const t = time && time !== '—' ? time : fallback;
      const prev = byCode.get(code);
      if (!prev) {
        byCode.set(code, { code, time: t, status });
        return;
      }
      byCode.set(code, {
        code,
        time: t || prev.time,
        status: status && status !== 'pending' ? status : (prev.status || status),
      });
    };

    (invitedByDay?.[rhDay] || []).forEach((e) => {
      if (typeof e === 'string') upsert(e, fallback, 'pending');
      else upsert(e.code, e.time || fallback, e.status || 'pending');
    });

    const dayIso = dayObj?.iso;
    (freelancerInvites || []).forEach((inv) => {
      if (!inv?.professionalId) return;
      const st = inv.status || 'pending';
      if (!['pending', 'accepted', 'declined', 'confirmed'].includes(st)) return;
      const coversDay = (inv.days || []).some((d) => {
        const iso = typeof d === 'string' ? d.slice(0, 10) : (d?.iso || '').slice(0, 10);
        return iso && dayIso && iso === dayIso;
      });
      if (!coversDay) return;
      upsert(inv.professionalId, inv.time || fallback, st);
    });

    return [...byCode.values()];
  }, [invitedByDay, rhDay, shift, freelancerInvites, dayObj?.iso]);

  const invitedCodes = useMemo(() => invitedEntries.map((e) => e.code), [invitedEntries]);
  const invitedSet = useMemo(() => new Set(invitedCodes), [invitedCodes.join('|')]);
  const inviteTimeByCode = useMemo(() => {
    const map = {};
    invitedEntries.forEach((e) => {
      if (!map[e.code]) map[e.code] = [];
      if (e.time && !map[e.code].some((t) => shiftTimesMatch(t, e.time))) {
        map[e.code].push(e.time);
      }
    });
    return map;
  }, [invitedEntries]);
  const inviteStatusByCode = useMemo(() => {
    const map = {};
    invitedEntries.forEach((e) => { map[e.code] = e.status || 'pending'; });
    return map;
  }, [invitedEntries]);

  const filterOpt = SHIFT_OPTIONS.find((s) => s.id === shiftFilter);
  const filterTime = filterOpt?.time || null;

  const dayStatus = requestStatusByDay?.[rhDay] || (invitedCodes.length ? 'sent' : 'requested');
  const alreadySent = dayStatus === 'sent' || dayStatus === 'confirmed' || invitedCodes.length > 0;

  const matchesFilterTime = (times) => {
    if (shiftFilter === 'all' || !filterTime) return true;
    const list = (Array.isArray(times) ? times : [times]).filter(Boolean);
    if (!list.length) return shiftTimesMatch(shift, filterTime);
    return list.some((t) => shiftTimesMatch(t, filterTime));
  };

  const pendingTeam = freelancersList.filter((f) => {
    if (!freelaInSector(f, sectorId)) return false;
    if (!selectedIds.includes(f.id) || invitedSet.has(f.id)) return false;
    if (shiftFilter === 'all') return true;
    return shiftTimesMatch(shift, filterTime);
  });
  const sentPeople = freelancersList.filter((f) => {
    if (!freelaInSector(f, sectorId) && !invitedSet.has(f.id)) return false;
    if (!invitedSet.has(f.id)) return false;
    const st = inviteStatusByCode[f.id];
    if (st === 'declined') return false;
    return matchesFilterTime(inviteTimeByCode[f.id] || []);
  });
  const declinedPeople = freelancersList.filter((f) => {
    if (inviteStatusByCode[f.id] !== 'declined') return false;
    return matchesFilterTime(inviteTimeByCode[f.id] || []);
  });
  const sentPeopleAll = freelancersList.filter((f) => invitedSet.has(f.id) && inviteStatusByCode[f.id] !== 'declined');
  const outside = freelancersList.filter((f) => freelaInSector(f, sectorId) && !selectedIds.includes(f.id) && !invitedSet.has(f.id));

  const visibleList = (
    activeTab === 'enviados' ? sentPeople
      : activeTab === 'recusados' ? declinedPeople
        : activeTab === 'sugestoes' ? outside
          : pendingTeam
  );

  const estimated = freelancersList
    .filter((f) => invitedSet.has(f.id) || (selectedIds.includes(f.id) && !invitedSet.has(f.id)))
    .reduce((sum, f) => sum + dailyRateFor(f.role, rateKind, dailyRates), 0);

  const newToSend = pendingTeam.length;
  const canApprove = newToSend > 0;
  const canReturn = dayStatus === 'requested' || dayStatus === 'draft' || (!alreadySent && dayCodes.length > 0);

  useEffect(() => {
    const pending = dayCodes.filter((id) => !invitedSet.has(id));
    setSelectedIds([...new Set([...pending])]);
    if (declinedPeople.length && alreadySent) setActiveTab('recusados');
    else if (alreadySent && pending.length === 0) setActiveTab('enviados');
    else setActiveTab('selecionados');
  }, [rhDay, dayCodes.join('|'), invitedCodes.join('|')]);

  // Só o filtro visual — não altera o turno da escala (isso bugava o destaque do "Todos")
  const onPickShiftFilter = (optId) => {
    setShiftFilter(optId);
  };

  const addFromOutside = (id) => {
    toggleSelectOne(id);
    setSelectedFreelancersByDay((prev) => {
      const cur = selectionEntries(prev[rhDay] || []);
      if (flattenSelectionCodes(cur).includes(id)) return prev;
      const time = shift && shift !== '—' ? shift : '';
      return { ...prev, [rhDay]: [...cur, { code: id, time }] };
    });
    setActiveTab('selecionados');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <button
        type="button"
        onClick={() => setCurrentView('main_kanban')}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, color: '#64748B', width: 'fit-content' }}
      >
        <ArrowLeft size={15} /> Escalas da semana
      </button>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
            <h1 className="page-title" style={{ margin: 0 }}>Aprovar escala</h1>
            <span style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#0066FF',
              background: '#EBF3FF',
              border: '1px solid #BFDBFE',
              padding: '4px 10px',
              borderRadius: '4px',
            }}>
              {sectorTitle}
            </span>
          </div>
          <p className="page-sub">
            {dayObj?.fullDay} · turno {shift} · diária de {RATE_KIND_LABEL[rateKind].toLowerCase()}
            {alreadySent ? ' · convites já enviados' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button type="button" onClick={() => shiftWeek(-1)} aria-label="Semana anterior" style={{ width: '32px', height: '32px', borderRadius: '4px', border: '1px solid #E2E8F0', background: '#FFF', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ChevronLeft size={16} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '4px', fontSize: '13px', fontWeight: 500, minWidth: '180px', justifyContent: 'center' }}>
            <Calendar size={14} color="#64748B" />
            {weekLabel || 'Esta semana'}
          </div>
          <button type="button" onClick={() => shiftWeek(1)} aria-label="Próxima semana" style={{ width: '32px', height: '32px', borderRadius: '4px', border: '1px solid #E2E8F0', background: '#FFF', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {days.map((d) => {
          const on = d.id === rhDay;
          return (
            <button
              key={d.iso || d.id}
              type="button"
              onClick={() => setRhDay(d.id)}
              style={{
                padding: '6px 10px',
                borderRadius: '4px',
                border: on ? '1px solid #0066FF' : d.isToday ? '1px solid #16A34A' : '1px solid #E2E8F0',
                background: on ? '#EBF3FF' : d.isToday ? '#F0FDF4' : '#FFFFFF',
                color: on ? '#0066FF' : '#64748B',
                fontSize: '12px',
                fontWeight: on ? 600 : 500,
                cursor: 'pointer',
              }}
            >
              {d.label} {d.date}
              {d.isToday ? ' · Hoje' : ''}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '12px', color: '#64748B', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={13} /> Horário
        </span>
        <button
          type="button"
          onClick={() => onPickShiftFilter('all')}
          style={{
            padding: '5px 10px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', outline: 'none',
            border: shiftFilter === 'all' ? '1px solid #0066FF' : '1px solid #E2E8F0',
            background: shiftFilter === 'all' ? '#0066FF' : '#FFF',
            color: shiftFilter === 'all' ? '#FFF' : '#64748B',
            fontWeight: shiftFilter === 'all' ? 600 : 500,
          }}
        >
          Todos{sentPeopleAll.length ? ` (${sentPeopleAll.length})` : ''}
        </button>
        {SHIFT_OPTIONS.map((opt) => {
          const on = shiftFilter === opt.id;
          const countForShift = invitedEntries.filter((e) => shiftTimesMatch(e.time, opt.time)).length;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onPickShiftFilter(opt.id)}
              style={{
                padding: '5px 10px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', textAlign: 'left', outline: 'none',
                border: on ? '1px solid #0066FF' : '1px solid #E2E8F0',
                background: on ? '#0066FF' : '#FFF',
                color: on ? '#FFF' : '#64748B',
                fontWeight: on ? 600 : 500,
              }}
            >
              {opt.label} · {opt.time}{countForShift ? ` (${countForShift})` : ''}
            </button>
          );
        })}
      </div>

      <div className="split-2" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '12px', alignItems: 'start' }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '2px' }}>
          <div className="metrics-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid #E2E8F0' }}>
            {[
              { label: 'Pessoas', value: guests },
              { label: 'Meta', value: needed },
              { label: 'Enviados', value: shiftFilter === 'all' ? sentPeopleAll.length : sentPeople.length },
              { label: 'Custo', value: formatBRL(estimated) },
            ].map((item) => (
              <div key={item.label} style={{ padding: '14px 16px', borderRight: '1px solid #F1F5F9' }}>
                <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.label}</div>
                <div style={{ fontSize: '18px', fontWeight: 600, color: '#0F172A', marginTop: '4px' }}>{item.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '16px', padding: '0 16px', borderBottom: '1px solid #E2E8F0', overflowX: 'auto' }}>
            {[
              { id: 'selecionados', label: `Equipe (${pendingTeam.length})` },
              { id: 'enviados', label: `Enviados (${sentPeople.length})` },
              { id: 'recusados', label: `Recusados (${declinedPeople.length})` },
              { id: 'sugestoes', label: `Fora da escala (${outside.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: activeTab === tab.id ? (tab.id === 'recusados' ? '#DC2626' : '#0066FF') : '#64748B',
                  borderBottom: activeTab === tab.id
                    ? `2px solid ${tab.id === 'recusados' ? '#DC2626' : '#0066FF'}`
                    : '2px solid transparent',
                  padding: '12px 0',
                  marginBottom: '-1px',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '8px 16px', width: '36px' }} />
                <th style={{ padding: '8px 8px', fontSize: '11px', fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Nome</th>
                <th style={{ padding: '8px 8px', fontSize: '11px', fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Função</th>
                <th style={{ padding: '8px 8px', fontSize: '11px', fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Diária</th>
                <th style={{ padding: '8px 16px 8px 8px', fontSize: '11px', fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Obs.</th>
              </tr>
            </thead>
            <tbody>
              {visibleList.map((f) => {
                const isInvited = invitedSet.has(f.id);
                const isChecked = selectedIds.includes(f.id);
                const invStatus = inviteStatusByCode[f.id] || 'pending';
                const statusLabel = invStatus === 'accepted' || invStatus === 'confirmed'
                  ? 'Aceito'
                  : invStatus === 'declined'
                    ? 'Recusado'
                    : 'Pendente';
                const statusColor = invStatus === 'accepted' || invStatus === 'confirmed'
                  ? '#16A34A'
                  : invStatus === 'declined'
                    ? '#DC2626'
                    : '#D97706';
                return (
                  <tr key={f.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '10px 16px' }}>
                      {activeTab === 'enviados' || activeTab === 'recusados' ? (
                        <span style={{ fontSize: '11px', color: statusColor, fontWeight: 600 }}>
                          {statusLabel === 'Aceito' ? 'OK' : statusLabel === 'Recusado' ? 'X' : '…'}
                        </span>
                      ) : activeTab === 'sugestoes' ? (
                        <button
                          type="button"
                          onClick={() => addFromOutside(f.id)}
                          style={{ fontSize: '11px', color: '#0066FF', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                        >
                          + Chamar
                        </button>
                      ) : (
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={isInvited}
                          onChange={() => toggleSelectOne(f.id)}
                          style={{ cursor: isInvited ? 'default' : 'pointer', accentColor: '#0066FF' }}
                        />
                      )}
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Avatar src={f.avatar} name={f.name} size={28} />
                        <span style={{ fontWeight: 500, color: '#0F172A' }}>{f.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 8px', color: '#64748B' }}>{f.role}</td>
                    <td style={{ padding: '10px 8px', fontWeight: 500, color: '#0F172A' }}>
                      {formatBRL(dailyRateFor(f.role, rateKind, dailyRates))}
                    </td>
                    <td style={{ padding: '10px 16px 10px 8px', fontSize: '12px' }}>
                      {isInvited ? (
                        <span>
                          <span style={{ color: statusColor, fontWeight: 600 }}>{statusLabel}</span>
                          <span style={{ color: '#64748B' }}>
                            {' · '}{(inviteTimeByCode[f.id] || []).join(' / ') || '—'}
                          </span>
                        </span>
                      ) : (
                        <span style={{ color: '#64748B' }}>{f.notes || '—'}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {visibleList.length === 0 && (
            <div style={{ padding: '28px 16px', textAlign: 'center', fontSize: '13px', color: '#64748B' }}>
              {activeTab === 'enviados'
                ? 'Ainda ninguém enviado neste dia.'
                : activeTab === 'recusados'
                  ? 'Nenhuma recusa neste dia.'
                  : activeTab === 'sugestoes'
                    ? 'Ninguém fora da escala com este filtro.'
                    : 'Equipe vazia — chame alguém em Fora da escala ou aguarde a Gerência.'}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '2px', padding: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', marginBottom: '12px' }}>Aprovação</div>
            {[
              { label: 'Novos a enviar', value: String(newToSend) },
              { label: 'Já enviados', value: String(sentPeopleAll.length) },
              { label: 'Turno', value: shift },
              { label: 'Diária', value: RATE_KIND_LABEL[rateKind] },
              { label: 'Custo', value: formatBRL(estimated) },
            ].map((row) => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #F1F5F9', fontSize: '13px' }}>
                <span style={{ color: '#64748B' }}>{row.label}</span>
                <span style={{ color: '#0F172A', fontWeight: 500 }}>{row.value}</span>
              </div>
            ))}
            <p style={{ fontSize: '12px', color: '#64748B', margin: '12px 0 14px', lineHeight: 1.45 }}>
              {alreadySent
                ? 'Convites já saíram. Para chamar mais, adicione em Equipe e envie de novo.'
                : 'Ao aprovar, o freela recebe o convite na hora e pode aceitar o pacote de uma vez.'}
            </p>
            <button
              type="button"
              onClick={handleApproveAndSend}
              className="btn-primary"
              disabled={!canApprove}
              style={{
                width: '100%',
                padding: '11px',
                opacity: canApprove ? 1 : 0.45,
                cursor: canApprove ? 'pointer' : 'not-allowed',
              }}
            >
              <Send size={15} /> {alreadySent ? 'Enviar novos convites' : 'Aprovar e enviar'}
            </button>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '14px 0 8px', lineHeight: 1.45 }}>
              Use <strong>Devolver</strong> só antes de convocar — se a escala estiver cara, incompleta ou com gente errada.
            </p>
            <button
              type="button"
              onClick={handleReturnToMaitre}
              className="btn-outline"
              disabled={!canReturn}
              style={{
                width: '100%',
                padding: '10px',
                justifyContent: 'center',
                opacity: canReturn ? 1 : 0.45,
                cursor: canReturn ? 'pointer' : 'not-allowed',
              }}
            >
              <RotateCcw size={14} /> Devolver à Gerência
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

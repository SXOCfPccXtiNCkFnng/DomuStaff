import React, { useMemo } from 'react';
import {
  Calendar, Users, CheckCircle2, MessageSquare, Clock, Settings, Search,
  Bell, ChevronLeft, ChevronRight, Phone, Plus, ArrowLeft,
  Check, Send, RotateCcw, AlertTriangle, Layers, LogOut,
  Utensils, Wine, ChefHat, Package, Bed, TrendingUp, X, FileText, Menu
} from 'lucide-react';
import { useApp } from '../../store/AppContext';
import {
  GERENCIA_DAYS, GERENCIA_SECTORS, SECTOR_SHIFT, RATE_KIND_LABEL,
  staffNeeded, formatBRL, dailyRateFor, rateKindForDay, dayMapTone,
  SHIFT_OPTIONS, staffingOptionsFromTech, shiftTimesMatch, normalizeShiftTime,
} from '../../lib/constants';
import Avatar from '../../components/Avatar';

export default function MontarEscala() {
  const {
    selectedGerenciaDay, setSelectedGerenciaDay, selectedSector, setSelectedSector,
    gerenciaSearchQuery, setGerenciaSearchQuery,
    selectedFreelancersByDay, setSelectedFreelancersByDay,
    sentDays, returnedByDay, guestCountByDay, freelancersList,
    toggleGerenciaFreelancer, handleCancelGerenciaSelection, handleSendToRH,
    getShiftForDay, setShiftForDay,
    weekLabel, shiftWeek, GERENCIA_DAYS: weekDays,
    SHIFT_OPTIONS: shiftOptionsFromCtx,
    techSettings, requestStatusByDay, sentBaselineByDay,
    invitedByDay, freelancerInvites, triggerToast, openDayPicker,
  } = useApp();

  const days = weekDays?.length ? weekDays : GERENCIA_DAYS;
  const shifts = shiftOptionsFromCtx?.length ? shiftOptionsFromCtx : SHIFT_OPTIONS;
  const currentDayObj = days.find((d) => d.id === selectedGerenciaDay) || days[4] || days[0];
  const dayIsPast = !!currentDayObj?.isPast;
  const dayGuests = guestCountByDay[selectedGerenciaDay] ?? 0;
  const weekGuestCounts = days.map((d) => Number(guestCountByDay[d.id]) || 0);
  const staffingOpts = staffingOptionsFromTech(techSettings, weekGuestCounts);
  const dayNeeded = staffNeeded(dayGuests, staffingOpts);
  const shift = getShiftForDay?.(selectedGerenciaDay, selectedSector)
    || SECTOR_SHIFT[selectedSector]
    || '15h – 23h';

  const dayInviteEntries = useMemo(() => {
    const fromStore = (invitedByDay?.[selectedGerenciaDay] || []).map((e) => (
      typeof e === 'string' ? { code: e, time: '', status: 'pending' } : e
    ));
    const dayIso = currentDayObj?.iso;
    const fromInvites = (freelancerInvites || [])
      .filter((inv) => {
        const st = inv.status || 'pending';
        if (!['pending', 'accepted', 'declined', 'confirmed'].includes(st)) return false;
        return (inv.days || []).some((d) => {
          const iso = typeof d === 'string' ? d.slice(0, 10) : (d?.iso || '').slice(0, 10);
          return iso && dayIso && iso === dayIso;
        });
      })
      .map((inv) => ({
        code: inv.professionalId,
        time: inv.time || '',
        status: inv.status || 'pending',
      }));
    const map = new Map();
    [...fromStore, ...fromInvites].forEach((e) => {
      if (!e.code) return;
      const key = `${e.code}|${normalizeShiftTime(e.time || shift)}`;
      const prev = map.get(key);
      if (!prev || (e.status && e.status !== 'pending')) map.set(key, e);
    });
    return [...map.values()];
  }, [invitedByDay, selectedGerenciaDay, freelancerInvites, currentDayObj?.iso, shift]);

  const inviteOnShift = (code) => dayInviteEntries.find(
    (e) => e.code === code && (!e.time || shiftTimesMatch(e.time, shift)),
  );
  const inviteOtherShift = (code) => dayInviteEntries.find(
    (e) => e.code === code && e.time && !shiftTimesMatch(e.time, shift),
  );
  const isLockedOnShift = (code) => {
    const inv = inviteOnShift(code);
    return inv && ['pending', 'accepted', 'confirmed'].includes(inv.status || 'pending');
  };
  const statusLabel = (code) => {
    const inv = inviteOnShift(code);
    if (!inv) return null;
    if (inv.status === 'accepted' || inv.status === 'confirmed') return { text: 'Aceito', color: '#16A34A' };
    if (inv.status === 'declined') return { text: 'Recusou', color: '#DC2626' };
    return { text: 'Convocado', color: '#0066FF' };
  };

  const currentDaySelectedIds = selectedFreelancersByDay[selectedGerenciaDay] || [];
  // Escala do turno atual: selecionados livres neste horário + já convocados neste horário
  const shiftScaleIds = useMemo(() => {
    const ids = new Set();
    currentDaySelectedIds.forEach((id) => {
      const other = inviteOtherShift(id);
      const lockedOther = other && ['pending', 'accepted', 'confirmed'].includes(other.status || 'pending');
      if (lockedOther && !inviteOnShift(id)) return;
      ids.add(id);
    });
    dayInviteEntries.forEach((e) => {
      if (!e.time || shiftTimesMatch(e.time, shift)) ids.add(e.code);
    });
    return [...ids];
  }, [currentDaySelectedIds, dayInviteEntries, shift]);

  const currentDaySelectedFreelancers = freelancersList.filter(
    (f) => shiftScaleIds.includes(f.id) && f.sector === selectedSector,
  );
  const selectedCount = currentDaySelectedFreelancers.length;
  const gap = Math.max(0, dayNeeded - selectedCount);
  const alreadySent = ['requested', 'sent', 'confirmed'].includes(requestStatusByDay?.[selectedGerenciaDay]);
  const dayReturned = returnedByDay[selectedGerenciaDay];
  const selectionKey = currentDaySelectedFreelancers.map((f) => f.id).sort().join('|');
  const baselineKey = sentBaselineByDay?.[`${selectedGerenciaDay}:${selectedSector}`] ?? '';
  const teamChanged = selectionKey !== baselineKey;
  const canSend = !dayIsPast && selectedCount > 0 && (!alreadySent || dayReturned || teamChanged);

  const filteredFreelancers = freelancersList
    .filter((f) => f.sector === selectedSector)
    .filter((f) => {
      if (!gerenciaSearchQuery) return true;
      const q = gerenciaSearchQuery.toLowerCase();
      return f.name.toLowerCase().includes(q) || f.role.toLowerCase().includes(q) || (f.notes || '').toLowerCase().includes(q);
    });

  const isAllSelected = filteredFreelancers.length > 0 && filteredFreelancers.every((f) => shiftScaleIds.includes(f.id));

  const tryToggle = (id) => {
    if (dayIsPast) return;
    if (isLockedOnShift(id) && shiftScaleIds.includes(id)) {
      triggerToast('Já convocado neste horário. Só pode chamar em outro turno.', 'err');
      return;
    }
    toggleGerenciaFreelancer(id);
  };

  const handleToggleSelectAllDay = (e) => {
    if (e.target.checked) {
      const unlocked = filteredFreelancers.map((f) => f.id);
      const allIds = Array.from(new Set([...currentDaySelectedIds, ...unlocked]));
      setSelectedFreelancersByDay((prev) => ({ ...prev, [selectedGerenciaDay]: allIds }));
    } else {
      const unselectIds = new Set(
        filteredFreelancers.map((f) => f.id).filter((id) => !isLockedOnShift(id)),
      );
      const remaining = currentDaySelectedIds.filter((id) => !unselectIds.has(id));
      setSelectedFreelancersByDay((prev) => ({ ...prev, [selectedGerenciaDay]: remaining }));
    }
  };

  const peopleLabel = (n) => {
    const v = Number(n) || 0;
    return `${v} ${v === 1 ? 'pessoa' : 'pessoas'}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div>
        <h1 className="page-title">Montar escala</h1>
        <p className="page-sub">Escolha o dia e o turno — a previsão de pessoas fica em Configurações. Depois monte o time e envie ao RH.</p>
      </div>

      {dayReturned && (
        <div style={{
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: '2px',
          padding: '12px 14px',
          fontSize: '13px',
          color: '#7F1D1D',
          lineHeight: 1.45,
        }}>
          <div style={{ fontWeight: 600, marginBottom: '2px' }}>
            Devolvida pelo RH · {dayReturned.author}
          </div>
          {dayReturned.reason}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={() => shiftWeek?.(-1)}
            style={{ width: '32px', height: '32px', borderRadius: '4px', border: '1px solid #E2E8F0', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}
          >
            <ChevronLeft size={16} />
          </button>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '4px',
            fontSize: '13px',
            fontWeight: 500,
            color: '#0F172A',
          }}>
            <Calendar size={14} color="#64748B" />
            <span>{weekLabel || 'Esta semana'}</span>
          </div>
          <button
            type="button"
            onClick={() => shiftWeek?.(1)}
            style={{ width: '32px', height: '32px', borderRadius: '4px', border: '1px solid #E2E8F0', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
          {GERENCIA_SECTORS.map((sec) => {
            const isSecActive = selectedSector === sec.id;
            const SecIcon = sec.icon;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setSelectedSector(sec.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  border: isSecActive ? '1px solid #0066FF' : '1px solid transparent',
                  background: isSecActive ? '#EBF3FF' : 'transparent',
                  color: isSecActive ? '#0066FF' : '#64748B',
                  fontSize: '13px',
                  fontWeight: isSecActive ? 600 : 500,
                  cursor: 'pointer',
                }}
              >
                <SecIcon size={14} />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="week-strip" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
        {days.map((day) => {
          const isDayActive = selectedGerenciaDay === day.id;
          const count = (selectedFreelancersByDay[day.id] || []).length;
          const guests = guestCountByDay[day.id] ?? 0;
          const needed = staffNeeded(guests, staffingOpts);
          const pct = Math.min(100, Math.round((count / Math.max(1, needed)) * 100));
          const isSent = ['requested', 'sent', 'confirmed'].includes(requestStatusByDay?.[day.id]);
          const kind = rateKindForDay(day);
          const tone = dayMapTone(kind, { active: isDayActive, isToday: day.isToday });
          const dayShift = getShiftForDay?.(day.id, selectedSector) || SECTOR_SHIFT[selectedSector];
          const past = !!day.isPast;

          return (
            <div
              key={day.iso || day.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedGerenciaDay(day.id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedGerenciaDay(day.id); }}
              style={{
                background: tone.background,
                border: tone.border,
                borderRadius: '2px',
                padding: '12px 8px 10px',
                textAlign: 'left',
                cursor: 'pointer',
                opacity: past ? 0.72 : 1,
                boxShadow: kind !== 'week' && !isDayActive ? `inset 0 2px 0 0 ${tone.bar}` : 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: tone.title }}>
                  {day.label} {day.date}
                </span>
                {isSent && <Check size={12} color="#16A34A" />}
              </div>
              {past && (
                <div style={{ fontSize: '10px', color: '#94A3B8', marginBottom: '4px' }}>Dia passado</div>
              )}
              <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '6px' }}>
                {Number(guests) || 0} total de pessoas
              </div>
              <div style={{
                fontSize: '10px',
                fontWeight: 500,
                color: tone.meta,
                marginBottom: '6px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {dayShift}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                {count}/{needed}
              </div>
              <div style={{ height: '3px', background: '#E2E8F0', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${pct}%`,
                  background: count === 0 ? 'transparent' : (count >= needed ? '#16A34A' : '#0066FF'),
                }} />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '2px',
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
          Turno de {currentDayObj?.fullDay || 'hoje'}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {shifts.map((opt) => {
            const on = shift === opt.time;
            return (
              <button
                key={opt.id}
                type="button"
                disabled={dayIsPast}
                onClick={() => {
                  if (dayIsPast) return;
                  setShiftForDay?.(selectedGerenciaDay, opt.time);
                }}
                style={{
                  padding: '7px 12px',
                  borderRadius: '4px',
                  border: on ? '1px solid #0066FF' : '1px solid #E2E8F0',
                  background: on ? '#EBF3FF' : '#FFF',
                  color: on ? '#0066FF' : '#475569',
                  fontSize: '12px',
                  fontWeight: on ? 600 : 500,
                  cursor: dayIsPast ? 'not-allowed' : 'pointer',
                  textAlign: 'left',
                  opacity: dayIsPast ? 0.55 : 1,
                }}
              >
                <div>{opt.label}</div>
                <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '1px' }}>{opt.time}</div>
              </button>
            );
          })}
        </div>
        <div style={{ fontSize: '12px', color: '#64748B' }}>
          Previsão neste dia: <strong style={{ color: '#0F172A' }}>{peopleLabel(dayGuests)}</strong>
          {' · '}meta sugerida <strong style={{ color: '#0F172A' }}>{dayNeeded}</strong> na equipe
        </div>
      </div>

      <div className="split-2" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px', alignItems: 'start' }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
                Disponíveis
              </h2>
              <span style={{ fontSize: '12px', color: '#64748B' }}>{filteredFreelancers.length}</span>
            </div>
            <span style={{ fontSize: '12px', color: '#64748B' }}>
              {GERENCIA_SECTORS.find((s) => s.id === selectedSector)?.label} · {shift}
            </span>
          </div>

                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #E2E8F0' }}>
                      <div style={{ position: 'relative' }}>
                        <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '9px' }} />
                        <input
                          type="text"
                          value={gerenciaSearchQuery}
                          onChange={(e) => setGerenciaSearchQuery(e.target.value)}
                          placeholder="Buscar nome ou função…"
                          style={{
                            width: '100%',
                            padding: '8px 10px 8px 32px',
                            borderRadius: '4px',
                            border: '1px solid #E2E8F0',
                            fontSize: '13px',
                            outline: 'none',
                            background: '#F8FAFC'
                          }}
                        />
                      </div>
                    </div>

                    {filteredFreelancers.length === 0 ? (
                      <div style={{ padding: '36px 16px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                        Ninguém disponível neste setor para o filtro atual.
                      </div>
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                            <th style={{ width: '36px', padding: '8px 16px' }}>
                              <input
                                type="checkbox"
                                checked={isAllSelected}
                                onChange={handleToggleSelectAllDay}
                                style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: '#0066FF' }}
                              />
                            </th>
                            <th style={{ padding: '8px 8px', fontSize: '11px', fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Nome</th>
                            <th style={{ padding: '8px 8px', fontSize: '11px', fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Função</th>
                            <th style={{ width: '44px' }} />
                          </tr>
                        </thead>
                        <tbody>
                          {filteredFreelancers.map(f => {
                            const isSelected = shiftScaleIds.includes(f.id);
                            const locked = isLockedOnShift(f.id);
                            const badge = statusLabel(f.id);
                            const other = inviteOtherShift(f.id);
                            return (
                              <tr
                                key={f.id}
                                onClick={() => tryToggle(f.id)}
                                style={{
                                  borderBottom: '1px solid #F1F5F9',
                                  background: isSelected ? '#F8FAFC' : 'transparent',
                                  cursor: locked ? 'default' : 'pointer',
                                  opacity: other && !isSelected ? 0.85 : 1,
                                }}
                              >
                                <td style={{ padding: '10px 16px' }} onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    disabled={locked || dayIsPast}
                                    onChange={() => tryToggle(f.id)}
                                    style={{ width: '15px', height: '15px', cursor: locked ? 'not-allowed' : 'pointer', accentColor: '#0066FF' }}
                                  />
                                </td>
                                <td style={{ padding: '10px 8px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Avatar src={f.avatar} name={f.name} size={28} />
                                    <div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '13px', fontWeight: 500, color: '#0F172A' }}>{f.name}</span>
                                        {badge && (
                                          <span style={{ fontSize: '10px', fontWeight: 600, color: badge.color }}>{badge.text}</span>
                                        )}
                                        {!badge && other && (
                                          <span style={{ fontSize: '10px', fontWeight: 500, color: '#64748B' }}>
                                            Já em {other.time}
                                          </span>
                                        )}
                                      </div>
                                      {f.notes ? (
                                        <div style={{ fontSize: '11px', color: '#64748B' }}>{f.notes}</div>
                                      ) : null}
                                    </div>
                                  </div>
                                </td>
                                <td style={{ padding: '10px 8px', fontSize: '13px', color: '#64748B' }}>{f.role}</td>
                                <td style={{ padding: '10px 12px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                                  <button
                                    type="button"
                                    onClick={() => triggerToast(`WhatsApp: ${f.name} · ${f.phone}`)}
                                    style={{
                                      width: '28px',
                                      height: '28px',
                                      borderRadius: '4px',
                                      border: '1px solid #E2E8F0',
                                      background: '#FFFFFF',
                                      color: '#64748B',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      cursor: 'pointer'
                                    }}
                                    title="WhatsApp"
                                  >
                                    <Phone size={13} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #E2E8F0', gap: '8px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
                          Escala de {currentDayObj.fullDay}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {selectedCount > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                const ids = selectedFreelancersByDay[selectedGerenciaDay] || [];
                                openDayPicker({
                                  id: '__team__',
                                  name: 'equipe do dia',
                                  sector: selectedSector,
                                  _teamIds: ids,
                                });
                              }}
                              className="btn-outline"
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                            >
                              Replicar dias
                            </button>
                          )}
                          <span style={{ fontSize: '12px', color: gap === 0 ? '#16A34A' : '#0066FF', fontWeight: 600 }}>
                            {selectedCount}/{dayNeeded}
                          </span>
                        </div>
                      </div>

                      <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                        {currentDaySelectedFreelancers.length === 0 ? (
                          <div style={{ padding: '28px 16px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                            Marque na lista ao lado para montar a escala.
                          </div>
                        ) : (
                          currentDaySelectedFreelancers.map(f => {
                            const locked = isLockedOnShift(f.id);
                            const badge = statusLabel(f.id);
                            return (
                            <div
                              key={f.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '10px 16px',
                                borderBottom: '1px solid #F1F5F9'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Avatar src={f.avatar} name={f.name} size={28} />
                                <div>
                                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#0F172A' }}>{f.name}</div>
                                  <div style={{ fontSize: '11px', color: badge?.color || '#64748B' }}>
                                    {badge ? `${badge.text} · ${f.role}` : f.role}
                                  </div>
                                </div>
                              </div>
                              {locked ? (
                                <span style={{ fontSize: '10px', fontWeight: 600, color: badge?.color || '#0066FF' }}>
                                  {badge?.text || 'OK'}
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => tryToggle(f.id)}
                                  style={{ color: '#94A3B8', padding: '4px', display: 'flex' }}
                                  title="Remover"
                                >
                                  <X size={14} />
                                </button>
                              )}
                            </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '2px', padding: '16px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', marginBottom: '14px' }}>Resumo</div>
                      {[
                        { label: 'Pessoas', value: peopleLabel(selectedCount) },
                        { label: 'Turno', value: shift },
                        { label: 'Meta', value: `${dayNeeded} pessoas` },
                        { label: 'Faltam', value: gap === 0 ? 'Completo' : `${gap} vaga${gap > 1 ? 's' : ''}` },
                      ].map((row) => (
                        <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #F1F5F9', fontSize: '13px' }}>
                          <span style={{ color: '#64748B' }}>{row.label}</span>
                          <span style={{ color: '#0F172A', fontWeight: 500 }}>{row.value}</span>
                        </div>
                      ))}
                    </div>

                    {dayIsPast ? (
                      <div style={{ fontSize: '12px', color: '#DC2626', padding: '0 2px' }}>
                        Dia passado — só consulta. Monte a escala a partir de hoje.
                      </div>
                    ) : dayReturned ? (
                      <div style={{ fontSize: '12px', color: '#DC2626', padding: '0 2px' }}>
                        Ajuste a equipe e reenvie ao RH.
                      </div>
                    ) : alreadySent && !teamChanged ? (
                      <div style={{ fontSize: '12px', color: '#16A34A', padding: '0 2px' }}>
                        Esta escala já foi enviada ao RH. Altere a equipe para reenviar.
                      </div>
                    ) : selectedCount === 0 ? (
                      <div style={{ fontSize: '12px', color: '#64748B', padding: '0 2px' }}>
                        Selecione ao menos um profissional para enviar.
                      </div>
                    ) : null}

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={handleCancelGerenciaSelection}
                        className="btn-outline"
                        disabled={dayIsPast || selectedCount === 0}
                        style={{ flex: 1, padding: '10px', justifyContent: 'center', opacity: (dayIsPast || selectedCount === 0) ? 0.45 : 1 }}
                      >
                        Limpar
                      </button>
                      <button
                        type="button"
                        onClick={handleSendToRH}
                        className="btn-primary"
                        disabled={!canSend}
                        style={{ flex: 1.6, padding: '10px', opacity: canSend ? 1 : 0.45, cursor: canSend ? 'pointer' : 'not-allowed' }}
                      >
                        <Send size={14} /> {dayReturned || (alreadySent && teamChanged) ? 'Reenviar ao RH' : alreadySent ? 'Reenviar ao RH' : 'Enviar ao RH'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
}

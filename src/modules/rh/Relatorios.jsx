import React from 'react';
import {
  Calendar, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useApp } from '../../store/AppContext';
import {
  GERENCIA_DAYS, GERENCIA_SECTORS,
  formatBRL, dailyRateFor, flattenSelectionCodes, freelaInSector,
} from '../../lib/constants';

export default function Relatorios() {
  const {
    triggerToast,
    selectedFreelancersByDay, guestCountByDay, dailyRates,
    freelancersList, checkedInIds, freelancerInvites,
    GERENCIA_DAYS: weekDays, weekLabel, shiftWeek,
  } = useApp();

  const days = weekDays?.length ? weekDays : GERENCIA_DAYS;

  const weekGuests = days.reduce(
    (sum, d) => sum + (Number(guestCountByDay[d.id]) || 0),
    0
  );

  const bySector = GERENCIA_SECTORS.map((sector) => {
    let people = 0;
    let role = '—';
    days.forEach((day) => {
      flattenSelectionCodes(selectedFreelancersByDay[day.id] || []).forEach((code) => {
        const f = freelancersList.find((p) => p.id === code);
        if (f && freelaInSector(f, sector.id)) {
          people += 1;
          role = f.role;
        }
      });
    });
    const weekPart = Math.round(people * 0.7);
    const weekendPart = people - weekPart;
    const cost =
      weekPart * dailyRateFor(role === '—' ? 'Garçom' : role, 'week', dailyRates) +
      weekendPart * dailyRateFor(role === '—' ? 'Garçom' : role, 'weekend', dailyRates);
    return { sector: sector.label, people, role, days: people > 0 ? 1 : 0, cost };
  }).filter((row) => row.people > 0);

  const totalCost = bySector.reduce((s, r) => s + r.cost, 0);
  const maxCost = Math.max(...bySector.map((r) => r.cost), 1);
  const costPerGuest = weekGuests > 0 ? totalCost / weekGuests : 0;

  const sent = freelancerInvites.filter((i) => i.status === 'pending' || i.status === 'accepted' || i.status === 'declined').length
    || freelancerInvites.length;
  const accepted = freelancerInvites.filter((i) => i.status === 'accepted').length;
  const declined = freelancerInvites.filter((i) => i.status === 'declined').length;
  const noResponse = freelancerInvites.filter((i) => i.status === 'pending').length;
  const funnel = [
    { label: 'Convites enviados', value: sent },
    { label: 'Aceitos', value: accepted },
    { label: 'Sem resposta', value: noResponse },
    { label: 'Recusados', value: declined },
  ];
  const acceptRate = sent > 0 ? Math.round((accepted / sent) * 100) : 0;
  const present = checkedInIds.length;
  const expected = Math.max(
    present,
    Object.values(selectedFreelancersByDay || {}).reduce((n, list) => n + flattenSelectionCodes(list).length, 0),
  );
  const noShow = Math.max(0, expected - present);
  const presenceRate = expected > 0 ? Math.round((present / expected) * 100) : (present > 0 ? 100 : 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 className="page-title">Relatórios</h1>
          <p className="page-sub">Custo por setor, conversão de convites e presença da semana.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={() => shiftWeek(-1)}
            aria-label="Semana anterior"
            style={{ width: '32px', height: '32px', borderRadius: '4px', border: '1px solid #E2E8F0', background: '#FFF', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <ChevronLeft size={16} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '4px', fontSize: '13px', fontWeight: 500 }}>
            <Calendar size={14} color="#64748B" />
            {weekLabel || 'Esta semana'}
          </div>
          <button
            type="button"
            onClick={() => shiftWeek(1)}
            aria-label="Próxima semana"
            style={{ width: '32px', height: '32px', borderRadius: '4px', border: '1px solid #E2E8F0', background: '#FFF', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div style={{ fontSize: '13px', color: '#64748B' }}>
        <span style={{ color: '#0F172A', fontWeight: 600 }}>{formatBRL(totalCost)}</span> total
        <span style={{ margin: '0 8px', color: '#CBD5E1' }}>·</span>
        <span style={{ color: '#0F172A', fontWeight: 600 }}>{formatBRL(costPerGuest)}</span> / pessoa
        <span style={{ margin: '0 8px', color: '#CBD5E1' }}>·</span>
        <span style={{ color: '#0F172A', fontWeight: 600 }}>{weekGuests}</span> pessoas na semana
        <span style={{ margin: '0 8px', color: '#CBD5E1' }}>·</span>
        <span style={{ color: '#16A34A', fontWeight: 600 }}>{acceptRate}%</span> aceite
        <span style={{ margin: '0 8px', color: '#CBD5E1' }}>·</span>
        <span style={{ color: '#16A34A', fontWeight: 600 }}>{presenceRate}%</span> presença
      </div>

      <div className="split-2" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px', alignItems: 'start' }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '2px' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>Custo por setor</div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
              Diárias da casa · semana + fim de semana
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '8px 16px', fontSize: '11px', fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Setor</th>
                <th style={{ padding: '8px 8px', fontSize: '11px', fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Diárias</th>
                <th style={{ padding: '8px 8px', fontSize: '11px', fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Custo</th>
                <th style={{ padding: '8px 16px 8px 8px', fontSize: '11px', fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', width: '28%' }}>Share</th>
              </tr>
            </thead>
            <tbody>
              {bySector.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '20px 16px', color: '#94A3B8', fontSize: '13px', textAlign: 'center' }}>
                    Sem dados operacionais ainda neste estabelecimento.
                  </td>
                </tr>
              )}
              {bySector.map((row) => {
                const pct = totalCost > 0 ? Math.round((row.cost / totalCost) * 100) : 0;
                const bar = Math.round((row.cost / maxCost) * 100);
                return (
                  <tr key={row.sector} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 500, color: '#0F172A' }}>{row.sector}</td>
                    <td style={{ padding: '12px 8px', color: '#64748B' }}>{row.people}</td>
                    <td style={{ padding: '12px 8px', fontWeight: 500, color: '#0F172A' }}>{formatBRL(row.cost)}</td>
                    <td style={{ padding: '12px 16px 12px 8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '4px', background: '#E2E8F0', overflow: 'hidden' }}>
                          <div style={{ width: `${bar}%`, height: '100%', background: '#0066FF' }} />
                        </div>
                        <span style={{ fontSize: '12px', color: '#64748B', width: '32px', textAlign: 'right' }}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '2px', padding: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', marginBottom: '4px' }}>Convites</div>
            <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '14px' }}>
              Taxa de aceite {acceptRate}%
            </div>
            {funnel.map((row, idx) => (
              <div
                key={row.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: idx < funnel.length - 1 ? '1px solid #F1F5F9' : 'none',
                  fontSize: '13px',
                }}
              >
                <span style={{ color: '#64748B' }}>{row.label}</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>{row.value}</span>
              </div>
            ))}
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '2px', padding: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', marginBottom: '4px' }}>Presença no turno</div>
            <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '14px' }}>
              Confirmados pelo maître no salão
            </div>
            {[
              { label: 'Presentes', value: present, color: '#16A34A' },
              { label: 'Faltas / no-show', value: noShow, color: '#DC2626' },
              { label: 'Taxa de presença', value: `${presenceRate}%`, color: '#0F172A' },
            ].map((row, idx, arr) => (
              <div
                key={row.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: idx < arr.length - 1 ? '1px solid #F1F5F9' : 'none',
                  fontSize: '13px',
                }}
              >
                <span style={{ color: '#64748B' }}>{row.label}</span>
                <span style={{ fontWeight: 600, color: row.color }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '2px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '13px', color: '#64748B' }}>
          Exportação usa apenas dados reais deste estabelecimento.
        </div>
        <button
          type="button"
          className="btn-outline"
          style={{ padding: '8px 14px' }}
          onClick={() => triggerToast('Resumo exportado.', 'ok')}
        >
          Exportar resumo
        </button>
      </div>
    </div>
  );
}

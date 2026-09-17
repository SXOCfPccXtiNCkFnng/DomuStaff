import React, { useMemo } from 'react';
import { Plus } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import {
  GERENCIA_SECTORS,
  staffNeeded,
  staffingOptionsFromTech,
} from '../../lib/constants';

function statusMeta({ sent, returned, requestStatus }) {
  if (returned) {
    return {
      label: 'Devolvida pela RH',
      color: '#DC2626',
      bg: '#FEF2F2',
      action: 'Ajustar',
    };
  }
  if (requestStatus === 'sent') {
    return {
      label: 'Convocando',
      color: '#0066FF',
      bg: '#EBF3FF',
      action: 'Abrir',
    };
  }
  if (requestStatus === 'confirmed') {
    return {
      label: 'Confirmada',
      color: '#16A34A',
      bg: '#F0FDF4',
      action: 'Abrir',
    };
  }
  if (sent || requestStatus === 'requested') {
    return {
      label: 'No RH',
      color: '#CA8A04',
      bg: '#FEFCE8',
      action: 'Abrir',
    };
  }
  return {
    label: 'Rascunho',
    color: '#64748B',
    bg: '#F1F5F9',
    action: 'Continuar',
  };
}

export default function Pedidos() {
  const {
    setCurrentView,
    selectedSector,
    setSelectedGerenciaDay,
    selectedFreelancersByDay,
    sentDays,
    returnedByDay,
    guestCountByDay,
    requestStatusByDay = {},
    GERENCIA_DAYS: weekDays,
    weekLabel,
    getShiftForDay,
    techSettings,
  } = useApp();

  const sectorMeta = GERENCIA_SECTORS.find((s) => s.id === selectedSector) || GERENCIA_SECTORS[0];
  const sectorLabel = sectorMeta?.label || 'Setor';

  const orders = useMemo(() => {
    const days = weekDays?.length ? weekDays : [];
    const weekGuestCounts = days.map((d) => Number(guestCountByDay[d.id]) || 0);
    const staffingOpts = staffingOptionsFromTech(techSettings, weekGuestCounts);
    return days
      .map((day) => {
        const codes = selectedFreelancersByDay[day.id] || [];
        const guests = Number(guestCountByDay[day.id]) || 0;
        const needed = staffNeeded(guests, staffingOpts);
        const sent = !!sentDays[day.id];
        const returned = returnedByDay[day.id];
        const requestStatus = requestStatusByDay[day.id] || null;
        const hasActivity = codes.length > 0 || sent || returned || (requestStatus && requestStatus !== 'draft');
        if (!hasActivity) return null;

        const meta = statusMeta({ sent, returned, requestStatus });
        const shift = getShiftForDay?.(day.id, selectedSector) || '—';
        const title = `${day.fullDay || day.label} · ${sectorLabel} · ${shift}`;
        const detail = returned
          ? `Motivo do RH: ${returned.reason}`
          : `${codes.length}/${needed || codes.length || 0} na lista · ${guests} total de pessoas`;

        return {
          day: day.id,
          title: title.charAt(0).toUpperCase() + title.slice(1),
          meta: detail,
          status: meta.label,
          statusColor: meta.color,
          statusBg: meta.bg,
          actionLabel: meta.action,
          sortKey: day.iso || day.id,
        };
      })
      .filter(Boolean)
      .sort((a, b) => String(b.sortKey).localeCompare(String(a.sortKey)));
  }, [
    weekDays,
    selectedFreelancersByDay,
    guestCountByDay,
    sentDays,
    returnedByDay,
    requestStatusByDay,
    selectedSector,
    sectorLabel,
    getShiftForDay,
    techSettings,
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
            Meus pedidos
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0' }}>
            {(weekLabel || 'Esta semana')} · {sectorLabel}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCurrentView('gerencia_montar_escala')}
          className="btn-primary"
          style={{ padding: '10px 16px' }}
        >
          <Plus size={15} /> Nova escala
        </button>
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '2px' }}>
        {orders.length === 0 ? (
          <div style={{ padding: '28px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
              Nenhum pedido nesta semana
            </div>
            <div style={{ fontSize: '13px', color: '#64748B', marginTop: '6px', lineHeight: 1.45 }}>
              Monte uma escala e ela aparece aqui. O RH vê os pedidos de toda a equipe nas Escalas da semana.
            </div>
            <button
              type="button"
              className="btn-primary"
              style={{ marginTop: '16px', padding: '10px 16px' }}
              onClick={() => setCurrentView('gerencia_montar_escala')}
            >
              <Plus size={15} /> Montar escala
            </button>
          </div>
        ) : (
          orders.map((order, idx) => (
            <div
              key={order.day}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                padding: '14px 16px',
                borderBottom: idx < orders.length - 1 ? '1px solid #F1F5F9' : 'none',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
                  {order.title}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '3px' }}>
                  {order.meta}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                <span
                  style={{
                    padding: '3px 8px',
                    borderRadius: '2px',
                    fontSize: '11px',
                    fontWeight: 500,
                    color: order.statusColor,
                    background: order.statusBg,
                  }}
                >
                  {order.status}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGerenciaDay(order.day);
                    setCurrentView('gerencia_montar_escala');
                  }}
                  className="btn-outline"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                >
                  {order.actionLabel}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

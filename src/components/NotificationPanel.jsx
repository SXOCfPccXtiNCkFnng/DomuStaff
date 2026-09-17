import React from 'react';
import { Bell, CheckCheck, X } from 'lucide-react';

function formatWhen(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    if (sameDay) return `Hoje · ${time}`;
    return `${d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} · ${time}`;
  } catch {
    return '';
  }
}

export default function NotificationPanel({
  open,
  onClose,
  items = [],
  onOpenItem,
  onMarkAllRead,
}) {
  if (!open) return null;

  const unread = items.filter((n) => !n.read).length;

  return (
    <>
      <button
        type="button"
        aria-label="Fechar notificações"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'transparent',
          border: 'none',
          zIndex: 70,
          cursor: 'default',
        }}
      />
      <div
        role="dialog"
        aria-label="Histórico de notificações"
        style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          width: 'min(360px, calc(100vw - 24px))',
          maxHeight: 'min(420px, 70vh)',
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '6px',
          boxShadow: '0 16px 40px rgba(15, 23, 42, 0.16)',
          zIndex: 75,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          padding: '12px 14px',
          borderBottom: '1px solid #E2E8F0',
        }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>Notificações</div>
            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '1px' }}>
              {unread > 0 ? `${unread} não lida${unread > 1 ? 's' : ''}` : 'Tudo lido'}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {unread > 0 && (
              <button
                type="button"
                onClick={onMarkAllRead}
                title="Marcar todas como lidas"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  border: 'none',
                  background: 'transparent',
                  color: '#0066FF',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '4px 6px',
                }}
              >
                <CheckCheck size={14} /> Ler todas
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              style={{
                border: 'none',
                background: 'transparent',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }}>
          {items.length === 0 ? (
            <div style={{ padding: '28px 16px', textAlign: 'center' }}>
              <Bell size={22} color="#CBD5E1" style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '13px', fontWeight: 500, color: '#0F172A' }}>Nada por aqui</div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', lineHeight: 1.4 }}>
                Quando chegar algo novo, aparece neste histórico.
              </div>
            </div>
          ) : (
            items.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => onOpenItem?.(n)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  border: 'none',
                  borderBottom: '1px solid #F1F5F9',
                  background: n.read ? '#FFFFFF' : '#F8FBFF',
                  padding: '12px 14px',
                  cursor: 'pointer',
                  display: 'flex',
                  gap: '10px',
                }}
              >
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '999px',
                  marginTop: '5px',
                  flexShrink: 0,
                  background: n.read ? 'transparent' : '#0066FF',
                }} />
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: n.read ? 500 : 600,
                    color: '#0F172A',
                    lineHeight: 1.35,
                  }}>
                    {n.title}
                  </span>
                  {n.body ? (
                    <span style={{
                      display: 'block',
                      fontSize: '12px',
                      color: '#64748B',
                      marginTop: '3px',
                      lineHeight: 1.4,
                    }}>
                      {n.body}
                    </span>
                  ) : null}
                  <span style={{
                    display: 'block',
                    fontSize: '11px',
                    color: '#94A3B8',
                    marginTop: '6px',
                  }}>
                    {formatWhen(n.at)}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
}

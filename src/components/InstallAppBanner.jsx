import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

const DISMISS_KEY = 'domu_install_banner_dismissed';
const DISMISS_DAYS = 14;

function isMobileUa() {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

function isStandalone() {
  if (typeof window === 'undefined') return true;
  const mq = window.matchMedia?.('(display-mode: standalone)')?.matches;
  const ios = window.navigator.standalone === true;
  return Boolean(mq || ios);
}

function wasDismissedRecently() {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const at = Number(raw);
    if (!Number.isFinite(at)) return false;
    return Date.now() - at < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function isIos() {
  if (typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/**
 * Banner no celular pedindo para instalar o app (PWA).
 * Android Chrome: beforeinstallprompt.
 * iOS Safari: orienta "Adicionar à Tela de Início".
 */
export default function InstallAppBanner() {
  const [visible, setVisible] = useState(false);
  const [deferred, setDeferred] = useState(null);
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    if (!isMobileUa() || isStandalone() || wasDismissedRecently()) return undefined;

    let bipSeen = false;

    const onBip = (e) => {
      e.preventDefault();
      bipSeen = true;
      setDeferred(e);
      setVisible(true);
      setShowIosHelp(false);
    };
    window.addEventListener('beforeinstallprompt', onBip);

    const t = window.setTimeout(() => {
      if (isStandalone() || bipSeen) return;
      setVisible(true);
      if (isIos()) setShowIosHelp(true);
    }, 1400);

    return () => {
      window.clearTimeout(t);
      window.removeEventListener('beforeinstallprompt', onBip);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    setShowIosHelp(false);
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch { /* ignore */ }
  };

  const install = async () => {
    if (deferred) {
      deferred.prompt();
      try { await deferred.userChoice; } catch { /* ignore */ }
      setDeferred(null);
      dismiss();
      return;
    }
    if (showIosHelp) {
      dismiss();
      return;
    }
    if (isIos()) {
      setShowIosHelp(true);
      return;
    }
    setShowIosHelp(true);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Instalar Domu Staff"
      style={{
        position: 'fixed',
        left: 12,
        right: 12,
        bottom: 'max(12px, env(safe-area-inset-bottom))',
        zIndex: 12000,
        background: '#0F172A',
        color: '#F8FAFC',
        borderRadius: 12,
        padding: '14px 14px 14px 16px',
        boxShadow: '0 12px 40px rgba(15, 23, 42, 0.35)',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        maxWidth: 480,
        margin: '0 auto',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, background: '#0066FF',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Download size={20} color="#FFF" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3 }}>
            Baixe o app Domu Staff
          </div>
          <div style={{ fontSize: 12, color: '#CBD5E1', marginTop: 4, lineHeight: 1.45 }}>
            {showIosHelp
              ? 'No iPhone/iPad: toque em Compartilhar (□↑) e depois em “Adicionar à Tela de Início”.'
              : 'Instale no celular para abrir mais rápido e receber convites como app.'}
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Fechar"
          style={{
            background: 'transparent', border: 'none', color: '#94A3B8',
            cursor: 'pointer', padding: 4, lineHeight: 0,
          }}
        >
          <X size={18} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          onClick={dismiss}
          style={{
            flex: 1, padding: '10px 12px', borderRadius: 8,
            border: '1px solid #334155', background: 'transparent',
            color: '#E2E8F0', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}
        >
          Agora não
        </button>
        <button
          type="button"
          onClick={install}
          style={{
            flex: 1.4, padding: '10px 12px', borderRadius: 8,
            border: 'none', background: '#0066FF',
            color: '#FFF', fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}
        >
          {deferred ? 'Instalar app' : showIosHelp ? 'Entendi' : 'Baixar app'}
        </button>
      </div>
    </div>
  );
}

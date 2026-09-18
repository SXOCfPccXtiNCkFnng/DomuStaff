/**
 * Web Push — inscrição no dispositivo + helpers.
 * Requer VITE_VAPID_PUBLIC_KEY e service worker com listener `push`.
 */

import { supabase, isSupabaseConfigured } from './supabase';

const VAPID_PUBLIC = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

export function isWebPushSupported() {
  return typeof window !== 'undefined'
    && 'serviceWorker' in navigator
    && 'PushManager' in window
    && 'Notification' in window
    && !!VAPID_PUBLIC;
}

export function pushPermission() {
  if (typeof Notification === 'undefined') return 'unsupported';
  return Notification.permission;
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) out[i] = raw.charCodeAt(i);
  return out;
}

async function getRegistration() {
  if (!('serviceWorker' in navigator)) return null;
  return navigator.serviceWorker.ready;
}

/** Inscreve o dispositivo e grava no Supabase (profile_id = auth.uid()). */
export async function enableWebPush(profileId) {
  if (!isWebPushSupported()) {
    throw new Error('Este navegador não suporta notificações push. No iPhone, use o app instalado na Tela de Início.');
  }
  if (!profileId) throw new Error('Faça login novamente.');
  if (!isSupabaseConfigured) {
    throw new Error('Supabase não configurado.');
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Permissão negada. Ative nas configurações do sistema / navegador.');
  }

  const reg = await getRegistration();
  if (!reg) throw new Error('Service worker não disponível. Recarregue o app.');

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
    });
  }

  const json = sub.toJSON();
  const endpoint = json.endpoint;
  const p256dh = json.keys?.p256dh;
  const auth = json.keys?.auth;
  if (!endpoint || !p256dh || !auth) {
    throw new Error('Não foi possível obter a subscription de push.');
  }

  const { error } = await supabase.from('push_subscriptions').upsert({
    profile_id: profileId,
    endpoint,
    p256dh,
    auth,
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 240) : null,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'endpoint' });

  if (error) throw new Error(error.message);
  return true;
}

export async function disableWebPush(profileId) {
  const reg = await getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  if (sub) {
    const endpoint = sub.endpoint;
    try { await sub.unsubscribe(); } catch { /* ignore */ }
    if (isSupabaseConfigured && profileId && endpoint) {
      await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);
    }
  }
  return true;
}

export async function hasActivePushSubscription() {
  if (!isWebPushSupported()) return false;
  if (Notification.permission !== 'granted') return false;
  const reg = await getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  return !!sub;
}

/** Re-sincroniza subscription se a permissão já foi dada (ex.: login em dispositivo já autorizado). */
export async function syncWebPushIfGranted(profileId) {
  if (!profileId || !isWebPushSupported()) return false;
  if (Notification.permission !== 'granted') return false;
  try {
    await enableWebPush(profileId);
    return true;
  } catch {
    return false;
  }
}

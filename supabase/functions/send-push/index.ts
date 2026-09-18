// Domu Staff — envia Web Push para um ou mais perfis.
// Secrets necessários (Dashboard → Edge Functions → Secrets, ou `supabase secrets set`):
//   VAPID_PUBLIC_KEY
//   VAPID_PRIVATE_KEY
//   (SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY já vêm no runtime)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import webpush from 'npm:web-push@3.6.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

webpush.setVapidDetails(
  'mailto:suporte@domustaff.app',
  Deno.env.get('VAPID_PUBLIC_KEY') || '',
  Deno.env.get('VAPID_PRIVATE_KEY') || '',
);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const vapidPub = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPriv = Deno.env.get('VAPID_PRIVATE_KEY');
    if (!vapidPub || !vapidPriv) {
      return json({ error: 'VAPID keys não configuradas' }, 500);
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Não autenticado' }, 401);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) return json({ error: 'Sessão inválida' }, 401);

    const body = await req.json().catch(() => ({}));
    const title = String(body.title || 'Domu Staff').slice(0, 120);
    const text = String(body.body || '').slice(0, 240);
    const view = body.view ? String(body.view) : null;
    const tag = body.tag ? String(body.tag) : `domu-${Date.now()}`;
    const url = body.url ? String(body.url) : '/';

    const admin = createClient(supabaseUrl, serviceKey);

    let profileIds: string[] = Array.isArray(body.profileIds)
      ? body.profileIds.filter((id: unknown) => typeof id === 'string' && id)
      : [];

    if ((!profileIds.length) && body.hotelId && Array.isArray(body.roles) && body.roles.length) {
      const { data: staff } = await admin
        .from('profiles')
        .select('id, role, hotel_id')
        .eq('hotel_id', body.hotelId)
        .in('role', body.roles);
      profileIds = (staff || []).map((p) => p.id);
    }

    // Quem dispara não precisa receber o próprio push
    profileIds = [...new Set(profileIds)].filter((id) => id !== user.id);
    if (!profileIds.length) {
      return json({ ok: true, sent: 0, reason: 'nenhum destinatário' });
    }

    const { data: subs, error: subErr } = await admin
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth')
      .in('profile_id', profileIds);

    if (subErr) return json({ error: subErr.message }, 500);
    if (!subs?.length) {
      return json({ ok: true, sent: 0, reason: 'sem subscriptions' });
    }

    const payload = JSON.stringify({
      title,
      body: text,
      tag,
      url,
      view,
    });

    let sent = 0;
    const stale: string[] = [];

    await Promise.all(subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload,
          { TTL: 60 * 60 * 12, urgency: 'high' },
        );
        sent += 1;
      } catch (err) {
        const status = err?.statusCode || err?.status;
        if (status === 404 || status === 410) stale.push(sub.id);
      }
    }));

    if (stale.length) {
      await admin.from('push_subscriptions').delete().in('id', stale);
    }

    return json({ ok: true, sent, stale: stale.length });
  } catch (err) {
    return json({ error: err?.message || 'Falha ao enviar push' }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

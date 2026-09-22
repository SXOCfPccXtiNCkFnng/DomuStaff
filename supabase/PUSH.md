# Web Push — Domu Staff

## 1. SQL
No SQL Editor do Supabase, rode `push_subscriptions.sql`.

## 2. Chaves VAPID
Já geradas para este projeto (guarde a privada só nos Secrets):

- **Pública** → `VITE_VAPID_PUBLIC_KEY` no `.env.local` (e no Vercel)
- **Privada** → secret `VAPID_PRIVATE_KEY` da Edge Function

Se precisar gerar de novo:
```bash
npx web-push generate-vapid-keys --json
```

## 3. Secrets da Edge Function
No Dashboard: **Project Settings → Edge Functions → Secrets**, ou CLI:

```bash
supabase secrets set VAPID_PUBLIC_KEY="SUA_CHAVE_PRIVADA_AQUI"
supabase secrets set VAPID_PRIVATE_KEY="SUA_CHAVE_PRIVADA_AQUI"
```

## 4. Deploy da função
```bash
supabase functions deploy send-push
```

Ou pelo Dashboard: Edge Functions → Create → cole o código de `functions/send-push/index.ts`.

## 5. App
1. Adicione no `.env.local` (e reinicie o Vite):
   ```
   VITE_VAPID_PUBLIC_KEY=BP-tBLwruzz8X2ewLsQKt32XgcGkdQ5FwMyAT6IUwqcR1RLqPIrGAM3eC-Ctm8qv8_wBX2g_dNeLQ1VIOqvXMw8
   ```
2. No celular: instale o PWA → Configurações → **Ativar notificações no celular**
3. iPhone: só funciona se o app estiver na Tela de Início (Safari → Compartilhar → Adicionar)

## Teste rápido
Com o app fechado no celular do freela, o RH aprova e envia a escala — o push deve aparecer na tela de bloqueio.

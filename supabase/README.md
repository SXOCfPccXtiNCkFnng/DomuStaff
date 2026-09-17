# Supabase — Domu Staff

1. Crie um projeto em https://supabase.com
2. SQL Editor: rode `setup_complete.sql` (schema + seed + trigger de perfil)
3. Copie `.env.example` para `.env.local` (ou `.env`) na raiz do app:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

4. **Login bloqueado por "confirme seu e-mail"**
   - Atalho (recomendado agora): rode `fix_confirm_email.sql` no SQL Editor
   - Ou em Authentication → Users → abra o usuário → **Confirm user**
   - O toggle **Confirm email** fica em Authentication → Sign In / Providers → Email → role até **User Signups** (em alguns projetos some da UI; o SQL resolve igual)

5. Rode `fix_hotel_link.sql` para contas novas **não** herdarem o Hotel Atlântico automaticamente

6. Rode `link_to_hotel.sql` para o freelancer/gerência vincular pelo código e entrar na base de profissionais

7. (Opcional) Rode também `hotels_cnpj.sql` para CNPJ único + código do hotel

8. Rode `enable_realtime_shift_requests.sql` para avisos em tempo real (escalas + convites do freelancer), sem recarregar a página

9. Reinicie `npm run dev`

Contas demo (senha `domu123`):

- `marcos.ferreira@atlantico.com.br` — Gerência
- `renata.prado@atlantico.com.br` — RH
- `joao.pedro@domustaff.app` — Freelancer

Sem as chaves, o app grava no navegador (localStorage) com as mesmas contas.

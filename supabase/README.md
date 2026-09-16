# Supabase — Domu Staff

1. Crie um projeto em https://supabase.com
2. SQL Editor: rode `setup_complete.sql` (schema + seed + trigger de perfil)
3. Copie `.env.example` para `.env.local` (ou `.env`) na raiz do app:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

4. **Importante para cadastro funcionar em desenvolvimento**
   - Abra Authentication → Providers → Email
   - Desative **Confirm email**
   - Sem isso, o plano gratuito estoura o limite de e-mail (`email rate limit exceeded`) e a conta **não entra** no Auth/banco

5. Reinicie `npm run dev`

Contas demo (senha `domu123`):

- `marcos.ferreira@atlantico.com.br` — Gerência
- `renata.prado@atlantico.com.br` — RH
- `joao.pedro@domustaff.app` — Freelancer

Sem as chaves, o app grava no navegador (localStorage) com as mesmas contas.

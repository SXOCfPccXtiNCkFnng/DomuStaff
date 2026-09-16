# Supabase — Domu Staff

1. Crie um projeto em https://supabase.com
2. SQL Editor: rode `schema.sql` e depois `seed.sql`
3. Copie `.env.example` para `.env.local` na raiz do app:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

4. Reinicie `npm run dev`

Contas demo (senha `domu123`):

- `marcos.ferreira@atlantico.com.br` — Gerência
- `renata.prado@atlantico.com.br` — RH
- `joao.pedro@domustaff.app` — Freelancer

Sem as chaves, o app grava no navegador (localStorage) com as mesmas contas.

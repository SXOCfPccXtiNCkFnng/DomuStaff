-- ============================================================================
-- Confirma e-mails que ficaram em "Waiting" (bloqueiam o login)
-- Rode no SQL Editor do Supabase.
-- ============================================================================

-- Confirma um usuário específico
update auth.users
set email_confirmed_at = coalesce(email_confirmed_at, now())
where email = 'rh@teste.com';

-- Opcional: confirma TODOS ainda sem confirmação
-- update auth.users
-- set email_confirmed_at = coalesce(email_confirmed_at, now())
-- where email_confirmed_at is null;

-- =========================================================================
-- COMANDO SQL: CRIAÇÃO OU ATUALIZAÇÃO DO USUÁRIO ADMINISTRADOR NO SUPABASE
-- =========================================================================
-- Dica: Você também pode simplesmente ir no painel do Supabase:
-- Authentication -> Users -> Add User (Create User)
-- Informar seu e-mail e sua senha de preferência com Auto Confirm marcado.
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  new_user_id UUID := 'e1111111-2222-3333-4444-555555555555';
  user_email TEXT := 'radjaniosilvasouza7@gmail.com'; -- Substitua se necessário
  user_pass TEXT := 'SuaSenhaSeguraAqui123!';         -- Substitua pela sua senha forte pessoal
BEGIN
  -- Se o usuário já existir com esse email, atualiza a senha com hash bcrypt seguro
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = user_email) THEN
    UPDATE auth.users
    SET 
      encrypted_password = crypt(user_pass, gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      raw_user_meta_data = jsonb_build_object('name', 'Radjanio Silva Souza'),
      raw_app_meta_data = jsonb_build_object('provider', 'email', 'providers', json_build_array('email'), 'role', 'admin'),
      updated_at = NOW()
    WHERE email = user_email;
  ELSE
    -- Inserir novo usuário administrador com email confirmado
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      user_email,
      crypt(user_pass, gen_salt('bf')),
      NOW(),
      jsonb_build_object('provider', 'email', 'providers', json_build_array('email'), 'role', 'admin'),
      jsonb_build_object('name', 'Radjanio Silva Souza'),
      NOW(),
      NOW(),
      '',
      ''
    );

    -- Inserir registro correspondente em auth.identities
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      new_user_id,
      new_user_id,
      jsonb_build_object('sub', new_user_id::text, 'email', user_email),
      'email',
      user_email,
      NOW(),
      NOW(),
      NOW()
    ) ON CONFLICT (provider, provider_id) DO NOTHING;
  END IF;
END $$;

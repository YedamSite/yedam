-- Adiciona UNIQUE constraints para phone e document_number na cheotnun_users
-- Fecha a lacuna onde apenas o checkAvailability() impedia duplicatas
-- Nota: PostgreSQL permite múltiplos NULLs em UNIQUE constraints, então
-- usuários sem phone/document_number cadastrados não são afetados.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cheotnun_users_phone_key'
  ) THEN
    ALTER TABLE cheotnun_users ADD CONSTRAINT cheotnun_users_phone_key UNIQUE (phone);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cheotnun_users_document_number_key'
  ) THEN
    ALTER TABLE cheotnun_users ADD CONSTRAINT cheotnun_users_document_number_key UNIQUE (document_number);
  END IF;
END;
$$;

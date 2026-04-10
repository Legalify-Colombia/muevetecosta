-- Asegurar que existan las plantillas de email para OTP y recuperación
-- Primero, verificar que la tabla email_templates existe (debería existir de migraciones anteriores)

-- Insertar plantilla para password reset si no existe
INSERT INTO email_templates (template_name, template_subject, template_html_content, is_active, created_at)
VALUES (
  'password_reset',
  'Código de Recuperación de Contraseña - Muévete por el Caribe',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2>Recupera tu Contraseña</h2>
    <p>Se ha solicitado la recuperación de tu contraseña. Usa este código:</p>
    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
      <p style="font-size: 36px; font-weight: bold; letter-spacing: 10px;">{{reset_code}}</p>
    </div>
    <p>Este código expira en 30 minutos. Si no solicitaste esto, ignora este email.</p>
  </div>',
  true,
  now()
)
ON CONFLICT (template_name) DO UPDATE 
SET is_active = true;

-- Insertar plantilla para éxito de reset
INSERT INTO email_templates (template_name, template_subject, template_html_content, is_active, created_at)
VALUES (
  'password_reset_success',
  'Contraseña Actualizada - Muévete por el Caribe',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2>Contraseña Actualizada</h2>
    <p>Tu contraseña ha sido cambiada exitosamente.</p>
    <p>Si no realizaste este cambio, contacta al administrador inmediatamente.</p>
  </div>',
  true,
  now()
)
ON CONFLICT (template_name) DO UPDATE 
SET is_active = true;

-- Asegurar que la tabla password_reset_codes está en RLS si no está
ALTER TABLE IF EXISTS password_reset_codes ENABLE ROW LEVEL SECURITY;

-- Crear políticas si existen la tabla
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'password_reset_codes') THEN
    -- Eliminar políticas existentes si existen
    DROP POLICY IF EXISTS "Users can view their own reset codes" ON password_reset_codes;
    DROP POLICY IF EXISTS "Service role can manage reset codes" ON password_reset_codes;

    -- Crear nuevas políticas
    CREATE POLICY "Users can view their own reset codes"
      ON password_reset_codes
      FOR SELECT
      USING (user_id = auth.uid());

    CREATE POLICY "Service role can manage reset codes"
      ON password_reset_codes
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END
$$;

-- Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_user_id ON password_reset_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_code ON password_reset_codes(code);
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_expires_at ON password_reset_codes(expires_at);

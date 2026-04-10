-- 1. CREAR TABLA PARA ALMACENAR CÓDIGOS OTP PARA RECUPERACIÓN DE CONTRASEÑA
CREATE TABLE IF NOT EXISTS password_reset_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_password_reset_codes_user_id ON password_reset_codes(user_id);
CREATE INDEX idx_password_reset_codes_code ON password_reset_codes(code);
CREATE INDEX idx_password_reset_codes_expires_at ON password_reset_codes(expires_at);

-- 2. PERMITIR RLS EN TABLA
ALTER TABLE password_reset_codes ENABLE ROW LEVEL SECURITY;

-- 3. RLS POLICIES PARA PASSWORD_RESET_CODES
CREATE POLICY "Users can view their own reset codes"
  ON password_reset_codes
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage reset codes"
  ON password_reset_codes
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 4. CREAR FUNCIÓN PARA GENERAR CÓDIGO OTP DE 6 DÍGITOS
CREATE OR REPLACE FUNCTION public.generate_reset_code()
RETURNS TEXT AS $$
BEGIN
  RETURN LPAD((random() * 999999)::INTEGER::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- 5. CREAR FUNCIÓN PARA ENVIAR EMAIL DE RECUPERACIÓN CON OTP
CREATE OR REPLACE FUNCTION public.send_password_reset_email(user_email TEXT)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_reset_code TEXT;
  v_result JSON;
BEGIN
  -- Obtener el ID del usuario por email
  SELECT id INTO v_user_id FROM auth.users WHERE email = user_email;
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Usuario no encontrado');
  END IF;

  -- Invalidar códigos previos
  UPDATE password_reset_codes 
  SET used_at = now() 
  WHERE user_id = v_user_id AND used_at IS NULL AND expires_at > now();

  -- Generar nuevo código válido por 30 minutos
  v_reset_code := public.generate_reset_code();
  
  INSERT INTO password_reset_codes (user_id, email, code, expires_at)
  VALUES (v_user_id, user_email, v_reset_code, now() + interval '30 minutes');

  -- Retornar éxito (el email se enviará desde Edge Function)
  RETURN json_build_object(
    'success', true,
    'code', v_reset_code,
    'user_id', v_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. CREAR FUNCIÓN PARA VALIDAR Y USAR CÓDIGO OTP
CREATE OR REPLACE FUNCTION public.validate_reset_code(p_code TEXT)
RETURNS JSON AS $$
DECLARE
  v_record PASSWORD_RESET_CODES;
BEGIN
  -- Buscar el código válido
  SELECT * INTO v_record FROM password_reset_codes 
  WHERE code = p_code 
  AND used_at IS NULL 
  AND expires_at > now()
  LIMIT 1;

  IF v_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Código inválido o expirado');
  END IF;

  -- Marcar como utilizado
  UPDATE password_reset_codes 
  SET used_at = now() 
  WHERE id = v_record.id;

  RETURN json_build_object(
    'success', true,
    'user_id', v_record.user_id,
    'email', v_record.email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. CREAR FUNCIÓN PARA ACTUALIZAR CONTRASEÑA DESDE CÓDIGO OTP
CREATE OR REPLACE FUNCTION public.reset_password_with_code(p_code TEXT, p_new_password TEXT)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_validation JSON;
BEGIN
  -- Validar el código
  v_validation := public.validate_reset_code(p_code);
  
  IF (v_validation->>'success')::BOOLEAN = FALSE THEN
    RETURN v_validation;
  END IF;

  v_user_id := (v_validation->>'user_id')::UUID;

  -- Actualizar contraseña mediante admin API
  -- Nota: Esta función debe ser llamada desde una Edge Function que tenga permisos de admin
  RETURN json_build_object(
    'success', true,
    'message', 'Contraseña actualizada',
    'user_id', v_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. CREAR TABLA PARA LOGGING DE INTENTOS DE LOGIN FALLIDOS (para seguridad futura)
CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip_address TEXT,
  success BOOLEAN DEFAULT false,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_login_attempts_email ON login_attempts(email);
CREATE INDEX idx_login_attempts_attempted_at ON login_attempts(attempted_at);

-- 9. CREAR FUNCIÓN PARA ACTUALIZAR ROLES DE USUARIO (para que admin pueda cambiar roles)
CREATE OR REPLACE FUNCTION public.update_user_role(p_user_id UUID, p_new_role user_role)
RETURNS JSON AS $$
BEGIN
  -- Solo admins pueden actualizar roles
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Solo administradores pueden cambiar roles');
  END IF;

  UPDATE profiles 
  SET role = p_new_role, updated_at = now()
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Usuario no encontrado');
  END IF;

  RETURN json_build_object(
    'success', true,
    'message', 'Rol actualizado correctamente',
    'user_id', p_user_id,
    'new_role', p_new_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. CREAR FUNCIÓN PARA ASEGURAR QUE PROFILE EXISTE CUANDO SE INTENTA ACTUALIZAR ROL
CREATE OR REPLACE FUNCTION public.ensure_profile_exists(p_user_id UUID)
RETURNS JSON AS $$
BEGIN
  -- Si el perfil no existe, crear uno
  INSERT INTO profiles (id, full_name, document_type, document_number, role)
  VALUES (p_user_id, 'Usuario', 'cc'::document_type, '', 'student')
  ON CONFLICT (id) DO NOTHING;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

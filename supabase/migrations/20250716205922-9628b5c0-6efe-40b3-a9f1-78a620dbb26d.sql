
-- Recrear la función handle_new_user con mejor manejo de errores
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insertar perfil con valores por defecto más seguros
  INSERT INTO public.profiles (id, full_name, document_type, document_number, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'),
    COALESCE((NEW.raw_user_meta_data->>'document_type')::document_type, 'cc'::document_type),
    COALESCE(NEW.raw_user_meta_data->>'document_number', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student'::user_role)
  );
  
  -- Si el usuario es estudiante, crear registro en student_info
  IF COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student'::user_role) = 'student' THEN
    INSERT INTO public.student_info (id, origin_university, academic_program, current_semester)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'origin_university', ''),
      COALESCE(NEW.raw_user_meta_data->>'academic_program', ''),
      COALESCE((NEW.raw_user_meta_data->>'current_semester')::integer, 1)
    );
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log el error pero no bloquear la creación del usuario
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Asegurar que el trigger existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

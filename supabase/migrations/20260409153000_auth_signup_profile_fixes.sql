-- Consolidated auth signup/profile fixes with a valid Supabase migration filename.
-- This migration is idempotent and safe to run on partially migrated databases.

-- 1) Make student_info tolerant to delayed population.
ALTER TABLE IF EXISTS public.student_info
  ALTER COLUMN origin_university DROP NOT NULL,
  ALTER COLUMN academic_program DROP NOT NULL,
  ALTER COLUMN current_semester DROP NOT NULL;

UPDATE public.student_info
SET origin_university = COALESCE(origin_university, 'Not specified'),
    academic_program = COALESCE(academic_program, 'Not specified'),
    current_semester = COALESCE(current_semester, 1)
WHERE origin_university IS NULL
   OR academic_program IS NULL
   OR current_semester IS NULL;

-- 2) Replace document number uniqueness with compound uniqueness.
ALTER TABLE IF EXISTS public.profiles
  DROP CONSTRAINT IF EXISTS profiles_document_number_key;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_document_unique
  ON public.profiles(document_type, document_number);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);

-- 3) Minimal signup trigger that never blocks auth signup.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  BEGIN
    INSERT INTO public.profiles (
      id,
      full_name,
      document_type,
      document_number,
      role
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
      'cc'::document_type,
      NEW.id::text,
      'student'::user_role
    )
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4) Recovery RPC to create a minimal missing profile.
CREATE OR REPLACE FUNCTION public.create_missing_profile(p_user_id uuid)
RETURNS TABLE (success boolean, message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id) THEN
    RETURN QUERY SELECT true, 'Profile already exists';
    RETURN;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
    RETURN QUERY SELECT false, 'User not found in auth.users';
    RETURN;
  END IF;

  INSERT INTO public.profiles (
    id,
    full_name,
    document_type,
    document_number,
    role
  )
  VALUES (
    p_user_id,
    'User',
    'cc'::document_type,
    p_user_id::text,
    'student'::user_role
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN QUERY SELECT true, 'Profile created successfully';
EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT false, 'Error creating profile: ' || SQLERRM;
END;
$$;

-- 5) RPC to update profile from auth metadata, with safe enum parsing.
CREATE OR REPLACE FUNCTION public.update_profile_from_auth_user(p_user_id uuid)
RETURNS TABLE (success boolean, message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_raw_document_type text;
  v_raw_role text;
  v_document_type document_type := 'cc'::document_type;
  v_user_role user_role := 'student'::user_role;
  v_document_number text;
  v_full_name text;
  v_phone text;
BEGIN
  SELECT
    COALESCE(raw_user_meta_data->>'full_name', 'User'),
    COALESCE(raw_user_meta_data->>'document_number', id::text),
    COALESCE(raw_user_meta_data->>'phone', ''),
    raw_user_meta_data->>'document_type',
    raw_user_meta_data->>'role'
  INTO v_full_name, v_document_number, v_phone, v_raw_document_type, v_raw_role
  FROM auth.users
  WHERE id = p_user_id;

  IF v_raw_document_type IS NOT NULL THEN
    BEGIN
      v_document_type := v_raw_document_type::document_type;
    EXCEPTION WHEN OTHERS THEN
      v_document_type := 'cc'::document_type;
    END;
  END IF;

  IF v_raw_role IS NOT NULL THEN
    BEGIN
      v_user_role := v_raw_role::user_role;
    EXCEPTION WHEN OTHERS THEN
      v_user_role := 'student'::user_role;
    END;
  END IF;

  UPDATE public.profiles
  SET full_name = v_full_name,
      document_type = v_document_type,
      document_number = v_document_number,
      phone = v_phone,
      role = v_user_role,
      updated_at = now()
  WHERE id = p_user_id;

  RETURN QUERY SELECT true, 'Profile updated successfully';
EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT false, 'Error: ' || SQLERRM;
END;
$$;

-- 6) RPC to populate student_info after successful signup.
CREATE OR REPLACE FUNCTION public.populate_student_info(
  p_user_id uuid,
  p_origin_university text DEFAULT 'Not specified',
  p_academic_program text DEFAULT 'Not specified',
  p_current_semester integer DEFAULT 1
)
RETURNS TABLE (success boolean, message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public.student_info (id, origin_university, academic_program, current_semester)
  VALUES (p_user_id, p_origin_university, p_academic_program, p_current_semester)
  ON CONFLICT (id) DO UPDATE SET
    origin_university = EXCLUDED.origin_university,
    academic_program = EXCLUDED.academic_program,
    current_semester = EXCLUDED.current_semester;

  RETURN QUERY SELECT true, 'Student info populated successfully';
EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT false, 'Error: ' || SQLERRM;
END;
$$;

INSERT INTO public.student_info (id, origin_university, academic_program, current_semester)
SELECT p.id, 'Not specified', 'Not specified', 1
FROM public.profiles p
WHERE p.role = 'student'::user_role
  AND NOT EXISTS (
    SELECT 1 FROM public.student_info si WHERE si.id = p.id
  )
ON CONFLICT (id) DO NOTHING;

-- 7) Non-recursive profile RLS.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_info ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles insert - service role only" ON public.profiles;
DROP POLICY IF EXISTS "Service role bypass" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can read profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role bypass"
  ON public.profiles
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Authenticated users can read profiles"
  ON public.profiles
  FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can view own student info" ON public.student_info;
DROP POLICY IF EXISTS "Users can update own student info" ON public.student_info;
DROP POLICY IF EXISTS "Service role can manage student info" ON public.student_info;

CREATE POLICY "Users can view own student info"
  ON public.student_info
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own student info"
  ON public.student_info
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role can manage student info"
  ON public.student_info
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

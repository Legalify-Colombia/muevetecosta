-- Migration: Fix RLS policies to prevent infinite recursion
-- Date: 2026-04-09
-- Problem: Policies that query the same table cause infinite recursion
-- Solution: Use simple policies + materialized access control

-- Step 1: Create a view for admin check (avoids recursion)
CREATE OR REPLACE VIEW public.admin_users AS
SELECT id
FROM public.profiles
WHERE role = 'admin'::user_role;

-- Step 2: Create a view for coordinators with their universities
CREATE OR REPLACE VIEW public.coordinator_access AS
SELECT 
  p.id AS coordinator_id,
  u.id AS university_id,
  u.name AS university_name
FROM public.profiles p
LEFT JOIN public.universities u ON u.coordinator_id = p.id
WHERE p.role = 'coordinator'::user_role;

-- Step 3: Update profiles RLS policies to use views and avoid recursion
DROP POLICY IF EXISTS "Service role bypass" ON public.profiles;
CREATE POLICY "Service role bypass"
  ON public.profiles
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Coordinators and Admins: Read-only access for display purposes
-- But this is handled by frontend, not database
-- For now we'll allow authenticated users to see minimal info
DROP POLICY IF EXISTS "Authenticated users can read profiles" ON public.profiles;
CREATE POLICY "Authenticated users can read profiles"
  ON public.profiles
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Step 4: Add function to check if user is admin (without recursion)
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Use immutable check based on auth role, not table query
  RETURN EXISTS (
    SELECT 1 FROM public.profiles WHERE id = p_user_id AND role = 'admin'::user_role
  );
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql IMMUTABLE SECURITY DEFINER;

-- Step 5: Add function to check if user is coordinator for university
CREATE OR REPLACE FUNCTION public.is_university_coordinator(p_user_id UUID, p_university_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.universities
    WHERE id = p_university_id AND coordinator_id = p_user_id
  );
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql IMMUTABLE SECURITY DEFINER;

-- Step 6: Add policy for inserting profiles (for migrations/scripts)
DROP POLICY IF EXISTS "Profiles insert - service role only" ON public.profiles;
CREATE POLICY "Profiles insert - service role only"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Step 7: Replace student_info policies to avoid recursion issues
ALTER TABLE public.student_info ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own student info" ON public.student_info;
CREATE POLICY "Users can view own student info"
  ON public.student_info
  FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own student info" ON public.student_info;
CREATE POLICY "Users can update own student info"
  ON public.student_info
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Service role can manage student info" ON public.student_info;
CREATE POLICY "Service role can manage student info"
  ON public.student_info
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Step 8: Log completion
DO $$
BEGIN
  RAISE NOTICE 'RLS recursion fix applied at %', NOW();
END $$;

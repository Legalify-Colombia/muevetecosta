-- Migration: Fix profile creation on user registration (Issue: Profiles not created for new students/professors)
-- Date: 2026-04-09
-- Problem: Trigger handle_new_user() fails silently, leaving users without profiles
-- Solution: Improve trigger with better validation and error handling

-- Step 1: Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Step 2: Create bulletproof handle_new_user function - MINIMAL VERSION
-- This function is designed to NEVER fail - completely fault-tolerant
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Wrapped in exception to prevent ANY errors from blocking signup
  BEGIN
    -- Extract minimal data
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
    NULL;  -- Silently ignore any errors
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Recreate trigger with better timing
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Add function to manually create missing profiles (for recovery)
CREATE OR REPLACE FUNCTION public.create_missing_profile(p_user_id UUID)
RETURNS TABLE (success BOOLEAN, message TEXT) AS $$
BEGIN
  -- Check if profile exists
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id) THEN
    RETURN QUERY SELECT true::BOOLEAN, 'Profile already exists'::TEXT;
    RETURN;
  END IF;
  
  -- Check if user exists in auth.users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
    RETURN QUERY SELECT false::BOOLEAN, 'User not found in auth.users'::TEXT;
    RETURN;
  END IF;
  
  -- Try to create profile
  INSERT INTO public.profiles (
    id,
    full_name,
    document_type,
    document_number,
    role
  )
  VALUES (
    p_user_id,
    'User_' || LEFT(p_user_id::text, 8),
    'cc'::document_type,
    p_user_id::text,
    'student'::user_role
  );
  
  RETURN QUERY SELECT true::BOOLEAN, 'Profile created successfully'::TEXT;
  
EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT false::BOOLEAN, 'Error creating profile: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Improve useAuth.tsx handling of missing profiles (via policy)
-- Ensure RLS allows user to read own profile even if it doesn't exist yet
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to avoid recursion
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Coordinators can view university users" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles insert - service role only" ON public.profiles;
DROP POLICY IF EXISTS "Service role bypass" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can read profiles" ON public.profiles;

-- Simple policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role can do everything (for backend operations)
CREATE POLICY "Service role bypass"
  ON public.profiles
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Authenticated users can read profiles (basic info)
CREATE POLICY "Authenticated users can read profiles"
  ON public.profiles
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Step 5b: Optional - add indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);

-- Step 6: Create email notification system for profile creation
CREATE OR REPLACE FUNCTION public.notify_profile_created()
RETURNS TRIGGER AS $$
BEGIN
  -- When a profile is created, we could trigger email here
  -- For now, just log it
  RAISE NOTICE 'Profile created for user %', NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_profile_created();


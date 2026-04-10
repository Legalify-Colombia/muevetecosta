-- Migration: Update profiles with complete data from auth.users
-- Date: 2026-04-09
-- Problem: Initial profile creation uses minimal data
-- Solution: Provide function to update profile with full metadata

-- Step 1: Create function to update profile with complete data
CREATE OR REPLACE FUNCTION public.update_profile_from_auth_user(p_user_id UUID)
RETURNS TABLE (success BOOLEAN, message TEXT) AS $$
DECLARE
  v_document_type document_type;
  v_user_role user_role;
  v_document_number TEXT;
  v_full_name TEXT;
  v_phone TEXT;
BEGIN
  -- Get data from auth.users raw_user_meta_data
  SELECT 
    COALESCE(raw_user_meta_data->>'full_name', 'User'),
    COALESCE(raw_user_meta_data->>'document_number', id::text),
    COALESCE(raw_user_meta_data->>'phone', ''),
    (raw_user_meta_data->>'document_type')::document_type,
    (raw_user_meta_data->>'role')::user_role
  INTO v_full_name, v_document_number, v_phone, v_document_type, v_user_role
  FROM auth.users
  WHERE id = p_user_id;
  
  -- Handle enum cast failures
  IF v_document_type IS NULL THEN
    v_document_type := 'cc'::document_type;
  END IF;
  
  IF v_user_role IS NULL THEN
    v_user_role := 'student'::user_role;
  END IF;
  
  -- Update profile
  UPDATE public.profiles
  SET 
    full_name = v_full_name,
    document_type = v_document_type,
    document_number = v_document_number,
    phone = v_phone,
    role = v_user_role,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  RETURN QUERY SELECT true::BOOLEAN, 'Profile updated successfully'::TEXT;
  
EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT false::BOOLEAN, 'Error: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Log completion
DO $$
BEGIN
  RAISE NOTICE 'update_profile_from_auth_user function created at %', NOW();
END $$;

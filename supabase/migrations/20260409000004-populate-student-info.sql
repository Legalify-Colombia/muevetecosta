-- Migration: Populate student_info for existing students and create RPC
-- Date: 2026-04-09
-- Problem: student_info needs to be created after profile creation
-- Solution: Provide RPC function to populate student_info

-- Step 1: Create RPC function to populate student_info
CREATE OR REPLACE FUNCTION public.populate_student_info(
  p_user_id UUID,
  p_origin_university TEXT DEFAULT 'Not specified',
  p_academic_program TEXT DEFAULT 'Not specified',
  p_current_semester INTEGER DEFAULT 1
)
RETURNS TABLE (success BOOLEAN, message TEXT) AS $$
BEGIN
  -- Try to insert or update student_info
  INSERT INTO public.student_info (id, origin_university, academic_program, current_semester)
  VALUES (p_user_id, p_origin_university, p_academic_program, p_current_semester)
  ON CONFLICT (id) DO UPDATE SET
    origin_university = EXCLUDED.origin_university,
    academic_program = EXCLUDED.academic_program,
    current_semester = EXCLUDED.current_semester;
  
  RETURN QUERY SELECT true::BOOLEAN, 'Student info populated successfully'::TEXT;
  
EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT false::BOOLEAN, 'Error: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create student_info records for existing students if missing
INSERT INTO public.student_info (id, origin_university, academic_program, current_semester)
SELECT p.id, 'Not specified', 'Not specified', 1
FROM public.profiles p
WHERE p.role = 'student'::user_role
AND NOT EXISTS (SELECT 1 FROM public.student_info WHERE id = p.id)
ON CONFLICT (id) DO NOTHING;

-- Step 3: Log completion
DO $$
BEGIN
  RAISE NOTICE 'Student info population completed at %', NOW();
END $$;

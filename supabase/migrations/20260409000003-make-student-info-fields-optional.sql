-- Migration: Make student_info fields optional
-- Date: 2026-04-09
-- Problem: student_info table had NOT NULL constraints that prevented profile creation
-- Solution: Allow NULL values for origin_university, academic_program, current_semester

-- Step 1: Alter student_info table to allow NULL values
ALTER TABLE public.student_info
  ALTER COLUMN origin_university DROP NOT NULL,
  ALTER COLUMN academic_program DROP NOT NULL,
  ALTER COLUMN current_semester DROP NOT NULL;

-- Step 2: Set defaults for existing rows with NULL
UPDATE public.student_info
  SET origin_university = 'Not specified'
  WHERE origin_university IS NULL;

UPDATE public.student_info
  SET academic_program = 'Not specified'
  WHERE academic_program IS NULL;

UPDATE public.student_info
  SET current_semester = 1
  WHERE current_semester IS NULL;

-- Step 3: Log completion
DO $$
BEGIN
  RAISE NOTICE 'student_info fields are now optional at %', NOW();
END $$;

-- Migration: Fix document_number constraint
-- Date: 2026-04-09
-- Problem: UNIQUE constraint on document_number causes conflicts
-- Solution: Remove UNIQUE or combine with document_type for compound uniqueness

-- Step 1: Drop existing constraint
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_document_number_key;

-- Step 2: Create compound unique index on (document_type, document_number)
-- This allows the same document number with different types (e.g., CC vs TI)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_document_unique
  ON public.profiles(document_type, document_number);

-- Step 3: Log completion
DO $$
BEGIN
  RAISE NOTICE 'document_number constraint fixed at %', NOW();
END $$;

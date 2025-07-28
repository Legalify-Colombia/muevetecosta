-- Fix the security definer view by recreating it properly with RLS policies instead
DROP VIEW IF EXISTS coordinator_students_view;

-- Create proper RLS policy instead of view for coordinator access
CREATE POLICY "Coordinators can view students from their origin university" 
ON public.student_info 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM universities u 
    WHERE u.id = origin_university_id 
    AND u.coordinator_id = auth.uid()
  )
);

-- Add email verification edge function for auth fixes
CREATE OR REPLACE FUNCTION public.handle_email_verification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Update email verification status in profiles when user confirms email
  UPDATE public.profiles 
  SET updated_at = now()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

-- Create trigger for email verification
DROP TRIGGER IF EXISTS on_email_confirmed ON auth.users;
CREATE TRIGGER on_email_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.handle_email_verification();
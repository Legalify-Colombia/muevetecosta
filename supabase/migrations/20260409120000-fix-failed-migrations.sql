-- Consolidated fixes for previously failing migrations.
-- Safe to run on partially migrated databases.

-- 1) Ensure reserved identifier column exists only when table exists.
DO $$
BEGIN
  IF to_regclass('public.professor_mobility_applications') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.professor_mobility_applications ADD COLUMN IF NOT EXISTS "current_role" TEXT';
  END IF;
END;
$$;

-- 2) Storage policies for template-documents (replace CREATE OR REPLACE POLICY usage).
DROP POLICY IF EXISTS "Admins can upload document templates" ON storage.objects;
CREATE POLICY "Admins can upload document templates"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'template-documents'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'::user_role
    )
  );

DROP POLICY IF EXISTS "Everyone can view document templates" ON storage.objects;
CREATE POLICY "Everyone can view document templates"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'template-documents');

DROP POLICY IF EXISTS "Admins can update document templates" ON storage.objects;
CREATE POLICY "Admins can update document templates"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'template-documents'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'::user_role
    )
  );

DROP POLICY IF EXISTS "Admins can delete document templates" ON storage.objects;
CREATE POLICY "Admins can delete document templates"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'template-documents'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'::user_role
    )
  );

DROP POLICY IF EXISTS "Users can upload postulation documents" ON storage.objects;
CREATE POLICY "Users can upload postulation documents"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'template-documents'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Authenticated users can view postulation documents" ON storage.objects;
CREATE POLICY "Authenticated users can view postulation documents"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'template-documents'
    AND auth.role() = 'authenticated'
  );

-- 3) Ensure templates use JSONB in available_variables.
INSERT INTO public.email_templates (
  template_name,
  template_subject,
  template_html_content,
  available_variables,
  description,
  is_active
) VALUES (
  'custom_admin_email',
  '{{subject}}',
  '<p>{{content}}</p>',
  to_jsonb(ARRAY['subject', 'content']),
  'Custom email template for admin panel messages',
  true
)
ON CONFLICT (template_name) DO UPDATE
SET
  available_variables = EXCLUDED.available_variables,
  is_active = EXCLUDED.is_active;

INSERT INTO public.email_templates (
  template_name,
  template_subject,
  template_html_content,
  available_variables,
  description,
  is_active
) VALUES (
  'coordinator_registration',
  'Bienvenido como Coordinador - Muévete por el Caribe',
  '<p>Hola {{nombre_coordinador}}, activa tu cuenta: {{link_activacion}}</p>',
  '["nombre_coordinador", "email_coordinador", "password_temporal", "link_activacion"]'::jsonb,
  'Welcome email for new coordinators',
  true
)
ON CONFLICT (template_name) DO UPDATE
SET
  available_variables = EXCLUDED.available_variables,
  is_active = EXCLUDED.is_active;

-- 4) Recreate policy with correct text[] handling for foldername().
DROP POLICY IF EXISTS "Project participants can view COIL documents" ON storage.objects;
CREATE POLICY "Project participants can view COIL documents"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'coil-documents'
    AND EXISTS (
      SELECT 1
      FROM public.coil_project_participants cpp
      JOIN public.coil_project_documents cpd ON cpd.project_id = cpp.project_id
      WHERE cpp.professor_id = auth.uid()
      AND cpp.status = 'approved'
      AND (storage.foldername(name))[1] = cpd.project_id::text
    )
  );

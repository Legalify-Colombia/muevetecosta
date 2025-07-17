
-- Actualizar la tabla university_required_documents para incluir archivo de plantilla
ALTER TABLE public.university_required_documents 
ADD COLUMN template_file_url TEXT,
ADD COLUMN template_file_name TEXT;

-- Crear buckets de almacenamiento si no existen
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('document-templates', 'document-templates', true, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('student-documents', 'student-documents', true, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/webp']),
  ('professor-documents', 'professor-documents', true, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Políticas de almacenamiento para document-templates
CREATE POLICY "Coordinators can upload document templates"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'document-templates' 
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.universities 
      WHERE coordinator_id = auth.uid()
    )
  );

CREATE POLICY "Everyone can view document templates"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'document-templates');

-- Políticas de almacenamiento para student-documents
CREATE POLICY "Students can upload their documents"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'student-documents' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can view student documents"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'student-documents' 
    AND auth.role() = 'authenticated'
  );

-- Políticas de almacenamiento para professor-documents
CREATE POLICY "Professors can upload their documents"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'professor-documents' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can view professor documents"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'professor-documents' 
    AND auth.role() = 'authenticated'
  );

-- Función para actualizar timestamp en university_required_documents
CREATE OR REPLACE FUNCTION update_university_required_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar timestamp
DROP TRIGGER IF EXISTS update_university_required_documents_updated_at ON public.university_required_documents;
CREATE TRIGGER update_university_required_documents_updated_at
  BEFORE UPDATE ON public.university_required_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_university_required_documents_updated_at();

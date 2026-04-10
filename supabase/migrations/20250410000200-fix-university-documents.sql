-- CREAR TABLA university_required_documents SI NO EXISTE
CREATE TABLE IF NOT EXISTS public.university_required_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  university_id UUID NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  document_title TEXT NOT NULL,
  document_type TEXT,
  is_mandatory BOOLEAN NOT NULL DEFAULT true,
  mobility_type TEXT NOT NULL DEFAULT 'both' CHECK (mobility_type IN ('student', 'professor', 'both')),
  description TEXT,
  template_file_url TEXT,
  template_file_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.university_required_documents ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas antiguas si existen
DROP POLICY IF EXISTS "Coordinators can manage their university required documents" ON public.university_required_documents;
DROP POLICY IF EXISTS "Everyone can view required documents for active universities" ON public.university_required_documents;

-- Crear nuevas políticas
CREATE POLICY "Coordinators can manage their university required documents"
  ON public.university_required_documents
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.universities u 
    WHERE u.id = university_required_documents.university_id 
    AND u.coordinator_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.universities u 
    WHERE u.id = university_required_documents.university_id 
    AND u.coordinator_id = auth.uid()
  ));

CREATE POLICY "Everyone can view required documents for active universities"
  ON public.university_required_documents
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.universities u 
    WHERE u.id = university_required_documents.university_id 
    AND u.is_active = true
  ));

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_university_required_documents_university_id 
  ON public.university_required_documents(university_id);

CREATE INDEX IF NOT EXISTS idx_university_required_documents_mobility_type 
  ON public.university_required_documents(mobility_type);

-- Crear tabla application_attachments si no existe
CREATE TABLE IF NOT EXISTS public.application_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL,
  application_type TEXT NOT NULL CHECK (application_type IN ('student', 'professor')),
  required_document_id UUID REFERENCES public.university_required_documents(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  applicant_comment TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en application_attachments
ALTER TABLE public.application_attachments ENABLE ROW LEVEL SECURITY;

-- Crear índices para application_attachments
CREATE INDEX IF NOT EXISTS idx_application_attachments_application_id 
  ON public.application_attachments(application_id);

CREATE INDEX IF NOT EXISTS idx_application_attachments_required_document_id 
  ON public.application_attachments(required_document_id);

-- Eliminar políticas antiguas si existen
DROP POLICY IF EXISTS "Students can manage their application attachments" ON public.application_attachments;
DROP POLICY IF EXISTS "Professors can manage their application attachments" ON public.application_attachments;
DROP POLICY IF EXISTS "Coordinators can view application attachments" ON public.application_attachments;

-- Crear políticas RLS para application_attachments
CREATE POLICY "Students can manage their application attachments"
  ON public.application_attachments
  FOR ALL
  USING (
    (application_type = 'student' AND EXISTS (
      SELECT 1 FROM public.mobility_applications ma 
      WHERE ma.id = application_id 
      AND ma.student_id = auth.uid()
    ))
  )
  WITH CHECK (
    (application_type = 'student' AND EXISTS (
      SELECT 1 FROM public.mobility_applications ma 
      WHERE ma.id = application_id 
      AND ma.student_id = auth.uid()
    ))
  );

CREATE POLICY "Professors can manage their application attachments"
  ON public.application_attachments
  FOR ALL
  USING (
    (application_type = 'professor' AND EXISTS (
      SELECT 1 FROM public.professor_mobility_applications pma 
      WHERE pma.id = application_id 
      AND pma.professor_id = auth.uid()
    ))
  )
  WITH CHECK (
    (application_type = 'professor' AND EXISTS (
      SELECT 1 FROM public.professor_mobility_applications pma 
      WHERE pma.id = application_id 
      AND pma.professor_id = auth.uid()
    ))
  );

CREATE POLICY "Coordinators can view application attachments"
  ON public.application_attachments
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.universities u 
    WHERE u.coordinator_id = auth.uid()
  ));

-- Función para actualizar updated_at
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

-- Crear buckets de almacenamiento si no existen
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('template-documents', 'template-documents', true, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('student-documents', 'student-documents', false, 52428800, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('professor-documents', 'professor-documents', false, 52428800, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

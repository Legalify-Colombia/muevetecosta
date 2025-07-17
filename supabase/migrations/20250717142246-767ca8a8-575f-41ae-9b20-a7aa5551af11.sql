
-- Crear tabla para documentos requeridos por universidad
CREATE TABLE public.university_required_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  university_id UUID NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  document_title TEXT NOT NULL,
  is_mandatory BOOLEAN NOT NULL DEFAULT true,
  mobility_type TEXT NOT NULL CHECK (mobility_type IN ('student', 'professor', 'both')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para documentos adjuntos de postulaciones
CREATE TABLE public.application_attachments (
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

-- Crear índices para mejor rendimiento
CREATE INDEX idx_university_required_documents_university_id ON public.university_required_documents(university_id);
CREATE INDEX idx_university_required_documents_mobility_type ON public.university_required_documents(mobility_type);
CREATE INDEX idx_application_attachments_application_id ON public.application_attachments(application_id);
CREATE INDEX idx_application_attachments_required_document_id ON public.application_attachments(required_document_id);

-- Habilitar RLS
ALTER TABLE public.university_required_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_attachments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para university_required_documents
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

-- Políticas RLS para application_attachments
CREATE POLICY "Students can manage their application attachments"
  ON public.application_attachments
  FOR ALL
  USING (
    (application_type = 'student' AND EXISTS (
      SELECT 1 FROM public.mobility_applications ma 
      WHERE ma.id::text = application_attachments.application_id::text 
      AND ma.student_id = auth.uid()
    ))
    OR
    (application_type = 'professor' AND EXISTS (
      SELECT 1 FROM public.professor_mobility_applications pma 
      WHERE pma.id::text = application_attachments.application_id::text 
      AND pma.professor_id = auth.uid()
    ))
  )
  WITH CHECK (
    (application_type = 'student' AND EXISTS (
      SELECT 1 FROM public.mobility_applications ma 
      WHERE ma.id::text = application_attachments.application_id::text 
      AND ma.student_id = auth.uid()
    ))
    OR
    (application_type = 'professor' AND EXISTS (
      SELECT 1 FROM public.professor_mobility_applications pma 
      WHERE pma.id::text = application_attachments.application_id::text 
      AND pma.professor_id = auth.uid()
    ))
  );

CREATE POLICY "Coordinators can view attachments for their university applications"
  ON public.application_attachments
  FOR SELECT
  USING (
    (application_type = 'student' AND EXISTS (
      SELECT 1 FROM public.mobility_applications ma
      JOIN public.universities u ON ma.destination_university_id = u.id
      WHERE ma.id::text = application_attachments.application_id::text 
      AND u.coordinator_id = auth.uid()
    ))
    OR
    (application_type = 'professor' AND EXISTS (
      SELECT 1 FROM public.professor_mobility_applications pma
      JOIN public.professor_mobility_calls pmc ON pma.mobility_call_id = pmc.id
      WHERE pma.id::text = application_attachments.application_id::text 
      AND pmc.university_id IN (
        SELECT id FROM public.universities WHERE coordinator_id = auth.uid()
      )
    ))
  );

-- Crear buckets de almacenamiento
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('university-documents', 'university-documents', true, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/webp']),
  ('application-attachments', 'application-attachments', true, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/webp']);

-- Políticas de almacenamiento para university-documents
CREATE POLICY "Coordinators can upload university documents"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'university-documents' 
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.universities 
      WHERE coordinator_id = auth.uid()
    )
  );

CREATE POLICY "Public read access to university documents"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'university-documents');

-- Políticas de almacenamiento para application-attachments
CREATE POLICY "Authenticated users can upload application attachments"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'application-attachments' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can view their own application attachments"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'application-attachments' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Coordinators can view application attachments for their universities"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'application-attachments'
    AND EXISTS (
      SELECT 1 FROM public.universities 
      WHERE coordinator_id = auth.uid()
    )
  );

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_university_required_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar timestamp
CREATE TRIGGER update_university_required_documents_updated_at
  BEFORE UPDATE ON public.university_required_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_university_required_documents_updated_at();

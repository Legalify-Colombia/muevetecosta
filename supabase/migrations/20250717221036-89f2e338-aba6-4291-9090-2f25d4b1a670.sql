
-- Crear tabla para convocatorias de movilidad de profesores
CREATE TABLE IF NOT EXISTS professor_mobility_calls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  mobility_type TEXT NOT NULL DEFAULT 'teaching', -- 'teaching', 'research', 'training'
  start_date DATE,
  end_date DATE,
  application_deadline DATE,
  host_university_id UUID REFERENCES universities(id),
  max_participants INTEGER DEFAULT 10,
  requirements TEXT,
  benefits TEXT,
  duration_weeks INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Actualizar tabla de postulaciones de profesores con campos adicionales
ALTER TABLE professor_mobility_applications 
ADD COLUMN IF NOT EXISTS mobility_call_id UUID REFERENCES professor_mobility_calls(id),
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS birth_place TEXT,
ADD COLUMN IF NOT EXISTS birth_country TEXT,
ADD COLUMN IF NOT EXISTS blood_type TEXT,
ADD COLUMN IF NOT EXISTS health_insurance TEXT, -- EPS
ADD COLUMN IF NOT EXISTS work_insurance TEXT, -- ARL
ADD COLUMN IF NOT EXISTS pension_fund TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS origin_institution TEXT,
ADD COLUMN IF NOT EXISTS faculty_department TEXT,
ADD COLUMN IF NOT EXISTS current_role TEXT,
ADD COLUMN IF NOT EXISTS expertise_area TEXT,
ADD COLUMN IF NOT EXISTS years_experience INTEGER,
ADD COLUMN IF NOT EXISTS employee_code TEXT,
ADD COLUMN IF NOT EXISTS collaboration_department TEXT,
ADD COLUMN IF NOT EXISTS proposed_start_date DATE,
ADD COLUMN IF NOT EXISTS proposed_end_date DATE,
ADD COLUMN IF NOT EXISTS mobility_justification TEXT,
ADD COLUMN IF NOT EXISTS work_plan TEXT;

-- Crear tabla para niveles de estudio del profesor
CREATE TABLE IF NOT EXISTS professor_education_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES professor_mobility_applications(id) ON DELETE CASCADE,
  education_level TEXT NOT NULL, -- 'professional', 'technologist', 'specialist', 'master', 'doctorate'
  institution TEXT NOT NULL,
  graduation_year INTEGER,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para documentos de postulaciones de profesores
CREATE TABLE IF NOT EXISTS professor_mobility_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES professor_mobility_applications(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para notas de las postulaciones de profesores
CREATE TABLE IF NOT EXISTS professor_mobility_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES professor_mobility_applications(id) ON DELETE CASCADE,
  coordinator_id UUID REFERENCES profiles(id),
  note TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS en todas las nuevas tablas
ALTER TABLE professor_mobility_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE professor_education_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE professor_mobility_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE professor_mobility_notes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para professor_mobility_calls
CREATE POLICY "Everyone can view active mobility calls" ON professor_mobility_calls
  FOR SELECT USING (is_active = true);

CREATE POLICY "Coordinators can manage their university calls" ON professor_mobility_calls
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM universities u
      WHERE u.id = professor_mobility_calls.host_university_id
      AND u.coordinator_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all mobility calls" ON professor_mobility_calls
  FOR ALL USING (get_current_user_role() = 'admin');

-- Políticas RLS para professor_education_levels
CREATE POLICY "Professors can manage their education levels" ON professor_education_levels
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM professor_mobility_applications pma
      WHERE pma.id = professor_education_levels.application_id
      AND pma.professor_id = auth.uid()
    )
  );

CREATE POLICY "Coordinators can view education levels for their applications" ON professor_education_levels
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM professor_mobility_applications pma
      JOIN professor_mobility_calls pmc ON pma.mobility_call_id = pmc.id
      JOIN universities u ON pmc.host_university_id = u.id
      WHERE pma.id = professor_education_levels.application_id
      AND u.coordinator_id = auth.uid()
    )
  );

-- Políticas RLS para professor_mobility_documents
CREATE POLICY "Professors can manage their documents" ON professor_mobility_documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM professor_mobility_applications pma
      WHERE pma.id = professor_mobility_documents.application_id
      AND pma.professor_id = auth.uid()
    )
  );

CREATE POLICY "Coordinators can view documents for their applications" ON professor_mobility_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM professor_mobility_applications pma
      JOIN professor_mobility_calls pmc ON pma.mobility_call_id = pmc.id
      JOIN universities u ON pmc.host_university_id = u.id
      WHERE pma.id = professor_mobility_documents.application_id
      AND u.coordinator_id = auth.uid()
    )
  );

-- Políticas RLS para professor_mobility_notes
CREATE POLICY "Coordinators can manage notes for their applications" ON professor_mobility_notes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM professor_mobility_applications pma
      JOIN professor_mobility_calls pmc ON pma.mobility_call_id = pmc.id
      JOIN universities u ON pmc.host_university_id = u.id
      WHERE pma.id = professor_mobility_notes.application_id
      AND u.coordinator_id = auth.uid()
    )
  );

CREATE POLICY "Professors can view non-internal notes" ON professor_mobility_notes
  FOR SELECT USING (
    is_internal = false AND
    EXISTS (
      SELECT 1 FROM professor_mobility_applications pma
      WHERE pma.id = professor_mobility_notes.application_id
      AND pma.professor_id = auth.uid()
    )
  );

-- Actualizar políticas existentes para incluir mobility_call_id
DROP POLICY IF EXISTS "Professors can create their own applications" ON professor_mobility_applications;
CREATE POLICY "Professors can create their own applications" ON professor_mobility_applications
  FOR INSERT WITH CHECK (professor_id = auth.uid());

DROP POLICY IF EXISTS "Coordinators can view applications to their university" ON professor_mobility_applications;
CREATE POLICY "Coordinators can view applications to their university" ON professor_mobility_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM professor_mobility_calls pmc
      JOIN universities u ON pmc.host_university_id = u.id
      WHERE pmc.id = professor_mobility_applications.mobility_call_id
      AND u.coordinator_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Coordinators can update application status" ON professor_mobility_applications;
CREATE POLICY "Coordinators can update application status" ON professor_mobility_applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM professor_mobility_calls pmc
      JOIN universities u ON pmc.host_university_id = u.id
      WHERE pmc.id = professor_mobility_applications.mobility_call_id
      AND u.coordinator_id = auth.uid()
    )
  );

-- Crear función para generar número de postulación de profesor
CREATE OR REPLACE FUNCTION generate_professor_application_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  next_number INTEGER;
  formatted_number TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(application_number FROM 5) AS INTEGER)), 0) + 1
  INTO next_number
  FROM professor_mobility_applications
  WHERE application_number LIKE 'PMV-%';
  
  formatted_number := 'PMV-' || LPAD(next_number::TEXT, 6, '0');
  RETURN formatted_number;
END;
$$;

-- Crear trigger para asignar número automáticamente
CREATE OR REPLACE FUNCTION set_professor_application_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.application_number IS NULL OR NEW.application_number = '' THEN
    NEW.application_number := generate_professor_application_number();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_set_professor_application_number ON professor_mobility_applications;
CREATE TRIGGER trigger_set_professor_application_number
  BEFORE INSERT ON professor_mobility_applications
  FOR EACH ROW
  EXECUTE FUNCTION set_professor_application_number();

-- Crear constraint para limitar máximo 2 postulaciones activas por profesor
CREATE OR REPLACE FUNCTION check_max_applications_per_professor()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  active_applications_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO active_applications_count
  FROM professor_mobility_applications
  WHERE professor_id = NEW.professor_id
  AND status IN ('pending', 'in_review', 'approved_origin', 'approved_destination');
  
  IF active_applications_count >= 2 THEN
    RAISE EXCEPTION 'Un profesor puede tener máximo 2 postulaciones activas simultáneamente';
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_check_max_applications ON professor_mobility_applications;
CREATE TRIGGER trigger_check_max_applications
  BEFORE INSERT ON professor_mobility_applications
  FOR EACH ROW
  EXECUTE FUNCTION check_max_applications_per_professor();

-- Crear storage bucket para documentos de profesores si no existe
INSERT INTO storage.buckets (id, name, public) 
VALUES ('professor-mobility-docs', 'professor-mobility-docs', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para documentos de profesores
CREATE POLICY "Professors can upload their mobility documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'professor-mobility-docs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Professors can view their mobility documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'professor-mobility-docs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Coordinators can view professor documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'professor-mobility-docs' AND
    EXISTS (
      SELECT 1 FROM professor_mobility_applications pma
      JOIN professor_mobility_calls pmc ON pma.mobility_call_id = pmc.id
      JOIN universities u ON pmc.host_university_id = u.id
      WHERE u.coordinator_id = auth.uid()
      AND pma.professor_id::text = (storage.foldername(name))[1]
    )
  );

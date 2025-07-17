
-- Crear tabla para convocatorias de movilidad de profesores
CREATE TABLE public.professor_mobility_calls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  host_institution_id UUID REFERENCES universities(id),
  mobility_type TEXT NOT NULL CHECK (mobility_type IN ('Docencia', 'Investigación', 'Capacitación', 'Observación')),
  application_deadline DATE NOT NULL,
  estimated_duration TEXT,
  requirements TEXT[],
  funding_available BOOLEAN DEFAULT false,
  collaboration_area TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para postulaciones de movilidad de profesores
CREATE TABLE public.professor_mobility_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_number TEXT UNIQUE,
  professor_id UUID REFERENCES profiles(id) NOT NULL,
  mobility_call_id UUID REFERENCES professor_mobility_calls(id) NOT NULL,
  
  -- Información personal
  gender TEXT,
  birth_date DATE,
  birth_place TEXT,
  birth_country TEXT,
  blood_type TEXT,
  health_insurance TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  
  -- Información académica/laboral
  origin_institution TEXT,
  faculty_department TEXT,
  current_role TEXT,
  expertise_area TEXT,
  years_experience INTEGER,
  employee_code TEXT,
  
  -- Detalles de movilidad
  collaboration_department TEXT,
  proposed_start_date DATE,
  proposed_end_date DATE,
  mobility_justification TEXT,
  work_plan TEXT,
  
  -- Estado y fechas
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved_origin', 'approved_destination', 'rejected', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para documentos de postulaciones de profesores
CREATE TABLE public.professor_mobility_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES professor_mobility_applications(id) NOT NULL,
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  uploaded_by UUID REFERENCES profiles(id)
);

-- Crear tabla para comentarios/notas de coordinadores
CREATE TABLE public.professor_mobility_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES professor_mobility_applications(id) NOT NULL,
  coordinator_id UUID REFERENCES profiles(id) NOT NULL,
  note TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear bucket para documentos de movilidad de profesores
INSERT INTO storage.buckets (id, name, public) 
VALUES ('professor-mobility-docs', 'professor-mobility-docs', false);

-- Función para generar números de postulación de profesores
CREATE OR REPLACE FUNCTION public.generate_professor_mobility_application_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  next_number INTEGER;
  formatted_number TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(application_number FROM 10) AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.professor_mobility_applications
  WHERE application_number LIKE 'MOV-PROF-%';
  
  formatted_number := 'MOV-PROF-' || LPAD(next_number::TEXT, 6, '0');
  RETURN formatted_number;
END;
$$;

-- Trigger para auto-generar número de postulación
CREATE OR REPLACE FUNCTION public.set_professor_mobility_application_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.application_number IS NULL OR NEW.application_number = '' THEN
    NEW.application_number := public.generate_professor_mobility_application_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER professor_mobility_application_number_trigger
  BEFORE INSERT ON public.professor_mobility_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.set_professor_mobility_application_number();

-- RLS Policies para convocatorias
ALTER TABLE public.professor_mobility_calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active mobility calls" ON public.professor_mobility_calls
FOR SELECT USING (is_active = true);

CREATE POLICY "Coordinators can manage mobility calls" ON public.professor_mobility_calls
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('coordinator', 'admin')
  )
);

-- RLS Policies para postulaciones
ALTER TABLE public.professor_mobility_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professors can create their own applications" ON public.professor_mobility_applications
FOR INSERT WITH CHECK (professor_id = auth.uid());

CREATE POLICY "Professors can view their own applications" ON public.professor_mobility_applications
FOR SELECT USING (professor_id = auth.uid());

CREATE POLICY "Coordinators can view applications" ON public.professor_mobility_applications
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('coordinator', 'admin')
  )
);

CREATE POLICY "Coordinators can update application status" ON public.professor_mobility_applications
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('coordinator', 'admin')
  )
);

-- RLS Policies para documentos
ALTER TABLE public.professor_mobility_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Application owners can manage documents" ON public.professor_mobility_documents
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM professor_mobility_applications pma
    WHERE pma.id = professor_mobility_documents.application_id
    AND pma.professor_id = auth.uid()
  )
);

CREATE POLICY "Coordinators can view documents" ON public.professor_mobility_documents
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('coordinator', 'admin')
  )
);

-- RLS Policies para notas
ALTER TABLE public.professor_mobility_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coordinators can manage notes" ON public.professor_mobility_notes
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('coordinator', 'admin')
  )
);

CREATE POLICY "Professors can view public notes" ON public.professor_mobility_notes
FOR SELECT USING (
  is_internal = false AND
  EXISTS (
    SELECT 1 FROM professor_mobility_applications pma
    WHERE pma.id = professor_mobility_notes.application_id
    AND pma.professor_id = auth.uid()
  )
);

-- Políticas de Storage para el bucket
CREATE POLICY "Authenticated users can upload documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'professor-mobility-docs' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can view their own documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'professor-mobility-docs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Coordinators can view all documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'professor-mobility-docs' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('coordinator', 'admin')
  )
);

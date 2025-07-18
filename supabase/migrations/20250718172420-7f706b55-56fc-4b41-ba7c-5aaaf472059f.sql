
-- Crear tabla para convocatorias de movilidad docente
CREATE TABLE public.professor_mobility_calls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  mobility_type TEXT NOT NULL DEFAULT 'teaching',
  start_date DATE,
  end_date DATE,
  application_deadline DATE NOT NULL,
  host_university_id UUID REFERENCES universities(id),
  max_participants INTEGER NOT NULL DEFAULT 10,
  requirements TEXT,
  benefits TEXT,
  duration_weeks INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.professor_mobility_calls ENABLE ROW LEVEL SECURITY;

-- Políticas para las convocatorias de movilidad docente
CREATE POLICY "Everyone can view active professor mobility calls" 
ON public.professor_mobility_calls 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage professor mobility calls" 
ON public.professor_mobility_calls 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Coordinators can manage calls for their university" 
ON public.professor_mobility_calls 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM universities u
    WHERE u.id = professor_mobility_calls.host_university_id 
    AND u.coordinator_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM universities u
    WHERE u.id = professor_mobility_calls.host_university_id 
    AND u.coordinator_id = auth.uid()
  )
);

-- Crear función para generar número de aplicación de profesor
CREATE OR REPLACE FUNCTION generate_professor_application_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  next_number INTEGER;
  formatted_number TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(application_number FROM 6) AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.professor_mobility_applications
  WHERE application_number LIKE 'PROF-%';
  
  formatted_number := 'PROF-' || LPAD(next_number::TEXT, 6, '0');
  RETURN formatted_number;
END;
$$;

-- Trigger para generar número de aplicación automáticamente
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

CREATE TRIGGER trigger_set_professor_application_number
  BEFORE INSERT ON professor_mobility_applications
  FOR EACH ROW
  EXECUTE FUNCTION set_professor_application_number();

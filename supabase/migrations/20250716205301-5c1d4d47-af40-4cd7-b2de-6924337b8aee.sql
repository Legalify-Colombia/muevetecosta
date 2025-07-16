
-- Crear enum para los roles de usuario
CREATE TYPE user_role AS ENUM ('admin', 'coordinator', 'professor', 'student');

-- Crear enum para tipos de documento
CREATE TYPE document_type AS ENUM ('cc', 'ti', 'passport', 'ce');

-- Crear enum para estado de postulación
CREATE TYPE application_status AS ENUM ('pending', 'in_review', 'approved', 'rejected', 'completed');

-- Tabla de perfiles de usuario (extiende auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  document_type document_type NOT NULL,
  document_number TEXT NOT NULL UNIQUE,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de universidades
CREATE TABLE public.universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  city TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  coordinator_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de programas académicos
CREATE TABLE public.academic_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID REFERENCES public.universities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_semesters INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de cursos
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES public.academic_programs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  credits INTEGER,
  semester INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de información adicional de estudiantes
CREATE TABLE public.student_info (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  origin_university TEXT NOT NULL,
  academic_program TEXT NOT NULL,
  current_semester INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de postulaciones de movilidad
CREATE TABLE public.mobility_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  destination_university_id UUID REFERENCES public.universities(id) ON DELETE CASCADE,
  destination_program_id UUID REFERENCES public.academic_programs(id) ON DELETE CASCADE,
  application_number TEXT UNIQUE NOT NULL,
  status application_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de homologación de cursos (mapeo entre cursos de origen y destino)
CREATE TABLE public.course_equivalences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.mobility_applications(id) ON DELETE CASCADE,
  origin_course_name TEXT NOT NULL,
  origin_course_code TEXT,
  destination_course_id UUID REFERENCES public.courses(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de documentos adjuntos
CREATE TABLE public.application_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.mobility_applications(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobility_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_equivalences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_documents ENABLE ROW LEVEL SECURITY;

-- Función para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Políticas RLS para profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.get_current_user_role() = 'admin');

-- Políticas RLS para universities
CREATE POLICY "Everyone can view active universities" ON public.universities
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage universities" ON public.universities
  FOR ALL USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Coordinators can update their university" ON public.universities
  FOR UPDATE USING (coordinator_id = auth.uid());

-- Políticas RLS para academic_programs
CREATE POLICY "Everyone can view active programs" ON public.academic_programs
  FOR SELECT USING (is_active = true);

CREATE POLICY "Coordinators can manage their university programs" ON public.academic_programs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.universities 
      WHERE id = university_id AND coordinator_id = auth.uid()
    )
  );

-- Políticas RLS para courses
CREATE POLICY "Everyone can view active courses" ON public.courses
  FOR SELECT USING (is_active = true);

CREATE POLICY "Coordinators can manage their university courses" ON public.courses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.academic_programs ap
      JOIN public.universities u ON ap.university_id = u.id
      WHERE ap.id = program_id AND u.coordinator_id = auth.uid()
    )
  );

-- Políticas RLS para student_info
CREATE POLICY "Students can view their own info" ON public.student_info
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Students can update their own info" ON public.student_info
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all student info" ON public.student_info
  FOR SELECT USING (public.get_current_user_role() = 'admin');

-- Políticas RLS para mobility_applications
CREATE POLICY "Students can view their own applications" ON public.mobility_applications
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can create applications" ON public.mobility_applications
  FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Coordinators can view applications to their university" ON public.mobility_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.universities 
      WHERE id = destination_university_id AND coordinator_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all applications" ON public.mobility_applications
  FOR SELECT USING (public.get_current_user_role() = 'admin');

-- Políticas RLS para course_equivalences
CREATE POLICY "Students can manage their course equivalences" ON public.course_equivalences
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.mobility_applications 
      WHERE id = application_id AND student_id = auth.uid()
    )
  );

CREATE POLICY "Coordinators can view course equivalences for their university" ON public.course_equivalences
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.mobility_applications ma
      JOIN public.universities u ON ma.destination_university_id = u.id
      WHERE ma.id = application_id AND u.coordinator_id = auth.uid()
    )
  );

-- Políticas RLS para application_documents
CREATE POLICY "Students can manage their application documents" ON public.application_documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.mobility_applications 
      WHERE id = application_id AND student_id = auth.uid()
    )
  );

CREATE POLICY "Coordinators can view documents for their university applications" ON public.application_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.mobility_applications ma
      JOIN public.universities u ON ma.destination_university_id = u.id
      WHERE ma.id = application_id AND u.coordinator_id = auth.uid()
    )
  );

-- Trigger para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, document_type, document_number, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'document_type')::document_type, 'cc'),
    COALESCE(NEW.raw_user_meta_data->>'document_number', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Función para generar número de postulación
CREATE OR REPLACE FUNCTION public.generate_application_number()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  formatted_number TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(application_number FROM 5) AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.mobility_applications
  WHERE application_number LIKE 'MOV-%';
  
  formatted_number := 'MOV-' || LPAD(next_number::TEXT, 6, '0');
  RETURN formatted_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger para generar número de postulación automáticamente
CREATE OR REPLACE FUNCTION public.set_application_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.application_number IS NULL OR NEW.application_number = '' THEN
    NEW.application_number := public.generate_application_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_application_number_trigger
  BEFORE INSERT ON public.mobility_applications
  FOR EACH ROW EXECUTE FUNCTION public.set_application_number();

-- Insertar datos de ejemplo
INSERT INTO public.universities (name, description, city, phone, email, is_active) VALUES
('Universidad del Atlántico', 'Universidad pública ubicada en Barranquilla, reconocida por su excelencia académica y compromiso con el desarrollo regional.', 'Barranquilla', '+57 5 319 8000', 'info@uniatlantico.edu.co', true),
('Universidad del Norte', 'Institución privada de educación superior con programas de alta calidad y enfoque en la innovación.', 'Barranquilla', '+57 5 350 9509', 'info@uninorte.edu.co', true),
('Universidad de Cartagena', 'Universidad pública con amplia trayectoria en la formación de profesionales y desarrollo de investigación.', 'Cartagena', '+57 5 698 6000', 'info@unicartagena.edu.co', true);

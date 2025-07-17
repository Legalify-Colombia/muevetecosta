
-- Crear tabla para postulaciones de movilidad de profesores
CREATE TABLE IF NOT EXISTS professor_mobility_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professor_id UUID REFERENCES profiles(id) NOT NULL,
  destination_university_id UUID REFERENCES universities(id),
  mobility_type TEXT NOT NULL DEFAULT 'teaching', -- 'teaching', 'research', 'training'
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'completed'
  application_number TEXT,
  purpose TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE professor_mobility_applications ENABLE ROW LEVEL SECURITY;

-- Política para que profesores puedan ver sus propias postulaciones
CREATE POLICY "Professors can view their own applications" 
  ON professor_mobility_applications 
  FOR SELECT 
  USING (professor_id = auth.uid());

-- Política para que profesores puedan crear sus propias postulaciones
CREATE POLICY "Professors can create their own applications" 
  ON professor_mobility_applications 
  FOR INSERT 
  WITH CHECK (professor_id = auth.uid());

-- Política para que coordinadores puedan ver postulaciones a su universidad
CREATE POLICY "Coordinators can view applications to their university" 
  ON professor_mobility_applications 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM universities u 
    WHERE u.id = destination_university_id AND u.coordinator_id = auth.uid()
  ));

-- Política para que coordinadores puedan actualizar estado de postulaciones
CREATE POLICY "Coordinators can update application status" 
  ON professor_mobility_applications 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM universities u 
    WHERE u.id = destination_university_id AND u.coordinator_id = auth.uid()
  ));

-- Política para que admins puedan ver todo
CREATE POLICY "Admins can view all professor applications" 
  ON professor_mobility_applications 
  FOR SELECT 
  USING (get_current_user_role() = 'admin');

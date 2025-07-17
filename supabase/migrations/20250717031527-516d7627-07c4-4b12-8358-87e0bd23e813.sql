
-- Agregar el rol de professor al enum existente
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'professor';

-- Crear tabla para información adicional de profesores
CREATE TABLE public.professor_info (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  university TEXT NOT NULL,
  faculty_department TEXT,
  expertise_areas TEXT[], -- Array de áreas de especialización
  research_interests TEXT,
  relevant_publications JSONB DEFAULT '[]'::jsonb, -- Array de publicaciones
  project_experience TEXT,
  cv_url TEXT, -- URL del CV subido
  profile_photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para proyectos de investigación
CREATE TABLE public.research_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  objectives TEXT,
  status TEXT DEFAULT 'proposal' CHECK (status IN ('proposal', 'active', 'completed', 'cancelled')),
  start_date DATE,
  end_date DATE,
  lead_university_id UUID REFERENCES universities(id),
  is_public BOOLEAN DEFAULT true, -- Para permitir búsqueda pública
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para participantes en proyectos
CREATE TABLE public.project_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES research_projects(id) ON DELETE CASCADE,
  professor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'principal_investigator', 'co_investigator', 'collaborator'
  university_id UUID REFERENCES universities(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'invited', 'declined', 'inactive')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(project_id, professor_id)
);

-- Crear tabla para universidades participantes en proyectos
CREATE TABLE public.project_universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES research_projects(id) ON DELETE CASCADE,
  university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'participant', -- 'lead', 'participant'
  UNIQUE(project_id, university_id)
);

-- Crear tabla para avances y hitos de proyectos
CREATE TABLE public.project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES research_projects(id) ON DELETE CASCADE,
  professor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  milestone_date DATE NOT NULL,
  next_steps TEXT,
  documents_urls TEXT[], -- URLs de documentos adjuntos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para documentos de proyectos
CREATE TABLE public.project_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES research_projects(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  document_type TEXT, -- 'progress_report', 'article', 'data', 'other'
  description TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para comentarios de proyectos
CREATE TABLE public.project_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES research_projects(id) ON DELETE CASCADE,
  professor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS en todas las nuevas tablas
ALTER TABLE public.professor_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_comments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para professor_info
CREATE POLICY "Professors can view and update their own info" ON public.professor_info
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Coordinators can view professor info from their university" ON public.professor_info
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM universities u, profiles p
      WHERE u.coordinator_id = auth.uid()
      AND p.id = auth.uid()
      AND p.role = 'coordinator'
      AND professor_info.university = u.name
    )
  );

CREATE POLICY "Admins can view all professor info" ON public.professor_info
  FOR SELECT USING (get_current_user_role() = 'admin');

-- Políticas RLS para research_projects
CREATE POLICY "Everyone can view public projects" ON public.research_projects
  FOR SELECT USING (is_public = true);

CREATE POLICY "Project participants can view their projects" ON public.research_projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM project_participants pp
      WHERE pp.project_id = research_projects.id
      AND pp.professor_id = auth.uid()
      AND pp.status = 'active'
    )
  );

CREATE POLICY "Coordinators can view projects from their university" ON public.research_projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM project_universities pu, universities u
      WHERE pu.project_id = research_projects.id
      AND pu.university_id = u.id
      AND u.coordinator_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all projects" ON public.research_projects
  FOR ALL USING (get_current_user_role() = 'admin');

-- Políticas RLS para project_participants
CREATE POLICY "Participants can view project participation" ON public.project_participants
  FOR SELECT USING (
    professor_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM project_participants pp2
      WHERE pp2.project_id = project_participants.project_id
      AND pp2.professor_id = auth.uid()
      AND pp2.status = 'active'
    )
  );

CREATE POLICY "Coordinators can view participants from their university projects" ON public.project_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM project_universities pu, universities u
      WHERE pu.project_id = project_participants.project_id
      AND pu.university_id = u.id
      AND u.coordinator_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all participants" ON public.project_participants
  FOR ALL USING (get_current_user_role() = 'admin');

-- Políticas RLS para project_universities
CREATE POLICY "Anyone can view project universities for public projects" ON public.project_universities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM research_projects rp
      WHERE rp.id = project_universities.project_id
      AND rp.is_public = true
    )
  );

CREATE POLICY "Project participants can view project universities" ON public.project_universities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM project_participants pp
      WHERE pp.project_id = project_universities.project_id
      AND pp.professor_id = auth.uid()
      AND pp.status = 'active'
    )
  );

-- Políticas RLS para project_milestones
CREATE POLICY "Project participants can manage milestones" ON public.project_milestones
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM project_participants pp
      WHERE pp.project_id = project_milestones.project_id
      AND pp.professor_id = auth.uid()
      AND pp.status = 'active'
    )
  );

-- Políticas RLS para project_documents
CREATE POLICY "Project participants can manage documents" ON public.project_documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM project_participants pp
      WHERE pp.project_id = project_documents.project_id
      AND pp.professor_id = auth.uid()
      AND pp.status = 'active'
    )
  );

-- Políticas RLS para project_comments
CREATE POLICY "Project participants can manage comments" ON public.project_comments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM project_participants pp
      WHERE pp.project_id = project_comments.project_id
      AND pp.professor_id = auth.uid()
      AND pp.status = 'active'
    )
  );

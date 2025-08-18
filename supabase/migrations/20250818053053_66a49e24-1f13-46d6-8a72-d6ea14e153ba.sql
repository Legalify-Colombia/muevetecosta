-- FASE 1: MEJORA DE BASE DE DATOS Y ALMACENAMIENTO PARA COIL

-- 1. EXPANDIR TABLA coil_projects CON NUEVOS CAMPOS
ALTER TABLE coil_projects ADD COLUMN IF NOT EXISTS host_university_name TEXT;
ALTER TABLE coil_projects ADD COLUMN IF NOT EXISTS purpose TEXT;
ALTER TABLE coil_projects ADD COLUMN IF NOT EXISTS meeting_platform TEXT CHECK (meeting_platform IN ('zoom', 'teams', 'meet', 'other'));
ALTER TABLE coil_projects ADD COLUMN IF NOT EXISTS meeting_links JSONB DEFAULT '[]'::jsonb;
ALTER TABLE coil_projects ADD COLUMN IF NOT EXISTS project_phase TEXT DEFAULT 'setup' CHECK (project_phase IN ('setup', 'active', 'evaluation', 'completed'));
ALTER TABLE coil_projects ADD COLUMN IF NOT EXISTS academic_level TEXT CHECK (academic_level IN ('undergraduate', 'graduate', 'mixed'));
ALTER TABLE coil_projects ADD COLUMN IF NOT EXISTS subject_area TEXT;
ALTER TABLE coil_projects ADD COLUMN IF NOT EXISTS project_type TEXT CHECK (project_type IN ('course', 'research', 'community_service', 'mixed'));

-- 2. CREAR TABLA PARA FOROS DE DISCUSIÓN
CREATE TABLE IF NOT EXISTS coil_project_forums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES coil_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  is_pinned BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. CREAR TABLA PARA POSTS DE FOROS (CON RESPUESTAS ANIDADAS)
CREATE TABLE IF NOT EXISTS coil_forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forum_id UUID NOT NULL REFERENCES coil_project_forums(id) ON DELETE CASCADE,
  parent_post_id UUID REFERENCES coil_forum_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. CREAR TABLA PARA CARPETAS DE DOCUMENTOS
CREATE TABLE IF NOT EXISTS coil_document_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES coil_projects(id) ON DELETE CASCADE,
  parent_folder_id UUID REFERENCES coil_document_folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  access_permissions JSONB DEFAULT '{"all": true}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. MEJORAR TABLA coil_project_documents EXISTENTE
ALTER TABLE coil_project_documents ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES coil_document_folders(id);
ALTER TABLE coil_project_documents ADD COLUMN IF NOT EXISTS version_number INTEGER DEFAULT 1;
ALTER TABLE coil_project_documents ADD COLUMN IF NOT EXISTS previous_version_id UUID REFERENCES coil_project_documents(id);
ALTER TABLE coil_project_documents ADD COLUMN IF NOT EXISTS access_permissions JSONB DEFAULT '{"all": true}'::jsonb;
ALTER TABLE coil_project_documents ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE coil_project_documents ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- 6. CREAR TABLA PARA TAREAS/ASIGNACIONES
CREATE TABLE IF NOT EXISTS coil_project_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES coil_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  max_points INTEGER DEFAULT 100,
  assignment_type TEXT DEFAULT 'individual' CHECK (assignment_type IN ('individual', 'group', 'peer_review')),
  target_participants TEXT[] DEFAULT '{}', -- roles o IDs específicos
  rubric JSONB DEFAULT '{}'::jsonb,
  created_by UUID NOT NULL REFERENCES profiles(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. CREAR TABLA PARA ENVÍOS DE TAREAS
CREATE TABLE IF NOT EXISTS coil_assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES coil_project_assignments(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_late BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'returned')),
  UNIQUE(assignment_id, participant_id)
);

-- 8. CREAR TABLA PARA CALIFICACIONES
CREATE TABLE IF NOT EXISTS coil_assignment_grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES coil_assignment_submissions(id) ON DELETE CASCADE,
  graded_by UUID NOT NULL REFERENCES profiles(id),
  points_earned INTEGER,
  feedback TEXT,
  rubric_scores JSONB DEFAULT '{}'::jsonb,
  graded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 9. CREAR TABLA PARA ROLES PERSONALIZADOS
CREATE TABLE IF NOT EXISTS coil_project_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES coil_projects(id) ON DELETE CASCADE,
  role_name TEXT NOT NULL,
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  can_manage_participants BOOLEAN DEFAULT false,
  can_create_assignments BOOLEAN DEFAULT false,
  can_grade_assignments BOOLEAN DEFAULT false,
  can_manage_documents BOOLEAN DEFAULT false,
  can_moderate_forums BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(project_id, role_name)
);

-- 10. MEJORAR TABLA coil_project_participants PARA ROLES PERSONALIZADOS
ALTER TABLE coil_project_participants ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES coil_project_roles(id);
ALTER TABLE coil_project_participants ADD COLUMN IF NOT EXISTS custom_permissions JSONB DEFAULT '{}'::jsonb;

-- 11. CREAR BUCKETS DE ALMACENAMIENTO ESPECIALIZADOS
INSERT INTO storage.buckets (id, name, public) VALUES
('coil-forum-attachments', 'coil-forum-attachments', false),
('coil-assignment-files', 'coil-assignment-files', false),
('coil-submission-files', 'coil-submission-files', false),
('coil-project-media', 'coil-project-media', true),
('coil-document-versions', 'coil-document-versions', false)
ON CONFLICT (id) DO NOTHING;

-- 12. ÍNDICES PARA OPTIMIZACIÓN
CREATE INDEX IF NOT EXISTS idx_coil_forum_posts_forum_id ON coil_forum_posts(forum_id);
CREATE INDEX IF NOT EXISTS idx_coil_forum_posts_parent ON coil_forum_posts(parent_post_id);
CREATE INDEX IF NOT EXISTS idx_coil_documents_folder ON coil_project_documents(folder_id);
CREATE INDEX IF NOT EXISTS idx_coil_assignments_project ON coil_project_assignments(project_id);
CREATE INDEX IF NOT EXISTS idx_coil_submissions_assignment ON coil_assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_coil_submissions_participant ON coil_assignment_submissions(participant_id);

-- 13. TRIGGERS PARA ACTUALIZAR updated_at
CREATE OR REPLACE FUNCTION update_coil_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_coil_project_forums_updated_at
  BEFORE UPDATE ON coil_project_forums
  FOR EACH ROW EXECUTE FUNCTION update_coil_updated_at();

CREATE TRIGGER update_coil_document_folders_updated_at
  BEFORE UPDATE ON coil_document_folders
  FOR EACH ROW EXECUTE FUNCTION update_coil_updated_at();

CREATE TRIGGER update_coil_project_assignments_updated_at
  BEFORE UPDATE ON coil_project_assignments
  FOR EACH ROW EXECUTE FUNCTION update_coil_updated_at();

CREATE TRIGGER update_coil_assignment_grades_updated_at
  BEFORE UPDATE ON coil_assignment_grades
  FOR EACH ROW EXECUTE FUNCTION update_coil_updated_at();

-- 14. RLS POLICIES PARA NUEVAS TABLAS

-- Políticas para coil_project_forums
ALTER TABLE coil_project_forums ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project participants can view forums"
ON coil_project_forums FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM coil_project_participants cpp
    WHERE cpp.project_id = coil_project_forums.project_id 
    AND cpp.professor_id = auth.uid() 
    AND cpp.status = 'approved'
  )
);

CREATE POLICY "Project participants can create forums"
ON coil_project_forums FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM coil_project_participants cpp
    WHERE cpp.project_id = coil_project_forums.project_id 
    AND cpp.professor_id = auth.uid() 
    AND cpp.status = 'approved'
  )
);

CREATE POLICY "Forum creators and coordinators can update forums"
ON coil_project_forums FOR UPDATE
USING (
  created_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM coil_project_participants cpp
    WHERE cpp.project_id = coil_project_forums.project_id 
    AND cpp.professor_id = auth.uid() 
    AND cpp.role = 'coordinator'
    AND cpp.status = 'approved'
  )
);

-- Políticas para coil_forum_posts
ALTER TABLE coil_forum_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Forum participants can view posts"
ON coil_forum_posts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM coil_project_forums cpf
    JOIN coil_project_participants cpp ON cpf.project_id = cpp.project_id
    WHERE cpf.id = coil_forum_posts.forum_id 
    AND cpp.professor_id = auth.uid() 
    AND cpp.status = 'approved'
  )
);

CREATE POLICY "Forum participants can create posts"
ON coil_forum_posts FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM coil_project_forums cpf
    JOIN coil_project_participants cpp ON cpf.project_id = cpp.project_id
    WHERE cpf.id = coil_forum_posts.forum_id 
    AND cpp.professor_id = auth.uid() 
    AND cpp.status = 'approved'
  )
);

CREATE POLICY "Post authors can update their posts"
ON coil_forum_posts FOR UPDATE
USING (author_id = auth.uid());

-- Políticas para coil_document_folders
ALTER TABLE coil_document_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project participants can view folders"
ON coil_document_folders FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM coil_project_participants cpp
    WHERE cpp.project_id = coil_document_folders.project_id 
    AND cpp.professor_id = auth.uid() 
    AND cpp.status = 'approved'
  )
);

CREATE POLICY "Project participants can manage folders"
ON coil_document_folders FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM coil_project_participants cpp
    WHERE cpp.project_id = coil_document_folders.project_id 
    AND cpp.professor_id = auth.uid() 
    AND cpp.status = 'approved'
  )
);

-- Políticas para coil_project_assignments
ALTER TABLE coil_project_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project participants can view assignments"
ON coil_project_assignments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM coil_project_participants cpp
    WHERE cpp.project_id = coil_project_assignments.project_id 
    AND cpp.professor_id = auth.uid() 
    AND cpp.status = 'approved'
  )
);

CREATE POLICY "Coordinators and collaborators can manage assignments"
ON coil_project_assignments FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM coil_project_participants cpp
    WHERE cpp.project_id = coil_project_assignments.project_id 
    AND cpp.professor_id = auth.uid() 
    AND cpp.role IN ('coordinator', 'collaborator')
    AND cpp.status = 'approved'
  )
);

-- Políticas para coil_assignment_submissions
ALTER TABLE coil_assignment_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view relevant submissions"
ON coil_assignment_submissions FOR SELECT
USING (
  participant_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM coil_project_assignments cpa
    JOIN coil_project_participants cpp ON cpa.project_id = cpp.project_id
    WHERE cpa.id = coil_assignment_submissions.assignment_id 
    AND cpp.professor_id = auth.uid() 
    AND cpp.role IN ('coordinator', 'collaborator')
    AND cpp.status = 'approved'
  )
);

CREATE POLICY "Students can create their submissions"
ON coil_assignment_submissions FOR INSERT
WITH CHECK (participant_id = auth.uid());

CREATE POLICY "Students can update their submissions"
ON coil_assignment_submissions FOR UPDATE
USING (participant_id = auth.uid());

-- Políticas para coil_assignment_grades
ALTER TABLE coil_assignment_grades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Relevant users can view grades"
ON coil_assignment_grades FOR SELECT
USING (
  graded_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM coil_assignment_submissions cas
    WHERE cas.id = coil_assignment_grades.submission_id 
    AND cas.participant_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM coil_assignment_submissions cas
    JOIN coil_project_assignments cpa ON cas.assignment_id = cpa.id
    JOIN coil_project_participants cpp ON cpa.project_id = cpp.project_id
    WHERE cas.id = coil_assignment_grades.submission_id 
    AND cpp.professor_id = auth.uid() 
    AND cpp.role IN ('coordinator', 'collaborator')
    AND cpp.status = 'approved'
  )
);

CREATE POLICY "Coordinators and collaborators can manage grades"
ON coil_assignment_grades FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM coil_assignment_submissions cas
    JOIN coil_project_assignments cpa ON cas.assignment_id = cpa.id
    JOIN coil_project_participants cpp ON cpa.project_id = cpp.project_id
    WHERE cas.id = coil_assignment_grades.submission_id 
    AND cpp.professor_id = auth.uid() 
    AND cpp.role IN ('coordinator', 'collaborator')
    AND cpp.status = 'approved'
  )
);

-- Políticas para coil_project_roles
ALTER TABLE coil_project_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project participants can view roles"
ON coil_project_roles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM coil_project_participants cpp
    WHERE cpp.project_id = coil_project_roles.project_id 
    AND cpp.professor_id = auth.uid() 
    AND cpp.status = 'approved'
  )
);

CREATE POLICY "Coordinators can manage project roles"
ON coil_project_roles FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM coil_project_participants cpp
    WHERE cpp.project_id = coil_project_roles.project_id 
    AND cpp.professor_id = auth.uid() 
    AND cpp.role = 'coordinator'
    AND cpp.status = 'approved'
  )
);

-- 15. POLÍTICAS DE STORAGE PARA NUEVOS BUCKETS

-- Políticas para coil-forum-attachments
CREATE POLICY "Forum participants can view attachments"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'coil-forum-attachments' AND
  EXISTS (
    SELECT 1 FROM coil_forum_posts cfp
    JOIN coil_project_forums cpf ON cfp.forum_id = cpf.id
    JOIN coil_project_participants cpp ON cpf.project_id = cpp.project_id
    WHERE cfp.id::text = (storage.foldername(name))[1]
    AND cpp.professor_id = auth.uid() 
    AND cpp.status = 'approved'
  )
);

CREATE POLICY "Forum participants can upload attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'coil-forum-attachments' AND
  auth.uid()::text = (storage.foldername(name))[2]
);

-- Políticas para coil-assignment-files
CREATE POLICY "Assignment participants can view files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'coil-assignment-files' AND
  EXISTS (
    SELECT 1 FROM coil_project_assignments cpa
    JOIN coil_project_participants cpp ON cpa.project_id = cpp.project_id
    WHERE cpa.id::text = (storage.foldername(name))[1]
    AND cpp.professor_id = auth.uid() 
    AND cpp.status = 'approved'
  )
);

CREATE POLICY "Coordinators can upload assignment files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'coil-assignment-files' AND
  EXISTS (
    SELECT 1 FROM coil_project_assignments cpa
    JOIN coil_project_participants cpp ON cpa.project_id = cpp.project_id
    WHERE cpa.id::text = (storage.foldername(name))[1]
    AND cpp.professor_id = auth.uid() 
    AND cpp.role IN ('coordinator', 'collaborator')
    AND cpp.status = 'approved'
  )
);

-- Políticas para coil-submission-files
CREATE POLICY "Submission owners can manage their files"
ON storage.objects FOR ALL
USING (
  bucket_id = 'coil-submission-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Instructors can view submission files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'coil-submission-files' AND
  EXISTS (
    SELECT 1 FROM coil_assignment_submissions cas
    JOIN coil_project_assignments cpa ON cas.assignment_id = cpa.id
    JOIN coil_project_participants cpp ON cpa.project_id = cpp.project_id
    WHERE cas.participant_id::text = (storage.foldername(name))[1]
    AND cpp.professor_id = auth.uid() 
    AND cpp.role IN ('coordinator', 'collaborator')
    AND cpp.status = 'approved'
  )
);

-- Políticas para coil-project-media (bucket público)
CREATE POLICY "Anyone can view project media"
ON storage.objects FOR SELECT
USING (bucket_id = 'coil-project-media');

CREATE POLICY "Project coordinators can upload media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'coil-project-media' AND
  EXISTS (
    SELECT 1 FROM coil_projects cp
    JOIN coil_project_participants cpp ON cp.id = cpp.project_id
    WHERE cp.id::text = (storage.foldername(name))[1]
    AND cpp.professor_id = auth.uid() 
    AND cpp.role = 'coordinator'
    AND cpp.status = 'approved'
  )
);

-- Políticas para coil-document-versions
CREATE POLICY "Document participants can view versions"
ON storage.objects FOR ALL
USING (
  bucket_id = 'coil-document-versions' AND
  EXISTS (
    SELECT 1 FROM coil_project_documents cpd
    JOIN coil_project_participants cpp ON cpd.project_id = cpp.project_id
    WHERE cpd.id::text = (storage.foldername(name))[1]
    AND cpp.professor_id = auth.uid() 
    AND cpp.status = 'approved'
  )
);
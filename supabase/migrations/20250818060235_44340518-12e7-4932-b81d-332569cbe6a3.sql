-- Create security definer function to check project access
CREATE OR REPLACE FUNCTION public.has_project_access(project_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- Project coordinator
    SELECT 1 FROM coil_projects WHERE id = project_id AND coordinator_id = user_id
    UNION
    -- Project participant (approved)
    SELECT 1 FROM coil_project_participants 
    WHERE project_id = has_project_access.project_id 
    AND professor_id = user_id 
    AND status = 'approved'
    UNION
    -- Coordinators and admins have access to all projects
    SELECT 1 FROM profiles 
    WHERE id = user_id 
    AND role IN ('coordinator', 'admin')
  );
$$;

-- Update COIL projects RLS policies for better access control
DROP POLICY IF EXISTS "Coordinators can manage all COIL projects" ON public.coil_projects;
DROP POLICY IF EXISTS "Project coordinators can manage their projects" ON public.coil_projects;
DROP POLICY IF EXISTS "Professors can view and apply to projects" ON public.coil_projects;
DROP POLICY IF EXISTS "Everyone can view public COIL projects" ON public.coil_projects;

-- New comprehensive policies for COIL projects
CREATE POLICY "Project creators and participants can manage projects" 
ON public.coil_projects 
FOR ALL 
USING (public.has_project_access(id, auth.uid()))
WITH CHECK (coordinator_id = auth.uid() OR public.has_project_access(id, auth.uid()));

CREATE POLICY "Everyone can view public projects" 
ON public.coil_projects 
FOR SELECT 
USING (is_public = true OR public.has_project_access(id, auth.uid()));

-- Update project participants policies
DROP POLICY IF EXISTS "Coordinators can manage project participants" ON public.coil_project_participants;
DROP POLICY IF EXISTS "Participants can view their own participation" ON public.coil_project_participants;

CREATE POLICY "Project managers can handle participants" 
ON public.coil_project_participants 
FOR ALL 
USING (public.has_project_access(project_id, auth.uid()) OR professor_id = auth.uid())
WITH CHECK (public.has_project_access(project_id, auth.uid()) OR professor_id = auth.uid());

-- Update project applications policies  
DROP POLICY IF EXISTS "Coordinators can manage all applications" ON public.coil_project_applications;
DROP POLICY IF EXISTS "Professors can create their own applications" ON public.coil_project_applications;
DROP POLICY IF EXISTS "Professors can view their own applications" ON public.coil_project_applications;

CREATE POLICY "Professors can manage their applications" 
ON public.coil_project_applications 
FOR ALL 
USING (professor_id = auth.uid() OR public.has_project_access(project_id, auth.uid()))
WITH CHECK (professor_id = auth.uid() OR public.has_project_access(project_id, auth.uid()));

-- Update document policies for better access
DROP POLICY IF EXISTS "Project participants can view documents" ON public.coil_project_documents;
DROP POLICY IF EXISTS "Project participants can upload documents" ON public.coil_project_documents;

CREATE POLICY "Project participants can manage documents" 
ON public.coil_project_documents 
FOR ALL 
USING (is_public = true OR public.has_project_access(project_id, auth.uid()))
WITH CHECK (public.has_project_access(project_id, auth.uid()));

-- Update folder policies
DROP POLICY IF EXISTS "Project participants can manage folders" ON public.coil_document_folders;
DROP POLICY IF EXISTS "Project participants can view folders" ON public.coil_document_folders;

CREATE POLICY "Project participants can handle folders" 
ON public.coil_document_folders 
FOR ALL 
USING (public.has_project_access(project_id, auth.uid()))
WITH CHECK (public.has_project_access(project_id, auth.uid()));

-- Update assignment policies
DROP POLICY IF EXISTS "Coordinators and collaborators can manage assignments" ON public.coil_project_assignments;
DROP POLICY IF EXISTS "Project participants can view assignments" ON public.coil_project_assignments;

CREATE POLICY "Project participants can handle assignments" 
ON public.coil_project_assignments 
FOR ALL 
USING (public.has_project_access(project_id, auth.uid()))
WITH CHECK (public.has_project_access(project_id, auth.uid()));

-- Update forum policies
DROP POLICY IF EXISTS "Project participants can create forums" ON public.coil_project_forums;
DROP POLICY IF EXISTS "Project participants can view forums" ON public.coil_project_forums;
DROP POLICY IF EXISTS "Forum creators and coordinators can update forums" ON public.coil_project_forums;

CREATE POLICY "Project participants can manage forums" 
ON public.coil_project_forums 
FOR ALL 
USING (public.has_project_access(project_id, auth.uid()))
WITH CHECK (public.has_project_access(project_id, auth.uid()));

-- Update forum posts policies
DROP POLICY IF EXISTS "Forum participants can create posts" ON public.coil_forum_posts;
DROP POLICY IF EXISTS "Forum participants can view posts" ON public.coil_forum_posts;
DROP POLICY IF EXISTS "Post authors can update their posts" ON public.coil_forum_posts;

CREATE POLICY "Forum participants can manage posts" 
ON public.coil_forum_posts 
FOR ALL 
USING (
  author_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM coil_project_forums cpf 
    WHERE cpf.id = forum_id AND public.has_project_access(cpf.project_id, auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM coil_project_forums cpf 
    WHERE cpf.id = forum_id AND public.has_project_access(cpf.project_id, auth.uid())
  )
);
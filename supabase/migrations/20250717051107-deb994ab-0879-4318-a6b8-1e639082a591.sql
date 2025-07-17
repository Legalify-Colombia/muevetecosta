
-- Actualizar políticas para research_projects
DROP POLICY IF EXISTS "Coordinators can create projects for their university" ON research_projects;
DROP POLICY IF EXISTS "Coordinators can update projects from their university" ON research_projects;

-- Permitir a coordinadores crear proyectos
CREATE POLICY "Coordinators can create projects" 
ON research_projects 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'coordinator'
  )
);

-- Permitir a coordinadores actualizar proyectos donde su universidad participa
CREATE POLICY "Coordinators can update university projects" 
ON research_projects 
FOR UPDATE 
USING (
  get_current_user_role() = 'admin' OR
  EXISTS (
    SELECT 1 FROM project_universities pu
    JOIN universities u ON pu.university_id = u.id
    WHERE pu.project_id = research_projects.id 
    AND u.coordinator_id = auth.uid()
  )
);

-- Actualizar políticas para project_participants
DROP POLICY IF EXISTS "Coordinators can manage participants from their university" ON project_participants;

CREATE POLICY "Coordinators can manage university participants" 
ON project_participants 
FOR ALL 
USING (
  get_current_user_role() = 'admin' OR
  EXISTS (
    SELECT 1 FROM project_universities pu
    JOIN universities u ON pu.university_id = u.id
    WHERE pu.project_id = project_participants.project_id 
    AND u.coordinator_id = auth.uid()
  )
)
WITH CHECK (
  get_current_user_role() = 'admin' OR
  EXISTS (
    SELECT 1 FROM project_universities pu
    JOIN universities u ON pu.university_id = u.id
    WHERE pu.project_id = project_participants.project_id 
    AND u.coordinator_id = auth.uid()
  )
);

-- Actualizar políticas para project_universities
DROP POLICY IF EXISTS "Coordinators can manage university participation" ON project_universities;

CREATE POLICY "Coordinators can manage university participation" 
ON project_universities 
FOR ALL 
USING (
  get_current_user_role() = 'admin' OR
  EXISTS (
    SELECT 1 FROM universities u
    WHERE u.id = project_universities.university_id 
    AND u.coordinator_id = auth.uid()
  )
)
WITH CHECK (
  get_current_user_role() = 'admin' OR
  EXISTS (
    SELECT 1 FROM universities u
    WHERE u.id = project_universities.university_id 
    AND u.coordinator_id = auth.uid()
  )
);

-- Primero vamos a actualizar los proyectos existentes para asignar el coordinator_id
-- basándonos en quién los creó (aunque no tenemos esa info, usaremos el primer coordinador disponible)

-- Obtener el primer coordinador disponible para asignar a proyectos existentes
UPDATE coil_projects 
SET coordinator_id = (
  SELECT id FROM profiles 
  WHERE role = 'coordinator' 
  LIMIT 1
)
WHERE coordinator_id IS NULL;

-- Actualizar las políticas RLS para permitir que los coordinadores vean y gestionen todos los proyectos COIL
DROP POLICY IF EXISTS "Coordinators can manage COIL projects" ON coil_projects;
DROP POLICY IF EXISTS "Everyone can view public COIL projects" ON coil_projects;

-- Nueva política: Los coordinadores pueden gestionar todos los proyectos COIL
CREATE POLICY "Coordinators can manage all COIL projects" 
ON coil_projects 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('coordinator', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('coordinator', 'admin')
  )
);

-- Nueva política: Todos pueden ver proyectos públicos
CREATE POLICY "Everyone can view public COIL projects" 
ON coil_projects 
FOR SELECT 
USING (is_public = true);

-- Nueva política: Los creadores de proyectos pueden gestionar sus propios proyectos
CREATE POLICY "Project coordinators can manage their projects" 
ON coil_projects 
FOR ALL 
TO authenticated
USING (coordinator_id = auth.uid())
WITH CHECK (coordinator_id = auth.uid());

-- Política para profesores: pueden ver proyectos públicos y postular
CREATE POLICY "Professors can view and apply to projects" 
ON coil_projects 
FOR SELECT 
TO authenticated
USING (
  is_public = true 
  OR coordinator_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM coil_project_participants 
    WHERE project_id = coil_projects.id 
    AND professor_id = auth.uid()
  )
);
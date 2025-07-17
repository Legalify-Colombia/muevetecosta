
-- Eliminar políticas existentes problemáticas si existen
DROP POLICY IF EXISTS "Administrators and Coordinators can manage documents" ON public.university_required_documents;

-- Crear nuevas políticas RLS para university_required_documents
CREATE POLICY "Coordinators can manage their university required documents"
  ON public.university_required_documents
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.universities u 
    WHERE u.id = university_required_documents.university_id 
    AND u.coordinator_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.universities u 
    WHERE u.id = university_required_documents.university_id 
    AND u.coordinator_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all required documents"
  ON public.university_required_documents
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Everyone can view required documents for active universities"
  ON public.university_required_documents
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.universities u 
    WHERE u.id = university_required_documents.university_id 
    AND u.is_active = true
  ));

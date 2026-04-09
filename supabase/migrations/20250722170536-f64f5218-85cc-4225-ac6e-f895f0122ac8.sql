
-- Actualizar las políticas de almacenamiento para template-documents
DROP POLICY IF EXISTS "Admins can upload document templates" ON storage.objects;
CREATE POLICY "Admins can upload document templates"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'template-documents'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'::user_role
    )
  );

DROP POLICY IF EXISTS "Everyone can view document templates" ON storage.objects;
CREATE POLICY "Everyone can view document templates"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'template-documents');

-- Política para actualizar documentos (para admins)
DROP POLICY IF EXISTS "Admins can update document templates" ON storage.objects;
CREATE POLICY "Admins can update document templates"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'template-documents'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'::user_role
    )
  );

-- Política para eliminar documentos (para admins)
DROP POLICY IF EXISTS "Admins can delete document templates" ON storage.objects;
CREATE POLICY "Admins can delete document templates"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'template-documents'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'::user_role
    )
  );

-- Políticas para el bucket de documentos de postulación de convenios
DROP POLICY IF EXISTS "Users can upload postulation documents" ON storage.objects;
CREATE POLICY "Users can upload postulation documents"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'template-documents'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Authenticated users can view postulation documents" ON storage.objects;
CREATE POLICY "Authenticated users can view postulation documents"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'template-documents'
    AND auth.role() = 'authenticated'
  );

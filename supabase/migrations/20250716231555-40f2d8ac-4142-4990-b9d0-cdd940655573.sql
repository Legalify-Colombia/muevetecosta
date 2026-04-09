
-- Modify the terms_content table to support multiple pages
ALTER TABLE public.terms_content 
ADD COLUMN slug TEXT NOT NULL DEFAULT 'terms',
ADD COLUMN is_published BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN meta_description TEXT,
ADD COLUMN sort_order INTEGER DEFAULT 0;

-- Create unique constraint for slug
ALTER TABLE public.terms_content 
ADD CONSTRAINT terms_content_slug_unique UNIQUE (slug);

-- Update existing record to have proper slug
UPDATE public.terms_content 
SET slug = 'terms', 
    meta_description = 'Términos y condiciones de uso de la plataforma'
WHERE slug = 'terms' OR id = (SELECT id FROM public.terms_content LIMIT 1);

-- Insert sample pages
INSERT INTO public.terms_content (title, content, slug, meta_description, sort_order) VALUES
(
  '¿Qué es Muévete por el Caribe?',
  '<h2>¿Qué es Muévete por el Caribe?</h2>
  <p>Muévete por el Caribe es una iniciativa de movilidad estudiantil que conecta las principales universidades de la región Caribe colombiana.</p>
  
  <h3>Nuestra Misión</h3>
  <p>Facilitar el intercambio académico entre estudiantes de las universidades participantes, promoviendo la diversidad cultural y académica.</p>
  
  <h3>Objetivos</h3>
  <ul>
    <li>Fomentar la movilidad estudiantil regional</li>
    <li>Ampliar las oportunidades académicas para los estudiantes</li>
    <li>Fortalecer los lazos entre instituciones educativas</li>
    <li>Promover el desarrollo académico y personal</li>
  </ul>',
  'que-es-muevete',
  'Conoce qué es Muévete por el Caribe y cómo funciona nuestro programa de movilidad estudiantil',
  1
),
(
  'Cómo Participar',
  '<h2>Cómo Participar en Muévete por el Caribe</h2>
  <p>Participar en nuestro programa de movilidad es un proceso sencillo que te abrirá las puertas a nuevas experiencias académicas.</p>
  
  <h3>Requisitos</h3>
  <ul>
    <li>Ser estudiante activo de una universidad participante</li>
    <li>Tener un promedio académico mínimo de 3.5</li>
    <li>Estar cursando entre 3° y 8° semestre</li>
    <li>Contar con el aval de tu coordinador académico</li>
  </ul>
  
  <h3>Proceso de Aplicación</h3>
  <ol>
    <li>Regístrate en la plataforma</li>
    <li>Completa tu perfil académico</li>
    <li>Selecciona la universidad de destino</li>
    <li>Envía tu solicitud con los documentos requeridos</li>
    <li>Espera la evaluación y respuesta</li>
  </ol>
  
  <h3>Documentos Requeridos</h3>
  <ul>
    <li>Certificado de notas actualizado</li>
    <li>Carta de motivación</li>
    <li>Carta de recomendación académica</li>
    <li>Documento de identidad</li>
  </ul>',
  'como-participar',
  'Guía completa sobre cómo participar en el programa Muévete por el Caribe',
  2
);

-- Update RLS policies to work with the new structure
DROP POLICY IF EXISTS "Anyone can view terms and conditions" ON public.terms_content;
DROP POLICY IF EXISTS "Only admins can update terms and conditions" ON public.terms_content;

-- New policies for multiple pages
CREATE POLICY "Anyone can view published pages" 
ON public.terms_content 
FOR SELECT 
USING (is_published = true);

CREATE POLICY "Only admins can manage all pages" 
ON public.terms_content 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Rename table to better reflect its purpose
ALTER TABLE public.terms_content RENAME TO pages_content;

-- Update trigger name
DROP TRIGGER IF EXISTS update_terms_content_updated_at ON public.pages_content;
DROP FUNCTION IF EXISTS update_terms_updated_at();

CREATE OR REPLACE FUNCTION update_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.last_updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pages_content_updated_at
  BEFORE UPDATE ON public.pages_content
  FOR EACH ROW
  EXECUTE FUNCTION update_pages_updated_at();

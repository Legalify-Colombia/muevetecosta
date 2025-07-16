
-- Create a table for terms and conditions content
CREATE TABLE public.terms_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Términos y Condiciones',
  content TEXT NOT NULL DEFAULT 'Contenido de términos y condiciones por definir...',
  last_updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default content
INSERT INTO public.terms_content (title, content) 
VALUES (
  'Términos y Condiciones',
  '<h2>Términos y Condiciones de Uso</h2>
  <p>Bienvenido a nuestra plataforma de movilidad estudiantil. Al utilizar nuestros servicios, usted acepta estos términos y condiciones.</p>
  
  <h3>1. Aceptación de los Términos</h3>
  <p>Al acceder y utilizar esta plataforma, usted acepta estar sujeto a estos términos y condiciones de uso.</p>
  
  <h3>2. Uso de la Plataforma</h3>
  <p>Esta plataforma está destinada exclusivamente para procesos de movilidad estudiantil entre universidades participantes.</p>
  
  <h3>3. Responsabilidades del Usuario</h3>
  <p>Los usuarios son responsables de proporcionar información veraz y actualizada en sus solicitudes.</p>
  
  <h3>4. Privacidad</h3>
  <p>Nos comprometemos a proteger la privacidad de la información personal de nuestros usuarios.</p>
  
  <h3>5. Modificaciones</h3>
  <p>Nos reservamos el derecho de modificar estos términos en cualquier momento.</p>'
);

-- Enable RLS for security
ALTER TABLE public.terms_content ENABLE ROW LEVEL SECURITY;

-- Policy for public read access (anyone can view terms)
CREATE POLICY "Anyone can view terms and conditions" 
ON public.terms_content 
FOR SELECT 
USING (true);

-- Policy for admin update access
CREATE POLICY "Only admins can update terms and conditions" 
ON public.terms_content 
FOR UPDATE 
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

-- Add trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_terms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.last_updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_terms_content_updated_at
  BEFORE UPDATE ON public.terms_content
  FOR EACH ROW
  EXECUTE FUNCTION update_terms_updated_at();


-- Crear tabla para el registro de universidades en convenios
CREATE TABLE public.convenios_universidades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre_universidad TEXT NOT NULL,
  razon_social TEXT NOT NULL,
  nit_rut TEXT NOT NULL,
  direccion TEXT NOT NULL,
  telefono TEXT NOT NULL,
  correo_institucional TEXT NOT NULL,
  sitio_web TEXT,
  
  -- Datos del responsable
  responsable_nombre TEXT NOT NULL,
  responsable_cargo TEXT NOT NULL,
  responsable_identificacion TEXT NOT NULL,
  responsable_correo TEXT NOT NULL,
  responsable_telefono TEXT NOT NULL,
  
  -- Documentos
  contrato_firmado_url TEXT,
  carta_adhesion_url TEXT,
  
  -- Estado y seguimiento
  estado TEXT NOT NULL DEFAULT 'pendiente_revision', -- pendiente_revision, aprobado, rechazado, pendiente_documentos
  motivo_rechazo TEXT,
  observaciones TEXT,
  
  -- Términos y condiciones
  acepta_terminos BOOLEAN NOT NULL DEFAULT false,
  
  -- Fechas
  fecha_solicitud TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  fecha_revision TIMESTAMP WITH TIME ZONE,
  fecha_aprobacion TIMESTAMP WITH TIME ZONE,
  
  -- Metadatos
  revisado_por UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para el historial de cambios de estado
CREATE TABLE public.convenios_historial (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  convenio_id UUID NOT NULL REFERENCES public.convenios_universidades(id) ON DELETE CASCADE,
  estado_anterior TEXT,
  estado_nuevo TEXT NOT NULL,
  observaciones TEXT,
  cambiado_por UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.convenios_universidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convenios_historial ENABLE ROW LEVEL SECURITY;

-- Políticas para convenios_universidades
CREATE POLICY "Solo admins pueden ver todas las solicitudes de convenios"
  ON public.convenios_universidades
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'::user_role
  ));

CREATE POLICY "Solo admins pueden gestionar convenios"
  ON public.convenios_universidades
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'::user_role
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'::user_role
  ));

-- Políticas para convenios_historial
CREATE POLICY "Solo admins pueden ver historial de convenios"
  ON public.convenios_historial
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'::user_role
  ));

CREATE POLICY "Solo admins pueden crear historial de convenios"
  ON public.convenios_historial
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'::user_role
  ));

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_convenios_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER update_convenios_universidades_updated_at
  BEFORE UPDATE ON public.convenios_universidades
  FOR EACH ROW
  EXECUTE FUNCTION update_convenios_updated_at();

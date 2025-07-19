
-- Crear tabla para plantillas de documentos del convenio
CREATE TABLE public.convenio_plantillas_documentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  tipo TEXT NOT NULL, -- 'contrato', 'carta_adhesion', 'anexo', 'guia'
  archivo_url TEXT NOT NULL,
  archivo_nombre TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  es_activa BOOLEAN NOT NULL DEFAULT true,
  es_obligatoria BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Crear tabla para términos y condiciones del convenio
CREATE TABLE public.convenio_terminos_condiciones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL DEFAULT 'Términos y Condiciones del Convenio Muévete',
  contenido TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  es_activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Crear tabla para configuración del proceso de postulación
CREATE TABLE public.convenio_configuracion (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre_convenio TEXT NOT NULL DEFAULT 'Convenio Muévete',
  descripcion_convenio TEXT NOT NULL DEFAULT 'Únete al programa de movilidad académica más innovador de la región',
  beneficios TEXT,
  proceso_habilitado BOOLEAN NOT NULL DEFAULT true,
  mensaje_bienvenida TEXT,
  mensaje_confirmacion TEXT NOT NULL DEFAULT 'Su postulación ha sido enviada con éxito. Un administrador revisará su solicitud y nos pondremos en contacto en breve.',
  correo_notificacion_admin TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Actualizar tabla convenios_universidades para incluir referencia a términos aceptados
ALTER TABLE public.convenios_universidades 
ADD COLUMN terminos_version_aceptados INTEGER,
ADD COLUMN descripcion_universidad TEXT,
ADD COLUMN metodo_creacion TEXT DEFAULT 'formulario', -- 'formulario', 'manual'
ADD COLUMN ip_registro INET,
ADD COLUMN user_agent TEXT;

-- Crear tabla para documentos cargados por las universidades
CREATE TABLE public.convenio_documentos_universidad (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  convenio_id UUID NOT NULL REFERENCES public.convenios_universidades(id) ON DELETE CASCADE,
  plantilla_documento_id UUID REFERENCES public.convenio_plantillas_documentos(id),
  tipo_documento TEXT NOT NULL,
  archivo_url TEXT NOT NULL,
  archivo_nombre TEXT NOT NULL,
  archivo_tamaño INTEGER,
  estado_revision TEXT DEFAULT 'pendiente', -- 'pendiente', 'aprobado', 'rechazado'
  observaciones_revision TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  revisado_at TIMESTAMP WITH TIME ZONE,
  revisado_por UUID REFERENCES auth.users(id)
);

-- Crear tabla para notificaciones del convenio
CREATE TABLE public.convenio_notificaciones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  convenio_id UUID NOT NULL REFERENCES public.convenios_universidades(id) ON DELETE CASCADE,
  tipo_notificacion TEXT NOT NULL, -- 'postulacion_recibida', 'aprobacion', 'rechazo', 'solicitud_info'
  destinatario_email TEXT NOT NULL,
  asunto TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  enviado BOOLEAN DEFAULT false,
  enviado_at TIMESTAMP WITH TIME ZONE,
  error_envio TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insertar configuración inicial
INSERT INTO public.convenio_configuracion (
  nombre_convenio,
  descripcion_convenio,
  beneficios,
  mensaje_bienvenida
) VALUES (
  'Convenio Muévete',
  'Únete al programa de movilidad académica más innovador de la región que conecta universidades y facilita el intercambio estudiantil y docente.',
  'Acceso a red de universidades aliadas|Intercambio estudiantil simplificado|Movilidad docente especializada|Plataforma tecnológica integrada|Soporte administrativo completo',
  'Bienvenido al proceso de postulación para el Convenio Muévete. A continuación encontrará toda la información necesaria para unir su institución a nuestra red de universidades.'
);

-- Insertar términos y condiciones inicial
INSERT INTO public.convenio_terminos_condiciones (
  contenido
) VALUES (
  'Al participar en el Convenio Muévete, la universidad se compromete a: 1) Facilitar el intercambio académico de estudiantes y docentes, 2) Mantener estándares de calidad educativa, 3) Proporcionar información actualizada de programas académicos, 4) Cumplir con los requisitos administrativos establecidos. La universidad acepta el uso de la plataforma tecnológica y el tratamiento de datos conforme a las políticas de privacidad establecidas.'
);

-- Habilitar RLS en las nuevas tablas
ALTER TABLE public.convenio_plantillas_documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convenio_terminos_condiciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convenio_configuracion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convenio_documentos_universidad ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convenio_notificaciones ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para plantillas de documentos
CREATE POLICY "Solo admins pueden gestionar plantillas de documentos"
  ON public.convenio_plantillas_documentos
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

CREATE POLICY "Cualquiera puede ver plantillas activas"
  ON public.convenio_plantillas_documentos
  FOR SELECT
  USING (es_activa = true);

-- Políticas para términos y condiciones
CREATE POLICY "Solo admins pueden gestionar términos"
  ON public.convenio_terminos_condiciones
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

CREATE POLICY "Cualquiera puede ver términos activos"
  ON public.convenio_terminos_condiciones
  FOR SELECT
  USING (es_activo = true);

-- Políticas para configuración
CREATE POLICY "Solo admins pueden gestionar configuración"
  ON public.convenio_configuracion
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

CREATE POLICY "Cualquiera puede ver configuración"
  ON public.convenio_configuracion
  FOR SELECT
  USING (true);

-- Políticas para documentos de universidad
CREATE POLICY "Solo admins pueden ver todos los documentos de convenio"
  ON public.convenio_documentos_universidad
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'::user_role
  ));

CREATE POLICY "Solo admins pueden gestionar documentos de convenio"
  ON public.convenio_documentos_universidad
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

-- Políticas para notificaciones
CREATE POLICY "Solo admins pueden gestionar notificaciones de convenio"
  ON public.convenio_notificaciones
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

-- Funciones de trigger para updated_at
CREATE OR REPLACE FUNCTION update_convenio_plantillas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_convenio_terminos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_convenio_configuracion_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_convenio_plantillas_documentos_updated_at
  BEFORE UPDATE ON public.convenio_plantillas_documentos
  FOR EACH ROW
  EXECUTE FUNCTION update_convenio_plantillas_updated_at();

CREATE TRIGGER update_convenio_terminos_condiciones_updated_at
  BEFORE UPDATE ON public.convenio_terminos_condiciones
  FOR EACH ROW
  EXECUTE FUNCTION update_convenio_terminos_updated_at();

CREATE TRIGGER update_convenio_configuracion_updated_at
  BEFORE UPDATE ON public.convenio_configuracion
  FOR EACH ROW
  EXECUTE FUNCTION update_convenio_configuracion_updated_at();

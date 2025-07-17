
-- Crear tabla para configuración de correo electrónico
CREATE TABLE public.email_configuration (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resend_api_key TEXT,
  default_sender_email TEXT NOT NULL DEFAULT 'no-reply@mobicaribe.com',
  default_sender_name TEXT NOT NULL DEFAULT 'MobiCaribe - Movilidad Académica',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES public.profiles(id)
);

-- Crear tabla para plantillas de correo electrónico
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_name TEXT NOT NULL UNIQUE,
  template_subject TEXT NOT NULL,
  template_html_content TEXT NOT NULL,
  available_variables JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES public.profiles(id)
);

-- Crear tabla para historial de correos enviados
CREATE TABLE public.email_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID REFERENCES public.profiles(id)
);

-- Habilitar RLS en las nuevas tablas
ALTER TABLE public.email_configuration ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_history ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para email_configuration
CREATE POLICY "Admins can manage email configuration"
  ON public.email_configuration
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

-- Políticas RLS para email_templates
CREATE POLICY "Admins can manage email templates"
  ON public.email_templates
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

-- Políticas RLS para email_history
CREATE POLICY "Admins can view all email history"
  ON public.email_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can view their own email history"
  ON public.email_history
  FOR SELECT
  USING (user_id = auth.uid());

-- Insertar plantillas de correo por defecto
INSERT INTO public.email_templates (template_name, template_subject, template_html_content, available_variables, description) VALUES
('user_registration', 
 '¡Bienvenido a MobiCaribe!', 
 '<h1>¡Bienvenido a MobiCaribe, {{nombre_usuario}}!</h1><p>Gracias por registrarte en nuestra plataforma de movilidad académica.</p><p>Para activar tu cuenta, haz clic en el siguiente enlace:</p><p><a href="{{link_activacion}}">Activar mi cuenta</a></p><p>Si tienes alguna pregunta, no dudes en contactarnos.</p><p>Saludos,<br>El equipo de MobiCaribe</p>',
 '["nombre_usuario", "link_activacion", "link_login"]',
 'Correo de bienvenida para nuevos usuarios registrados'),

('password_reset',
 'Restablecimiento de contraseña - MobiCaribe',
 '<h1>Hola {{nombre_usuario}},</h1><p>Recibimos una solicitud para restablecer tu contraseña.</p><p>Para crear una nueva contraseña, haz clic en el siguiente enlace:</p><p><a href="{{link_restablecimiento}}">Restablecer mi contraseña</a></p><p>Si no solicitaste este cambio, puedes ignorar este correo.</p><p>Saludos,<br>El equipo de MobiCaribe</p>',
 '["nombre_usuario", "link_restablecimiento"]',
 'Correo para restablecimiento de contraseña'),

('application_confirmation_student',
 'Confirmación de postulación - {{numero_radicacion}}',
 '<h1>¡Postulación recibida exitosamente!</h1><p>Hola {{nombre_postulante}},</p><p>Hemos recibido tu postulación con el número de radicación: <strong>{{numero_radicacion}}</strong></p><p><strong>Detalles de tu postulación:</strong></p><ul><li>Universidad destino: {{nombre_universidad_destino}}</li><li>Programa: {{programa_postulacion}}</li></ul><p>Tu postulación será revisada por el coordinador de la universidad destino. Te notificaremos cualquier actualización.</p><p>Saludos,<br>El equipo de MobiCaribe</p>',
 '["nombre_postulante", "numero_radicacion", "nombre_universidad_destino", "programa_postulacion"]',
 'Confirmación de postulación para estudiantes'),

('application_status_update',
 'Actualización de postulación - {{numero_radicacion}}',
 '<h1>Actualización de tu postulación</h1><p>Hola {{nombre_postulante}},</p><p>Tu postulación <strong>{{numero_radicacion}}</strong> ha sido actualizada.</p><p><strong>Nuevo estado:</strong> {{estado_nuevo}}</p><p><strong>Comentarios del coordinador:</strong></p><p>{{comentario_coordinador}}</p><p>Puedes ver más detalles en tu panel: <a href="{{link_seguimiento}}">Ver mi postulación</a></p><p>Saludos,<br>El equipo de MobiCaribe</p>',
 '["nombre_postulante", "numero_radicacion", "estado_nuevo", "comentario_coordinador", "link_seguimiento"]',
 'Notificación de cambio de estado en postulaciones'),

('new_application_coordinator',
 'Nueva postulación recibida - {{numero_radicacion}}',
 '<h1>Nueva postulación para tu universidad</h1><p>Hola {{nombre_coordinador}},</p><p>Has recibido una nueva postulación:</p><p><strong>Detalles:</strong></p><ul><li>Número de radicación: {{numero_radicacion}}</li><li>Postulante: {{nombre_postulante}}</li><li>Universidad origen: {{universidad_origen}}</li><li>Programa destino: {{programa_destino}}</li></ul><p><a href="{{link_detalle_postulacion}}">Ver detalles de la postulación</a></p><p>Saludos,<br>El equipo de MobiCaribe</p>',
 '["nombre_coordinador", "nombre_postulante", "numero_radicacion", "universidad_origen", "programa_destino", "link_detalle_postulacion"]',
 'Notificación para coordinadores sobre nuevas postulaciones'),

('system_news',
 '{{titulo_novedad}} - MobiCaribe',
 '<h1>{{titulo_novedad}}</h1><div>{{contenido_novedad}}</div><p>Saludos,<br>El equipo de MobiCaribe</p>',
 '["titulo_novedad", "contenido_novedad"]',
 'Plantilla para novedades y anuncios del sistema'),

('new_project_notification',
 'Nuevo proyecto de investigación - {{titulo_proyecto}}',
 '<h1>Nuevo proyecto disponible</h1><p>Hola {{nombre_destinatario}},</p><p>Se ha creado un nuevo proyecto de investigación que puede ser de tu interés:</p><p><strong>Título:</strong> {{titulo_proyecto}}</p><p><strong>Tu rol:</strong> {{rol_proyecto}}</p><p><a href="{{link_proyecto}}">Ver detalles del proyecto</a></p><p>Saludos,<br>El equipo de MobiCaribe</p>',
 '["nombre_destinatario", "titulo_proyecto", "rol_proyecto", "link_proyecto"]',
 'Notificación sobre nuevos proyectos de investigación');

-- Insertar configuración de correo por defecto
INSERT INTO public.email_configuration (default_sender_email, default_sender_name, is_active) VALUES
('no-reply@mobicaribe.com', 'MobiCaribe - Movilidad Académica', true);

-- Crear trigger para actualizar updated_at en email_configuration
CREATE OR REPLACE FUNCTION public.update_email_configuration_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_email_configuration_updated_at
  BEFORE UPDATE ON public.email_configuration
  FOR EACH ROW
  EXECUTE FUNCTION public.update_email_configuration_updated_at();

-- Crear trigger para actualizar updated_at en email_templates
CREATE OR REPLACE FUNCTION public.update_email_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_email_templates_updated_at();

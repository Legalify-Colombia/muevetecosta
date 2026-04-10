-- Migration: Ensure email templates and configuration exist
-- Date: 2026-04-09
-- Purpose: Fix missing email templates that prevent welcome emails from being sent

-- Step 1: Ensure email_configuration table exists and has at least one active config
INSERT INTO public.email_configuration (
  configuration_name,
  default_sender_email,
  default_sender_name,
  resend_api_key,
  is_active,
  created_at,
  updated_at
) VALUES (
  'default',
  'noreply@mueveteporlacosta.com',
  'Muévete por el Caribe',
  COALESCE(current_setting('app.resend_api_key', true), ''),
  true,
  NOW(),
  NOW()
)
ON CONFLICT (configuration_name) DO UPDATE SET
  is_active = true,
  updated_at = NOW();

-- Step 2: Create/update user_registration template
INSERT INTO public.email_templates (
  template_name,
  template_subject,
  template_html_content,
  available_variables,
  description,
  is_active
) VALUES (
  'user_registration',
  'Bienvenido a Muévete por el Caribe - Confirma tu cuenta',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #003366; color: white; padding: 20px; text-align: center;">
      <h1>¡Bienvenido a Muévete por el Caribe!</h1>
    </div>
    <div style="padding: 20px; background-color: #f5f5f5;">
      <p>Hola {{nombre_usuario}},</p>
      <p>Tu cuenta ha sido creada exitosamente. Para comenzar a explorar programas de movilidad estudiantil, sigue estos pasos:</p>
      <ol>
        <li>Confirma tu correo electrónico haciendo clic en el botón de abajo</li>
        <li>Completa tu perfil con información personal</li>
        <li>Comienza a buscar y postular a programas internacionales</li>
      </ol>
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{link_activacion}}" style="background-color: #007ACC; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Confirmar mi cuenta</a>
      </div>
      <p>Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:</p>
      <p><code>{{link_activacion}}</code></p>
      <hr />
      <p>Ya tienes cuenta? <a href="{{link_login}}">Inicia sesión aquí</a></p>
      <p style="color: #666; font-size: 12px;">Este correo fue enviado a {{email_usuario}}. Si no te registraste, ignora este mensaje.</p>
    </div>
  </div>',
  jsonb_build_array('nombre_usuario', 'link_activacion', 'link_login', 'email_usuario'),
  'Welcome email for new user registrations',
  true
)
ON CONFLICT (template_name) DO UPDATE SET
  template_html_content = EXCLUDED.template_html_content,
  available_variables = EXCLUDED.available_variables,
  is_active = true;

-- Step 3: Create/update application_confirmation_student template
INSERT INTO public.email_templates (
  template_name,
  template_subject,
  template_html_content,
  available_variables,
  description,
  is_active
) VALUES (
  'application_confirmation_student',
  'Tu postulación ha sido registrada - {{numero_radicacion}}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #28a745; color: white; padding: 20px; text-align: center;">
      <h1>✓ Postulación Registrada</h1>
    </div>
    <div style="padding: 20px; background-color: #f9f9f9;">
      <p>Hola {{nombre_postulante}},</p>
      <p>Tu postulación ha sido recibida exitosamente.</p>
      <div style="background-color: #e7f3ff; padding: 15px; border-left: 4px solid #2196F3; margin: 20px 0;">
        <p><strong>Número de radicación:</strong> {{numero_radicacion}}</p>
        <p><strong>Universidad destino:</strong> {{nombre_universidad_destino}}</p>
        <p><strong>Programa:</strong> {{programa_postulacion}}</p>
      </div>
      <p>Por favor, mantén este número de radicación para referencias futuras.</p>
      <p>El coordinador de la universidad revisará tu postulación y te notificará del resultado en los próximos días.</p>
    </div>
  </div>',
  jsonb_build_array('nombre_postulante', 'numero_radicacion', 'nombre_universidad_destino', 'programa_postulacion'),
  'Application confirmation email for students',
  true
)
ON CONFLICT (template_name) DO UPDATE SET
  template_html_content = EXCLUDED.template_html_content,
  available_variables = EXCLUDED.available_variables,
  is_active = true;

-- Step 4: Create/update application_status_update template
INSERT INTO public.email_templates (
  template_name,
  template_subject,
  template_html_content,
  available_variables,
  description,
  is_active
) VALUES (
  'application_status_update',
  'Actualización en tu postulación: {{estado_nuevo}}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #f0ad4e; color: white; padding: 20px; text-align: center;">
      <h1>Actualización en tu postulación</h1>
    </div>
    <div style="padding: 20px; background-color: #fafaf8;">
      <p>Hola {{nombre_postulante}},</p>
      <p>Tu postulación ({{numero_radicacion}}) ha sido actualizada:</p>
      <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
        <p><strong>Nuevo estado:</strong> {{estado_nuevo}}</p>
        <p><strong>Comentario:</strong> {{comentario_coordinador}}</p>
      </div>
      <div style="text-align: center; margin: 20px 0;">
        <a href="{{link_seguimiento}}" style="background-color: #007ACC; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ver detalles</a>
      </div>
    </div>
  </div>',
  jsonb_build_array('nombre_postulante', 'numero_radicacion', 'estado_nuevo', 'comentario_coordinador', 'link_seguimiento'),
  'Application status update email',
  true
)
ON CONFLICT (template_name) DO UPDATE SET
  template_html_content = EXCLUDED.template_html_content,
  available_variables = EXCLUDED.available_variables,
  is_active = true;

-- Step 5: Create/update new_application_coordinator template
INSERT INTO public.email_templates (
  template_name,
  template_subject,
  template_html_content,
  available_variables,
  description,
  is_active
) VALUES (
  'new_application_coordinator',
  'Nueva postulación recibida - {{numero_radicacion}}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #007ACC; color: white; padding: 20px; text-align: center;">
      <h1>Nueva Postulación</h1>
    </div>
    <div style="padding: 20px; background-color: #f5f5f5;">
      <p>Hola {{nombre_coordinador}},</p>
      <p>Una nueva postulación ha sido recibida en tu plataforma:</p>
      <div style="background-color: #e3f2fd; padding: 15px; border-left: 4px solid #2196F3; margin: 20px 0;">
        <p><strong>Postulante:</strong> {{nombre_postulante}}</p>
        <p><strong>Número de radicación:</strong> {{numero_radicacion}}</p>
        <p><strong>Universidad de origen:</strong> {{universidad_origen}}</p>
        <p><strong>Programa de destino:</strong> {{programa_destino}}</p>
      </div>
      <div style="text-align: center; margin: 20px 0;">
        <a href="{{link_detalle_postulacion}}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Revisar postulación</a>
      </div>
    </div>
  </div>',
  jsonb_build_array('nombre_coordinador', 'nombre_postulante', 'numero_radicacion', 'universidad_origen', 'programa_destino', 'link_detalle_postulacion'),
  'New application notification for coordinators',
  true
)
ON CONFLICT (template_name) DO UPDATE SET
  template_html_content = EXCLUDED.template_html_content,
  available_variables = EXCLUDED.available_variables,
  is_active = true;

-- Step 6: Create function to verify email setup
CREATE OR REPLACE FUNCTION public.verify_email_setup()
RETURNS TABLE (
  check_name TEXT,
  status TEXT,
  details TEXT
) AS $$
BEGIN
  -- Check 1: Email configuration exists
  RETURN QUERY
  SELECT
    'Email Configuration'::TEXT as check_name,
    (CASE WHEN EXISTS (SELECT 1 FROM email_configuration WHERE is_active = true) THEN 'OK' ELSE 'MISSING' END)::TEXT as status,
    (SELECT COALESCE(default_sender_email, 'Not configured') FROM email_configuration WHERE is_active = true LIMIT 1)::TEXT as details;
  
  -- Check 2: Email templates exist
  RETURN QUERY
  SELECT
    'Email Templates'::TEXT as check_name,
    (CASE WHEN COUNT(*) > 0 THEN 'OK' ELSE 'MISSING' END)::TEXT as status,
    (COUNT(*) || ' templates found')::TEXT as details
  FROM email_templates
  WHERE is_active = true;
  
  -- Check 3: User registration template
  RETURN QUERY
  SELECT
    'User Registration Template'::TEXT as check_name,
    (CASE WHEN EXISTS (SELECT 1 FROM email_templates WHERE template_name = 'user_registration' AND is_active = true) THEN 'OK' ELSE 'MISSING' END)::TEXT as status,
    'Template for new user signups'::TEXT as details;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Log setup completion
DO $$
BEGIN
  RAISE NOTICE 'Email setup migration completed at %', NOW();
END $$;

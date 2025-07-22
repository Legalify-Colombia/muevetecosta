-- Agregar plantilla de email para coordinadores
INSERT INTO email_templates (
  template_name,
  template_subject,
  template_html_content,
  available_variables,
  description,
  is_active
) VALUES (
  'coordinator_registration',
  'Bienvenido como Coordinador - Muévete por la Costa',
  '<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenido como Coordinador - Muévete por la Costa</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 20px;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #fff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .header img {
            max-width: 180px;
            height: auto;
        }
        h1 {
            color: #2c3e50;
            text-align: center;
            margin-bottom: 20px;
            font-size: 28px;
        }
        p {
            margin-bottom: 15px;
            text-align: justify;
        }
        .highlight {
            color: #3498db;
            font-weight: bold;
        }
        .coordinator-info {
            background-color: #e3f2fd;
            padding: 20px;
            border-left: 4px solid #2196f3;
            margin: 20px 0;
            border-radius: 4px;
        }
        .call-to-action-text {
            text-align: center;
            margin-top: 20px;
            margin-bottom: 15px;
            font-size: 16px;
        }
        .button-link {
            display: block;
            width: fit-content;
            margin: 20px auto;
            padding: 15px 30px;
            background-color: #2196f3;
            color: #ffffff;
            border-radius: 8px;
            text-align: center;
            text-decoration: none;
            font-weight: bold;
            font-size: 16px;
            transition: background-color 0.3s ease;
        }
        .button-link:hover {
            background-color: #1976d2;
            text-decoration: none;
        }
        .credentials-box {
            background-color: #fff3e0;
            padding: 15px;
            border: 1px solid #ffb74d;
            border-radius: 6px;
            margin: 20px 0;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            color: #777;
            font-size: 0.9em;
        }
        ul {
            padding-left: 20px;
        }
        ul li {
            margin-bottom: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://mueveteporlacosta.com.co/lovable-uploads/df25e485-5dd4-485d-958a-b48ea880cc0f.png" alt="Logo Muévete por la Costa">
        </div>
        <h1>¡Bienvenido como <span class="highlight">Coordinador</span>!</h1>
        <p>Estimado(a) <strong>{{nombre_coordinador}}</strong>,</p>
        <p>¡Es un placer darte la bienvenida al equipo de Muévete por la Costa! Has sido designado(a) como <span class="highlight">Coordinador Académico</span> en nuestra plataforma de movilidad estudiantil.</p>
        
        <div class="coordinator-info">
            <h3 style="margin-top: 0; color: #1976d2;">Tu Rol como Coordinador</h3>
            <p>Como coordinador, tendrás acceso a funcionalidades especiales que te permitirán:</p>
            <ul>
                <li>Gestionar las postulaciones de movilidad hacia tu universidad</li>
                <li>Revisar y aprobar solicitudes de estudiantes</li>
                <li>Administrar programas académicos y convenios</li>
                <li>Coordinar con otras universidades de la región</li>
                <li>Acceder a reportes y estadísticas detalladas</li>
            </ul>
        </div>

        <div class="credentials-box">
            <h4 style="margin-top: 0; color: #f57c00;">Información de Acceso</h4>
            <p><strong>Email:</strong> {{email_coordinador}}</p>
            <p><strong>Contraseña temporal:</strong> {{password_temporal}}</p>
            <p style="font-size: 0.9em; color: #666; margin-bottom: 0;">
                <em>Por seguridad, deberás cambiar esta contraseña en tu primer inicio de sesión.</em>
            </p>
        </div>

        <p class="call-to-action-text">Para activar tu cuenta y establecer tu contraseña definitiva, haz clic en el siguiente botón:</p>
        <a href="{{link_activacion}}" class="button-link">Activar mi Cuenta de Coordinador</a>

        <p>Una vez que actives tu cuenta, podrás acceder al panel de coordinador y comenzar a gestionar las actividades de movilidad académica.</p>
        
        <p>Si tienes alguna pregunta o necesitas asistencia durante el proceso de activación, no dudes en contactar a nuestro equipo de soporte técnico.</p>

        <p>¡Esperamos trabajar contigo para impulsar la movilidad académica en la región!</p>

        <div class="footer">
            <p>Saludos cordiales,<br><strong>El equipo de Muévete por la Costa</strong></p>
            <p style="font-size: 0.8em; color: #999; margin-top: 20px;">
                Este correo fue enviado automáticamente. Si no solicitaste ser coordinador, por favor contacta a soporte.
            </p>
        </div>
    </div>
</body>
</html>',
  '["nombre_coordinador", "email_coordinador", "password_temporal", "link_activacion"]'::jsonb,
  'Correo de bienvenida para nuevos coordinadores con información de acceso',
  true
) ON CONFLICT (template_name) DO UPDATE SET
  template_html_content = EXCLUDED.template_html_content,
  available_variables = EXCLUDED.available_variables,
  description = EXCLUDED.description;
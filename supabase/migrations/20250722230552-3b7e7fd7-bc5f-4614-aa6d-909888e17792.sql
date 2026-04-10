-- Agregar plantilla para correos personalizados del administrador
INSERT INTO email_templates (
  template_name,
  template_subject,
  template_html_content,
  available_variables,
  description,
  is_active
) VALUES (
  'custom_admin_email',
  '{{subject}}',
  '<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{subject}}</title>
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
        .content {
            margin-bottom: 20px;
            text-align: justify;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            color: #777;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://mueveteporlacosta.com.co/lovable-uploads/LogoM.png" alt="Logo Muévete por el Caribe">
        </div>
        <div class="content">
            {{content}}
        </div>
        <div class="footer">
            <p>Saludos,<br>El equipo de Muévete por el Caribe</p>
        </div>
    </div>
</body>
</html>',
  to_jsonb(ARRAY['subject', 'content']),
  'Plantilla para correos personalizados enviados desde el panel de administración',
  true
) ON CONFLICT (template_name) DO UPDATE SET
  template_html_content = EXCLUDED.template_html_content,
  available_variables = EXCLUDED.available_variables,
  description = EXCLUDED.description;
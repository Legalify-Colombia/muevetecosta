import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useEmail } from '@/hooks/useEmail';
import { Loader2, Mail, Send } from 'lucide-react';

interface TestEmailData {
  templateName: string;
  recipientEmail: string;
  templateData: Record<string, string>;
}

export const EmailTestModule = () => {
  const [testEmail, setTestEmail] = useState<TestEmailData>({
    templateName: '',
    recipientEmail: '',
    templateData: {}
  });
  const [customSubject, setCustomSubject] = useState('');
  const [customContent, setCustomContent] = useState('');
  const [isCustomEmail, setIsCustomEmail] = useState(false);
  const { sendEmail, sending } = useEmail();
  const { toast } = useToast();

  const emailTemplates = [
    {
      value: 'user_registration',
      label: 'Registro de Usuario',
      variables: ['nombre_usuario', 'link_activacion', 'link_login']
    },
    {
      value: 'password_reset',
      label: 'Restablecimiento de Contraseña',
      variables: ['nombre_usuario', 'link_restablecimiento']
    },
    {
      value: 'application_confirmation_student',
      label: 'Confirmación de Postulación',
      variables: ['nombre_postulante', 'numero_radicacion', 'nombre_universidad_destino', 'programa_postulacion']
    },
    {
      value: 'application_status_update',
      label: 'Actualización de Estado',
      variables: ['nombre_postulante', 'numero_radicacion', 'estado_nuevo', 'comentario_coordinador', 'link_seguimiento']
    },
    {
      value: 'new_application_coordinator',
      label: 'Nueva Postulación (Coordinador)',
      variables: ['nombre_coordinador', 'nombre_postulante', 'numero_radicacion', 'universidad_origen', 'programa_destino', 'link_detalle_postulacion']
    },
    {
      value: 'system_news',
      label: 'Novedades del Sistema',
      variables: ['titulo_novedad', 'contenido_novedad']
    }
  ];

  const getSelectedTemplate = () => {
    return emailTemplates.find(t => t.value === testEmail.templateName);
  };

  const handleVariableChange = (variable: string, value: string) => {
    setTestEmail(prev => ({
      ...prev,
      templateData: {
        ...prev.templateData,
        [variable]: value
      }
    }));
  };

  const generateSampleData = () => {
    const template = getSelectedTemplate();
    if (!template) return;

    const sampleData: Record<string, string> = {
      nombre_usuario: 'Juan Pérez',
      nombre_postulante: 'María González',
      nombre_coordinador: 'Dr. Carlos Rodríguez',
      numero_radicacion: 'MOV-' + Math.floor(Math.random() * 100000).toString().padStart(6, '0'),
      nombre_universidad_destino: 'Universidad del Caribe',
      universidad_origen: 'Universidad de la Costa',
      programa_postulacion: 'Ingeniería de Sistemas',
      programa_destino: 'Ingeniería de Sistemas',
      estado_nuevo: 'Aprobado',
      comentario_coordinador: 'Su postulación cumple con todos los requisitos.',
      link_activacion: `https://mueveteporlacosta.com.co/auth/confirm?token=sample`,
      link_restablecimiento: `https://mueveteporlacosta.com.co/auth/reset?token=sample`,
      link_seguimiento: `https://mueveteporlacosta.com.co/dashboard/student`,
      link_detalle_postulacion: `https://mueveteporlacosta.com.co/dashboard/coordinator`,
      link_login: 'https://mueveteporlacosta.com.co/auth',
      titulo_novedad: 'Nueva funcionalidad disponible',
      contenido_novedad: 'Ahora puedes subir documentos adicionales a tu postulación y hacer seguimiento en tiempo real.',
    };

    const newTemplateData: Record<string, string> = {};
    template.variables.forEach(variable => {
      newTemplateData[variable] = sampleData[variable] || `[${variable}]`;
    });

    setTestEmail(prev => ({
      ...prev,
      templateData: newTemplateData
    }));
  };

  const handleSendTestEmail = async () => {
    if (!testEmail.recipientEmail) {
      toast({
        title: "Error",
        description: "Por favor ingresa un email de destino",
        variant: "destructive",
      });
      return;
    }

    if (isCustomEmail) {
      if (!customSubject || !customContent) {
        toast({
          title: "Error",
          description: "Por favor completa el asunto y contenido del correo",
          variant: "destructive",
        });
        return;
      }

      const result = await sendEmail({
        templateName: 'custom_admin_email',
        recipientEmail: testEmail.recipientEmail,
        templateData: {
          subject: customSubject,
          content: customContent
        }
      });

      if (result.success) {
        toast({
          title: "Correo enviado",
          description: "El correo personalizado se ha enviado exitosamente",
        });
        setCustomSubject('');
        setCustomContent('');
        setTestEmail(prev => ({ ...prev, recipientEmail: '' }));
      }
    } else {
      if (!testEmail.templateName) {
        toast({
          title: "Error",
          description: "Por favor selecciona una plantilla",
          variant: "destructive",
        });
        return;
      }

      const result = await sendEmail({
        templateName: testEmail.templateName,
        recipientEmail: testEmail.recipientEmail,
        templateData: testEmail.templateData
      });

      if (result.success) {
        toast({
          title: "Correo enviado",
          description: "El correo de prueba se ha enviado exitosamente",
        });
        setTestEmail({
          templateName: '',
          recipientEmail: '',
          templateData: {}
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Envío de Correos de Prueba
          </CardTitle>
          <CardDescription>
            Envía correos de prueba para verificar que las plantillas y configuración funcionan correctamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={!isCustomEmail ? "default" : "outline"}
              onClick={() => setIsCustomEmail(false)}
              className="flex-1"
            >
              Usar Plantilla
            </Button>
            <Button
              variant={isCustomEmail ? "default" : "outline"}
              onClick={() => setIsCustomEmail(true)}
              className="flex-1"
            >
              Correo Personalizado
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipient">Email de Destino *</Label>
            <Input
              id="recipient"
              type="email"
              placeholder="ejemplo@correo.com"
              value={testEmail.recipientEmail}
              onChange={(e) => setTestEmail(prev => ({ ...prev, recipientEmail: e.target.value }))}
            />
          </div>

          {!isCustomEmail ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="template">Plantilla de Correo *</Label>
                <Select
                  value={testEmail.templateName}
                  onValueChange={(value) => setTestEmail(prev => ({ 
                    ...prev, 
                    templateName: value,
                    templateData: {}
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una plantilla" />
                  </SelectTrigger>
                  <SelectContent>
                    {emailTemplates.map((template) => (
                      <SelectItem key={template.value} value={template.value}>
                        {template.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {testEmail.templateName && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Variables de la Plantilla</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateSampleData}
                    >
                      Generar Datos de Ejemplo
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getSelectedTemplate()?.variables.map((variable) => (
                      <div key={variable} className="space-y-1">
                        <Label htmlFor={variable} className="text-sm">
                          {variable}
                        </Label>
                        <Input
                          id={variable}
                          placeholder={`Valor para ${variable}`}
                          value={testEmail.templateData[variable] || ''}
                          onChange={(e) => handleVariableChange(variable, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="customSubject">Asunto del Correo *</Label>
                <Input
                  id="customSubject"
                  placeholder="Asunto del correo"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customContent">Contenido del Correo *</Label>
                <Textarea
                  id="customContent"
                  placeholder="Escribe aquí el contenido del correo..."
                  rows={8}
                  value={customContent}
                  onChange={(e) => setCustomContent(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Puedes usar HTML básico para formatear el contenido
                </p>
              </div>
            </>
          )}

          <Button 
            onClick={handleSendTestEmail} 
            disabled={sending}
            className="w-full"
          >
            {sending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Enviar Correo de Prueba
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuración de Enlaces de Autenticación</CardTitle>
          <CardDescription>
            Para que los enlaces de autenticación funcionen correctamente, asegúrate de configurar lo siguiente en Supabase:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">1. Site URL:</h4>
              <code className="bg-muted p-2 rounded block">https://mueveteporlacosta.com.co</code>
            </div>
            <div>
              <h4 className="font-semibold mb-2">2. Redirect URLs (agregar todas):</h4>
              <div className="space-y-1">
                <code className="bg-muted p-2 rounded block">https://mueveteporlacosta.com.co/auth/callback</code>
                <code className="bg-muted p-2 rounded block">https://mueveteporlacosta.com.co/auth/confirm</code>
                <code className="bg-muted p-2 rounded block">https://mueveteporlacosta.com.co/auth/reset</code>
                <code className="bg-muted p-2 rounded block">https://mueveteporlacosta.com.co/**</code>
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800">
                <strong>Importante:</strong> Ve a la configuración de autenticación de Supabase en{' '}
                <strong>Authentication {'>'} URL Configuration</strong> y agrega estas URLs.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
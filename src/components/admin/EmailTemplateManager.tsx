
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Edit, Eye, Loader2 } from 'lucide-react';

interface EmailTemplate {
  id: string;
  template_name: string;
  template_subject: string;
  template_html_content: string;
  available_variables: string[];
  description: string | null;
  is_active: boolean;
}

export const EmailTemplateManager = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('template_name');

      if (error) {
        console.error('Error loading templates:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las plantillas",
          variant: "destructive",
        });
        return;
      }

      setTemplates(data.map(template => ({
        ...template,
        available_variables: Array.isArray(template.available_variables) 
          ? template.available_variables 
          : JSON.parse(template.available_variables || '[]')
      })));
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('email_templates')
        .update({
          template_subject: editingTemplate.template_subject,
          template_html_content: editingTemplate.template_html_content,
          description: editingTemplate.description,
        })
        .eq('id', editingTemplate.id);

      if (error) throw error;

      toast({
        title: "Plantilla guardada",
        description: "La plantilla se ha actualizado exitosamente",
      });

      setEditingTemplate(null);
      await loadTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la plantilla",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const renderPreview = (template: EmailTemplate) => {
    let content = template.template_html_content;
    
    // Replace variables with sample data for preview
    template.available_variables.forEach(variable => {
      const sampleData: Record<string, string> = {
        nombre_usuario: 'Juan Pérez',
        nombre_postulante: 'María González',
        numero_radicacion: 'MOV-000001',
        nombre_universidad_destino: 'Universidad del Caribe',
        programa_postulacion: 'Ingeniería de Sistemas',
        estado_nuevo: 'Aprobado',
        comentario_coordinador: 'Su postulación cumple con todos los requisitos.',
        link_activacion: 'https://mobicaribe.com/activate',
        link_restablecimiento: 'https://mobicaribe.com/reset',
        link_seguimiento: 'https://mobicaribe.com/applications/123',
        titulo_novedad: 'Nueva funcionalidad disponible',
        contenido_novedad: 'Ahora puedes subir documentos adicionales a tu postulación.',
      };
      
      const regex = new RegExp(`{{${variable}}}`, 'g');
      content = content.replace(regex, sampleData[variable] || `[${variable}]`);
    });

    return content;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{template.template_name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setPreviewTemplate(template)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Vista Previa
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Vista Previa: {template.template_name}</DialogTitle>
                        <DialogDescription>
                          Asunto: {template.template_subject}
                        </DialogDescription>
                      </DialogHeader>
                      <div 
                        className="border rounded p-4 bg-white"
                        dangerouslySetInnerHTML={{ __html: renderPreview(template) }}
                      />
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEditingTemplate(template)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Editar Plantilla: {template.template_name}</DialogTitle>
                        <DialogDescription>
                          Personaliza el contenido y asunto de la plantilla
                        </DialogDescription>
                      </DialogHeader>
                      {editingTemplate && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="subject">Asunto del Correo</Label>
                            <Input
                              id="subject"
                              value={editingTemplate.template_subject}
                              onChange={(e) => setEditingTemplate(prev => 
                                prev ? { ...prev, template_subject: e.target.value } : null
                              )}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="content">Contenido HTML</Label>
                            <Textarea
                              id="content"
                              rows={12}
                              value={editingTemplate.template_html_content}
                              onChange={(e) => setEditingTemplate(prev => 
                                prev ? { ...prev, template_html_content: e.target.value } : null
                              )}
                              className="font-mono text-sm"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="description">Descripción</Label>
                            <Textarea
                              id="description"
                              rows={2}
                              value={editingTemplate.description || ''}
                              onChange={(e) => setEditingTemplate(prev => 
                                prev ? { ...prev, description: e.target.value } : null
                              )}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Variables Disponibles</Label>
                            <div className="flex flex-wrap gap-2">
                              {editingTemplate.available_variables.map((variable) => (
                                <Badge key={variable} variant="secondary">
                                  {`{{${variable}}}`}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Usa estas variables en tu plantilla para insertar datos dinámicos
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <Button onClick={handleSaveTemplate} disabled={saving}>
                              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Guardar Plantilla
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => setEditingTemplate(null)}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Asunto:</strong> {template.template_subject}</p>
                <div className="flex flex-wrap gap-1">
                  {template.available_variables.map((variable) => (
                    <Badge key={variable} variant="outline" className="text-xs">
                      {`{{${variable}}}`}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

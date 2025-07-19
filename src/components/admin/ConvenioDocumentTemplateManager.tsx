
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { FileText, Upload, Download, Edit, Trash2, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DocumentTemplate {
  id: string;
  nombre: string;
  descripcion?: string;
  tipo: string;
  archivo_url: string;
  archivo_nombre: string;
  version: number;
  es_activa: boolean;
  es_obligatoria: boolean;
  created_at: string;
  updated_at: string;
}

const ConvenioDocumentTemplateManager = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<DocumentTemplate | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo: 'contrato',
    es_obligatoria: true,
    archivo: null as File | null
  });

  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ['document-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('convenio_plantillas_documentos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as DocumentTemplate[];
    }
  });

  const uploadFile = async (file: File) => {
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('document-templates')
      .upload(fileName, file);
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('document-templates')
      .getPublicUrl(fileName);
    
    return { url: publicUrl, fileName };
  };

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      let archivo_url = data.archivo_url;
      let archivo_nombre = data.archivo_nombre;

      if (formData.archivo) {
        const { url, fileName } = await uploadFile(formData.archivo);
        archivo_url = url;
        archivo_nombre = fileName;
      }

      if (editingTemplate) {
        const { error } = await supabase
          .from('convenio_plantillas_documentos')
          .update({
            nombre: data.nombre,
            descripcion: data.descripcion,
            tipo: data.tipo,
            es_obligatoria: data.es_obligatoria,
            archivo_url,
            archivo_nombre,
            version: editingTemplate.version + 1
          })
          .eq('id', editingTemplate.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('convenio_plantillas_documentos')
          .insert({
            nombre: data.nombre,
            descripcion: data.descripcion,
            tipo: data.tipo,
            es_obligatoria: data.es_obligatoria,
            archivo_url,
            archivo_nombre
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-templates'] });
      toast({
        title: "Plantilla guardada",
        description: "La plantilla de documento ha sido guardada exitosamente.",
      });
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo guardar la plantilla de documento.",
        variant: "destructive",
      });
      console.error('Error saving template:', error);
    }
  });

  const toggleTemplateMutation = useMutation({
    mutationFn: async ({ id, es_activa }: { id: string; es_activa: boolean }) => {
      const { error } = await supabase
        .from('convenio_plantillas_documentos')
        .update({ es_activa })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-templates'] });
      toast({
        title: "Estado actualizado",
        description: "El estado de la plantilla ha sido actualizado.",
      });
    }
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('convenio_plantillas_documentos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-templates'] });
      toast({
        title: "Plantilla eliminada",
        description: "La plantilla de documento ha sido eliminada.",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      tipo: 'contrato',
      es_obligatoria: true,
      archivo: null
    });
    setEditingTemplate(null);
    setDialogOpen(false);
  };

  const handleEdit = (template: DocumentTemplate) => {
    setEditingTemplate(template);
    setFormData({
      nombre: template.nombre,
      descripcion: template.descripcion || '',
      tipo: template.tipo,
      es_obligatoria: template.es_obligatoria,
      archivo: null
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || (!formData.archivo && !editingTemplate)) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos requeridos.",
        variant: "destructive",
      });
      return;
    }

    mutation.mutate(formData);
  };

  const getTipoLabel = (tipo: string) => {
    const labels = {
      'contrato': 'Contrato',
      'carta_adhesion': 'Carta de Adhesión',
      'anexo': 'Anexo',
      'guia': 'Guía'
    };
    return labels[tipo as keyof typeof labels] || tipo;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full border-b-2 border-primary h-8 w-8"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Plantillas de Documentos</h3>
          <p className="text-sm text-muted-foreground">
            Gestiona las plantillas que las universidades deben descargar y firmar
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingTemplate(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Plantilla
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla de Documento'}
              </DialogTitle>
              <DialogDescription>
                Configure la plantilla que las universidades deberán descargar y firmar
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre de la Plantilla *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej: Contrato de Adhesión"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tipo">Tipo de Documento *</Label>
                  <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contrato">Contrato</SelectItem>
                      <SelectItem value="carta_adhesion">Carta de Adhesión</SelectItem>
                      <SelectItem value="anexo">Anexo</SelectItem>
                      <SelectItem value="guia">Guía</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Breve descripción del documento..."
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="archivo">
                  Archivo de Plantilla * {editingTemplate && '(Dejar vacío para mantener el actual)'}
                </Label>
                <Input
                  id="archivo"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setFormData({ ...formData, archivo: e.target.files?.[0] || null })}
                  required={!editingTemplate}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Formatos permitidos: PDF, DOC, DOCX
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="es_obligatoria"
                  checked={formData.es_obligatoria}
                  onCheckedChange={(checked) => setFormData({ ...formData, es_obligatoria: checked })}
                />
                <Label htmlFor="es_obligatoria">Documento obligatorio</Label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? 'Guardando...' : (editingTemplate ? 'Actualizar' : 'Crear')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plantillas Disponibles</CardTitle>
          <CardDescription>
            Lista de todas las plantillas de documentos configuradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Obligatorio</TableHead>
                <TableHead>Versión</TableHead>
                <TableHead>Fecha Creación</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates?.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{template.nombre}</div>
                      {template.descripcion && (
                        <div className="text-sm text-muted-foreground">{template.descripcion}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getTipoLabel(template.tipo)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={template.es_activa}
                        onCheckedChange={(checked) => 
                          toggleTemplateMutation.mutate({ id: template.id, es_activa: checked })
                        }
                      />
                      <span className="text-sm">
                        {template.es_activa ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={template.es_obligatoria ? 'default' : 'secondary'}>
                      {template.es_obligatoria ? 'Obligatorio' : 'Opcional'}
                    </Badge>
                  </TableCell>
                  <TableCell>v{template.version}</TableCell>
                  <TableCell>
                    {format(new Date(template.created_at), 'dd/MM/yyyy', { locale: es })}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(template.archivo_url, '_blank')}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(template)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteTemplateMutation.mutate(template.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConvenioDocumentTemplateManager;

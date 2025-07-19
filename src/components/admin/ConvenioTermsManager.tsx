
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { FileText, Edit, Plus, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TermsConditions {
  id: string;
  titulo: string;
  contenido: string;
  version: number;
  es_activo: boolean;
  created_at: string;
  updated_at: string;
}

const ConvenioTermsManager = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editingTerms, setEditingTerms] = useState<TermsConditions | null>(null);
  const [previewTerms, setPreviewTerms] = useState<TermsConditions | null>(null);
  const [formData, setFormData] = useState({
    titulo: 'Términos y Condiciones del Convenio Muévete',
    contenido: ''
  });

  const queryClient = useQueryClient();

  const { data: terms, isLoading } = useQuery({
    queryKey: ['convenio-terms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('convenio_terminos_condiciones')
        .select('*')
        .order('version', { ascending: false });
      
      if (error) throw error;
      return data as TermsConditions[];
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingTerms) {
        const { error } = await supabase
          .from('convenio_terminos_condiciones')
          .update({
            titulo: data.titulo,
            contenido: data.contenido,
            version: editingTerms.version + 1
          })
          .eq('id', editingTerms.id);
        
        if (error) throw error;
      } else {
        // Desactivar términos anteriores
        await supabase
          .from('convenio_terminos_condiciones')
          .update({ es_activo: false })
          .eq('es_activo', true);

        const maxVersion = terms?.length ? Math.max(...terms.map(t => t.version)) : 0;
        
        const { error } = await supabase
          .from('convenio_terminos_condiciones')
          .insert({
            titulo: data.titulo,
            contenido: data.contenido,
            version: maxVersion + 1,
            es_activo: true
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['convenio-terms'] });
      toast({
        title: "Términos guardados",
        description: "Los términos y condiciones han sido guardados exitosamente.",
      });
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudieron guardar los términos y condiciones.",
        variant: "destructive",
      });
      console.error('Error saving terms:', error);
    }
  });

  const activateTermsMutation = useMutation({
    mutationFn: async (id: string) => {
      // Desactivar todos los términos
      await supabase
        .from('convenio_terminos_condiciones')
        .update({ es_activo: false })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      // Activar el seleccionado
      const { error } = await supabase
        .from('convenio_terminos_condiciones')
        .update({ es_activo: true })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['convenio-terms'] });
      toast({
        title: "Términos activados",
        description: "Los términos seleccionados están ahora activos.",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      titulo: 'Términos y Condiciones del Convenio Muévete',
      contenido: ''
    });
    setEditingTerms(null);
    setDialogOpen(false);
  };

  const handleEdit = (terms: TermsConditions) => {
    setEditingTerms(terms);
    setFormData({
      titulo: terms.titulo,
      contenido: terms.contenido
    });
    setDialogOpen(true);
  };

  const handlePreview = (terms: TermsConditions) => {
    setPreviewTerms(terms);
    setPreviewOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo || !formData.contenido) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos requeridos.",
        variant: "destructive",
      });
      return;
    }

    mutation.mutate(formData);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full border-b-2 border-primary h-8 w-8"></div>
    </div>;
  }

  const activeTerms = terms?.find(t => t.es_activo);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Términos y Condiciones</h3>
          <p className="text-sm text-muted-foreground">
            Gestiona los términos y condiciones que las universidades deben aceptar
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingTerms(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Versión
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTerms ? 'Editar Términos y Condiciones' : 'Nueva Versión de Términos y Condiciones'}
              </DialogTitle>
              <DialogDescription>
                Configure los términos y condiciones que las universidades deben aceptar
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Título de los términos y condiciones"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="contenido">Contenido *</Label>
                <Textarea
                  id="contenido"
                  value={formData.contenido}
                  onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
                  placeholder="Escriba aquí el contenido completo de los términos y condiciones..."
                  rows={15}
                  className="font-mono text-sm"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Puede usar HTML básico para formato (p, strong, em, ul, ol, li, a)
                </p>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? 'Guardando...' : (editingTerms ? 'Actualizar' : 'Crear Nueva Versión')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Términos Activos */}
      {activeTerms && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Términos Activos (v{activeTerms.version})
            </CardTitle>
            <CardDescription className="text-green-700">
              Esta es la versión que actualmente ven las universidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h4 className="font-medium">{activeTerms.titulo}</h4>
              <div className="text-sm text-muted-foreground">
                {activeTerms.contenido.substring(0, 200)}...
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => handlePreview(activeTerms)}>
                  <Eye className="h-3 w-3 mr-1" />
                  Ver Completo
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleEdit(activeTerms)}>
                  <Edit className="h-3 w-3 mr-1" />
                  Editar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historial de Versiones */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Versiones</CardTitle>
          <CardDescription>
            Todas las versiones de términos y condiciones creadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Versión</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Creación</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {terms?.map((term) => (
                <TableRow key={term.id}>
                  <TableCell>
                    <Badge variant={term.es_activo ? 'default' : 'secondary'}>
                      v{term.version}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{term.titulo}</div>
                  </TableCell>
                  <TableCell>
                    {term.es_activo ? (
                      <Badge className="bg-green-100 text-green-800">Activo</Badge>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">Inactivo</Badge>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => activateTermsMutation.mutate(term.id)}
                          className="p-0 h-auto"
                        >
                          Activar
                        </Button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {format(new Date(term.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(term)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(term)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de Preview */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewTerms?.titulo}</DialogTitle>
            <DialogDescription>
              Versión {previewTerms?.version} - {previewTerms && format(new Date(previewTerms.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
            </DialogDescription>
          </DialogHeader>
          <div className="whitespace-pre-wrap text-sm leading-6">
            {previewTerms?.contenido}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConvenioTermsManager;

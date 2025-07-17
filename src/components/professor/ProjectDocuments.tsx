
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileText, Plus, Download, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface ProjectDocumentsProps {
  projectId: string;
}

const ProjectDocuments = ({ projectId }: ProjectDocumentsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    file_name: "",
    file_url: "",
    document_type: "",
    description: ""
  });

  // Obtener documentos del proyecto
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['project-documents', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_documents')
        .select(`
          *,
          profiles (
            full_name
          )
        `)
        .eq('project_id', projectId)
        .order('uploaded_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Crear documento
  const createDocumentMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!user?.id) throw new Error("Usuario no autenticado");
      
      const { error } = await supabase
        .from('project_documents')
        .insert({
          project_id: projectId,
          uploaded_by: user.id,
          ...data
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Documento subido",
        description: "El documento se ha registrado correctamente."
      });
      queryClient.invalidateQueries({ queryKey: ['project-documents', projectId] });
      setIsDialogOpen(false);
      setFormData({
        file_name: "",
        file_url: "",
        document_type: "",
        description: ""
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo subir el documento.",
        variant: "destructive"
      });
      console.error("Error creating document:", error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createDocumentMutation.mutate(formData);
  };

  const getDocumentTypeLabel = (type: string) => {
    const types = {
      'progress_report': 'Informe de Avance',
      'article': 'Artículo',
      'data': 'Datos',
      'other': 'Otro'
    };
    return types[type as keyof typeof types] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Documentos del Proyecto</h3>
          <p className="text-muted-foreground">
            Gestiona los documentos y archivos del proyecto
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Subir Documento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Subir Nuevo Documento</DialogTitle>
              <DialogDescription>
                Añade un documento al proyecto para compartir con el equipo
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="file_name">Nombre del Documento *</Label>
                <Input
                  id="file_name"
                  value={formData.file_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, file_name: e.target.value }))}
                  placeholder="Ej. Informe_Avance_Q1_2024.pdf"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="file_url">URL del Archivo *</Label>
                <Input
                  id="file_url"
                  type="url"
                  value={formData.file_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, file_url: e.target.value }))}
                  placeholder="https://ejemplo.com/documento.pdf"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="document_type">Tipo de Documento</Label>
                <Select value={formData.document_type} onValueChange={(value) => setFormData(prev => ({ ...prev, document_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo de documento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="progress_report">Informe de Avance</SelectItem>
                    <SelectItem value="article">Artículo</SelectItem>
                    <SelectItem value="data">Datos</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe brevemente el contenido del documento..."
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createDocumentMutation.isPending}>
                  {createDocumentMutation.isPending ? "Subiendo..." : "Subir Documento"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Documentos */}
      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Cargando documentos...</p>
            </div>
          </CardContent>
        </Card>
      ) : documents.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay documentos</h3>
            <p className="text-muted-foreground">
              Sube el primer documento del proyecto
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {documents.map((document) => (
            <Card key={document.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-medium">{document.file_name}</h4>
                      {document.document_type && (
                        <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                          {getDocumentTypeLabel(document.document_type)}
                        </span>
                      )}
                    </div>
                    
                    {document.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {document.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(document.uploaded_at).toLocaleDateString()}
                      </span>
                      <span>Subido por {document.profiles?.full_name}</span>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a
                      href={document.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Descargar
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectDocuments;

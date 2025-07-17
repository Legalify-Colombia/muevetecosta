import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Edit, Trash2, FileText } from "lucide-react";
import { useUniversityRequiredDocuments, useCreateUniversityRequiredDocument, useUpdateUniversityRequiredDocument, useDeleteUniversityRequiredDocument, UniversityRequiredDocument } from "@/hooks/useUniversityRequiredDocuments";
import { FileUpload } from "@/components/ui/file-upload";
import { useFileUpload } from "@/hooks/useFileUpload";
import { Download } from "lucide-react";

const documentSchema = z.object({
  document_title: z.string().min(2, "El título debe tener al menos 2 caracteres"),
  is_mandatory: z.boolean(),
  mobility_type: z.enum(['student', 'professor', 'both']),
  description: z.string().optional(),
});

type DocumentFormData = z.infer<typeof documentSchema>;

interface UniversityRequiredDocumentsProps {
  universityId: string;
}

export const UniversityRequiredDocuments = ({ universityId }: UniversityRequiredDocumentsProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingDocument, setEditingDocument] = useState<UniversityRequiredDocument | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentTemplate, setCurrentTemplate] = useState<{ name: string; url: string } | null>(null);

  const { data: documents = [], isLoading } = useUniversityRequiredDocuments(universityId);
  const createDocumentMutation = useCreateUniversityRequiredDocument();
  const updateDocumentMutation = useUpdateUniversityRequiredDocument();
  const deleteDocumentMutation = useDeleteUniversityRequiredDocument();
  
  const { uploadFile, isUploading } = useFileUpload({ 
    bucket: 'document-templates',
    folder: `university-${universityId}`
  });

  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      document_title: "",
      is_mandatory: true,
      mobility_type: 'student',
      description: "",
    },
  });

  const onSubmit = async (data: DocumentFormData) => {
    let templateFileUrl = '';
    let templateFileName = '';

    // Si hay un archivo seleccionado, subirlo primero
    if (selectedFile) {
      const fileName = `${data.document_title.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.${selectedFile.name.split('.').pop()}`;
      const uploadedUrl = await uploadFile(selectedFile, fileName);
      
      if (!uploadedUrl) {
        return; // Error en la carga, el hook ya mostró el mensaje
      }
      
      templateFileUrl = uploadedUrl;
      templateFileName = selectedFile.name;
    } else if (editingDocument && currentTemplate) {
      // Mantener el archivo existente si estamos editando y no se seleccionó uno nuevo
      templateFileUrl = currentTemplate.url;
      templateFileName = currentTemplate.name;
    }

    const documentData = {
      university_id: universityId,
      document_title: data.document_title,
      is_mandatory: data.is_mandatory,
      mobility_type: data.mobility_type,
      ...(data.description && { description: data.description }),
      ...(templateFileUrl && { template_file_url: templateFileUrl }),
      ...(templateFileName && { template_file_name: templateFileName })
    };

    if (editingDocument) {
      updateDocumentMutation.mutate({
        id: editingDocument.id,
        data: documentData
      });
    } else {
      createDocumentMutation.mutate(documentData);
    }
    
    handleCloseDialog();
  };

  const handleEdit = (document: UniversityRequiredDocument) => {
    setEditingDocument(document);
    form.reset({
      document_title: document.document_title,
      is_mandatory: document.is_mandatory,
      mobility_type: document.mobility_type,
      description: document.description || "",
    });
    
    // Configurar el archivo de plantilla actual si existe
    if (document.template_file_url && document.template_file_name) {
      setCurrentTemplate({
        name: document.template_file_name,
        url: document.template_file_url
      });
    } else {
      setCurrentTemplate(null);
    }
    setSelectedFile(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este documento requerido?")) {
      deleteDocumentMutation.mutate(id);
    }
  };

  const handleCloseDialog = () => {
    setShowCreateDialog(false);
    setEditingDocument(null);
    setSelectedFile(null);
    setCurrentTemplate(null);
    form.reset({
      document_title: "",
      is_mandatory: true,
      mobility_type: 'student',
      description: "",
    });
  };

  const getMobilityTypeLabel = (type: string) => {
    switch (type) {
      case 'student': return 'Estudiantil';
      case 'professor': return 'Docente/Admin';
      case 'both': return 'Ambos';
      default: return type;
    }
  };

  const getMobilityTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'student': return 'default';
      case 'professor': return 'secondary';
      case 'both': return 'outline';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Documentos Requeridos para Postulación</h2>
          <p className="text-muted-foreground">
            Define los documentos específicos que requiere tu universidad para las postulaciones de movilidad
          </p>
        </div>
        <Dialog 
          open={showCreateDialog || !!editingDocument} 
          onOpenChange={(open) => {
            if (!open) handleCloseDialog();
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Documento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingDocument ? "Editar Documento Requerido" : "Nuevo Documento Requerido"}
              </DialogTitle>
              <DialogDescription>
                {editingDocument 
                  ? "Modifica la información del documento requerido"
                  : "Añade un nuevo documento que los postulantes deberán cargar"
                }
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="document_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título del Documento</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ej: Carta de Motivación, Certificado de Notas..." 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="mobility_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Movilidad</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el tipo de movilidad" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="student">Movilidad Estudiantil</SelectItem>
                          <SelectItem value="professor">Movilidad Docente/Administrativa</SelectItem>
                          <SelectItem value="both">Ambos Tipos</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_mandatory"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Documento Obligatorio
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          ¿Es este documento obligatorio para la postulación?
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción/Instrucciones (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Ej: Debe estar traducido al inglés, formato PDF únicamente..."
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <Label>Plantilla del Documento (Opcional)</Label>
                  <p className="text-sm text-muted-foreground">
                    Sube una plantilla que los postulantes puedan descargar como referencia
                  </p>
                  <FileUpload
                    onFileSelect={setSelectedFile}
                    accept=".pdf,.doc,.docx"
                    currentFile={selectedFile ? { name: selectedFile.name, url: '' } : currentTemplate}
                    disabled={isUploading}
                    className="mt-2"
                  />
                </div>

                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={createDocumentMutation.isPending || updateDocumentMutation.isPending || isUploading}
                  >
                    {(createDocumentMutation.isPending || updateDocumentMutation.isPending || isUploading) 
                      ? "Guardando..." 
                      : (editingDocument ? "Actualizar" : "Crear Documento")
                    }
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Documentos Configurados
          </CardTitle>
          <CardDescription>
            Lista de todos los documentos requeridos configurados para tu universidad
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Cargando documentos...</div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay documentos requeridos configurados</p>
              <p className="text-sm">Agrega el primer documento para comenzar</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Documento</TableHead>
                  <TableHead>Tipo de Movilidad</TableHead>
                  <TableHead>Obligatorio</TableHead>
                  <TableHead>Plantilla</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell>
                      <div className="font-medium">{document.document_title}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getMobilityTypeBadgeVariant(document.mobility_type) as any}>
                        {getMobilityTypeLabel(document.mobility_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={document.is_mandatory ? "default" : "secondary"}>
                        {document.is_mandatory ? "Obligatorio" : "Opcional"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {document.template_file_url ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(document.template_file_url, '_blank')}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          {document.template_file_name}
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-sm">Sin plantilla</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {document.description || "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit(document)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(document.id)}
                          disabled={deleteDocumentMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

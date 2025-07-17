
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Download } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useUniversityRequiredDocuments } from "@/hooks/useUniversityRequiredDocuments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DocumentUploadSectionProps {
  formData: any;
  setFormData: (data: any) => void;
  destinationUniversityId?: string;
  mobilityType?: 'student' | 'professor';
}

export const DocumentUploadSection = ({ 
  formData, 
  setFormData, 
  destinationUniversityId,
  mobilityType = 'student'
}: DocumentUploadSectionProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, { file: File; url: string }>>({});
  
  const { data: requiredDocuments = [] } = useUniversityRequiredDocuments(destinationUniversityId);
  
  const { uploadFile, isUploading } = useFileUpload({ 
    bucket: mobilityType === 'student' ? 'student-documents' : 'professor-documents',
    folder: `${mobilityType}-${Date.now()}`
  });

  // Filtrar documentos según el tipo de movilidad
  const applicableDocuments = requiredDocuments.filter(doc => 
    doc.mobility_type === mobilityType || doc.mobility_type === 'both'
  );

  const handleFileSelect = async (documentId: string, file: File | null) => {
    if (!file) {
      // Remover archivo
      const newFiles = { ...uploadedFiles };
      delete newFiles[documentId];
      setUploadedFiles(newFiles);
      
      const newFormData = { ...formData };
      delete newFormData[`document_${documentId}`];
      setFormData(newFormData);
      return;
    }

    try {
      const fileName = `${documentId}_${file.name}`;
      const uploadedUrl = await uploadFile(file, fileName);
      
      if (uploadedUrl) {
        const newFiles = {
          ...uploadedFiles,
          [documentId]: { file, url: uploadedUrl }
        };
        setUploadedFiles(newFiles);
        
        setFormData((prev: any) => ({
          ...prev,
          [`document_${documentId}`]: uploadedUrl
        }));
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documentos Requeridos</CardTitle>
        {destinationUniversityId ? (
          <div className="flex items-start space-x-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>
              Carga los documentos requeridos por la universidad de destino. 
              Los documentos marcados como obligatorios son necesarios para completar tu postulación.
            </p>
          </div>
        ) : (
          <div className="flex items-start space-x-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>
              Selecciona una universidad de destino para ver los documentos requeridos específicos.
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {applicableDocuments.length > 0 ? (
          applicableDocuments.map((document) => (
            <div key={document.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{document.document_title}</h4>
                  <Badge variant={document.is_mandatory ? "default" : "secondary"}>
                    {document.is_mandatory ? "Obligatorio" : "Opcional"}
                  </Badge>
                </div>
                {document.template_file_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(document.template_file_url, '_blank')}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Descargar Plantilla
                  </Button>
                )}
              </div>
              
              {document.description && (
                <p className="text-sm text-muted-foreground">{document.description}</p>
              )}
              
              <FileUpload
                onFileSelect={(file) => handleFileSelect(document.id, file)}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                currentFile={uploadedFiles[document.id] ? {
                  name: uploadedFiles[document.id].file.name,
                  url: uploadedFiles[document.id].url
                } : null}
                disabled={isUploading}
                label={`Cargar ${document.document_title}`}
              />
            </div>
          ))
        ) : destinationUniversityId ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Esta universidad no ha configurado documentos específicos para {mobilityType === 'student' ? 'estudiantes' : 'profesores'}.</p>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Selecciona una universidad de destino para ver los documentos requeridos.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

interface DocumentUploadSectionProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const DocumentUploadSection = ({ formData, setFormData }: DocumentUploadSectionProps) => {
  const handleFileChange = (field: string, file: File | null) => {
    setFormData((prev: any) => ({ ...prev, [field]: file }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documentos Anexos</CardTitle>
        <div className="flex items-start space-x-2 text-sm text-muted-foreground">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>
            Todos los documentos deben estar en formato PDF y no exceder 5MB por archivo.
            Los documentos se cargarán cuando el sistema de almacenamiento esté configurado.
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="cv">Hoja de Vida (PDF)</Label>
          <Input 
            id="cv"
            type="file"
            accept=".pdf"
            onChange={(e) => handleFileChange('cv', e.target.files?.[0] || null)}
            disabled // Temporarily disabled until storage is set up
          />
        </div>

        <div>
          <Label htmlFor="homologationContract">Contrato de Homologación de Origen (PDF)</Label>
          <Input 
            id="homologationContract"
            type="file"
            accept=".pdf"
            onChange={(e) => handleFileChange('homologationContract', e.target.files?.[0] || null)}
            disabled // Temporarily disabled until storage is set up
          />
        </div>

        <div>
          <Label htmlFor="academicRecord">Histórico de Notas (PDF)</Label>
          <Input 
            id="academicRecord"
            type="file"
            accept=".pdf"
            onChange={(e) => handleFileChange('academicRecord', e.target.files?.[0] || null)}
            disabled // Temporarily disabled until storage is set up
          />
        </div>
      </CardContent>
    </Card>
  );
};

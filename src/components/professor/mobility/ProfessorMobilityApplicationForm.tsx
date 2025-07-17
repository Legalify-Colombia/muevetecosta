
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Send, Plus, Trash2, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface MobilityCall {
  id: string;
  title: string;
  description?: string;
  mobility_type: string;
  application_deadline: string;
  host_university_id: string;
  requirements?: string;
  benefits?: string;
  duration_weeks?: number;
  universities?: {
    name: string;
    city: string;
  };
}

interface EducationLevel {
  education_level: string;
  institution: string;
  graduation_year: number;
  title: string;
}

interface RequiredDocument {
  id: string;
  document_title: string;
  document_type: string;
  description?: string;
  is_mandatory: boolean;
  template_file_url?: string;
  template_file_name?: string;
}

interface ProfessorMobilityApplicationFormProps {
  mobilityCall: MobilityCall;
  onBack: () => void;
  onSuccess: () => void;
}

export const ProfessorMobilityApplicationForm: React.FC<ProfessorMobilityApplicationFormProps> = ({
  mobilityCall,
  onBack,
  onSuccess
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [educationLevels, setEducationLevels] = useState<EducationLevel[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<{[key: string]: File}>({});

  // Verificar cuántas aplicaciones activas tiene el profesor
  const { data: activeApplicationsCount = 0 } = useQuery({
    queryKey: ['professor-active-applications-count'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professor_mobility_applications')
        .select('id')
        .eq('professor_id', user?.id)
        .in('status', ['pending', 'in_review', 'approved_origin', 'approved_destination']);
      
      if (error) throw error;
      return data?.length || 0;
    }
  });

  // Obtener documentos requeridos para esta universidad
  const { data: requiredDocuments = [] } = useQuery({
    queryKey: ['university-required-documents', mobilityCall.host_university_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('university_required_documents')
        .select('*')
        .eq('university_id', mobilityCall.host_university_id)
        .eq('mobility_type', 'professor');
      
      if (error) throw error;
      return data as RequiredDocument[];
    }
  });

  const createApplicationMutation = useMutation({
    mutationFn: async (formData: any) => {
      if (activeApplicationsCount >= 2) {
        throw new Error('Ya tienes el máximo de 2 postulaciones activas permitidas');
      }

      // Crear la aplicación usando la tabla existente
      const { data: application, error: appError } = await supabase
        .from('professor_mobility_applications')
        .insert({
          professor_id: user?.id,
          mobility_type: mobilityCall.mobility_type,
          destination_university_id: mobilityCall.host_university_id,
          purpose: formData.mobility_justification,
          status: 'pending'
        })
        .select()
        .single();

      if (appError) throw appError;

      // Note: Skip education levels and documents for now since tables don't exist
      // These would be handled when the proper database schema is in place

      return application;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professor-mobility-applications'] });
      queryClient.invalidateQueries({ queryKey: ['professor-active-applications-count'] });
      toast({
        title: 'Postulación enviada exitosamente',
        description: 'Tu postulación ha sido registrada y será revisada por el coordinador.'
      });
      onSuccess();
    },
    onError: (error: any) => {
      console.error('Error creating application:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo enviar la postulación.',
        variant: 'destructive'
      });
    }
  });

  const addEducationLevel = () => {
    setEducationLevels([...educationLevels, {
      education_level: '',
      institution: '',
      graduation_year: new Date().getFullYear(),
      title: ''
    }]);
  };

  const removeEducationLevel = (index: number) => {
    setEducationLevels(educationLevels.filter((_, i) => i !== index));
  };

  const updateEducationLevel = (index: number, field: string, value: any) => {
    const updated = [...educationLevels];
    updated[index] = { ...updated[index], [field]: value };
    setEducationLevels(updated);
  };

  const handleFileUpload = (docType: string, file: File) => {
    setUploadedDocuments(prev => ({ ...prev, [docType]: file }));
  };

  const downloadTemplate = async (templateUrl: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('document-templates')
        .download(templateUrl);
      
      if (error) throw error;
      
      const url = URL.createObjectURL(data);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo descargar la plantilla.',
        variant: 'destructive'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeApplicationsCount >= 2) {
      toast({
        title: 'Límite alcanzado',
        description: 'Ya tienes el máximo de 2 postulaciones activas permitidas.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const form = new FormData(e.target as HTMLFormElement);
      const formData = Object.fromEntries(form.entries());
      await createApplicationMutation.mutateAsync(formData);
    } catch (error) {
      console.error('Error submitting application:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (activeApplicationsCount >= 2) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <CardTitle>Límite de Postulaciones Alcanzado</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Ya tienes {activeApplicationsCount} postulaciones activas. El límite máximo es de 2 postulaciones simultáneas.
          </p>
          <p className="text-sm text-muted-foreground">
            Para poder postularte a esta convocatoria, debes esperar a que una de tus postulaciones actuales sea procesada.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <CardTitle>Postular a: {mobilityCall.title}</CardTitle>
            <CardDescription>
              {mobilityCall.universities?.name} - {mobilityCall.universities?.city}
            </CardDescription>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline">{mobilityCall.mobility_type}</Badge>
              {mobilityCall.duration_weeks && (
                <Badge variant="outline">{mobilityCall.duration_weeks} semanas</Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Información Personal */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Información Personal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gender">Género *</Label>
                <Select name="gender" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar género" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="femenino">Femenino</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="birth_date">Fecha de Nacimiento *</Label>
                <Input id="birth_date" name="birth_date" type="date" required />
              </div>
              
              <div>
                <Label htmlFor="contact_phone">Teléfono de Contacto *</Label>
                <Input id="contact_phone" name="contact_phone" type="tel" required />
              </div>
              
              <div>
                <Label htmlFor="contact_email">Email de Contacto *</Label>
                <Input id="contact_email" name="contact_email" type="email" required />
              </div>
            </div>
          </div>

          {/* Información Profesional */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Información Profesional</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="origin_institution">Institución de Origen *</Label>
                <Input id="origin_institution" name="origin_institution" required />
              </div>
              
              <div>
                <Label htmlFor="faculty_department">Facultad/Departamento *</Label>
                <Input id="faculty_department" name="faculty_department" required />
              </div>
              
              <div>
                <Label htmlFor="current_role">Rol Actual *</Label>
                <Input id="current_role" name="current_role" required />
              </div>
              
              <div>
                <Label htmlFor="expertise_area">Área de Experticia</Label>
                <Input id="expertise_area" name="expertise_area" />
              </div>
            </div>
          </div>

          {/* Detalles de la Movilidad */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Detalles de la Movilidad</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="proposed_start_date">Fecha de Inicio Propuesta</Label>
                <Input id="proposed_start_date" name="proposed_start_date" type="date" />
              </div>
              
              <div>
                <Label htmlFor="proposed_end_date">Fecha de Fin Propuesta</Label>
                <Input id="proposed_end_date" name="proposed_end_date" type="date" />
              </div>
            </div>
            
            <div>
              <Label htmlFor="mobility_justification">Justificación de la Movilidad *</Label>
              <Textarea 
                id="mobility_justification" 
                name="mobility_justification" 
                rows={4}
                placeholder="Explica por qué deseas participar en esta movilidad..."
                required
              />
            </div>
            
            <div>
              <Label htmlFor="work_plan">Plan de Trabajo *</Label>
              <Textarea 
                id="work_plan" 
                name="work_plan" 
                rows={4}
                placeholder="Describe el plan de trabajo que desarrollarás durante la movilidad..."
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onBack}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Postulación
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

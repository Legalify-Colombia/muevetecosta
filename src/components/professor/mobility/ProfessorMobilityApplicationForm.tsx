
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

      // Crear la aplicación
      const { data: application, error: appError } = await supabase
        .from('professor_mobility_applications')
        .insert({
          professor_id: user?.id,
          mobility_call_id: mobilityCall.id,
          gender: formData.gender,
          birth_date: formData.birth_date,
          birth_place: formData.birth_place,
          birth_country: formData.birth_country,
          blood_type: formData.blood_type,
          health_insurance: formData.health_insurance,
          work_insurance: formData.work_insurance,
          pension_fund: formData.pension_fund,
          contact_phone: formData.contact_phone,
          contact_email: formData.contact_email,
          origin_institution: formData.origin_institution,
          faculty_department: formData.faculty_department,
          current_role: formData.current_role,
          expertise_area: formData.expertise_area,
          years_experience: parseInt(formData.years_experience) || 0,
          employee_code: formData.employee_code,
          collaboration_department: formData.collaboration_department,
          proposed_start_date: formData.proposed_start_date,
          proposed_end_date: formData.proposed_end_date,
          mobility_justification: formData.mobility_justification,
          work_plan: formData.work_plan,
          status: 'pending'
        })
        .select()
        .single();

      if (appError) throw appError;

      // Guardar niveles de educación
      if (educationLevels.length > 0) {
        const { error: eduError } = await supabase
          .from('professor_education_levels')
          .insert(
            educationLevels.map(level => ({
              application_id: application.id,
              ...level
            }))
          );
        
        if (eduError) throw eduError;
      }

      // Subir documentos
      for (const [docType, file] of Object.entries(uploadedDocuments)) {
        if (file) {
          const fileName = `${user?.id}/${application.id}/${docType}_${Date.now()}_${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from('professor-mobility-docs')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          // Guardar referencia del documento
          const { error: docError } = await supabase
            .from('professor_mobility_documents')
            .insert({
              application_id: application.id,
              document_type: docType,
              file_name: file.name,
              file_path: fileName,
              file_size: file.size
            });

          if (docError) throw docError;
        }
      }

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
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
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
                <Label htmlFor="birth_place">Lugar de Nacimiento *</Label>
                <Input id="birth_place" name="birth_place" required />
              </div>
              
              <div>
                <Label htmlFor="birth_country">País de Nacimiento *</Label>
                <Input id="birth_country" name="birth_country" required />
              </div>
              
              <div>
                <Label htmlFor="blood_type">Grupo Sanguíneo</Label>
                <Select name="blood_type">
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar grupo sanguíneo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="health_insurance">EPS *</Label>
                <Input id="health_insurance" name="health_insurance" required />
              </div>
              
              <div>
                <Label htmlFor="work_insurance">ARL *</Label>
                <Input id="work_insurance" name="work_insurance" required />
              </div>
              
              <div>
                <Label htmlFor="pension_fund">Fondo de Pensiones *</Label>
                <Input id="pension_fund" name="pension_fund" required />
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
              
              <div>
                <Label htmlFor="years_experience">Años de Experiencia</Label>
                <Input id="years_experience" name="years_experience" type="number" min="0" />
              </div>
              
              <div>
                <Label htmlFor="employee_code">Código de Empleado</Label>
                <Input id="employee_code" name="employee_code" />
              </div>
            </div>

            {/* Niveles de Estudio */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Niveles de Estudio</h4>
                <Button type="button" variant="outline" size="sm" onClick={addEducationLevel}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Nivel
                </Button>
              </div>
              
              {educationLevels.map((level, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                  <div>
                    <Label>Nivel de Estudios *</Label>
                    <Select 
                      value={level.education_level} 
                      onValueChange={(value) => updateEducationLevel(index, 'education_level', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar nivel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Profesional</SelectItem>
                        <SelectItem value="technologist">Tecnólogo</SelectItem>
                        <SelectItem value="specialist">Especialista</SelectItem>
                        <SelectItem value="master">Magíster</SelectItem>
                        <SelectItem value="doctorate">Doctorado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Institución *</Label>
                    <Input 
                      value={level.institution}
                      onChange={(e) => updateEducationLevel(index, 'institution', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label>Año de Graduación</Label>
                    <Input 
                      type="number"
                      value={level.graduation_year}
                      onChange={(e) => updateEducationLevel(index, 'graduation_year', parseInt(e.target.value))}
                      min="1950"
                      max={new Date().getFullYear()}
                    />
                  </div>
                  
                  <div>
                    <Label>Título *</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={level.title}
                        onChange={(e) => updateEducationLevel(index, 'title', e.target.value)}
                        required
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={() => removeEducationLevel(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Universidad de Destino */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Universidad de Destino</h3>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Universidad</Label>
                  <p className="font-medium">{mobilityCall.universities?.name}</p>
                </div>
                <div>
                  <Label>Ciudad</Label>
                  <p className="font-medium">{mobilityCall.universities?.city}</p>
                </div>
                <div>
                  <Label htmlFor="collaboration_department">Departamento de Colaboración</Label>
                  <Input id="collaboration_department" name="collaboration_department" />
                </div>
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

          {/* Documentos Requeridos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Documentos Requeridos</h3>
            {requiredDocuments.length > 0 ? (
              <div className="space-y-4">
                {requiredDocuments.map((doc) => (
                  <div key={doc.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{doc.document_title}</h4>
                        {doc.is_mandatory && <Badge variant="destructive" className="text-xs">Obligatorio</Badge>}
                      </div>
                      {doc.template_file_url && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => downloadTemplate(doc.template_file_url!, doc.template_file_name!)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Descargar Plantilla
                        </Button>
                      )}
                    </div>
                    
                    {doc.description && (
                      <p className="text-sm text-muted-foreground mb-3">{doc.description}</p>
                    )}
                    
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(doc.document_type, file);
                        }
                      }}
                      required={doc.is_mandatory}
                    />
                    
                    {uploadedDocuments[doc.document_type] && (
                      <p className="text-sm text-green-600 mt-2">
                        ✓ Archivo seleccionado: {uploadedDocuments[doc.document_type].name}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No hay documentos específicos requeridos para esta universidad.</p>
            )}
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

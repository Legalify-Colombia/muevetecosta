
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Upload, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface MobilityOpportunity {
  id: string;
  title: string;
  description?: string;
  mobility_type: string;
  application_deadline: string;
  universities?: {
    name: string;
    city: string;
  };
}

interface MobilityApplicationFormProps {
  opportunity: MobilityOpportunity;
  onBack: () => void;
}

export default function MobilityApplicationForm({ opportunity, onBack }: MobilityApplicationFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Fetch user profile info
  const { data: profile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Fetch professor info if available
  const { data: professorInfo } = useQuery({
    queryKey: ['professor-info', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('professor_info')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const submitApplication = useMutation({
    mutationFn: async (formData: any) => {
      if (!user?.id) throw new Error('Usuario no autenticado');

      // Insert application
      const { data: application, error: appError } = await supabase
        .from('professor_mobility_applications')
        .insert({
          professor_id: user.id,
          mobility_call_id: opportunity.id,
          ...formData
        })
        .select()
        .single();

      if (appError) throw appError;

      // Upload documents if any
      if (uploadedFiles.length > 0) {
        for (const file of uploadedFiles) {
          const fileName = `${application.id}/${Date.now()}-${file.name}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('professor-mobility-docs')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          // Insert document record
          const { error: docError } = await supabase
            .from('professor_mobility_documents')
            .insert({
              application_id: application.id,
              document_type: 'general',
              file_name: file.name,
              file_path: fileName,
              file_size: file.size,
              uploaded_by: user.id
            });

          if (docError) throw docError;
        }
      }

      return application;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professor-mobility-applications'] });
      toast({
        title: 'Postulación enviada',
        description: 'Tu postulación se ha enviado exitosamente.'
      });
      onBack();
    },
    onError: (error: any) => {
      console.error('Error submitting application:', error);
      toast({
        title: 'Error',
        description: 'No se pudo enviar la postulación.',
        variant: 'destructive'
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.target as HTMLFormElement);
    
    const applicationData = {
      gender: formData.get('gender'),
      birth_date: formData.get('birth_date'),
      birth_place: formData.get('birth_place'),
      birth_country: formData.get('birth_country'),
      blood_type: formData.get('blood_type'),
      health_insurance: formData.get('health_insurance'),
      contact_phone: formData.get('contact_phone'),
      contact_email: formData.get('contact_email'),
      origin_institution: formData.get('origin_institution'),
      faculty_department: formData.get('faculty_department'),
      current_role: formData.get('current_role'),
      expertise_area: formData.get('expertise_area'),
      years_experience: parseInt(formData.get('years_experience') as string) || null,
      employee_code: formData.get('employee_code'),
      collaboration_department: formData.get('collaboration_department'),
      proposed_start_date: formData.get('proposed_start_date'),
      proposed_end_date: formData.get('proposed_end_date'),
      mobility_justification: formData.get('mobility_justification'),
      work_plan: formData.get('work_plan')
    };

    await submitApplication.mutateAsync(applicationData);
    setIsSubmitting(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <CardTitle>Postulación a Movilidad</CardTitle>
            <CardDescription>{opportunity.title}</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información Personal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gender">Género</Label>
                <Select name="gender">
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
                <Label htmlFor="birth_date">Fecha de Nacimiento</Label>
                <Input id="birth_date" name="birth_date" type="date" />
              </div>
              
              <div>
                <Label htmlFor="birth_place">Lugar de Nacimiento</Label>
                <Input id="birth_place" name="birth_place" />
              </div>
              
              <div>
                <Label htmlFor="birth_country">País de Nacimiento</Label>
                <Input id="birth_country" name="birth_country" />
              </div>
              
              <div>
                <Label htmlFor="blood_type">Tipo de Sangre</Label>
                <Input id="blood_type" name="blood_type" placeholder="Ej. O+" />
              </div>
              
              <div>
                <Label htmlFor="health_insurance">Seguro de Salud</Label>
                <Input id="health_insurance" name="health_insurance" />
              </div>
              
              <div>
                <Label htmlFor="contact_phone">Teléfono de Contacto</Label>
                <Input 
                  id="contact_phone" 
                  name="contact_phone" 
                  defaultValue={profile?.phone || ''}
                  required 
                />
              </div>
              
              <div>
                <Label htmlFor="contact_email">Email de Contacto</Label>
                <Input 
                  id="contact_email" 
                  name="contact_email" 
                  type="email"
                  defaultValue={user?.email || ''}
                  required 
                />
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información Académica/Laboral</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="origin_institution">Institución de Origen</Label>
                <Input 
                  id="origin_institution" 
                  name="origin_institution"
                  defaultValue={professorInfo?.university || ''}
                  required 
                />
              </div>
              
              <div>
                <Label htmlFor="faculty_department">Facultad/Departamento</Label>
                <Input 
                  id="faculty_department" 
                  name="faculty_department"
                  defaultValue={professorInfo?.faculty_department || ''}
                />
              </div>
              
              <div>
                <Label htmlFor="current_role">Rol Actual</Label>
                <Input id="current_role" name="current_role" placeholder="Ej. Profesor Asociado" />
              </div>
              
              <div>
                <Label htmlFor="expertise_area">Área de Experticia</Label>
                <Input 
                  id="expertise_area" 
                  name="expertise_area"
                  defaultValue={professorInfo?.expertise_areas?.join(', ') || ''}
                />
              </div>
              
              <div>
                <Label htmlFor="years_experience">Años de Experiencia</Label>
                <Input id="years_experience" name="years_experience" type="number" />
              </div>
              
              <div>
                <Label htmlFor="employee_code">Código de Empleado</Label>
                <Input id="employee_code" name="employee_code" />
              </div>
            </div>
          </div>

          {/* Mobility Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Detalles de la Movilidad</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="collaboration_department">Departamento de Colaboración</Label>
                <Input id="collaboration_department" name="collaboration_department" />
              </div>
              
              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="proposed_start_date">Fecha de Inicio Propuesta</Label>
                  <Input id="proposed_start_date" name="proposed_start_date" type="date" />
                </div>
                
                <div>
                  <Label htmlFor="proposed_end_date">Fecha de Fin Propuesta</Label>
                  <Input id="proposed_end_date" name="proposed_end_date" type="date" />
                </div>
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="mobility_justification">Justificación de la Movilidad</Label>
                <Textarea 
                  id="mobility_justification" 
                  name="mobility_justification"
                  rows={4}
                  placeholder="Explique por qué desea participar en esta movilidad y cómo contribuirá a su desarrollo profesional..."
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="work_plan">Plan de Trabajo</Label>
                <Textarea 
                  id="work_plan" 
                  name="work_plan"
                  rows={6}
                  placeholder="Describa las actividades que planea realizar durante la movilidad..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Document Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Documentos</h3>
            <div>
              <Label htmlFor="documents">Adjuntar Documentos</Label>
              <Input 
                id="documents" 
                type="file" 
                multiple 
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Formatos aceptados: PDF, DOC, DOCX, JPG, PNG
              </p>
            </div>
            
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Archivos Seleccionados:</Label>
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">{file.name}</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      Remover
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onBack}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Enviar Postulación'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}


import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Send, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { DocumentUploadSection } from '@/components/mobility/DocumentUploadSection';

interface MobilityOpportunity {
  id: string;
  title: string;
  description?: string;
  host_institution_id?: string;
  mobility_type: string;
  application_deadline: string;
  estimated_duration?: string;
  collaboration_area?: string;
  funding_available: boolean;
  requirements?: string[];
  universities?: {
    name: string;
    city: string;
  };
}

interface MobilityApplicationFormProps {
  opportunity: MobilityOpportunity;
  onBack: () => void;
  onSuccess: () => void;
}

export const MobilityApplicationForm: React.FC<MobilityApplicationFormProps> = ({
  opportunity,
  onBack,
  onSuccess
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({});

  const createApplicationMutation = useMutation({
    mutationFn: async (applicationData: any) => {
      const { error } = await supabase
        .from('professor_mobility_applications' as any)
        .insert({
          ...applicationData,
          professor_id: user?.id,
          mobility_call_id: opportunity.id,
          status: 'pending'
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professor-mobility-applications'] });
      toast({
        title: 'Postulación enviada',
        description: 'Tu postulación ha sido enviada exitosamente.'
      });
      onSuccess();
    },
    onError: (error: any) => {
      console.error('Error creating application:', error);
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

    try {
      const form = new FormData(e.target as HTMLFormElement);
      
      const applicationData = {
        gender: form.get('gender'),
        birth_date: form.get('birth_date'),
        birth_place: form.get('birth_place'),
        birth_country: form.get('birth_country'),
        blood_type: form.get('blood_type'),
        health_insurance: form.get('health_insurance'),
        contact_phone: form.get('contact_phone'),
        contact_email: form.get('contact_email'),
        origin_institution: form.get('origin_institution'),
        faculty_department: form.get('faculty_department'),
        current_role: form.get('current_role'),
        expertise_area: form.get('expertise_area'),
        years_experience: parseInt(form.get('years_experience') as string) || 0,
        employee_code: form.get('employee_code'),
        collaboration_department: form.get('collaboration_department'),
        proposed_start_date: form.get('proposed_start_date'),
        proposed_end_date: form.get('proposed_end_date'),
        mobility_justification: form.get('mobility_justification'),
        work_plan: form.get('work_plan'),
        ...formData // Include document uploads
      };

      await createApplicationMutation.mutateAsync(applicationData);
    } catch (error) {
      console.error('Error submitting application:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <CardTitle>Postular a: {opportunity.title}</CardTitle>
            <CardDescription>
              {opportunity.universities?.name} - {opportunity.universities?.city}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Personal */}
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
                <Input id="blood_type" name="blood_type" />
              </div>
              
              <div>
                <Label htmlFor="health_insurance">Seguro de Salud</Label>
                <Input id="health_insurance" name="health_insurance" />
              </div>
              
              <div>
                <Label htmlFor="contact_phone">Teléfono de Contacto</Label>
                <Input id="contact_phone" name="contact_phone" type="tel" required />
              </div>
              
              <div>
                <Label htmlFor="contact_email">Email de Contacto</Label>
                <Input id="contact_email" name="contact_email" type="email" required />
              </div>
            </div>
          </div>

          {/* Información Académica/Laboral */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información Académica y Laboral</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="origin_institution">Institución de Origen</Label>
                <Input id="origin_institution" name="origin_institution" required />
              </div>
              
              <div>
                <Label htmlFor="faculty_department">Facultad/Departamento</Label>
                <Input id="faculty_department" name="faculty_department" />
              </div>
              
              <div>
                <Label htmlFor="current_role">Rol Actual</Label>
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
          </div>

          {/* Detalles de Movilidad */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Detalles de la Movilidad</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="collaboration_department">Departamento de Colaboración</Label>
                <Input id="collaboration_department" name="collaboration_department" />
              </div>
              
              <div>
                <Label htmlFor="proposed_start_date">Fecha de Inicio Propuesta</Label>
                <Input id="proposed_start_date" name="proposed_start_date" type="date" />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="proposed_end_date">Fecha de Fin Propuesta</Label>
                <Input id="proposed_end_date" name="proposed_end_date" type="date" />
              </div>
            </div>
            
            <div>
              <Label htmlFor="mobility_justification">Justificación de la Movilidad</Label>
              <Textarea 
                id="mobility_justification" 
                name="mobility_justification" 
                rows={4}
                placeholder="Explica por qué deseas participar en esta movilidad..."
                required
              />
            </div>
            
            <div>
              <Label htmlFor="work_plan">Plan de Trabajo</Label>
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
          <DocumentUploadSection 
            formData={formData}
            setFormData={setFormData}
            destinationUniversityId={opportunity.host_institution_id}
            mobilityType="professor"
          />

          <div className="flex justify-end space-x-4">
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

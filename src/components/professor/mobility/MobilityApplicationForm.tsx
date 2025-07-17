
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Upload, FileText, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface MobilityApplicationFormProps {
  opportunity: any;
  onBack: () => void;
  onComplete: () => void;
}

export const MobilityApplicationForm = ({ 
  opportunity, 
  onBack, 
  onComplete 
}: MobilityApplicationFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({});
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const totalSteps = 5;
  const stepProgress = (currentStep / totalSteps) * 100;

  const createApplicationMutation = useMutation({
    mutationFn: async (applicationData: any) => {
      const { data, error } = await supabase
        .from('professor_mobility_applications')
        .insert({
          ...applicationData,
          professor_id: user?.id,
          mobility_call_id: opportunity.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: async (application) => {
      // Upload documents
      for (const file of uploadedFiles) {
        const filePath = `${user?.id}/${application.id}/${file.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from('professor-mobility-docs')
          .upload(filePath, file.file);
          
        if (uploadError) throw uploadError;
        
        // Save document reference
        await supabase
          .from('professor_mobility_documents')
          .insert({
            application_id: application.id,
            document_type: file.type,
            file_name: file.name,
            file_path: filePath,
            file_size: file.file.size,
            uploaded_by: user?.id
          });
      }
      
      queryClient.invalidateQueries({ queryKey: ['professor-mobility-applications'] });
      toast({
        title: 'Postulación enviada exitosamente',
        description: `Tu número de radicación es: ${application.application_number}`
      });
      onComplete();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: 'No se pudo enviar la postulación. Inténtalo de nuevo.',
        variant: 'destructive'
      });
    }
  });

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.includes('pdf') && !file.type.includes('doc')) {
      toast({
        title: 'Tipo de archivo no válido',
        description: 'Solo se permiten archivos PDF y DOC/DOCX',
        variant: 'destructive'
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Archivo muy grande',
        description: 'El archivo no puede superar los 5MB',
        variant: 'destructive'
      });
      return;
    }

    setUploadedFiles(prev => [
      ...prev.filter(f => f.type !== type),
      { type, name: file.name, file }
    ]);

    toast({
      title: 'Archivo cargado',
      description: `${file.name} ha sido cargado exitosamente`
    });
  };

  const handleSubmit = () => {
    createApplicationMutation.mutate(formData);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información Personal</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gender">Sexo</Label>
                <Select onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Femenino">Femenino</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="birth_date">Fecha de Nacimiento</Label>
                <Input
                  id="birth_date"
                  type="date"
                  onChange={(e) => handleInputChange('birth_date', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="birth_place">Lugar de Nacimiento</Label>
                <Input
                  id="birth_place"
                  onChange={(e) => handleInputChange('birth_place', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="birth_country">País de Nacimiento</Label>
                <Input
                  id="birth_country"
                  onChange={(e) => handleInputChange('birth_country', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="blood_type">Grupo Sanguíneo</Label>
                <Select onValueChange={(value) => handleInputChange('blood_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
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
                <Label htmlFor="health_insurance">EPS/Seguro de Salud</Label>
                <Input
                  id="health_insurance"
                  onChange={(e) => handleInputChange('health_insurance', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="contact_phone">Teléfono de Contacto</Label>
                <Input
                  id="contact_phone"
                  type="tel"
                  onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="contact_email">Correo Electrónico</Label>
                <Input
                  id="contact_email"
                  type="email"
                  onChange={(e) => handleInputChange('contact_email', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información Académica y Laboral</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="origin_institution">Institución de Origen</Label>
                <Input
                  id="origin_institution"
                  onChange={(e) => handleInputChange('origin_institution', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="faculty_department">Facultad/Departamento</Label>
                <Input
                  id="faculty_department"
                  onChange={(e) => handleInputChange('faculty_department', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="current_role">Rol Actual</Label>
                <Input
                  id="current_role"
                  placeholder="ej. Profesor Titular, Investigador..."
                  onChange={(e) => handleInputChange('current_role', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="expertise_area">Área de Experticia Principal</Label>
                <Input
                  id="expertise_area"
                  onChange={(e) => handleInputChange('expertise_area', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="years_experience">Años de Experiencia</Label>
                <Input
                  id="years_experience"
                  type="number"
                  min="0"
                  onChange={(e) => handleInputChange('years_experience', parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="employee_code">Código de Empleado (opcional)</Label>
                <Input
                  id="employee_code"
                  onChange={(e) => handleInputChange('employee_code', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Detalles de la Movilidad</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="collaboration_department">Área/Departamento de Colaboración</Label>
                <Input
                  id="collaboration_department"
                  placeholder="Especifica el área o departamento en la universidad anfitriona"
                  onChange={(e) => handleInputChange('collaboration_department', e.target.value)}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="proposed_start_date">Fecha de Inicio Propuesta</Label>
                  <Input
                    id="proposed_start_date"
                    type="date"
                    onChange={(e) => handleInputChange('proposed_start_date', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="proposed_end_date">Fecha de Finalización Propuesta</Label>
                  <Input
                    id="proposed_end_date"
                    type="date"
                    onChange={(e) => handleInputChange('proposed_end_date', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="mobility_justification">Justificación y Objetivos de la Movilidad *</Label>
                <Textarea
                  id="mobility_justification"
                  rows={6}
                  placeholder="Explica tus motivos y razones para realizar la movilidad. Incluye por qué es relevante para tu desarrollo profesional, tu institución y la institución anfitriona, así como los objetivos específicos que esperas lograr."
                  onChange={(e) => handleInputChange('mobility_justification', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="work_plan">Plan de Trabajo Detallado *</Label>
                <Textarea
                  id="work_plan"
                  rows={8}
                  placeholder="Describe las actividades concretas que realizarás durante tu estancia: actividades de docencia, investigación, administrativas, resultados esperados, etc."
                  onChange={(e) => handleInputChange('work_plan', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Documentos Anexos</h3>
            
            <div className="grid gap-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <Label htmlFor="cv_file" className="text-sm font-medium cursor-pointer">
                    Currículum Vitae (CV) *
                  </Label>
                  <Input
                    id="cv_file"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileUpload(e, 'CV')}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-500 mt-1">PDF o DOC, máximo 5MB</p>
                  {uploadedFiles.find(f => f.type === 'CV') && (
                    <div className="flex items-center justify-center gap-2 mt-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">CV cargado</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <Label htmlFor="invitation_letter_file" className="text-sm font-medium cursor-pointer">
                    Carta de Invitación (opcional)
                  </Label>
                  <Input
                    id="invitation_letter_file"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileUpload(e, 'Carta de Invitación')}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-500 mt-1">PDF o DOC, máximo 5MB</p>
                  {uploadedFiles.find(f => f.type === 'Carta de Invitación') && (
                    <div className="flex items-center justify-center gap-2 mt-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Carta cargada</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <Label htmlFor="recommendation_letter_file" className="text-sm font-medium cursor-pointer">
                    Carta de Aval/Recomendación (opcional)
                  </Label>
                  <Input
                    id="recommendation_letter_file"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileUpload(e, 'Carta de Recomendación')}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-500 mt-1">PDF o DOC, máximo 5MB</p>
                  {uploadedFiles.find(f => f.type === 'Carta de Recomendación') && (
                    <div className="flex items-center justify-center gap-2 mt-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Carta cargada</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <Label htmlFor="proposal_file" className="text-sm font-medium cursor-pointer">
                    Propuesta Detallada (opcional)
                  </Label>
                  <Input
                    id="proposal_file"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileUpload(e, 'Propuesta Detallada')}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-500 mt-1">PDF o DOC, máximo 5MB</p>
                  {uploadedFiles.find(f => f.type === 'Propuesta Detallada') && (
                    <div className="flex items-center justify-center gap-2 mt-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Propuesta cargada</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Revisión Final</h3>
            
            <Card>
              <CardHeader>
                <CardTitle>Resumen de tu Postulación</CardTitle>
                <CardDescription>Revisa la información antes de enviar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium">Convocatoria:</h4>
                  <p className="text-sm text-gray-600">{opportunity.title}</p>
                </div>
                
                <div>
                  <h4 className="font-medium">Universidad Anfitriona:</h4>
                  <p className="text-sm text-gray-600">{opportunity.universities?.name}</p>
                </div>
                
                <div>
                  <h4 className="font-medium">Tipo de Movilidad:</h4>
                  <p className="text-sm text-gray-600">{opportunity.mobility_type}</p>
                </div>
                
                <div>
                  <h4 className="font-medium">Área de Colaboración:</h4>
                  <p className="text-sm text-gray-600">{formData.collaboration_department || 'No especificada'}</p>
                </div>
                
                <div>
                  <h4 className="font-medium">Fechas Propuestas:</h4>
                  <p className="text-sm text-gray-600">
                    {formData.proposed_start_date && formData.proposed_end_date
                      ? `${new Date(formData.proposed_start_date).toLocaleDateString('es-ES')} - ${new Date(formData.proposed_end_date).toLocaleDateString('es-ES')}`
                      : 'No especificadas'
                    }
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium">Documentos Adjuntos:</h4>
                  <ul className="text-sm text-gray-600">
                    {uploadedFiles.map((file, index) => (
                      <li key={index}>• {file.type}: {file.name}</li>
                    ))}
                    {uploadedFiles.length === 0 && <li>No hay documentos adjuntos</li>}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Importante:</strong> Una vez enviada la postulación, no podrás realizar cambios. 
                Asegúrate de que toda la información sea correcta y de haber adjuntado todos los documentos necesarios.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Postulación de Movilidad</h1>
          <p className="text-muted-foreground">{opportunity.title}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Paso {currentStep} de {totalSteps}</CardTitle>
              <CardDescription>Completa todos los pasos para enviar tu postulación</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Progreso</div>
              <div className="text-lg font-semibold">{Math.round(stepProgress)}%</div>
            </div>
          </div>
          <Progress value={stepProgress} className="mt-4" />
        </CardHeader>
        
        <CardContent>
          {renderStep()}
        </CardContent>
        
        <div className="flex justify-between p-6 pt-0">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>
          
          {currentStep < totalSteps ? (
            <Button onClick={handleNext}>
              Siguiente
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={createApplicationMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {createApplicationMutation.isPending ? 'Enviando...' : 'Enviar Postulación'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

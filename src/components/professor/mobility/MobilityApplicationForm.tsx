
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface MobilityCall {
  id: string;
  title: string;
  description?: string;
  host_institution_id?: string;
  mobility_type: string;
  application_deadline: string;
  estimated_duration?: string;
  collaboration_area?: string;
  funding_available: boolean;
  universities?: {
    name: string;
    city: string;
  };
}

interface ApplicationData {
  // Personal Info
  gender: string;
  birth_date: string;
  birth_place: string;
  birth_country: string;
  blood_type: string;
  health_insurance: string;
  contact_phone: string;
  contact_email: string;
  
  // Academic Info
  origin_institution: string;
  faculty_department: string;
  current_role: string;
  expertise_area: string;
  years_experience: number;
  employee_code: string;
  
  // Mobility Details
  collaboration_department: string;
  proposed_start_date: string;
  proposed_end_date: string;
  mobility_justification: string;
  work_plan: string;
}

interface Props {
  mobilityCall: MobilityCall;
  onBack: () => void;
  onComplete: () => void;
}

export const MobilityApplicationForm: React.FC<Props> = ({ mobilityCall, onBack, onComplete }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File }>({});
  const [applicationData, setApplicationData] = useState<Partial<ApplicationData>>({});

  const totalSteps = 5;

  const createApplicationMutation = useMutation({
    mutationFn: async (data: ApplicationData) => {
      // Create application
      const { data: application, error: appError } = await supabase
        .from('professor_mobility_applications' as any)
        .insert({
          professor_id: user?.id,
          mobility_call_id: mobilityCall.id,
          ...data
        })
        .select()
        .single();

      if (appError) throw appError;

      // Upload documents
      const uploadPromises = Object.entries(uploadedFiles).map(async ([type, file]) => {
        const fileName = `${application.id}/${type}_${Date.now()}_${file.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from('professor-mobility-docs')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Save document reference
        const { error: docError } = await supabase
          .from('professor_mobility_documents' as any)
          .insert({
            application_id: application.id,
            document_type: type,
            file_name: file.name,
            file_path: fileName,
            file_size: file.size,
            uploaded_by: user?.id
          });

        if (docError) throw docError;
      });

      await Promise.all(uploadPromises);
      return application;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professor-mobility-applications'] });
      toast({
        title: 'Postulación enviada',
        description: 'Tu postulación ha sido enviada exitosamente.'
      });
      onComplete();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: 'No se pudo enviar la postulación. Inténtalo de nuevo.',
        variant: 'destructive'
      });
      console.error('Error creating application:', error);
    }
  });

  const handleFileUpload = (type: string, file: File) => {
    setUploadedFiles(prev => ({ ...prev, [type]: file }));
    toast({
      title: 'Archivo cargado',
      description: `${file.name} ha sido cargado exitosamente.`
    });
  };

  const handleInputChange = (field: string, value: string | number) => {
    setApplicationData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (!applicationData.mobility_justification || !applicationData.work_plan) {
      toast({
        title: 'Información incompleta',
        description: 'Por favor completa la justificación y el plan de trabajo.',
        variant: 'destructive'
      });
      return;
    }

    createApplicationMutation.mutate(applicationData as ApplicationData);
  };

  const renderPersonalInfo = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Información Personal</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="gender">Sexo</Label>
          <Select onValueChange={(value) => handleInputChange('gender', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar sexo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Masculino">Masculino</SelectItem>
              <SelectItem value="Femenino">Femenino</SelectItem>
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
          <Label htmlFor="health_insurance">EPS</Label>
          <Input
            id="health_insurance"
            onChange={(e) => handleInputChange('health_insurance', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="contact_phone">Teléfono de Contacto</Label>
          <Input
            id="contact_phone"
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

  const renderAcademicInfo = () => (
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
            placeholder="ej. Profesor Titular, Investigador"
            onChange={(e) => handleInputChange('current_role', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="expertise_area">Área de Experticia</Label>
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
            onChange={(e) => handleInputChange('years_experience', parseInt(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="employee_code">Código de Empleado</Label>
          <Input
            id="employee_code"
            onChange={(e) => handleInputChange('employee_code', e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const renderMobilityDetails = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Detalles de la Movilidad</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="collaboration_department">Departamento de Colaboración</Label>
          <Input
            id="collaboration_department"
            onChange={(e) => handleInputChange('collaboration_department', e.target.value)}
          />
        </div>
        <div></div>
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
          rows={4}
          placeholder="Describe tus motivos, razones y objetivos específicos para esta movilidad..."
          onChange={(e) => handleInputChange('mobility_justification', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="work_plan">Plan de Trabajo Detallado *</Label>
        <Textarea
          id="work_plan"
          rows={4}
          placeholder="Describe las actividades concretas que realizarás durante tu estancia..."
          onChange={(e) => handleInputChange('work_plan', e.target.value)}
        />
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Documentos Anexos</h3>
      
      {['cv', 'invitation_letter', 'recommendation_letter', 'research_proposal'].map((docType) => {
        const labels = {
          cv: 'Currículum Vitae (PDF) *',
          invitation_letter: 'Carta de Invitación',
          recommendation_letter: 'Carta de Recomendación',
          research_proposal: 'Propuesta de Investigación/Docencia'
        };
        
        return (
          <div key={docType} className="border rounded-lg p-4">
            <Label className="text-sm font-medium">{labels[docType as keyof typeof labels]}</Label>
            <div className="mt-2">
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(docType, file);
                  }
                }}
                className="mb-2"
              />
              {uploadedFiles[docType] && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Archivo cargado: {uploadedFiles[docType].name}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderReview = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Revisión Final</h3>
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium">Convocatoria Seleccionada:</h4>
        <p className="text-sm">{mobilityCall.title}</p>
        <p className="text-sm text-gray-600">{mobilityCall.universities?.name} - {mobilityCall.universities?.city}</p>
      </div>
      
      <div className="space-y-2">
        <h4 className="font-medium">Documentos cargados:</h4>
        {Object.entries(uploadedFiles).map(([type, file]) => (
          <div key={type} className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4" />
            <span>{file.name}</span>
          </div>
        ))}
        {Object.keys(uploadedFiles).length === 0 && (
          <div className="flex items-center gap-2 text-sm text-amber-600">
            <AlertCircle className="h-4 w-4" />
            <span>No se han cargado documentos</span>
          </div>
        )}
      </div>

      <div className="bg-amber-50 p-4 rounded-lg">
        <p className="text-sm">
          <strong>Importante:</strong> Una vez enviada la postulación, no podrás modificar la información. 
          Asegúrate de que todos los datos sean correctos.
        </p>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderPersonalInfo();
      case 2: return renderAcademicInfo();
      case 3: return renderMobilityDetails();
      case 4: return renderDocuments();
      case 5: return renderReview();
      default: return null;
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Formulario de Postulación de Movilidad</CardTitle>
            <CardDescription>
              Postulándose a: {mobilityCall.title}
            </CardDescription>
          </div>
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Paso {currentStep} de {totalSteps}</span>
            <span className="text-sm text-gray-500">{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className="w-full" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {renderCurrentStep()}
        
        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>
          
          {currentStep < totalSteps ? (
            <Button onClick={nextStep}>
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
      </CardContent>
    </Card>
  );
};

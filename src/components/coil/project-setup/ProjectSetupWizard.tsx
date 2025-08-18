import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { useCreateCoilProject } from "@/hooks/useCoilProjects";
import { useToast } from "@/hooks/use-toast";

import ProjectBasicInfoForm, { ProjectBasicInfo } from "./ProjectBasicInfoForm";
import ProjectConnectionSetup, { ProjectConnectionInfo } from "./ProjectConnectionSetup";
import ProjectRolesConfiguration, { ProjectRolesInfo } from "./ProjectRolesConfiguration";
import ProjectDocumentStructureComponent, { ProjectDocumentStructure } from "./ProjectDocumentStructure";

interface ProjectSetupWizardProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface WizardData {
  basicInfo: ProjectBasicInfo;
  connections: ProjectConnectionInfo;
  roles: ProjectRolesInfo;
  documentStructure: ProjectDocumentStructure;
}

const INITIAL_DATA: WizardData = {
  basicInfo: {
    title: "",
    host_university_name: "",
    description: "",
    objectives: "",
    purpose: "",
    academic_level: "",
    subject_area: "",
    project_type: "",
    max_participants: 10
  },
  connections: {
    meeting_platform: "",
    meeting_links: []
  },
  roles: {
    roles: []
  },
  documentStructure: {
    folders: []
  }
};

const WIZARD_STEPS = [
  {
    id: "basic",
    title: "Información Básica",
    description: "Datos fundamentales del proyecto"
  },
  {
    id: "connections",
    title: "Conexiones",
    description: "Enlaces de videoconferencia"
  },
  {
    id: "roles",
    title: "Roles y Permisos",
    description: "Configuración de participantes"
  },
  {
    id: "documents",
    title: "Estructura de Documentos",
    description: "Organización de archivos"
  }
];

export default function ProjectSetupWizard({ onSuccess, onCancel }: ProjectSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState<WizardData>(INITIAL_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const createProject = useCreateCoilProject();
  const { toast } = useToast();

  const updateBasicInfo = (data: ProjectBasicInfo) => {
    setWizardData(prev => ({ ...prev, basicInfo: data }));
  };

  const updateConnections = (data: ProjectConnectionInfo) => {
    setWizardData(prev => ({ ...prev, connections: data }));
  };

  const updateRoles = (data: ProjectRolesInfo) => {
    setWizardData(prev => ({ ...prev, roles: data }));
  };

  const updateDocumentStructure = (data: ProjectDocumentStructure) => {
    setWizardData(prev => ({ ...prev, documentStructure: data }));
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return !!(wizardData.basicInfo.title && 
                 wizardData.basicInfo.host_university_name && 
                 wizardData.basicInfo.description && 
                 wizardData.basicInfo.objectives && 
                 wizardData.basicInfo.purpose);
      case 1: // Connections
        return true; // Conexiones son opcionales
      case 2: // Roles
        return wizardData.roles.roles.length > 0;
      case 3: // Documents
        return wizardData.documentStructure.folders.length > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Preparar datos para la API
      const projectData = {
        title: wizardData.basicInfo.title,
        description: wizardData.basicInfo.description,
        objectives: wizardData.basicInfo.objectives,
        purpose: wizardData.basicInfo.purpose,
        host_university_name: wizardData.basicInfo.host_university_name,
        academic_level: wizardData.basicInfo.academic_level,
        subject_area: wizardData.basicInfo.subject_area,
        project_type: wizardData.basicInfo.project_type,
        max_participants: wizardData.basicInfo.max_participants,
        meeting_platform: wizardData.connections.meeting_platform,
        meeting_links: wizardData.connections.meeting_links,
        project_phase: "setup",
        status: "active",
        is_public: true
      };

      // Crear el proyecto
      await createProject.mutateAsync(projectData);
      
      toast({
        title: "Proyecto Creado",
        description: "El proyecto COIL ha sido configurado exitosamente",
      });
      
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el proyecto. Intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <ProjectBasicInfoForm 
            data={wizardData.basicInfo} 
            onChange={updateBasicInfo} 
          />
        );
      case 1:
        return (
          <ProjectConnectionSetup 
            data={wizardData.connections} 
            onChange={updateConnections} 
          />
        );
      case 2:
        return (
          <ProjectRolesConfiguration 
            data={wizardData.roles} 
            onChange={updateRoles} 
          />
        );
      case 3:
        return (
          <ProjectDocumentStructureComponent 
            data={wizardData.documentStructure} 
            onChange={updateDocumentStructure} 
          />
        );
      default:
        return null;
    }
  };

  const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Encabezado del wizard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Configuración del Proyecto COIL
          </CardTitle>
          <CardDescription>
            Paso {currentStep + 1} de {WIZARD_STEPS.length}: {WIZARD_STEPS[currentStep].description}
          </CardDescription>
          <Progress value={progress} className="w-full" />
        </CardHeader>
      </Card>

      {/* Navegación de pasos */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-1">
          {WIZARD_STEPS.map((step, index) => (
            <div
              key={step.id}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                index === currentStep
                  ? "bg-primary text-primary-foreground"
                  : index < currentStep
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {step.title}
            </div>
          ))}
        </div>
      </div>

      {/* Contenido del paso actual */}
      {renderCurrentStep()}

      {/* Botones de navegación */}
      <div className="flex justify-between">
        <div>
          {currentStep > 0 && (
            <Button variant="outline" onClick={handlePrevious}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          
          {currentStep < WIZARD_STEPS.length - 1 ? (
            <Button 
              onClick={handleNext}
              disabled={!canProceedToNext()}
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={!canProceedToNext() || isSubmitting}
            >
              {isSubmitting ? "Creando..." : "Crear Proyecto"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}